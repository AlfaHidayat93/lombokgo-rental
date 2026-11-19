import { createFileRoute, Link } from "@tanstack/react-router";
import { Car, Map, Plane, ShieldCheck, Star } from "lucide-react";
import hero from "@/assets/hero.jpg";
import { Layout } from "@/components/Layout";
import { reviews, rupiah, tours } from "@/lib/data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LombokGo — Sewa Mobil, Motor & Paket Wisata Lombok" },
      { name: "description", content: "Booking sewa kendaraan dan paket wisata Lombok: Gili, Kuta, Rinjani. Antar-jemput bandara, bayar mudah, chat WhatsApp." },
      { property: "og:title", content: "LombokGo — Sewa Kendaraan & Paket Wisata Lombok" },
      { property: "og:description", content: "Pesan transportasi dan tur Lombok secara praktis, cepat, dan terpercaya." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <Layout>
      <section className="relative">
        <img src={hero} alt="Pantai Lombok" width={1600} height={912} className="h-[80vh] min-h-[520px] w-full object-cover" />
        <div className="absolute inset-0 bg-hero-overlay" />
        <div className="absolute inset-0 mx-auto flex max-w-6xl flex-col justify-end px-4 pb-16 text-primary-foreground">
          <p className="text-sm font-semibold uppercase tracking-widest">Lombok · Gili · Rinjani</p>
          <h1 className="mt-3 max-w-2xl text-5xl font-semibold leading-tight md:text-7xl">Jelajahi Lombok, tanpa repot.</h1>
          <p className="mt-4 max-w-xl text-lg opacity-90">Sewa mobil & motor, paket wisata, dan antar-jemput bandara dalam satu tempat.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/kendaraan" className="rounded-full bg-accent px-6 py-3 font-semibold text-accent-foreground">Sewa Kendaraan</Link>
            <Link to="/paket" className="rounded-full bg-background px-6 py-3 font-semibold text-primary">Lihat Paket Wisata</Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-16 md:grid-cols-4">
        {[
          { icon: Car, t: "Mobil & Motor", d: "Lepas kunci atau dengan sopir" },
          { icon: Plane, t: "Antar-Jemput", d: "Bandara LOP, pelabuhan & hotel" },
          { icon: Map, t: "Paket Wisata", d: "Gili, Kuta, Rinjani & custom" },
          { icon: ShieldCheck, t: "Harga Transparan", d: "Tanpa biaya tersembunyi" },
        ].map(({ icon: I, t, d }) => (
          <div key={t} className="rounded-2xl bg-card p-6 shadow-card">
            <I className="h-8 w-8 text-accent" />
            <h3 className="mt-4 text-lg font-semibold">{t}</h3>
            <p className="text-sm text-muted-foreground">{d}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="flex items-end justify-between"><h2 className="text-4xl font-semibold">Wisata Populer</h2><Link to="/paket" className="text-sm font-semibold text-accent">Semua paket →</Link></div>
        <div className="mt-8 grid gap-6 md:grid-cols-4">
          {tours.map((t) => (
            <Link to="/paket" key={t.id} className="group overflow-hidden rounded-2xl bg-card shadow-card">
              <img src={t.image} alt={t.title} loading="lazy" width={1024} height={1024} className="aspect-[4/3] w-full object-cover transition group-hover:scale-105" />
              <div className="p-4"><p className="text-xs font-semibold text-accent">{t.category}</p><h3 className="mt-1 font-semibold leading-snug">{t.title}</h3><p className="mt-2 text-sm text-muted-foreground">mulai {rupiah(t.price)}</p></div>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-secondary py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-4xl font-semibold">Kata Mereka</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {reviews.slice(0, 3).map((r) => (
              <div key={r.name} className="rounded-2xl bg-card p-6">
                <div className="flex gap-1 text-accent">{Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}</div>
                <p className="mt-3">"{r.text}"</p><p className="mt-4 text-sm font-semibold">{r.name} · <span className="text-muted-foreground">{r.from}</span></p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
