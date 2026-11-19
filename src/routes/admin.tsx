import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Car,
  Map,
  Settings,
  ShoppingBag,
  Plus,
  Trash2,
  Edit,
  CheckCircle2,
  Clock,
  ExternalLink,
  Save,
  Lock,
  LogOut,
  RefreshCw,
  Search,
  MessageCircle,
  Eye,
  ShieldAlert,
} from "lucide-react";
import {
  getAdminOverview,
  saveVehicle,
  deleteVehicle,
  saveTour,
  deleteTour,
  saveSettings,
  updateOrderStatus,
  type AdminVehicle,
  type AdminTour,
  type DeliveryArea,
} from "@/lib/admin.functions";
import { rupiah, waLink } from "@/lib/data";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Dashboard Admin — LombokGo" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

const DEFAULT_PIN = "123456";
const PIN_KEY = "lombokgo_admin_auth";

function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");
  const [activeTab, setActiveTab] = useState<"orders" | "vehicles" | "tours" | "settings">("orders");
  const [loading, setLoading] = useState(false);

  // Data states
  const [orders, setOrders] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<AdminVehicle[]>([]);
  const [tours, setTours] = useState<AdminTour[]>([]);
  const [deliveryAreas, setDeliveryAreas] = useState<DeliveryArea[]>([]);
  const [waNumber, setWaNumber] = useState("");
  const [geminiApiKey, setGeminiApiKey] = useState("");

  // Filters
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");

  // Modals
  const [editingVehicle, setEditingVehicle] = useState<AdminVehicle | null>(null);
  const [isNewVehicle, setIsNewVehicle] = useState(false);
  const [editingTour, setEditingTour] = useState<AdminTour | null>(null);
  const [isNewTour, setIsNewTour] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  useEffect(() => {
    const auth = localStorage.getItem(PIN_KEY);
    if (auth === "true") {
      setIsAuthenticated(true);
      fetchOverview();
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === DEFAULT_PIN) {
      localStorage.setItem(PIN_KEY, "true");
      setIsAuthenticated(true);
      setPinError("");
      fetchOverview();
      toast.success("Login Admin berhasil!");
    } else {
      setPinError("PIN Admin salah. Default PIN: 123456");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(PIN_KEY);
    setIsAuthenticated(false);
    setPinInput("");
    toast.info("Anda telah keluar dari dashboard admin.");
  };

  // IMAGE UPLOAD & COMPRESS
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUploading(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const MAX = 1000;
        const scale = img.width > MAX ? MAX / img.width : 1;
        const canvas = document.createElement("canvas");
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.75);
        setEditingVehicle((prev) => prev ? { ...prev, image: dataUrl } : prev);
        setImageUploading(false);
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
    // reset input so same file can be re-uploaded
    e.target.value = "";
  };

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const data = await getAdminOverview();
      setOrders(data.orders || []);
      setVehicles(data.catalog.vehicles || []);
      setTours(data.catalog.tours || []);
      setDeliveryAreas(data.catalog.deliveryAreas || []);
      setWaNumber(data.catalog.waNumber || "6287866950767");
      setGeminiApiKey(data.catalog.geminiApiKey || "");
    } catch (e) {
      console.error(e);
      toast.error("Gagal memuat data dari server.");
    } finally {
      setLoading(false);
    }
  };

  // ORDER ACTIONS
  const handleMarkPaid = async (invoice: string) => {
    try {
      await updateOrderStatus({ data: { invoice, status: "lunas" } });
      setOrders((prev) =>
        prev.map((o) => (o.invoice_number === invoice ? { ...o, status: "lunas", paid_at: new Date().toISOString() } : o))
      );
      toast.success(`Pesanan ${invoice} berhasil ditandai LUNAS!`);
    } catch {
      toast.error("Gagal memperbarui status pesanan.");
    }
  };

  // VEHICLE ACTIONS
  const handleSaveVehicleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVehicle) return;
    try {
      await saveVehicle({ data: editingVehicle });
      toast.success(`Kendaraan ${editingVehicle.name} berhasil disimpan!`);
      setEditingVehicle(null);
      fetchOverview();
    } catch {
      toast.error("Gagal menyimpan kendaraan.");
    }
  };

  const handleDeleteVehicle = async (id: string, name: string) => {
    if (!confirm(`Yakin ingin menghapus ${name}?`)) return;
    try {
      await deleteVehicle({ data: { id } });
      toast.success(`${name} dihapus dari katalog.`);
      setVehicles((prev) => prev.filter((v) => v.id !== id));
    } catch {
      toast.error("Gagal menghapus kendaraan.");
    }
  };

  // TOUR ACTIONS
  const handleSaveTourSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTour) return;
    try {
      await saveTour({ data: editingTour });
      toast.success(`Paket ${editingTour.title} berhasil disimpan!`);
      setEditingTour(null);
      fetchOverview();
    } catch {
      toast.error("Gagal menyimpan paket wisata.");
    }
  };

  const handleDeleteTour = async (id: string, title: string) => {
    if (!confirm(`Yakin ingin menghapus ${title}?`)) return;
    try {
      await deleteTour({ data: { id } });
      toast.success(`${title} dihapus dari daftar paket.`);
      setTours((prev) => prev.filter((t) => t.id !== id));
    } catch {
      toast.error("Gagal menghapus paket.");
    }
  };

  // SETTINGS ACTIONS
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveSettings({
        data: {
          waNumber,
          deliveryAreas,
          geminiApiKey,
        },
      });
      toast.success("Pengaturan kontak, tarif, dan AI Chat berhasil disimpan!");
    } catch {
      toast.error("Gagal menyimpan pengaturan.");
    }
  };

  // LOGIN SCREEN
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
        <div className="w-full max-w-sm rounded-3xl border bg-card p-8 shadow-card text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
            <Lock className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold">Portal Admin LombokGo</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Masukkan PIN Admin untuk mengelola pesanan, harga sewa, dan paket wisata.
          </p>

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <input
                type="password"
                placeholder="Masukkan PIN (Default: 123456)"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                className="w-full text-center tracking-widest text-lg font-mono rounded-xl border bg-background px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20"
                autoFocus
              />
              {pinError && <p className="mt-2 text-xs text-destructive font-medium">{pinError}</p>}
            </div>
            <button
              type="submit"
              className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground shadow hover:opacity-90"
            >
              Masuk Dashboard
            </button>
            <div className="pt-2">
              <Link to="/" className="text-xs text-muted-foreground hover:text-primary">
                ← Kembali ke Website Utama
              </Link>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // CALC REVENUE
  const totalRevenue = orders
    .filter((o) => o.status === "lunas")
    .reduce((acc, o) => acc + (o.total || 0), 0);
  const paidCount = orders.filter((o) => o.status === "lunas").length;
  const pendingCount = orders.filter((o) => o.status !== "lunas").length;

  // FILTERED ORDERS
  const filteredOrders = orders.filter((o) => {
    const matchSearch =
      (o.invoice_number || "").toLowerCase().includes(orderSearch.toLowerCase()) ||
      (o.customer_name || "").toLowerCase().includes(orderSearch.toLowerCase()) ||
      (o.customer_phone || "").toLowerCase().includes(orderSearch.toLowerCase()) ||
      (o.item_name || "").toLowerCase().includes(orderSearch.toLowerCase());
    const matchStatus =
      orderStatusFilter === "all" ||
      (orderStatusFilter === "lunas" && o.status === "lunas") ||
      (orderStatusFilter === "pending" && o.status !== "lunas");
    return matchSearch && matchStatus;
  });

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Top Header */}
      <header className="sticky top-0 z-30 border-b bg-card/90 backdrop-blur px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="font-display text-2xl font-bold text-primary">
              Lombok<span className="text-accent">Go</span>
            </Link>
            <span className="rounded-md bg-accent/15 px-2.5 py-0.5 text-xs font-bold text-accent">
              Admin Portal
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchOverview}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-lg border bg-background px-3 py-1.5 text-xs font-semibold hover:bg-muted"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Segarkan
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/20"
            >
              <LogOut className="h-3.5 w-3.5" />
              Keluar
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b pb-4">
          <button
            onClick={() => setActiveTab("orders")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
              activeTab === "orders"
                ? "bg-primary text-primary-foreground shadow"
                : "bg-card text-muted-foreground hover:bg-muted"
            }`}
          >
            <ShoppingBag className="h-4 w-4" />
            Pesanan & Invoice
            <span className="rounded-full bg-white/20 px-2 py-0.2 text-xs">
              {orders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("vehicles")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
              activeTab === "vehicles"
                ? "bg-primary text-primary-foreground shadow"
                : "bg-card text-muted-foreground hover:bg-muted"
            }`}
          >
            <Car className="h-4 w-4" />
            Katalog Kendaraan
            <span className="rounded-full bg-white/20 px-2 py-0.2 text-xs">
              {vehicles.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("tours")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
              activeTab === "tours"
                ? "bg-primary text-primary-foreground shadow"
                : "bg-card text-muted-foreground hover:bg-muted"
            }`}
          >
            <Map className="h-4 w-4" />
            Paket Wisata
            <span className="rounded-full bg-white/20 px-2 py-0.2 text-xs">
              {tours.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
              activeTab === "settings"
                ? "bg-primary text-primary-foreground shadow"
                : "bg-card text-muted-foreground hover:bg-muted"
            }`}
          >
            <Settings className="h-4 w-4" />
            Pengaturan Bisnis & Kontak
          </button>
        </div>

        {/* TAB 1: ORDERS */}
        {activeTab === "orders" && (
          <div className="mt-6 space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border bg-card p-6 shadow-sm">
                <p className="text-xs font-semibold uppercase text-muted-foreground">Total Pendapatan Lunas</p>
                <p className="mt-2 text-2xl font-black text-whatsapp">{rupiah(totalRevenue)}</p>
                <p className="text-xs text-muted-foreground mt-1">{paidCount} transaksi berhasil dibayar</p>
              </div>
              <div className="rounded-3xl border bg-card p-6 shadow-sm">
                <p className="text-xs font-semibold uppercase text-muted-foreground">Menunggu Pembayaran</p>
                <p className="mt-2 text-2xl font-black text-amber-600">{pendingCount}</p>
                <p className="text-xs text-muted-foreground mt-1">Invoice belum diverifikasi lunas</p>
              </div>
              <div className="rounded-3xl border bg-card p-6 shadow-sm">
                <p className="text-xs font-semibold uppercase text-muted-foreground">Total Keseluruhan Pesanan</p>
                <p className="mt-2 text-2xl font-black text-foreground">{orders.length}</p>
                <p className="text-xs text-muted-foreground mt-1">Rental mobil, motor, dan tur</p>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col gap-3 rounded-2xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Cari no invoice, nama tamu, no HP, kendaraan..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="w-full rounded-xl border bg-background pl-9 pr-4 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground">Status:</span>
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="rounded-xl border bg-background px-3 py-2 text-xs font-semibold focus:outline-none"
                >
                  <option value="all">Semua Status ({orders.length})</option>
                  <option value="pending">Menunggu Pembayaran ({pendingCount})</option>
                  <option value="lunas">Lunas ({paidCount})</option>
                </select>
              </div>
            </div>

            {/* Orders Table */}
            <div className="overflow-x-auto rounded-3xl border bg-card shadow-sm">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b bg-muted/40 text-xs font-semibold text-muted-foreground">
                    <th className="px-5 py-3.5">Invoice & Tanggal</th>
                    <th className="px-5 py-3.5">Nama & Kontak Tamu</th>
                    <th className="px-5 py-3.5">Pesanan Unit / Tur</th>
                    <th className="px-5 py-3.5 text-right">Total Bayar</th>
                    <th className="px-5 py-3.5 text-center">Status</th>
                    <th className="px-5 py-3.5 text-right">Aksi Cepat</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredOrders.map((o) => {
                    const isPaid = o.status === "lunas";
                    const cleanPhone = (o.customer_phone || "").replace(/\D/g, "");
                    const waDirect = `https://wa.me/${cleanPhone.startsWith("0") ? "62" + cleanPhone.slice(1) : cleanPhone}?text=Halo%20${encodeURIComponent(o.customer_name)}%2C%20kami%20dari%20LombokGo%20mengonfirmasi%20pesanan%20${o.invoice_number}.`;

                    return (
                      <tr key={o.invoice_number} className="hover:bg-muted/10 transition">
                        <td className="px-5 py-4">
                          <p className="font-mono font-bold text-foreground">{o.invoice_number}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(o.created_at || Date.now()).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <p className="font-semibold text-foreground">{o.customer_name}</p>
                          <p className="text-xs text-muted-foreground">{o.customer_phone}</p>
                          <p className="text-xs text-muted-foreground">{o.customer_email}</p>
                        </td>

                        <td className="px-5 py-4">
                          <p className="font-medium text-foreground">{o.item_name}</p>
                          <p className="text-xs text-muted-foreground">
                            Mulai: {o.start_date} ({o.quantity} {o.unit_label})
                          </p>
                          {o.delivery_area && (
                            <span className="inline-block rounded bg-primary/10 px-2 py-0.5 text-[10px] text-primary mt-1">
                              Antar: {o.delivery_area}
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4 text-right">
                          <p className="font-bold text-foreground">{rupiah(o.total)}</p>
                          <p className="text-[11px] text-muted-foreground">{o.payment_method}</p>
                        </td>

                        <td className="px-5 py-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
                              isPaid ? "bg-whatsapp/15 text-whatsapp" : "bg-amber-500/15 text-amber-600"
                            }`}
                          >
                            {isPaid ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                            {isPaid ? "LUNAS" : "MENUNGGU"}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {!isPaid && (
                              <button
                                onClick={() => handleMarkPaid(o.invoice_number)}
                                title="Tandai Sudah Lunas"
                                className="rounded-lg bg-whatsapp px-2.5 py-1 text-xs font-bold text-primary-foreground shadow-sm hover:opacity-90 transition"
                              >
                                ✓ Tandai Lunas
                              </button>
                            )}

                            <a
                              href={`/invoice/${o.invoice_number}?token=${o.access_token || ""}`}
                              target="_blank"
                              rel="noreferrer"
                              title="Buka Lembar Invoice"
                              className="rounded-lg border bg-background p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition"
                            >
                              <Eye className="h-4 w-4" />
                            </a>

                            {cleanPhone && (
                              <a
                                href={waDirect}
                                target="_blank"
                                rel="noreferrer"
                                title="Hubungi WA Pelanggan"
                                className="rounded-lg bg-whatsapp/15 p-1.5 text-whatsapp hover:bg-whatsapp hover:text-primary-foreground transition"
                              >
                                <MessageCircle className="h-4 w-4" />
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredOrders.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-muted-foreground">
                        Tidak ada pesanan yang sesuai filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: FLEET / VEHICLES */}
        {activeTab === "vehicles" && (
          <div className="mt-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Katalog Mobil & Motor</h2>
                <p className="text-xs text-muted-foreground">
                  Perubahan harga sewa harian/mingguan di sini langsung aktif di halaman depan dan formulir booking.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsNewVehicle(true);
                  setEditingVehicle({
                    id: `v-${Date.now()}`,
                    name: "",
                    type: "Mobil",
                    seats: 7,
                    transmission: "Manual",
                    driver: true,
                    daily: 350000,
                    weekly: 2200000,
                    year: new Date().getFullYear(),
                    condition: "Sangat baik, AC dingin",
                    specs: ["AC", "Audio Bluetooth", "Bensin"],
                  });
                }}
                className="flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-xs sm:text-sm font-bold text-accent-foreground shadow hover:opacity-90"
              >
                <Plus className="h-4 w-4" />
                Tambah Kendaraan Baru
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {vehicles.map((v) => (
                <div key={v.id} className="flex flex-col justify-between rounded-3xl border bg-card overflow-hidden shadow-sm">
                  {/* Vehicle Photo */}
                  {v.image ? (
                    <img
                      src={v.image}
                      alt={v.name}
                      className="h-40 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-32 w-full items-center justify-center bg-muted/50">
                      <Car className="h-10 w-10 text-muted-foreground/40" />
                    </div>
                  )}

                  <div className="p-5 flex flex-col flex-1 justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                          {v.type}
                        </span>
                        <span className="text-xs font-semibold text-muted-foreground">Tahun {v.year}</span>
                      </div>

                      <h3 className="mt-3 text-lg font-bold">{v.name}</h3>
                      <p className="text-xs text-muted-foreground">{v.condition}</p>

                      <div className="mt-3 flex flex-wrap gap-2 text-xs">
                        <span className="rounded-lg bg-secondary px-2 py-1 font-medium">{v.seats} Kursi</span>
                        <span className="rounded-lg bg-secondary px-2 py-1 font-medium">⚙️ {v.transmission}</span>
                        <span className="rounded-lg bg-secondary px-2 py-1 font-medium">
                          {v.driverOption === "both"
                            ? "🚗 Lepas Kunci & Sopir"
                            : v.driverOption === "with_driver"
                            ? "👤 Dengan Sopir"
                            : "🔑 Lepas Kunci"}
                        </span>
                      </div>

                      <div className="mt-4 border-t pt-3 space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Sewa Harian:</span>
                          <span className="font-bold text-primary">{rupiah(v.daily)} /hari</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Sewa Mingguan:</span>
                          <span className="font-medium text-foreground">{rupiah(v.weekly)} /minggu</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex gap-2 border-t pt-4">
                      <button
                        onClick={() => {
                          setIsNewVehicle(false);
                          setEditingVehicle({ ...v });
                        }}
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border bg-secondary py-2 text-xs font-bold hover:bg-muted"
                      >
                        <Edit className="h-3.5 w-3.5" />
                        Edit Harga / Unit
                      </button>
                      <button
                        onClick={() => handleDeleteVehicle(v.id, v.name)}
                        className="flex items-center justify-center rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs font-bold text-destructive hover:bg-destructive/20"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: TOURS */}
        {activeTab === "tours" && (
          <div className="mt-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Daftar Paket Wisata</h2>
                <p className="text-xs text-muted-foreground">
                  Edit judul paket, itinerary, fasilitas, dan harga per orang untuk tur Lombok.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsNewTour(true);
                  setEditingTour({
                    id: `tour-${Date.now()}`,
                    title: "",
                    category: "One-Day Tour",
                    duration: "1 hari",
                    price: 400000,
                    image: "/src/assets/gili.jpg",
                    summary: "",
                    itinerary: ["08.00 Jemput di penginapan", "10.00 Mulai aktivitas tur", "16.00 Selesai dan kembali"],
                    includes: ["Transportasi AC", "Makan siang", "Pemandu lokal", "Tiket masuk"],
                    pickup: "Senggigi, Mataram, Bandara",
                  });
                }}
                className="flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-xs sm:text-sm font-bold text-accent-foreground shadow hover:opacity-90"
              >
                <Plus className="h-4 w-4" />
                Tambah Paket Wisata
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {tours.map((t) => (
                <div key={t.id} className="flex flex-col justify-between rounded-3xl border bg-card p-6 shadow-sm">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-accent/15 px-3 py-1 text-xs font-bold text-accent">
                        {t.category}
                      </span>
                      <span className="text-xs font-semibold text-muted-foreground">{t.duration}</span>
                    </div>

                    <h3 className="mt-3 text-xl font-bold text-foreground">{t.title}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">{t.summary}</p>
                    <p className="mt-2 text-xs font-medium text-muted-foreground">📍 Jemput: {t.pickup}</p>

                    <div className="mt-4 border-t pt-3 flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Harga Paket:</span>
                      <span className="text-lg font-black text-primary">{rupiah(t.price)} /orang</span>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-2 border-t pt-4">
                    <button
                      onClick={() => {
                        setIsNewTour(false);
                        setEditingTour({ ...t });
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border bg-secondary py-2 text-xs font-bold hover:bg-muted"
                    >
                      <Edit className="h-3.5 w-3.5" />
                      Edit Paket & Harga
                    </button>
                    <button
                      onClick={() => handleDeleteTour(t.id, t.title)}
                      className="flex items-center justify-center rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs font-bold text-destructive hover:bg-destructive/20"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: SETTINGS */}
        {activeTab === "settings" && (
          <div className="mt-6 max-w-2xl space-y-6">
            <form onSubmit={handleSaveSettings} className="rounded-3xl border bg-card p-6 sm:p-8 shadow-sm space-y-6">
              <div>
                <h2 className="text-xl font-bold">Pengaturan Bisnis & Kontak</h2>
                <p className="text-xs text-muted-foreground">
                  Nomor WhatsApp bisnis dan biaya pengantaran ke berbagai titik di Pulau Lombok.
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase">
                  Nomor WhatsApp Resmi Bisnis
                </label>
                <div className="mt-1 flex items-center gap-2">
                  <span className="rounded-xl border bg-muted px-3 py-2.5 text-sm font-mono">+</span>
                  <input
                    type="text"
                    value={waNumber}
                    onChange={(e) => setWaNumber(e.target.value.replace(/\D/g, ""))}
                    placeholder="Contoh: 6287866950767"
                    className="flex-1 rounded-xl border bg-background px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  *Gunakan awalan kode negara 62 tanpa spasi atau tanda +. Nomor ini digunakan untuk tombol chat WhatsApp di seluruh website.
                </p>
              </div>

              <div className="border-t pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-muted-foreground uppercase">
                    Kunci AI Google Gemini (Gratis)
                  </label>
                  <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600">
                    AI Pintar 24 Jam
                  </span>
                </div>
                <input
                  type="password"
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value.trim())}
                  placeholder="Masukkan Gemini API Key (AIzaSy...)"
                  className="w-full rounded-xl border bg-background px-4 py-2.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Dapatkan API Key gratis di{" "}
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-primary underline"
                  >
                    Google AI Studio (aistudio.google.com)
                  </a>
                  . Dengan memasukkan API Key ini, asisten Live Chat akan menjadi sangat pintar, memahami rekomendasi kapasitas mobil, jumlah hari sewa, hitung harga, dan menjawab dalam bahasa santun secara otomatis.
                </p>
              </div>

              <div className="border-t pt-4 space-y-3">
                <label className="text-xs font-bold text-muted-foreground uppercase">
                  Tarif Antar-Jemput Kendaraan
                </label>

                {deliveryAreas.map((area, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="w-48 text-xs font-semibold text-foreground truncate">{area.name}</span>
                    <div className="flex-1 flex items-center gap-2">
                      <span className="text-xs font-semibold text-muted-foreground">Rp</span>
                      <input
                        type="number"
                        value={area.fee}
                        onChange={(e) => {
                          const updated = [...deliveryAreas];
                          updated[idx] = { ...updated[idx], fee: +e.target.value };
                          setDeliveryAreas(updated);
                        }}
                        className="w-full rounded-xl border bg-background px-3 py-1.5 text-xs font-mono focus:outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground shadow hover:opacity-90"
              >
                <Save className="h-4 w-4" />
                Simpan Seluruh Pengaturan
              </button>
            </form>
          </div>
        )}
      </main>

      {/* MODAL EDIT / TAMBAH KENDARAAN */}
      {editingVehicle && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in"
          onClick={() => setEditingVehicle(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border bg-card p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold">
              {isNewVehicle ? "Tambah Kendaraan Baru" : `Edit Kendaraan: ${editingVehicle.name}`}
            </h3>

            <form onSubmit={handleSaveVehicleSubmit} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-muted-foreground">Nama Kendaraan</label>
                  <input
                    required
                    value={editingVehicle.name}
                    onChange={(e) => setEditingVehicle({ ...editingVehicle, name: e.target.value })}
                    className="mt-1 w-full rounded-xl border bg-background p-2.5 text-xs"
                    placeholder="Contoh: Mitsubishi Xpander"
                  />
                </div>
                <div>
                  <label className="font-semibold text-muted-foreground">Tipe Unit</label>
                  <select
                    value={editingVehicle.type}
                    onChange={(e) => setEditingVehicle({ ...editingVehicle, type: e.target.value as any })}
                    className="mt-1 w-full rounded-xl border bg-background p-2.5 text-xs"
                  >
                    <option value="Mobil">Mobil</option>
                    <option value="Motor">Motor</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-muted-foreground">Kapasitas Kursi</label>
                  <input
                    type="number"
                    value={editingVehicle.seats}
                    onChange={(e) => setEditingVehicle({ ...editingVehicle, seats: +e.target.value })}
                    className="mt-1 w-full rounded-xl border bg-background p-2.5 text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-muted-foreground">Transmisi</label>
                  <select
                    value={editingVehicle.transmission}
                    onChange={(e) => setEditingVehicle({ ...editingVehicle, transmission: e.target.value as any })}
                    className="mt-1 w-full rounded-xl border bg-background p-2.5 text-xs"
                  >
                    <option value="Manual & Otomatis">Manual &amp; Otomatis (Keduanya Tersedia)</option>
                    <option value="Manual">Manual Saja</option>
                    <option value="Otomatis">Otomatis Saja</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-muted-foreground">Tahun Unit</label>
                  <input
                    type="number"
                    value={editingVehicle.year}
                    onChange={(e) => setEditingVehicle({ ...editingVehicle, year: +e.target.value })}
                    className="mt-1 w-full rounded-xl border bg-background p-2.5 text-xs"
                  />
                </div>
              </div>

              {/* HARGA SEWA — dinamis berdasarkan pilihan transmisi & sopir */}
              {editingVehicle.transmission === "Manual & Otomatis" ? (
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 space-y-3">
                  <p className="text-[11px] font-bold text-primary uppercase tracking-wide">Harga Sewa per Transmisi</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-muted-foreground">⚙️ Manual — Harian (Rp)</label>
                      <input
                        type="number"
                        value={editingVehicle.dailyManual ?? 0}
                        onChange={(e) => setEditingVehicle({ ...editingVehicle, dailyManual: +e.target.value, daily: Math.min(editingVehicle.dailyOtomatis ?? +e.target.value, +e.target.value) })}
                        className="mt-1 w-full rounded-xl border bg-background p-2.5 text-xs font-mono font-bold text-primary"
                        placeholder="350000"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-muted-foreground">⚙️ Manual — Mingguan (Rp)</label>
                      <input
                        type="number"
                        value={editingVehicle.weeklyManual ?? 0}
                        onChange={(e) => setEditingVehicle({ ...editingVehicle, weeklyManual: +e.target.value, weekly: Math.min(editingVehicle.weeklyOtomatis ?? +e.target.value, +e.target.value) })}
                        className="mt-1 w-full rounded-xl border bg-background p-2.5 text-xs font-mono font-bold text-primary"
                        placeholder="2200000"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-muted-foreground">🚗 Otomatis — Harian (Rp)</label>
                      <input
                        type="number"
                        value={editingVehicle.dailyOtomatis ?? 0}
                        onChange={(e) => setEditingVehicle({ ...editingVehicle, dailyOtomatis: +e.target.value, daily: Math.min(editingVehicle.dailyManual ?? +e.target.value, +e.target.value) })}
                        className="mt-1 w-full rounded-xl border bg-background p-2.5 text-xs font-mono font-bold text-primary"
                        placeholder="400000"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-muted-foreground">🚗 Otomatis — Mingguan (Rp)</label>
                      <input
                        type="number"
                        value={editingVehicle.weeklyOtomatis ?? 0}
                        onChange={(e) => setEditingVehicle({ ...editingVehicle, weeklyOtomatis: +e.target.value, weekly: Math.min(editingVehicle.weeklyManual ?? +e.target.value, +e.target.value) })}
                        className="mt-1 w-full rounded-xl border bg-background p-2.5 text-xs font-mono font-bold text-primary"
                        placeholder="2600000"
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground">Harga terendah otomatis dipakai sebagai harga tampilan kartu kendaraan.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-muted-foreground">Sewa Harian (Rp)</label>
                    <input
                      type="number"
                      required
                      value={editingVehicle.daily}
                      onChange={(e) => setEditingVehicle({ ...editingVehicle, daily: +e.target.value })}
                      className="mt-1 w-full rounded-xl border bg-background p-2.5 text-xs font-mono font-bold text-primary"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-muted-foreground">Sewa Mingguan (Rp)</label>
                    <input
                      type="number"
                      required
                      value={editingVehicle.weekly}
                      onChange={(e) => setEditingVehicle({ ...editingVehicle, weekly: +e.target.value })}
                      className="mt-1 w-full rounded-xl border bg-background p-2.5 text-xs font-mono font-bold text-primary"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="font-semibold text-muted-foreground">Opsi Supir</label>
                <select
                  value={editingVehicle.driverOption ?? (editingVehicle.driver ? "with_driver" : "self_drive")}
                  onChange={(e) => {
                    const val = e.target.value;
                    setEditingVehicle({
                      ...editingVehicle,
                      driverOption: val,
                      driver: val === "self_drive" ? false : true,
                    });
                  }}
                  className="mt-1 w-full rounded-xl border bg-background p-2.5 text-xs"
                >
                  <option value="both">Tersedia Keduanya (Lepas Kunci &amp; Dengan Sopir)</option>
                  <option value="self_drive">Lepas Kunci Saja (Tanpa Sopir)</option>
                  <option value="with_driver">Dengan Sopir Saja</option>
                </select>
              </div>

              {/* HARGA SOPIR — muncul jika opsi "both" atau "with_driver" */}
              {(editingVehicle.driverOption === "both" || editingVehicle.driverOption === "with_driver") && (
                <div className="rounded-xl border border-amber-300/40 bg-amber-50/60 dark:bg-amber-950/20 p-3 space-y-2">
                  <p className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wide">
                    👤 Biaya Tambahan Sopir
                    {editingVehicle.driverOption === "both" && <span className="ml-1 font-normal normal-case">(hanya dikenakan jika pelanggan pilih "Dengan Sopir")</span>}
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-muted-foreground">Biaya Sopir /hari (Rp)</label>
                      <input
                        type="number"
                        value={editingVehicle.dailyDriver ?? 0}
                        onChange={(e) => setEditingVehicle({ ...editingVehicle, dailyDriver: +e.target.value })}
                        className="mt-1 w-full rounded-xl border bg-background p-2.5 text-xs font-mono font-bold text-amber-700 dark:text-amber-400"
                        placeholder="150000"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-muted-foreground">Biaya Sopir /minggu (Rp)</label>
                      <input
                        type="number"
                        value={editingVehicle.weeklyDriver ?? 0}
                        onChange={(e) => setEditingVehicle({ ...editingVehicle, weeklyDriver: +e.target.value })}
                        className="mt-1 w-full rounded-xl border bg-background p-2.5 text-xs font-mono font-bold text-amber-700 dark:text-amber-400"
                        placeholder="900000"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* UPLOAD FOTO KENDARAAN */}
              <div>
                <label className="font-semibold text-muted-foreground">Foto Kendaraan</label>
                <div className="mt-1 space-y-2">
                  {editingVehicle.image ? (
                    <div className="relative">
                      <img
                        src={editingVehicle.image}
                        alt="Preview Foto Kendaraan"
                        className="h-40 w-full rounded-xl border object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setEditingVehicle({ ...editingVehicle, image: undefined })}
                        className="absolute right-2 top-2 rounded-full bg-destructive/90 px-2.5 py-1 text-[10px] font-bold text-white shadow hover:bg-destructive"
                      >
                        Hapus Foto
                      </button>
                    </div>
                  ) : (
                    <div className="flex h-28 w-full items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/30 bg-muted/30 text-muted-foreground">
                      <span className="text-[11px]">Belum ada foto — upload di bawah</span>
                    </div>
                  )}
                  <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-primary/40 bg-primary/5 py-2 text-xs font-bold text-primary hover:bg-primary/10 transition-colors">
                    {imageUploading ? (
                      <span>Memproses gambar…</span>
                    ) : (
                      <>
                        <span>📷</span>
                        <span>{editingVehicle.image ? "Ganti Foto" : "Upload Foto Kendaraan"}</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={imageUploading}
                    />
                  </label>
                  <p className="text-[10px] text-muted-foreground">Format: JPG/PNG/WEBP. Otomatis dikompres ke maks 1000px.</p>
                </div>
              </div>

              <div>
                <label className="font-semibold text-muted-foreground">Kondisi Kendaraan</label>
                <input
                  value={editingVehicle.condition}
                  onChange={(e) => setEditingVehicle({ ...editingVehicle, condition: e.target.value })}
                  className="mt-1 w-full rounded-xl border bg-background p-2.5 text-xs"
                  placeholder="Contoh: Sangat baik, AC dingin, terawat rutin"
                />
              </div>

              <div>
                <label className="font-semibold text-muted-foreground">Fasilitas / Fitur (Pisahkan tanda koma)</label>
                <input
                  value={editingVehicle.specs.join(", ")}
                  onChange={(e) =>
                    setEditingVehicle({
                      ...editingVehicle,
                      specs: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                    })
                  }
                  className="mt-1 w-full rounded-xl border bg-background p-2.5 text-xs"
                  placeholder="AC, Audio Bluetooth, Kamera Mundur"
                />
              </div>

              <div className="mt-6 flex justify-end gap-2 border-t pt-4">
                <button
                  type="button"
                  onClick={() => setEditingVehicle(null)}
                  className="rounded-xl border px-4 py-2 text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-primary px-5 py-2 text-xs font-bold text-primary-foreground shadow"
                >
                  Simpan Kendaraan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT / TAMBAH PAKET */}
      {editingTour && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in"
          onClick={() => setEditingTour(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border bg-card p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold">
              {isNewTour ? "Tambah Paket Wisata" : `Edit Paket: ${editingTour.title}`}
            </h3>

            <form onSubmit={handleSaveTourSubmit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-muted-foreground">Judul Paket</label>
                <input
                  required
                  value={editingTour.title}
                  onChange={(e) => setEditingTour({ ...editingTour, title: e.target.value })}
                  className="mt-1 w-full rounded-xl border bg-background p-2.5 text-xs"
                  placeholder="Contoh: Eksplorasi Air Terjun Benang Kelambu"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-muted-foreground">Kategori Paket</label>
                  <select
                    value={editingTour.category}
                    onChange={(e) => setEditingTour({ ...editingTour, category: e.target.value as any })}
                    className="mt-1 w-full rounded-xl border bg-background p-2.5 text-xs"
                  >
                    <option value="One-Day Tour">One-Day Tour</option>
                    <option value="Keluarga">Keluarga</option>
                    <option value="Honeymoon">Honeymoon</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-muted-foreground">Durasi</label>
                  <input
                    value={editingTour.duration}
                    onChange={(e) => setEditingTour({ ...editingTour, duration: e.target.value })}
                    className="mt-1 w-full rounded-xl border bg-background p-2.5 text-xs"
                    placeholder="1 hari / 3 hari 2 malam"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-muted-foreground">Harga per Orang (Rp)</label>
                  <input
                    type="number"
                    required
                    value={editingTour.price}
                    onChange={(e) => setEditingTour({ ...editingTour, price: +e.target.value })}
                    className="mt-1 w-full rounded-xl border bg-background p-2.5 text-xs font-mono font-bold text-primary"
                  />
                </div>
                <div>
                  <label className="font-semibold text-muted-foreground">Area Penjemputan</label>
                  <input
                    value={editingTour.pickup}
                    onChange={(e) => setEditingTour({ ...editingTour, pickup: e.target.value })}
                    className="mt-1 w-full rounded-xl border bg-background p-2.5 text-xs"
                    placeholder="Mataram, Senggigi, Bandara"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-muted-foreground">Ringkasan Singkat</label>
                <textarea
                  rows={2}
                  value={editingTour.summary}
                  onChange={(e) => setEditingTour({ ...editingTour, summary: e.target.value })}
                  className="mt-1 w-full rounded-xl border bg-background p-2.5 text-xs"
                  placeholder="Ceritakan daya tarik utama paket ini..."
                />
              </div>

              <div>
                <label className="font-semibold text-muted-foreground">
                  Rute / Itinerary (Satu jadwal per baris)
                </label>
                <textarea
                  rows={4}
                  value={editingTour.itinerary.join("\n")}
                  onChange={(e) =>
                    setEditingTour({
                      ...editingTour,
                      itinerary: e.target.value.split("\n").filter(Boolean),
                    })
                  }
                  className="mt-1 w-full rounded-xl border bg-background p-2.5 text-xs font-mono"
                  placeholder="08.00 Jemput di hotel&#10;10.00 Snorkeling&#10;13.00 Makan siang"
                />
              </div>

              <div>
                <label className="font-semibold text-muted-foreground">
                  Fasilitas Termasuk (Pisahkan tanda koma)
                </label>
                <input
                  value={editingTour.includes.join(", ")}
                  onChange={(e) =>
                    setEditingTour({
                      ...editingTour,
                      includes: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                    })
                  }
                  className="mt-1 w-full rounded-xl border bg-background p-2.5 text-xs"
                  placeholder="Transport AC, Boat, Makan siang, Pemandu"
                />
              </div>

              <div className="mt-6 flex justify-end gap-2 border-t pt-4">
                <button
                  type="button"
                  onClick={() => setEditingTour(null)}
                  className="rounded-xl border px-4 py-2 text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-primary px-5 py-2 text-xs font-bold text-primary-foreground shadow"
                >
                  Simpan Paket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
