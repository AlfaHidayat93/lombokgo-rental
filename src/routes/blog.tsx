import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { X, Clock, Calendar, ArrowRight, Share2 } from "lucide-react";
import { Layout } from "@/components/Layout";
import { posts, type posts as _postsType } from "@/lib/data";
import { toast } from "sonner";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Blog & Panduan Wisata Lombok — LombokGo" },
      { name: "description", content: "Rekomendasi tempat wisata, tips liburan, dan rute terbaik di Lombok." },
      { property: "og:title", content: "Blog & Panduan Wisata Lombok" },
      { property: "og:description", content: "Tips dan rute terbaik untuk liburan di Lombok." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

const postContents: Record<string, { body: string[]; tips: string[] }> = {
  "rute-terbaik-pantai-selatan": {
    body: [
      "Kawasan Lombok Selatan terkenal dengan deretan pantai berpasir putih mirip merica, tebing karang dramatis, dan ombak selancar kelas dunia. Agar perjalanan efisien dan tidak bolak-balik, berikut urutan rute rekomendasi kami.",
      "1. Pagi Hari (08.00 - 10.30): Mulailah dengan mengunjungi Desa Adat Sasak Sade di Rembitan untuk melihat arsitektur rumah tradisional dan tenun khas Lombok sebelum matahari terlalu terik.",
      "2. Menjelang Siang (11.00 - 13.30): Lanjutkan ke Pantai Kuta Mandalika. Nikmati makan siang seafood segar di warung tepi pantai atau kafe modern di sepanjang jalan raya Kuta.",
      "3. Sore Hari (14.30 - 17.00): Kunjungi Pantai Tanjung Aan. Berenang di air lautnya yang tenang seperti kolam renang alami dan mendaki Bukit Merese untuk pemandangan 360 derajat teluk selatan Lombok.",
      "4. Golden Hour (17.30 - 18.30): Saksikan matahari terbenam (sunset) terbaik di atas Bukit Merese atau Pantai Selong Belanak sembari melihat kerbau gembala pulang melintasi pasir pantai.",
    ],
    tips: [
      "Sewa motor matic (seperti NMAX atau Scoopy) untuk fleksibilitas melewati jalan pesisir selatan.",
      "Gunakan tabir surya (sunscreen) dan kacamata hitam karena matahari siang cukup terik.",
      "Bawa uang tunai kecil untuk retribusi parkir warga lokal (Rp5.000 - Rp10.000).",
    ],
  },
  "tips-trekking-rinjani": {
    body: [
      "Gunung Rinjani (3.726 mdpl) adalah gunung berapi tertinggi kedua di Indonesia dan impian banyak pendaki dunia. Keindahan Danau Segara Anak dan kaldera Plawangan menawarkan pemandangan magis yang tiada duanya.",
      "Persiapan fisik adalah kunci utama. Mulailah latihan kardio seperti jogging, jalan menanjak, atau naik turun tangga minimal 3-4 minggu sebelum tanggal pendakian Anda.",
      "Pilih jalur pendakian yang tepat: Jalur Sembalun cocok untuk pemandangan padang savana terbuka dan rute summit terdekat, sedangkan jalur Senaru menawarkan keteduhan hutan tropis yang sejuk.",
      "Gunakan jasa pemandu (guide) dan porter berlisensi. Mereka tidak hanya membantu membawakan tenda, logistik, dan memasak makanan bergizi, tetapi juga menjaga keselamatan Anda di jalur pegunungan.",
    ],
    tips: [
      "Bawa jaket windproof/down jacket tebal karena suhu di puncak bisa mencapai 3-5°C saat dini hari.",
      "Sepatu trekking dengan grip yang baik sangat penting saat melintasi pasir batu jelang puncak.",
      "Patuhi etika 'Leave No Trace' dengan membawa turun seluruh sampah pribadi Anda.",
    ],
  },
  "gili-mana-yang-cocok": {
    body: [
      "Kepulauan Gili di barat laut Lombok terdiri dari tiga pulau ikonik tanpa kendaraan bermotor: Gili Trawangan, Gili Meno, dan Gili Air. Setiap pulau memiliki pesona dan kepribadian yang berbeda.",
      "Gili Trawangan (Gili T): Pulau terbesar dan paling ramai. Cocok untuk wisatawan yang menyukai suasana energik, bar pantai, live music, sunset lounge, dan beragam pilihan diving center.",
      "Gili Meno: Pulau terkecil dan paling tenang di tengah. Tempat pelarian sempurna untuk pasangan berbulan madu (honeymooners) atau siapa saja yang mendambakan ketenangan sunyi, pantai sepi, dan patung bawah laut Nest karya Jason deCaires Taylor.",
      "Gili Air: Perpaduan seimbang antara keduanya. Nuansa santai khas bohemian, deretan kafe vegan dan yoga shala, serta terumbu karang yang sangat dekat dari bibir pantai timur pulau.",
    ],
    tips: [
      "Semua transportasi di ketiga Gili hanya menggunakan sepeda kayuh atau kereta kuda (cidomo).",
      "Waktu terbaik untuk snorkeling bersama penyu liar adalah pagi hari sekitar pukul 08.30 - 10.30.",
      "Anda bisa memesan paket Island Hopping 1 hari untuk menjelajahi ketiga pulau sekaligus bersama pemandu kami.",
    ],
  },
};

type Post = (typeof posts)[number];

function Page() {
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const handleShare = (post: Post) => {
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({ title: post.title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link panduan disalin ke clipboard!");
    }
  };

  return (
    <Layout>
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div>
          <span className="rounded-full bg-accent/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-accent">
            Panduan & Tips Wisata
          </span>
          <h1 className="mt-3 text-4xl font-semibold md:text-5xl">Blog & Panduan Liburan Lombok</h1>
          <p className="mt-2 text-muted-foreground">
            Rekomendasi rute terindah, tips persiapan perjalanan, dan panduan lengkap dari tim lokal LombokGo.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {posts.map((p) => (
            <article
              key={p.slug}
              onClick={() => setSelectedPost(p)}
              className="group cursor-pointer overflow-hidden rounded-3xl border bg-card shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={p.image}
                  alt={p.title}
                  loading="lazy"
                  width={1024}
                  height={1024}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <span className="absolute bottom-3 left-3 rounded-full bg-black/60 px-2.5 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm">
                  {p.read}
                </span>
              </div>
              <div className="p-6">
                <p className="text-xs font-semibold text-accent">{p.date}</p>
                <h2 className="mt-2 text-xl font-bold leading-snug group-hover:text-primary transition">
                  {p.title}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{p.excerpt}</p>
                <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-primary">
                  <span>Baca Selengkapnya</span>
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Reading Modal */}
      {selectedPost && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in"
          onClick={() => setSelectedPost(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-card p-6 sm:p-8 shadow-2xl border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {selectedPost.date}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {selectedPost.read}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleShare(selectedPost)}
                  className="rounded-full p-2 text-muted-foreground hover:bg-muted"
                  aria-label="Bagikan"
                >
                  <Share2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setSelectedPost(null)}
                  className="rounded-full p-2 text-muted-foreground hover:bg-muted"
                  aria-label="Tutup"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <h2 className="mt-5 text-2xl sm:text-3xl font-bold leading-tight text-foreground">
              {selectedPost.title}
            </h2>

            <div className="mt-4 overflow-hidden rounded-2xl">
              <img
                src={selectedPost.image}
                alt={selectedPost.title}
                className="h-64 w-full object-cover"
              />
            </div>

            {/* Article Content */}
            <div className="mt-6 space-y-4 text-sm sm:text-base leading-relaxed text-foreground/90">
              {(postContents[selectedPost.slug]?.body || [selectedPost.excerpt]).map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>

            {/* Tips Box */}
            {postContents[selectedPost.slug]?.tips && (
              <div className="mt-6 rounded-2xl bg-secondary/70 p-5">
                <p className="font-bold text-sm text-foreground">💡 Tips Penting Perjalanan:</p>
                <ul className="mt-2 list-disc list-inside space-y-1.5 text-xs sm:text-sm text-muted-foreground">
                  {postContents[selectedPost.slug].tips.map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t pt-5">
              <p className="text-xs text-muted-foreground">Butuh transportasi atau pemandu lokal di Lombok?</p>
              <a
                href="/kendaraan"
                onClick={() => setSelectedPost(null)}
                className="inline-flex items-center justify-center rounded-full bg-accent px-5 py-2.5 text-xs sm:text-sm font-bold text-accent-foreground shadow-sm hover:opacity-95"
              >
                Sewa Kendaraan Sekarang →
              </a>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
