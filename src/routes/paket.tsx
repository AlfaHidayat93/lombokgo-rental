import { createFileRoute } from "@tanstack/react-router";
import { Check, Clock, MapPin } from "lucide-react";
import { useState } from "react";
import { Layout } from "@/components/Layout";
import { BookingDialog } from "@/components/BookingDialog";
import { rupiah, tours, waLink, type Tour } from "@/lib/data";

export const Route = createFileRoute("/paket")({
  head: () => ({
    meta: [
      { title: "Paket Wisata Lombok: Gili, Kuta, Rinjani — LombokGo" },
      { name: "description", content: "Paket one-day tour, liburan keluarga, honeymoon, dan custom itinerary di Lombok lengkap dengan itinerary dan fasilitas." },
      { property: "og:title", content: "Paket Wisata Lombok" },
      { property: "og:description", content: "Gili Trawangan, pantai Kuta, trekking Rinjani, dan lainnya." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

const cats = ["Semua", "One-Day Tour", "Keluarga", "Honeymoon", "Custom"];

function Page() {
  const [cat, setCat] = useState("Semua");
  const [book, setBook] = useState<Tour | null>(null);
  const list = tours.filter((t) => cat === "Semua" || t.category === cat);
  return (
    <Layout>
      <section className="mx-auto max-w-6xl px-4 py-12">
        <h1 className="text-5xl font-semibold">Paket Wisata</h1>
        <div className="mt-6 flex flex-wrap gap-2">
          {cats.map((c) => <button key={c} onClick={() => setCat(c)} className={`rounded-full border px-4 py-2 text-sm font-medium ${cat === c ? "border-primary bg-primary text-primary-foreground" : "bg-card"}`}>{c}</button>)}
        </div>
        <div className="mt-8 space-y-8">
          {list.map((t) => (
            <article key={t.id} className="grid overflow-hidden rounded-2xl bg-card shadow-card md:grid-cols-5">
              <img src={t.image} alt={t.title} loading="lazy" width={1024} height={1024} className="h-64 w-full object-cover md:col-span-2 md:h-full" />
              <div className="p-6 md:col-span-3">
                <p className="text-xs font-semibold uppercase text-accent">{t.category}</p>
                <h2 className="mt-1 text-2xl font-semibold">{t.title}</h2>
                <p className="mt-2 text-muted-foreground">{t.summary}</p>
                <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{t.duration}</span>
                  <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />Jemput: {t.pickup}</span>
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div><p className="text-sm font-semibold">Itinerary</p><ol className="mt-1 space-y-1 text-sm text-muted-foreground">{t.itinerary.map((i) => <li key={i}>• {i}</li>)}</ol></div>
                  <div><p className="text-sm font-semibold">Termasuk</p><ul className="mt-1 space-y-1 text-sm">{t.includes.map((i) => <li key={i} className="flex gap-1"><Check className="h-4 w-4 text-whatsapp" />{i}</li>)}</ul></div>
                </div>
                <div className="mt-5 flex items-center justify-between">
                  <p className="text-xl font-bold text-primary">{rupiah(t.price)}<span className="text-xs font-normal text-muted-foreground"> /orang</span></p>
                  <button onClick={() => setBook(t)} className="rounded-full bg-accent px-6 py-2.5 font-semibold text-accent-foreground">Cek Jadwal & Pesan</button>
                </div>
              </div>
            </article>
          ))}
        </div>
        <div className="mt-12 rounded-2xl bg-primary p-8 text-primary-foreground">
          <h2 className="text-3xl font-semibold">Mau itinerary sendiri?</h2>
          <p className="mt-2 opacity-90">Ceritakan rencanamu, tim kami susunkan tur kustom sesuai budget.</p>
          <a href={waLink("Halo, saya ingin membuat tur kustom di Lombok.")} target="_blank" rel="noreferrer" className="mt-5 inline-flex rounded-full bg-whatsapp px-6 py-3 font-semibold">Konsultasi via WhatsApp</a>
        </div>
      </section>
      {book && <BookingDialog id={book.id} itemType="tour" title={book.title} unitLabel="orang" onClose={() => setBook(null)} />}
    </Layout>
  );
}
