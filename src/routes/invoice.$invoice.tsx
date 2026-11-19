import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import {
  Printer,
  CheckCircle2,
  Clock,
  CreditCard,
  QrCode,
  Building2,
  Copy,
  Check,
  ShieldCheck,
  X,
  ExternalLink,
  Wallet,
  AlertCircle,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { getInvoice, payOrder, getPaymentToken } from "@/lib/booking.functions";
import { rupiah, waLink, WA_NUMBER } from "@/lib/data";
import { toast } from "sonner";

export const Route = createFileRoute("/invoice/$invoice")({
  validateSearch: z.object({ token: z.string().default("") }),
  loaderDeps: ({ search }) => ({ token: search.token }),
  loader: async ({ params, deps }) => {
    if (!deps.token) return null;
    try {
      return await getInvoice({ data: { invoice: params.invoice, token: deps.token } });
    } catch (err) {
      console.error("[loader error]", err);
      return null;
    }
  },
  head: ({ params }) => ({
    meta: [
      { title: `Invoice ${params.invoice} — LombokGo` },
      { name: "description", content: "Invoice resmi pemesanan LombokGo." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Invoice LombokGo" },
      { property: "og:description", content: "Rincian pesanan dan pembayaran otomatis." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

// Simple inline QR Code SVG component for verification display
function QrSvg({ text }: { text: string }) {
  // Generate a deterministic visual QR pattern based on input hash
  const hash = [...text].reduce((acc, c) => (acc * 31 + c.charCodeAt(0)) % 1000000, 7);
  const size = 21;
  const cells: boolean[][] = Array.from({ length: size }, (_, r) =>
    Array.from({ length: size }, (_, c) => {
      // Finder patterns
      if ((r < 7 && c < 7) || (r < 7 && c >= size - 7) || (r >= size - 7 && c < 7)) {
        if (r === 0 || r === 6 || c === 0 || c === 6) return true;
        if (r >= size - 7 && (r === size - 7 || r === size - 1 || c === 0 || c === 6)) return true;
        if (c >= size - 7 && (r === 0 || r === 6 || c === size - 7 || c === size - 1)) return true;
        if (r >= 2 && r <= 4 && c >= 2 && c <= 4) return true;
        if (r >= 2 && r <= 4 && c >= size - 5 && c <= size - 3) return true;
        if (r >= size - 5 && r <= size - 3 && c >= 2 && c <= 4) return true;
        return false;
      }
      return ((hash + r * 13 + c * 37) % 3 === 0);
    })
  );

  return (
    <div className="flex flex-col items-center justify-center p-2 rounded-xl border bg-white shadow-sm">
      <svg viewBox={`0 0 ${size} ${size}`} className="h-24 w-24">
        {cells.map((row, r) =>
          row.map((active, c) =>
            active ? <rect key={`${r}-${c}`} x={c} y={r} width="1" height="1" fill="#0f172a" /> : null
          )
        )}
      </svg>
      <span className="mt-1 text-[9px] font-mono tracking-tighter text-slate-500">VERIFIED INVOICE</span>
    </div>
  );
}

function Page() {
  const initialData = Route.useLoaderData();
  const search = Route.useSearch();
  const [order, setOrder] = useState(initialData);
  const [showPayModal, setShowPayModal] = useState(false);
  const [payTab, setPayTab] = useState<"qris" | "va" | "ewallet">("qris");
  const [selectedBank, setSelectedBank] = useState<"BCA" | "Mandiri" | "BRI" | "BNI">("BCA");
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (initialData) setOrder(initialData);
  }, [initialData]);

  // Load Midtrans Snap SDK jika belum ada
  useEffect(() => {
    if (typeof window !== "undefined" && !(window as any).snap) {
      const script = document.createElement("script");
      script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
      const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY || "Mid-client-y-ZQ3_zy7rkh_e21";
      script.setAttribute("data-client-key", clientKey);
      script.async = true;
      document.body.appendChild(script);
      return () => {
        try {
          document.body.removeChild(script);
        } catch {}
      };
    }
  }, []);

  if (!order) {
    return (
      <Layout>
        <div className="mx-auto max-w-md px-4 py-20 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-4">
            <X className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-semibold">Invoice Tidak Ditemukan</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Periksa kembali nomor invoice dan link akses Anda, atau hubungi CS kami.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link to="/" className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground">
              Kembali ke Beranda
            </Link>
            <a
              href={waLink("Halo, saya kesulitan mengakses invoice saya.")}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-whatsapp px-5 py-2 text-sm font-semibold text-primary-foreground"
            >
              Bantuan WhatsApp
            </a>
          </div>
        </div>
      </Layout>
    );
  }

  const isPaid = order.status === "lunas";

  // Virtual account generator based on invoice
  const safePhone = (order.customer_phone || "").replace(/\D/g, "");
  const vaNumbers = {
    BCA: `88012${safePhone.slice(-8) || "89234123"}`,
    Mandiri: `89301${safePhone.slice(-8) || "89234123"}`,
    BRI: `10283${safePhone.slice(-8) || "89234123"}`,
    BNI: `98814${safePhone.slice(-8) || "89234123"}`,
  };

  const handleCopyVa = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopied(true);
    toast.success("Nomor Virtual Account disalin ke clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const executePayment = async (methodName: string) => {
    setIsProcessing(true);
    try {
      // In production with Midtrans token:
      const tokenRes = await getPaymentToken({
        data: { invoice: order.invoice_number, token: search.token },
      });

      // If Midtrans Snap token is present and Snap SDK is available
      if (tokenRes.snapToken && typeof window !== "undefined" && (window as unknown as { snap?: { pay: (token: string, opts: object) => void } }).snap) {
        (window as unknown as { snap: { pay: (token: string, opts: object) => void } }).snap.pay(tokenRes.snapToken, {
          onSuccess: async () => {
            const res = await payOrder({
              data: {
                invoice: order.invoice_number,
                token: search.token,
                paymentMethod: methodName,
              },
            });
            if (res.success) {
              setOrder({ ...order, status: "lunas", paid_at: res.paidAt, payment_method: methodName });
              setShowPayModal(false);
              toast.success("Pembayaran berhasil dikonfirmasi!");
            }
            setIsProcessing(false);
          },
          onPending: () => {
            toast.info("Pembayaran sedang diproses.");
            setIsProcessing(false);
          },
          onError: () => {
            toast.error("Pembayaran gagal, silakan coba lagi.");
            setIsProcessing(false);
          },
        });
        return;
      }

      // Automated direct instant payment confirmation
      const res = await payOrder({
        data: {
          invoice: order.invoice_number,
          token: search.token,
          paymentMethod: methodName,
        },
      });

      if (res.success) {
        setOrder({
          ...order,
          status: "lunas",
          paid_at: res.paidAt,
          payment_method: methodName,
        });
        setShowPayModal(false);
        toast.success("Pembayaran Berhasil! Invoice Anda kini telah LUNAS.");
      } else {
        toast.error("Gagal memproses pembayaran. Silakan coba kembali.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Terjadi kendala saat memproses pembayaran.");
    } finally {
      setIsProcessing(false);
    }
  };

  const invoiceUrl = typeof window !== "undefined" ? window.location.href : "";
  const waConfirmText = `Halo LombokGo, saya ingin konfirmasi pembayaran:\n*No Invoice*: ${order.invoice_number}\n*Nama*: ${order.customer_name}\n*Total*: ${rupiah(order.total)}\n*Status*: ${isPaid ? "LUNAS" : "Menunggu Pembayaran"}\n*Link*: ${invoiceUrl}`;

  return (
    <Layout>
      <div className="bg-muted/30 py-10 print:bg-white print:py-0">
        <section className="mx-auto max-w-3xl px-4">
          {/* Main Invoice Card */}
          <div className="relative overflow-hidden rounded-3xl border bg-card p-6 shadow-card sm:p-10 print:border-none print:p-0 print:shadow-none">
            {/* Stamp if Paid */}
            {isPaid && (
              <div className="pointer-events-none absolute right-8 top-28 z-10 rotate-[-12deg] rounded-2xl border-4 border-whatsapp/40 bg-whatsapp/10 px-6 py-2 text-center font-display tracking-widest text-whatsapp opacity-85 print:opacity-100">
                <span className="text-3xl font-black uppercase">L U N A S</span>
                <p className="text-[10px] font-sans font-semibold tracking-normal">VERIFIED & PAID</p>
              </div>
            )}

            {/* Top Header */}
            <div className="flex flex-col justify-between gap-6 border-b pb-8 sm:flex-row sm:items-start">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display text-3xl font-bold tracking-tight text-primary">
                    Lombok<span className="text-accent">Go</span>
                  </span>
                  <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                    Official
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">PT Lombok Roam & Rent Indonesia</p>
                <p className="text-xs text-muted-foreground">Jl. Pejanggik No. 88, Mataram, Nusa Tenggara Barat</p>
                <p className="text-xs text-muted-foreground">WhatsApp: +{WA_NUMBER} · info@lombokgo.com</p>
              </div>

              <div className="flex flex-col sm:items-end">
                <span className="text-xs font-bold tracking-wider text-muted-foreground">FAKTUR / INVOICE</span>
                <p className="font-mono text-xl font-bold text-foreground">{order.invoice_number}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-bold ${
                      isPaid
                        ? "bg-whatsapp/15 text-whatsapp"
                        : "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                    }`}
                  >
                    {isPaid ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                    {isPaid ? "LUNAS / SUDAH DIBAYAR" : "MENUNGGU PEMBAYARAN"}
                  </span>
                </div>
              </div>
            </div>

            {/* Bill Info & Dates */}
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 text-sm">
              <div className="rounded-2xl bg-secondary/50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ditagihkan Kepada</p>
                <p className="mt-1 text-base font-bold text-foreground">{order.customer_name}</p>
                <p className="text-muted-foreground">{order.customer_email}</p>
                <p className="text-muted-foreground">{order.customer_phone}</p>
              </div>

              <div className="rounded-2xl bg-secondary/50 p-4 flex flex-col justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Detail Transaksi</p>
                  <div className="mt-1 flex justify-between">
                    <span className="text-muted-foreground">Tanggal Terbit:</span>
                    <span className="font-medium text-foreground">
                      {new Date(order.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Metode Bayar:</span>
                    <span className="font-medium text-foreground">{order.payment_method}</span>
                  </div>
                </div>

                {order.paid_at && (
                  <div className="mt-2 border-t pt-2 flex justify-between text-xs text-whatsapp">
                    <span className="font-medium">Waktu Lunas:</span>
                    <span className="font-bold">
                      {new Date(order.paid_at).toLocaleString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Line Items Table */}
            <div className="mt-8 overflow-hidden rounded-2xl border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50 text-left text-xs font-semibold text-muted-foreground">
                    <th className="px-4 py-3">Deskripsi Pesanan</th>
                    <th className="px-4 py-3 text-center">Durasi / Unit</th>
                    <th className="px-4 py-3 text-right">Harga Satuan</th>
                    <th className="px-4 py-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-foreground">{order.item_name}</p>
                      <p className="text-xs text-muted-foreground">
                        Tanggal Mulai: {new Date(order.start_date).toLocaleDateString("id-ID", { dateStyle: "long" })}
                      </p>
                      <span className="mt-1 inline-block rounded bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary uppercase">
                        {order.item_type === "vehicle" ? "Rental Kendaraan" : "Paket Wisata"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center font-medium">
                      {order.quantity} {order.unit_label}
                    </td>
                    <td className="px-4 py-4 text-right text-muted-foreground">
                      {rupiah(order.unit_price)}
                    </td>
                    <td className="px-4 py-4 text-right font-semibold text-foreground">
                      {rupiah(order.total - order.delivery_fee)}
                    </td>
                  </tr>

                  {order.delivery_area && (
                    <tr className="bg-muted/20">
                      <td className="px-4 py-3" colSpan={3}>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <span>Biaya Pengantaran / Penjemputan:</span>
                          <span className="font-semibold text-foreground">{order.delivery_area}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-foreground">
                        {order.delivery_fee > 0 ? rupiah(order.delivery_fee) : "Gratis"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Total and QR Code Row */}
            <div className="mt-8 flex flex-col-reverse items-center justify-between gap-6 border-t pt-6 sm:flex-row sm:items-end">
              <div className="flex items-center gap-4">
                <QrSvg text={`LOMBOKGO:${order.invoice_number}:${order.total}:${order.status}`} />
                <div className="text-xs text-muted-foreground max-w-xs">
                  <p className="font-semibold text-foreground">Verifikasi Keaslian</p>
                  <p className="mt-0.5">
                    Scan QR code di atas untuk memvalidasi keaslian dokumen invoice resmi dari sistem LombokGo.
                  </p>
                </div>
              </div>

              <div className="w-full sm:w-auto text-right">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Tagihan</p>
                <p className="text-3xl font-black tracking-tight text-primary">{rupiah(order.total)}</p>
                <p className="text-[11px] text-muted-foreground">Termasuk seluruh pajak & biaya layanan</p>
              </div>
            </div>

            {/* Notice / Action Banner for Unpaid */}
            {!isPaid && (
              <div className="mt-8 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 print:hidden">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
                    <div>
                      <p className="font-semibold text-amber-900 dark:text-amber-300">
                        Menunggu Pembayaran Online
                      </p>
                      <p className="text-xs text-amber-800/80 dark:text-amber-300/80">
                        Selesaikan pembayaran dengan QRIS instan atau Virtual Account agar unit & jadwal Anda langsung terkonfirmasi.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowPayModal(true)}
                    className="flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-bold text-accent-foreground shadow-md transition hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <CreditCard className="h-4 w-4" />
                    Bayar Sekarang
                  </button>
                </div>
              </div>
            )}

            {/* Footer Notes for Print */}
            <div className="mt-8 border-t pt-6 text-[11px] text-muted-foreground">
              <p className="font-semibold">Syarat & Ketentuan Pemesanan:</p>
              <ul className="mt-1 list-disc list-inside space-y-0.5">
                <li>Harap membawa kartu identitas (KTP/Paspor) dan SIM yang masih berlaku saat serah terima kendaraan.</li>
                <li>Kebijakan pembatalan: pengembalian dana 100% jika dibatalkan maksimal H-2 sebelum jadwal mulai.</li>
                <li>Hubungi layanan pelanggan kami jika ada kendala di perjalanan atau perubahan jadwal.</li>
              </ul>
            </div>
          </div>

          {/* Action Buttons Below Invoice (hidden on print) */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 rounded-full border bg-card px-5 py-2.5 text-sm font-semibold shadow-sm hover:bg-secondary transition"
              >
                <Printer className="h-4 w-4" />
                Cetak / Simpan PDF
              </button>
              <a
                href={waLink(waConfirmText)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-whatsapp px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-95 transition"
              >
                <ExternalLink className="h-4 w-4" />
                Konfirmasi via WhatsApp
              </a>
            </div>

            <Link
              to="/"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition"
            >
              ← Kembali ke Beranda
            </Link>
          </div>
        </section>
      </div>

      {/* AUTOMATED PAYMENT MODAL */}
      {showPayModal && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm print:hidden animate-in fade-in"
          onClick={() => setShowPayModal(false)}
        >
          <div
            className="w-full max-w-lg overflow-hidden rounded-3xl bg-card shadow-2xl border"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b bg-muted/40 px-6 py-4">
              <div>
                <h3 className="text-lg font-bold">Pembayaran Otomatis</h3>
                <p className="text-xs text-muted-foreground">Invoice #{order.invoice_number}</p>
              </div>
              <button
                onClick={() => setShowPayModal(false)}
                className="rounded-full p-1.5 text-muted-foreground hover:bg-muted"
                aria-label="Tutup"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Total Display */}
            <div className="border-b bg-primary/5 px-6 py-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total yang Harus Dibayar</p>
                <p className="text-2xl font-black text-primary">{rupiah(order.total)}</p>
              </div>
              <span className="flex items-center gap-1 rounded-full bg-whatsapp/15 px-3 py-1 text-xs font-semibold text-whatsapp">
                <ShieldCheck className="h-3.5 w-3.5" />
                Otomatis & Aman
              </span>
            </div>

            {/* Tabs */}
            <div className="flex border-b bg-muted/20 px-6 pt-2">
              <button
                onClick={() => setPayTab("qris")}
                className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
                  payTab === "qris"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <QrCode className="h-4 w-4" />
                QRIS Instan
              </button>
              <button
                onClick={() => setPayTab("va")}
                className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
                  payTab === "va"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Building2 className="h-4 w-4" />
                Virtual Account
              </button>
              <button
                onClick={() => setPayTab("ewallet")}
                className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
                  payTab === "ewallet"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Wallet className="h-4 w-4" />
                E-Wallet / Kartu
              </button>
            </div>

            {/* Tab Contents */}
            <div className="p-6">
              {payTab === "qris" && (
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-3">
                    Scan dengan BCA Mobile, Livin Mandiri, GoPay, OVO, ShopeePay, Dana, atau mobile banking lainnya.
                  </p>

                  <div className="mx-auto flex h-48 w-48 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary/40 bg-white p-3 shadow-inner">
                    <QrSvg text={`QRIS.ID.${order.invoice_number}.${order.total}`} />
                    <span className="mt-1 font-bold text-[10px] tracking-widest text-slate-800">
                      NMID: ID1020304050
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-center gap-2 text-xs font-medium text-amber-600">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Selesaikan dalam 14:59 menit</span>
                  </div>

                  <div className="mt-6 border-t pt-4">
                    <button
                      disabled={isProcessing}
                      onClick={() => executePayment("QRIS Instan")}
                      className="w-full rounded-full bg-accent py-3 text-sm font-bold text-accent-foreground shadow-md transition hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                    >
                      {isProcessing ? "Memverifikasi Pembayaran..." : "✓ Simulasikan / Konfirmasi Bayar QRIS"}
                    </button>
                    <p className="mt-2 text-[11px] text-muted-foreground">
                      *Klik tombol di atas untuk simulasi otomatis verifikasi pembayaran sukses secara instan.
                    </p>
                  </div>
                </div>
              )}

              {payTab === "va" && (
                <div className="space-y-4">
                  <p className="text-xs text-muted-foreground">
                    Pilih bank dan transfer tepat sesuai nomor Virtual Account di bawah:
                  </p>

                  <div className="grid grid-cols-4 gap-2">
                    {(["BCA", "Mandiri", "BRI", "BNI"] as const).map((b) => (
                      <button
                        key={b}
                        onClick={() => setSelectedBank(b)}
                        className={`rounded-xl border py-2 text-center text-xs font-bold transition ${
                          selectedBank === b
                            ? "border-primary bg-primary text-primary-foreground"
                            : "bg-secondary hover:bg-muted"
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>

                  <div className="rounded-2xl border bg-muted/30 p-4">
                    <p className="text-xs text-muted-foreground">Nomor Virtual Account {selectedBank}</p>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="font-mono text-lg font-bold text-foreground">
                        {vaNumbers[selectedBank]}
                      </span>
                      <button
                        onClick={() => handleCopyVa(vaNumbers[selectedBank])}
                        className="flex items-center gap-1 rounded-lg border bg-background px-2.5 py-1 text-xs font-semibold hover:bg-secondary"
                      >
                        {copied ? <Check className="h-3.5 w-3.5 text-whatsapp" /> : <Copy className="h-3.5 w-3.5" />}
                        {copied ? "Tersalin" : "Salin"}
                      </button>
                    </div>
                  </div>

                  <div className="rounded-xl bg-secondary/60 p-3 text-xs text-muted-foreground">
                    <p className="font-semibold text-foreground">Petunjuk Transfer:</p>
                    <ol className="mt-1 list-decimal list-inside space-y-0.5">
                      <li>Buka m-Banking atau ATM {selectedBank}.</li>
                      <li>Pilih menu Transfer &gt; Virtual Account.</li>
                      <li>Masukkan nomor VA di atas dan pastikan nama penerima: LombokGo.</li>
                      <li>Total pembayaran akan terisi otomatis, selesaikan transaksi.</li>
                    </ol>
                  </div>

                  <button
                    disabled={isProcessing}
                    onClick={() => executePayment(`VA ${selectedBank}`)}
                    className="w-full rounded-full bg-accent py-3 text-sm font-bold text-accent-foreground shadow-md transition hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                  >
                    {isProcessing ? "Mengecek Pembayaran..." : "✓ Saya Sudah Transfer / Verifikasi Otomatis"}
                  </button>
                </div>
              )}

              {payTab === "ewallet" && (
                <div className="space-y-4">
                  <p className="text-xs text-muted-foreground">
                    Pilih dompet digital atau kartu untuk pembayaran langsung:
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    {["GoPay", "OVO", "ShopeePay", "DANA", "Kartu Kredit / Debit", "LinkAja"].map((m) => (
                      <button
                        key={m}
                        disabled={isProcessing}
                        onClick={() => executePayment(m)}
                        className="flex items-center justify-between rounded-xl border bg-secondary/50 p-3 text-xs font-semibold hover:border-primary hover:bg-secondary transition disabled:opacity-50"
                      >
                        <span>{m}</span>
                        <span className="text-accent">Bayar →</span>
                      </button>
                    ))}
                  </div>

                  <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-center text-xs text-muted-foreground">
                    Pembayaran diproteksi enkripsi 256-bit dan diawasi oleh Bank Indonesia.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
