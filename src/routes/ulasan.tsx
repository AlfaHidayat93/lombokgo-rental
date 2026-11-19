import { createFileRoute } from "@tanstack/react-router";
import { Star, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { reviews as seed } from "@/lib/data";
import { toast } from "sonner";

export const Route = createFileRoute("/ulasan")({
  head: () => ({
    meta: [
      { title: "Ulasan & Testimoni Pelanggan — LombokGo" },
      { name: "description", content: "Pengalaman nyata pelanggan menyewa kendaraan dan ikut tur bersama LombokGo." },
      { property: "og:title", content: "Ulasan Pelanggan LombokGo" },
      { property: "og:description", content: "Baca dan bagikan pengalaman liburanmu di Lombok." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

const STORAGE_KEY = "lombokgo_user_reviews";

function Page() {
  const [list, setList] = useState(seed);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [text, setText] = useState("");
  const [rating, setRating] = useState(5);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setList([...parsed, ...seed]);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !text.trim()) {
      toast.error("Mohon lengkapi nama dan cerita ulasan Anda.");
      return;
    }

    const newReview = {
      name: name.trim(),
      from: city.trim() || "Pelanggan Terverifikasi",
      rating,
      text: text.trim(),
    };

    const updatedList = [newReview, ...list];
    setList(updatedList);

    try {
      const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      localStorage.setItem(STORAGE_KEY, JSON.stringify([newReview, ...existing]));
    } catch {
      // ignore
    }

    setName("");
    setCity("");
    setText("");
    setRating(5);
    toast.success("Terima kasih! Ulasan Anda berhasil diterbitkan.");
  };

  const avg = (list.reduce((a, r) => a + r.rating, 0) / list.length).toFixed(1);

  return (
    <Layout>
      <section className="mx-auto max-w-4xl px-4 py-12">
        <div className="text-center sm:text-left">
          <span className="rounded-full bg-accent/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-accent">
            Testimoni & Pengalaman
          </span>
          <h1 className="mt-3 text-4xl font-semibold md:text-5xl">Ulasan Pelanggan</h1>
          <div className="mt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <div className="flex gap-1 text-amber-500">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-current" />
              ))}
            </div>
            <p className="text-muted-foreground font-medium text-sm">
              Rata-rata ★ <span className="font-bold text-foreground">{avg}</span> dari {list.length} ulasan pelanggan
            </p>
          </div>
        </div>

        {/* Review Form */}
        <form
          className="mt-8 space-y-4 rounded-3xl border bg-card p-6 sm:p-8 shadow-card"
          onSubmit={handleSubmit}
        >
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-whatsapp" />
            <p className="font-bold text-base">Bagikan Pengalaman Liburan Anda</p>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground">Rating Kepuasan</label>
            <div className="mt-1 flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  type="button"
                  key={n}
                  onClick={() => setRating(n)}
                  aria-label={`${n} bintang`}
                  className="p-1 transition hover:scale-110"
                >
                  <Star
                    className={`h-7 w-7 text-amber-400 ${
                      n <= rating ? "fill-current" : "text-muted stroke-muted-foreground"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Nama Lengkap</label>
              <input
                placeholder="Contoh: Budi Santoso"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-xl border bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Asal Kota (Opsional)</label>
              <input
                placeholder="Contoh: Jakarta / Surabaya"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="mt-1 w-full rounded-xl border bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground">Cerita Pengalaman Anda</label>
            <textarea
              placeholder="Ceritakan kondisi mobil/motor, pelayanan supir, atau keindahan tur wisata Anda..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="mt-1 w-full rounded-xl border bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              rows={3}
            />
          </div>

          <button className="rounded-full bg-primary px-7 py-3 text-sm font-bold text-primary-foreground shadow-md transition hover:opacity-95 active:scale-95">
            Kirim Ulasan Sekarang
          </button>
        </form>

        {/* Reviews List */}
        <div className="mt-10 space-y-4">
          {list.map((r, i) => (
            <div key={i} className="rounded-3xl border bg-card p-6 shadow-card">
              <div className="flex items-center justify-between">
                <div className="flex gap-1 text-amber-400">
                  {Array.from({ length: r.rating }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <span className="text-[11px] font-semibold text-muted-foreground">Terverifikasi</span>
              </div>
              <p className="mt-3 text-sm sm:text-base leading-relaxed text-foreground">"{r.text}"</p>
              <div className="mt-4 flex items-center gap-2 border-t pt-3 text-xs">
                <span className="font-bold text-foreground">{r.name}</span>
                <span className="text-muted-foreground">·</span>
                <span className="text-muted-foreground">{r.from}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
}
