import gili from "@/assets/gili.jpg";
import rinjani from "@/assets/rinjani.jpg";
import kuta from "@/assets/kuta.jpg";
import hero from "@/assets/hero.jpg";

import initialCatalog from "@/data/initialCatalog.json";

export const WA_NUMBER = initialCatalog.waNumber || "6287866950767";
export const waLink = (text: string) =>
  `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;

export const rupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

export type Vehicle = {
  id: string; name: string; type: "Mobil" | "Motor"; seats: number;
  transmission: "Manual" | "Otomatis" | "Manual & Otomatis" | string;
  driver: boolean;
  driverOption?: string;
  daily: number; weekly: number;
  // Harga per varian transmisi (opsional, jika transmission === "Manual & Otomatis")
  dailyManual?: number; weeklyManual?: number;
  dailyOtomatis?: number; weeklyOtomatis?: number;
  // Biaya tambahan sopir (opsional, jika driverOption === "both")
  dailyDriver?: number; weeklyDriver?: number;
  year: number; condition: string; specs: string[];
  image?: string;
};

export const vehicles: Vehicle[] = (initialCatalog.vehicles as any) || [
  { id: "avanza", name: "Toyota Avanza", type: "Mobil", seats: 7, transmission: "Manual", driver: true, daily: 350000, weekly: 2200000, year: 2022, condition: "Sangat baik, AC dingin", specs: ["AC", "Audio Bluetooth", "Bensin"] },
  { id: "innova", name: "Toyota Innova Reborn", type: "Mobil", seats: 7, transmission: "Otomatis", driver: true, daily: 650000, weekly: 4200000, year: 2023, condition: "Seperti baru", specs: ["AC Double Blower", "Captain Seat", "Diesel"] },
  { id: "brio", name: "Honda Brio", type: "Mobil", seats: 4, transmission: "Otomatis", driver: false, daily: 300000, weekly: 1900000, year: 2023, condition: "Sangat baik", specs: ["AC", "Irit BBM", "Kamera Mundur"] },
  { id: "hiace", name: "Toyota Hiace Premio", type: "Mobil", seats: 14, transmission: "Manual", driver: true, daily: 1300000, weekly: 8500000, year: 2022, condition: "Terawat rutin", specs: ["AC", "Bagasi Luas", "Rombongan"] },
  { id: "scoopy", name: "Honda Scoopy", type: "Motor", seats: 2, transmission: "Otomatis", driver: false, daily: 75000, weekly: 450000, year: 2023, condition: "Sangat baik, 2 helm", specs: ["110cc", "2 Helm", "Jas Hujan"] },
  { id: "nmax", name: "Yamaha NMAX", type: "Motor", seats: 2, transmission: "Otomatis", driver: false, daily: 150000, weekly: 900000, year: 2023, condition: "Seperti baru", specs: ["155cc", "ABS", "2 Helm"] },
  { id: "klx", name: "Kawasaki KLX 150", type: "Motor", seats: 2, transmission: "Manual", driver: false, daily: 175000, weekly: 1050000, year: 2022, condition: "Siap off-road", specs: ["150cc", "Trail", "Helm Cross"] },
];

export const deliveryAreas = initialCatalog.deliveryAreas || [
  { name: "Bandara Lombok (LOP)", fee: 100000 },
  { name: "Pelabuhan Lembar / Bangsal", fee: 100000 },
  { name: "Mataram", fee: 0 },
  { name: "Senggigi", fee: 50000 },
  { name: "Kuta Mandalika", fee: 100000 },
];

export type Tour = {
  id: string; title: string; category: "One-Day Tour" | "Keluarga" | "Honeymoon" | "Custom";
  duration: string; price: number; image: string; summary: string;
  itinerary: string[]; includes: string[]; pickup: string;
};

export const tours: Tour[] = [
  { id: "gili", title: "Island Hopping Gili Trawangan, Meno & Air", category: "One-Day Tour", duration: "1 hari", price: 450000, image: gili,
    summary: "Snorkeling bersama penyu dan melihat patung bawah laut Gili Meno.",
    itinerary: ["08.00 Jemput di hotel", "09.30 Nyebrang dari Bangsal", "10.00 Snorkeling 3 spot", "13.00 Makan siang di Gili Trawangan", "16.00 Kembali ke hotel"],
    includes: ["Transport AC", "Boat & alat snorkel", "Makan siang", "Pemandu", "Tiket masuk"], pickup: "Senggigi, Mataram, Bandara" },
  { id: "kuta", title: "Pantai Selatan Kuta Lombok", category: "Keluarga", duration: "1 hari", price: 375000, image: kuta,
    summary: "Tanjung Aan, Bukit Merese, Desa Sade, dan Mandalika.",
    itinerary: ["08.00 Jemput", "09.30 Desa Adat Sade", "11.00 Pantai Kuta Mandalika", "13.00 Makan siang seafood", "15.00 Tanjung Aan & Bukit Merese", "18.00 Sunset lalu kembali"],
    includes: ["Transport AC", "Makan siang", "Pemandu", "Tiket masuk", "Air mineral"], pickup: "Kuta, Mataram, Senggigi" },
  { id: "honeymoon", title: "Honeymoon Lombok 4D3N", category: "Honeymoon", duration: "4 hari 3 malam", price: 4500000, image: hero,
    summary: "Villa romantis, dinner sunset, dan private trip ke Gili.",
    itinerary: ["Hari 1: Jemput bandara, check-in villa", "Hari 2: Private Gili trip + candle light dinner", "Hari 3: Pantai selatan & spa", "Hari 4: Belanja oleh-oleh, antar bandara"],
    includes: ["Villa 3 malam", "Mobil pribadi + sopir", "Dinner romantis", "Dekorasi kamar", "Dokumentasi"], pickup: "Bandara Lombok (LOP)" },
  { id: "rinjani", title: "Trekking Gunung Rinjani 3D2N", category: "Custom", duration: "3 hari 2 malam", price: 3200000, image: rinjani,
    summary: "Summit 3.726 mdpl dan berkemah di Danau Segara Anak.",
    itinerary: ["Hari 1: Sembalun – Pos 3 – Camp Crater Rim", "Hari 2: Summit sunrise, turun ke Danau Segara Anak", "Hari 3: Senaru, kembali ke hotel"],
    includes: ["Guide & porter", "Tenda & sleeping bag", "Makan 3x sehari", "Tiket TNGR", "Transport PP"], pickup: "Senggigi, Mataram, Kuta" },
];

export const reviews = [
  { name: "Sarah W.", from: "Jakarta", rating: 5, text: "Mobil diantar tepat waktu ke bandara, bersih dan wangi. Sopirnya ramah sekali!" },
  { name: "Daniel K.", from: "Australia", rating: 5, text: "Rinjani trek was the highlight of my trip. Guides were amazing and safe." },
  { name: "Rina & Bayu", from: "Surabaya", rating: 5, text: "Paket honeymoon-nya sempurna. Dinner sunset di Gili tak terlupakan." },
  { name: "Ahmad F.", from: "Bandung", rating: 4, text: "Sewa NMAX murah, motor mulus. Fast respon via WhatsApp." },
];

export const posts = [
  { slug: "rute-terbaik-pantai-selatan", title: "Rute Terbaik Menjelajah Pantai Selatan Lombok", excerpt: "Urutan kunjungan Kuta, Tanjung Aan, hingga Selong Belanak agar tidak bolak-balik.", image: kuta, date: "12 Okt 2026", read: "6 menit" },
  { slug: "tips-trekking-rinjani", title: "10 Tips Persiapan Trekking Rinjani untuk Pemula", excerpt: "Perlengkapan, latihan fisik, dan waktu terbaik mendaki.", image: rinjani, date: "28 Sep 2026", read: "8 menit" },
  { slug: "gili-mana-yang-cocok", title: "Gili Trawangan, Meno, atau Air? Pilih Sesuai Gayamu", excerpt: "Pesta, romantis, atau santai — kenali karakter tiap pulau.", image: gili, date: "15 Sep 2026", read: "5 menit" },
];
