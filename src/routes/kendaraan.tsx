import { createFileRoute } from "@tanstack/react-router";
import { Bike, Car, Users, Settings2, UserCheck, Key } from "lucide-react";
import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { BookingDialog } from "@/components/BookingDialog";
import { rupiah, vehicles as staticVehicles, type Vehicle } from "@/lib/data";
import { getCatalogPublic, type AdminVehicle } from "@/lib/admin.functions";

export const Route = createFileRoute("/kendaraan")({
  head: () => ({
    meta: [
      { title: "Sewa Mobil & Motor Lombok — LombokGo" },
      { name: "description", content: "Sewa mobil dan motor di Lombok, lepas kunci atau dengan sopir. Antar ke Bandara LOP, Senggigi, Kuta, Mataram." },
      { property: "og:title", content: "Sewa Mobil & Motor Lombok" },
      { property: "og:description", content: "Filter berdasarkan jenis, kapasitas, transmisi, dan opsi sopir." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: async () => {
    try {
      const catalog = await getCatalogPublic();
      // Gunakan DB jika ada kendaraan tersimpan, fallback ke data statis
      return { vehicles: catalog.vehicles.length > 0 ? catalog.vehicles : null };
    } catch {
      return { vehicles: null };
    }
  },
  component: Page,
});

// Konversi AdminVehicle ke Vehicle agar kompatibel dengan BookingDialog
function toVehicle(v: AdminVehicle): Vehicle {
  return {
    id: v.id,
    name: v.name,
    type: v.type as Vehicle["type"],
    seats: v.seats,
    transmission: v.transmission,
    driver: v.driver,
    driverOption: v.driverOption,
    daily: v.daily,
    weekly: v.weekly,
    dailyManual: v.dailyManual,
    weeklyManual: v.weeklyManual,
    dailyOtomatis: v.dailyOtomatis,
    weeklyOtomatis: v.weeklyOtomatis,
    dailyDriver: v.dailyDriver,
    weeklyDriver: v.weeklyDriver,
    year: v.year,
    condition: v.condition,
    specs: v.specs,
    image: v.image,
  };
}

const sel = "rounded-lg border bg-card px-3 py-2 text-sm";

function Page() {
  const loaderData = Route.useLoaderData();
  const [liveVehicles, setLiveVehicles] = useState<AdminVehicle[] | null>(loaderData?.vehicles || null);

  useEffect(() => {
    // Ambil data terbaru langsung dari server untuk memastikan foto dan harga varian dari admin selalu tampil
    getCatalogPublic()
      .then((cat) => {
        if (cat?.vehicles && cat.vehicles.length > 0) {
          setLiveVehicles(cat.vehicles);
        }
      })
      .catch((err) => console.warn("[kendaraan] getCatalogPublic client error:", err));
  }, []);

  const allVehicles: Vehicle[] = liveVehicles ? liveVehicles.map(toVehicle) : staticVehicles;

  const [type, setType] = useState("Semua");
  const [seats, setSeats] = useState(0);
  const [trans, setTrans] = useState("Semua");
  const [mode, setMode] = useState("Semua");
  const [book, setBook] = useState<Vehicle | null>(null);

  const list = allVehicles.filter((v) => {
    const matchType = type === "Semua" || v.type === type;
    const matchSeats = v.seats >= seats;
    const matchTrans =
      trans === "Semua" ||
      v.transmission === trans ||
      v.transmission === "Manual & Otomatis" ||
      (v.transmission && v.transmission.toLowerCase().includes(trans.toLowerCase()));
    const matchMode =
      mode === "Semua" ||
      (mode === "Dengan Sopir" && (v.driver || v.driverOption === "both" || v.driverOption === "with_driver")) ||
      (mode === "Lepas Kunci" && (!v.driver || v.driverOption === "both" || v.driverOption === "self_drive"));
    return matchType && matchSeats && matchTrans && matchMode;
  });

  return (
    <Layout>
      <section className="mx-auto max-w-6xl px-4 py-12">
        <h1 className="text-5xl font-semibold">Sewa Kendaraan</h1>
        <p className="mt-2 text-muted-foreground">Diantar gratis area Mataram. Bandara, pelabuhan, Senggigi & Kuta tersedia.</p>
        <div className="mt-8 flex flex-wrap gap-3 rounded-2xl bg-secondary p-4">
          <select className={sel} value={type} onChange={(e) => setType(e.target.value)}><option>Semua</option><option>Mobil</option><option>Motor</option></select>
          <select className={sel} value={seats} onChange={(e) => setSeats(+e.target.value)}><option value={0}>Semua kapasitas</option><option value={4}>4+ orang</option><option value={7}>7+ orang</option><option value={14}>14 orang</option></select>
          <select className={sel} value={trans} onChange={(e) => setTrans(e.target.value)}><option>Semua</option><option>Manual</option><option>Otomatis</option></select>
          <select className={sel} value={mode} onChange={(e) => setMode(e.target.value)}><option>Semua</option><option>Lepas Kunci</option><option>Dengan Sopir</option></select>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {list.map((v) => {
            const Icon = v.type === "Mobil" ? Car : Bike;
            return (
              <div key={v.id} className="flex flex-col rounded-2xl bg-card shadow-card overflow-hidden">
                {/* Foto kendaraan */}
                <div className="flex h-44 items-center justify-center bg-secondary overflow-hidden">
                  {v.image ? (
                    <img src={v.image} alt={v.name} className="h-full w-full object-cover" />
                  ) : (
                    <Icon className="h-16 w-16 text-primary" />
                  )}
                </div>

                <div className="flex flex-col flex-1 p-6">
                  <h3 className="text-xl font-semibold">{v.name}</h3>
                  <p className="text-xs text-muted-foreground">Tahun {v.year} · {v.condition}</p>
                  <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Users className="h-3 w-3" />{v.seats} org</span>
                    <span className="flex items-center gap-1"><Settings2 className="h-3 w-3" />{v.transmission}</span>
                    <span className="flex items-center gap-1">
                      {v.driverOption === "with_driver" ? (
                        <><UserCheck className="h-3 w-3" />Dengan sopir</>
                      ) : v.driverOption === "self_drive" ? (
                        <><Key className="h-3 w-3" />Lepas kunci</>
                      ) : (
                        <><UserCheck className="h-3 w-3" />Sopir / lepas kunci</>
                      )}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">{v.specs.map((s) => <span key={s} className="rounded-full bg-muted px-2 py-0.5 text-xs">{s}</span>)}</div>
                  <div className="mt-auto pt-4">
                    <p className="text-lg font-bold text-primary">{rupiah(v.daily)}<span className="text-xs font-normal text-muted-foreground"> /hari</span></p>
                    <p className="text-xs text-muted-foreground">{rupiah(v.weekly)} /minggu</p>
                    <button onClick={() => setBook(v)} className="mt-3 w-full rounded-full bg-accent py-2.5 font-semibold text-accent-foreground">Cek & Pesan</button>
                  </div>
                </div>
              </div>
            );
          })}
          {list.length === 0 && <p className="text-muted-foreground">Tidak ada kendaraan yang cocok.</p>}
        </div>
      </section>
      {book && (
        <BookingDialog
          id={book.id}
          itemType="vehicle"
          title={book.name}
          unitLabel="hari"
          onClose={() => setBook(null)}
          vehicleData={(liveVehicles ? liveVehicles.find((v) => v.id === book.id) : undefined) || (book as any)}
        />
      )}

    </Layout>
  );
}
