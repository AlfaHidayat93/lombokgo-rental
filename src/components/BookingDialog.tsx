import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { deliveryAreas, rupiah } from "@/lib/data";
import { quote } from "@/lib/pricing";
import { createOrder } from "@/lib/booking.functions";
import type { AdminVehicle } from "@/lib/admin.functions";

function bookedDays(id: string) {
  const seed = [...id].reduce((a, c) => a + c.charCodeAt(0), 0);
  return new Set([seed % 28 + 1, (seed * 3) % 28 + 1, (seed * 7) % 28 + 1]);
}

const PAYS = ["QRIS Instan", "Transfer Bank", "E-Wallet", "Kartu Kredit"] as const;

type Props = {
  id: string;
  itemType: "vehicle" | "tour";
  title: string;
  unitLabel: string;
  onClose: () => void;
  vehicleData?: AdminVehicle;
};

const inp = "mt-1 w-full rounded-lg border bg-background px-3 py-2";

export function BookingDialog({ id, itemType, title, unitLabel, onClose, vehicleData }: Props) {
  const today = new Date().toISOString().slice(0, 10);
  const [start, setStart] = useState(today);
  const [qty, setQty] = useState(1);
  const [area, setArea] = useState(2);
  const [pay, setPay] = useState<(typeof PAYS)[number]>("QRIS Instan");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const create = useServerFn(createOrder);
  const booked = useMemo(() => bookedDays(id), [id]);
  const unavailable = booked.has(new Date(start).getDate());

  const isMultiTrans = vehicleData
    ? vehicleData.transmission === "Manual & Otomatis"
    : false;
  const isBothDriver = vehicleData
    ? vehicleData.driverOption === "both"
    : false;

  const hasManualPrice = vehicleData?.dailyManual && vehicleData?.dailyManual > 0;
  const hasOtomatisPrice = vehicleData?.dailyOtomatis && vehicleData?.dailyOtomatis > 0;
  const hasDriverPrice = vehicleData?.dailyDriver && vehicleData?.dailyDriver > 0;

  const [transmissionChoice, setTransmissionChoice] = useState<"Manual" | "Otomatis">(
    isMultiTrans ? "Otomatis" : "Manual"
  );
  const [driverChoice, setDriverChoice] = useState<"self_drive" | "with_driver">("self_drive");

  const q = quote({
    itemType,
    itemId: id,
    quantity: qty,
    deliveryIndex: area,
    transmissionChoice: isMultiTrans ? transmissionChoice : undefined,
    driverChoice: isBothDriver ? driverChoice : undefined,
    vehicleData: vehicleData as any,
  });

  async function submit() {
    setErr("");
    if (!name || !email || !phone) return setErr("Lengkapi nama, email, dan nomor HP.");
    setBusy(true);
    try {
      const r = await create({
        data: {
          itemType,
          itemId: id,
          quantity: qty,
          deliveryIndex: itemType === "vehicle" ? area : undefined,
          startDate: start,
          name,
          email,
          phone,
          paymentMethod: pay,
          transmissionChoice: isMultiTrans ? transmissionChoice : undefined,
          driverChoice: isBothDriver ? driverChoice : undefined,
        },
      });
      navigate({ to: "/invoice/$invoice", params: { invoice: r.invoice }, search: { token: r.token } });
    } catch (e: any) {
      console.error("[BookingDialog submit error]", e);
      const msg = e?.message || "Gagal membuat pesanan, periksa kembali data Anda.";
      setErr(msg);
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-foreground/50 sm:items-center sm:p-4" onClick={onClose}>
      <div className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-card p-6 sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <h3 className="text-xl font-semibold">{title}</h3>
          <button onClick={onClose} aria-label="Tutup"><X className="h-5 w-5" /></button>
        </div>

        <div className="mt-4 space-y-3 text-sm">
          <label className="block">Nama lengkap<input value={name} onChange={(e) => setName(e.target.value)} className={inp} placeholder="Contoh: Budi Santoso" /></label>
          <div className="grid grid-cols-2 gap-2">
            <label className="block">Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inp} placeholder="budi@gmail.com" /></label>
            <label className="block">No. HP / WA<input value={phone} onChange={(e) => setPhone(e.target.value)} className={inp} placeholder="08123456789" /></label>
          </div>
          <label className="block">Tanggal mulai<input type="date" min={today} value={start} onChange={(e) => setStart(e.target.value)} className={inp} /></label>
          <p className={unavailable ? "font-medium text-destructive" : "font-medium text-whatsapp"}>
            {unavailable ? "Tanggal ini sudah penuh — pilih tanggal lain." : "✓ Tersedia di tanggal ini"}
          </p>
          <label className="block">Jumlah {unitLabel}<input type="number" min={1} max={60} value={qty} onChange={(e) => setQty(Math.min(60, Math.max(1, +e.target.value)))} className={inp} /></label>

          {/* PILIHAN TRANSMISI */}
          {itemType === "vehicle" && isMultiTrans && (
            <div>
              <p className="font-medium text-foreground">Pilih Transmisi</p>
              <div className="mt-1.5 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTransmissionChoice("Manual")}
                  className={`rounded-xl border p-3 text-left text-xs transition ${transmissionChoice === "Manual" ? "border-primary bg-primary/10 font-bold text-primary" : "border-border bg-background"}`}
                >
                  <p className="font-semibold">⚙️ Manual</p>
                  {hasManualPrice && (
                    <p className="mt-0.5 text-[11px] text-muted-foreground">{rupiah(vehicleData!.dailyManual!)} /hari</p>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setTransmissionChoice("Otomatis")}
                  className={`rounded-xl border p-3 text-left text-xs transition ${transmissionChoice === "Otomatis" ? "border-primary bg-primary/10 font-bold text-primary" : "border-border bg-background"}`}
                >
                  <p className="font-semibold">🚗 Otomatis</p>
                  {hasOtomatisPrice && (
                    <p className="mt-0.5 text-[11px] text-muted-foreground">{rupiah(vehicleData!.dailyOtomatis!)} /hari</p>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* PILIHAN OPSI SOPIR */}
          {itemType === "vehicle" && isBothDriver && (
            <div>
              <p className="font-medium text-foreground">Pilih Opsi Sopir</p>
              <div className="mt-1.5 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDriverChoice("self_drive")}
                  className={`rounded-xl border p-3 text-left text-xs transition ${driverChoice === "self_drive" ? "border-primary bg-primary/10 font-bold text-primary" : "border-border bg-background"}`}
                >
                  <p className="font-semibold">🔑 Lepas Kunci</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">Tanpa sopir</p>
                </button>
                <button
                  type="button"
                  onClick={() => setDriverChoice("with_driver")}
                  className={`rounded-xl border p-3 text-left text-xs transition ${driverChoice === "with_driver" ? "border-primary bg-primary/10 font-bold text-primary" : "border-border bg-background"}`}
                >
                  <p className="font-semibold">👤 Dengan Sopir</p>
                  {hasDriverPrice && (
                    <p className="mt-0.5 text-[11px] text-muted-foreground">+{rupiah(vehicleData!.dailyDriver!)} /hari</p>
                  )}
                </button>
              </div>
            </div>
          )}

          {itemType === "vehicle" && (
            <label className="block">Lokasi antar
              <select value={area} onChange={(e) => setArea(+e.target.value)} className={inp}>
                {deliveryAreas.map((a, i) => (
                  <option key={a.name} value={i}>{a.name} {a.fee ? `(+${rupiah(a.fee)})` : "(gratis)"}</option>
                ))}
              </select>
            </label>
          )}

          <div>Metode Pembayaran
            <div className="mt-1 grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PAYS.map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setPay(p)}
                  className={`rounded-lg border px-2 py-2 text-xs font-medium transition ${pay === p ? "border-primary bg-primary text-primary-foreground shadow-sm" : "border-border hover:bg-secondary"}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {err && <p className="text-destructive font-medium">{err}</p>}
        </div>

        {/* RINGKASAN HARGA */}
        <div className="mt-4 rounded-xl bg-secondary p-3 text-xs space-y-1">
          {isMultiTrans && (
            <div className="flex justify-between text-muted-foreground">
              <span>Transmisi dipilih:</span>
              <span className="font-semibold text-foreground">{transmissionChoice}</span>
            </div>
          )}
          {isBothDriver && (
            <div className="flex justify-between text-muted-foreground">
              <span>Opsi sopir:</span>
              <span className="font-semibold text-foreground">{driverChoice === "with_driver" ? "Dengan Sopir" : "Lepas Kunci"}</span>
            </div>
          )}
          <div className="flex justify-between text-muted-foreground">
            <span>Sewa {qty} {unitLabel}:</span>
            <span>{rupiah(q.subtotal)}</span>
          </div>
          {q.deliveryFee > 0 && (
            <div className="flex justify-between text-muted-foreground">
              <span>Antar ke {q.deliveryArea}:</span>
              <span>+{rupiah(q.deliveryFee)}</span>
            </div>
          )}
          <div className="flex justify-between border-t pt-1 font-bold text-foreground">
            <span>Total</span>
            <span className="text-primary">{rupiah(q.total)}</span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-end">
          <button
            type="button"
            disabled={unavailable || busy}
            onClick={submit}
            className="w-full rounded-full bg-accent py-3 text-sm font-semibold text-accent-foreground shadow-md transition hover:opacity-90 disabled:opacity-50"
          >
            {busy ? "Memproses…" : "Pesan & Bayar via Midtrans →"}
          </button>
        </div>
      </div>
    </div>
  );
}
