import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Car,
  Map,
  Plane,
  ShieldCheck,
  Star,
  CheckCircle2,
  Clock,
  MapPin,
  Headphones,
  Sparkles,
  ArrowRight,
  Bike,
  Compass,
} from "lucide-react";
import hero from "@/assets/hero.jpg";
import { Layout } from "@/components/Layout";
import { reviews, rupiah, tours, WA_NUMBER, waLink } from "@/lib/data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LombokGo Transport & Rental — Sewa Mobil & Motor Bandara Lombok (BIZAM)" },
      { name: "description", content: "LombokGo: Sewa mobil lepas kunci/dengan sopir, rental motor, antar-jemput Bandara BIZAM Praya, serta paket wisata Lombok terbaik. Layanan 24 jam & harga transparan." },
      { property: "og:title", content: "LombokGo Transport & Rental — Right from the Airport Gate" },
      { property: "og:description", content: "Sewa kendaraan instan di pintu kedatangan Bandara BIZAM Lombok. Armada baru, bersih, bergaransi." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <Layout>
      {/* HERO SECTION */}
      <section className="relative overflow-hidden">
        <img
          src={hero}
          alt="LombokGo Transport & Rental Bandara Lombok"
          width={1600}
          height={912}
          className="h-[88vh] min-h-[580px] w-full object-cover brightness-[0.75]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/40 to-transparent" />
        <div className="absolute inset-0 mx-auto flex max-w-6xl flex-col justify-end px-4 pb-16 text-primary-foreground">
          <div className="inline-flex items-center gap-2 rounded-full bg-accent/90 px-3.5 py-1 text-xs font-semibold text-accent-foreground backdrop-blur-xs w-fit mb-3">
            <Plane className="h-3.5 w-3.5" />
            <span>Kawasan Bandara Internasional Lombok (BIZAM) Praya</span>
          </div>
          <h1 className="max-w-3xl text-4xl font-display font-bold leading-tight sm:text-6xl md:text-7xl">
            Your Seamless Gateway to Exploring Lombok.
          </h1>
          <p className="mt-3 text-lg md:text-2xl font-light text-accent italic">
            Right from the Airport Gate
          </p>
          <p className="mt-4 max-w-2xl text-sm sm:text-base opacity-90 leading-relaxed">
            Perusahaan penyedia jasa sewa mobil & motor, antar-jemput bandara (airport transfer), serta paket wisata lokal resmi. Armada keluaran terbaru, higienis, dan tanpa biaya tersembunyi.
          </p>
          <div className="mt-8 flex flex-wrap gap-3.5">
            <Link
              to="/kendaraan"
              className="rounded-full bg-accent px-6 py-3 font-semibold text-accent-foreground transition hover:opacity-90 shadow-lg flex items-center gap-2"
            >
              <Car className="h-4 w-4" />
              Sewa Kendaraan
            </Link>
            <Link
              to="/paket"
              className="rounded-full bg-background/95 px-6 py-3 font-semibold text-primary backdrop-blur-xs transition hover:bg-background shadow-md flex items-center gap-2"
            >
              <Map className="h-4 w-4" />
              Lihat Paket Wisata
            </Link>
            <a
              href={waLink("Halo LombokGo, saya butuh penjemputan di Bandara BIZAM.")}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-whatsapp/90 px-5 py-3 font-semibold text-primary-foreground backdrop-blur-xs transition hover:bg-whatsapp flex items-center gap-2"
            >
              <Plane className="h-4 w-4" />
              Antar-Jemput BIZAM
            </a>
          </div>
        </div>
      </section>

      {/* 4 KEUNGGULAN KOMPETITIF */}
      <section className="bg-card py-16 border-b">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-accent">Why Choose LombokGo?</p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-display font-semibold text-foreground">
              Keunggulan Layanan Transportasi Kami
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Komitmen kami memberikan standar layanan tertinggi untuk perjalanan bisnis, liburan keluarga, maupun petualangan Anda di Lombok.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border bg-background p-6 shadow-xs hover:shadow-card transition">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent">
                <MapPin className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-foreground">Kawasan Bandara BIZAM</h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                Serah terima kendaraan hanya beberapa menit setelah keluar area pengambilan bagasi. Langsung hemat biaya transfer awal dan waktu perjalanan.
              </p>
            </div>

            <div className="rounded-2xl border bg-background p-6 shadow-xs hover:shadow-card transition">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-foreground">Inspeksi & Kebersihan Ketat</h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                Setiap armada melewati pengecekan rem, ban, oli, AC, serta pencucian dan sterilisasi interior sebelum diserahkan kepada penyewa.
              </p>
            </div>

            <div className="rounded-2xl border bg-background p-6 shadow-xs hover:shadow-card transition">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-foreground">Transparansi Harga Cepat</h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                Rincian biaya jelas di awal tanpa biaya tersembunyi. Didukung verifikasi dokumen efisien serta sistem pembayaran digital otomatis.
              </p>
            </div>

            <div className="rounded-2xl border bg-background p-6 shadow-xs hover:shadow-card transition">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent">
                <Headphones className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-foreground">Bantuan Darurat 24 Jam</h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                Dukungan tim teknis lapangan yang siap membantu 24/7 di seluruh wilayah Lombok serta rekomendasi rute & kuliner lokal terbaik.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4 PILAR LAYANAN UTAMA */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-accent">Layanan Lengkap</p>
            <h2 className="mt-1 text-3xl sm:text-4xl font-display font-semibold text-foreground">
              Armada & Solusi Mobilitas Lombok
            </h2>
          </div>
          <Link to="/kendaraan" className="text-sm font-semibold text-accent hover:underline flex items-center gap-1">
            Lihat semua armada kendaraan <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col rounded-2xl bg-card border p-6 shadow-xs hover:shadow-card transition">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Car className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-foreground">Sewa Mobil</h3>
            <p className="text-xs text-accent font-medium mt-0.5">Lepas Kunci / Dengan Sopir</p>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              City car (Brio, Agya), MPV Keluarga (Avanza, Xenia, Xpander), SUV VIP (Innova Reborn, Fortuner), hingga HiAce Premio rombongan.
            </p>
            <Link to="/kendaraan" className="mt-auto pt-4 text-xs font-semibold text-primary hover:underline">
              Pilih Unit Mobil →
            </Link>
          </div>

          <div className="flex flex-col rounded-2xl bg-card border p-6 shadow-xs hover:shadow-card transition">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Bike className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-foreground">Sewa Sepeda Motor</h3>
            <p className="text-xs text-accent font-medium mt-0.5">Harian & Mingguan</p>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              Matic (Beat, Scoopy), Maxi Scooter (NMAX, PCX, XMAX), dan Trail Adventure (KLX 150, CRF). <strong>Gratis 2 helm SNI, jas hujan & phone holder.</strong>
            </p>
            <Link to="/kendaraan" className="mt-auto pt-4 text-xs font-semibold text-primary hover:underline">
              Pilih Unit Motor →
            </Link>
          </div>

          <div className="flex flex-col rounded-2xl bg-card border p-6 shadow-xs hover:shadow-card transition">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Plane className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-foreground">Airport Transfer</h3>
            <p className="text-xs text-accent font-medium mt-0.5">Antar-Jemput BIZAM 24 Jam</p>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              Penjemputan langsung di pintu kedatangan BIZAM menuju Kuta Mandalika, Mataram, Senggigi, Pelabuhan Bangsal/Teluk Nare (Gili), dan Sembalun.
            </p>
            <a href={waLink("Halo LombokGo, saya ingin reservasi Airport Transfer BIZAM.")} target="_blank" rel="noreferrer" className="mt-auto pt-4 text-xs font-semibold text-primary hover:underline">
              Pesan Antar-Jemput →
            </a>
          </div>

          <div className="flex flex-col rounded-2xl bg-card border p-6 shadow-xs hover:shadow-card transition">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Compass className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-foreground">Paket Wisata Lombok</h3>
            <p className="text-xs text-accent font-medium mt-0.5">Tur Harian & Multi-Day</p>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              Mandalika & Sasak Culture, 3 Gili Island Hopping (private boat & snorkeling), Rinjani Waterfall, hingga Custom Trip (2H1M - 4H3M).
            </p>
            <Link to="/paket" className="mt-auto pt-4 text-xs font-semibold text-primary hover:underline">
              Eksplorasi Paket Tur →
            </Link>
          </div>
        </div>
      </section>

      {/* POPULAR TOURS */}
      <section className="bg-secondary/60 py-16 border-y">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-accent">Destinasi Favorit</p>
              <h2 className="text-3xl sm:text-4xl font-display font-semibold text-foreground">Paket Wisata Populer</h2>
            </div>
            <Link to="/paket" className="text-sm font-semibold text-accent hover:underline flex items-center gap-1">
              Semua paket <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {tours.map((t) => (
              <Link to="/paket" key={t.id} className="group overflow-hidden rounded-2xl bg-card shadow-xs hover:shadow-card transition flex flex-col">
                <div className="overflow-hidden aspect-[4/3]">
                  <img
                    src={t.image}
                    alt={t.title}
                    loading="lazy"
                    width={1024}
                    height={1024}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <span className="text-[11px] font-semibold text-accent uppercase tracking-wider">{t.category}</span>
                  <h3 className="mt-1 font-semibold text-sm leading-snug text-foreground group-hover:text-primary transition">{t.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{t.summary}</p>
                  <div className="mt-auto pt-3 border-t border-border/50 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{t.duration}</span>
                    <span className="font-bold text-primary">{rupiah(t.price)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ALUR PEMESANAN (4 LANGKAH DARI COMPANY PROFILE) */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-accent">Sederhana & Praktis</p>
          <h2 className="mt-1 text-3xl sm:text-4xl font-display font-semibold text-foreground">
            Alur Pemesanan & Serah Terima
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Kemudahan sewa armada tanpa antre, langsung siap digunakan begitu Anda tiba di Lombok.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 relative">
          <div className="p-5 rounded-2xl bg-card border relative">
            <span className="absolute -top-3 left-5 flex h-7 w-7 items-center justify-center rounded-full bg-accent text-accent-foreground font-bold text-xs">1</span>
            <h4 className="mt-2 text-base font-semibold text-foreground">Konsultasi & Cek Ketersediaan</h4>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              Pilih kendaraan di website atau hubungi reservasi LombokGo dengan menginformasikan tanggal sewa, unit, dan nomor penerbangan (jika di BIZAM).
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-card border relative">
            <span className="absolute -top-3 left-5 flex h-7 w-7 items-center justify-center rounded-full bg-accent text-accent-foreground font-bold text-xs">2</span>
            <h4 className="mt-2 text-base font-semibold text-foreground">Konfirmasi & Verifikasi</h4>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              Pengiriman foto identitas resmi (e-KTP/Paspor serta SIM A untuk mobil lepas kunci atau SIM C untuk motor) beserta bukti tiket kedatangan.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-card border relative">
            <span className="absolute -top-3 left-5 flex h-7 w-7 items-center justify-center rounded-full bg-accent text-accent-foreground font-bold text-xs">3</span>
            <h4 className="mt-2 text-base font-semibold text-foreground">Serah Terima di BIZAM</h4>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              Tim kami menyambut Anda di titik temu kawasan Bandara Internasional Lombok (atau lokasi hotel) untuk pengecekan fisik unit bersama.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-card border relative">
            <span className="absolute -top-3 left-5 flex h-7 w-7 items-center justify-center rounded-full bg-accent text-accent-foreground font-bold text-xs">4</span>
            <h4 className="mt-2 text-base font-semibold text-foreground">Pengembalian Fleksibel</h4>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              Unit dapat dikembalikan di area Bandara BIZAM sebelum penerbangan pulang Anda, atau di titik lain sesuai kesepakatan awal.
            </p>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-secondary/80 py-16 border-t">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center max-w-xl mx-auto mb-10">
            <p className="text-xs font-bold uppercase tracking-widest text-accent">Testimoni Nyata</p>
            <h2 className="text-3xl font-display font-semibold text-foreground">Kata Pelanggan Kami</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {reviews.slice(0, 3).map((r) => (
              <div key={r.name} className="rounded-2xl bg-card p-6 border shadow-xs">
                <div className="flex gap-1 text-accent">
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-foreground">"{r.text}"</p>
                <p className="mt-4 text-xs font-semibold text-foreground">
                  {r.name} · <span className="text-muted-foreground font-normal">{r.from}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="bg-primary text-primary-foreground py-14">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <h2 className="text-2xl sm:text-4xl font-display font-bold">
            Mendarat di Bandara Lombok Hari Ini?
          </h2>
          <p className="mt-3 max-w-xl mx-auto text-sm sm:text-base text-primary-foreground/80">
            Armada siap menunggu Anda tepat di pintu gerbang BIZAM. Konsultasikan jadwal Anda bersama tim reservasi LombokGo sekarang.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              to="/kendaraan"
              className="rounded-full bg-accent px-7 py-3 text-sm font-semibold text-accent-foreground hover:opacity-90 shadow-md"
            >
              Cek Ketersediaan Kendaraan
            </Link>
            <a
              href={waLink("Halo LombokGo, saya butuh sewa kendaraan segera di Bandara BIZAM.")}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-whatsapp px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 flex items-center gap-2"
            >
              Chat WhatsApp (+62 878-6695-0767)
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
}
