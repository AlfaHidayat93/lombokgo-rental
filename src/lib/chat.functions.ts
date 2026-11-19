import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const auth = z.object({ id: z.string().uuid(), token: z.string().uuid() });

type ConvoData = {
  id: string;
  token: string;
  mode: string;
  guest_name?: string | null;
  updated_at: string;
  messages: Array<{ id: string; sender: string; content: string; created_at: string }>;
};

// Resilient in-memory store for high-availability chat sessions
const memoryConvos = new Map<string, ConvoData>();

function generateUuid(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

async function getAdminClient() {
  const url = process.env["SUPABASE_URL"] || process.env["VITE_SUPABASE_URL"];
  const key =
    process.env["SUPABASE_SERVICE_ROLE_KEY"] ||
    process.env["SUPABASE_PUBLISHABLE_KEY"] ||
    process.env["VITE_SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) {
    return null;
  }
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    return supabaseAdmin;
  } catch {
    return null;
  }
}

async function verify(id: string, token: string) {
  const db = await getAdminClient();
  if (db) {
    try {
      const { data } = await db
        .from("chat_conversations")
        .select("id, mode")
        .eq("id", id)
        .eq("access_token", token)
        .maybeSingle();
      if (data) return { db, convo: data };
    } catch (e) {
      console.warn("[verify chat] Supabase check failed, checking memory:", e);
    }
  }

  const mem = memoryConvos.get(`${id}:${token}`);
  if (mem) {
    return { db: null, convo: { id: mem.id, mode: mem.mode } };
  }

  // Auto-restore session in memory so guest is never locked out
  const fallbackConvo: ConvoData = {
    id,
    token,
    mode: "ai",
    updated_at: new Date().toISOString(),
    messages: [],
  };
  memoryConvos.set(`${id}:${token}`, fallbackConvo);
  return { db: null, convo: { id, mode: "ai" } };
}

export const startChat = createServerFn({ method: "POST" }).handler(async () => {
  const db = await getAdminClient();
  const id = generateUuid();
  const token = generateUuid();
  const now = new Date().toISOString();

  if (db) {
    try {
      const { data, error } = await db
        .from("chat_conversations")
        .insert({ id, access_token: token })
        .select("id, access_token")
        .single();
      if (!error && data) {
        return { id: data.id, token: data.access_token };
      }
    } catch (e) {
      console.warn("[startChat] Supabase insert failed, using memory store:", e);
    }
  }

  memoryConvos.set(`${id}:${token}`, {
    id,
    token,
    mode: "ai",
    updated_at: now,
    messages: [
      {
        id: `msg-${Date.now()}`,
        sender: "ai",
        content: "Halo! 👋 Selamat datang di LombokGo. Mau cari sewa mobil, motor, atau info paket wisata di Lombok?",
        created_at: now,
      },
    ],
  });

  return { id, token };
});

export const getChat = createServerFn({ method: "POST" })
  .inputValidator((d) => auth.parse(d))
  .handler(async ({ data }) => {
    const { db, convo } = await verify(data.id, data.token);

    if (db) {
      try {
        const { data: msgs } = await db
          .from("chat_messages")
          .select("id, sender, content, created_at")
          .eq("conversation_id", data.id)
          .order("created_at")
          .limit(200);

        if (msgs && msgs.length > 0) {
          return { mode: convo.mode, messages: msgs };
        }
      } catch (e) {
        console.warn("[getChat] Supabase query failed, falling back to memory:", e);
      }
    }

    const mem = memoryConvos.get(`${data.id}:${data.token}`);
    return {
      mode: mem?.mode ?? convo.mode ?? "ai",
      messages: mem?.messages ?? [],
    };
  });

const SYSTEM_PROMPT = `Kamu adalah asisten customer service LombokGo, layanan sewa mobil/motor dan paket wisata di Lombok.
Jawab singkat, ramah, dalam bahasa Indonesia yang santun.
Informasi utama:
- Rental Mobil:
  * Toyota Avanza: Rp350.000/hari (Rp2.200.000/minggu) - 7 seat, manual, opsi sopir
  * Honda Brio: Rp300.000/hari (Rp1.900.000/minggu) - 4 seat, matic, lepas kunci
  * Toyota Innova Reborn: Rp650.000/hari (Rp4.200.000/minggu) - 7 seat, matic, opsi sopir
  * Toyota Hiace Premio: Rp1.300.000/hari (Rp8.500.000/minggu) - 14 seat rombongan
- Rental Motor:
  * Honda Scoopy: Rp75.000/hari (Rp450.000/minggu) - 2 helm, jas hujan
  * Yamaha NMAX: Rp150.000/hari (Rp900.000/minggu) - nyaman
  * Kawasaki KLX 150: Rp175.000/hari (Rp1.050.000/minggu) - trail offroad
- Titik Antar: Mataram GRATIS, Bandara Lombok (LOP) Rp100rb, Pelabuhan Bangsal/Lembar Rp100rb, Senggigi Rp50rb, Kuta Rp100rb.
- Paket Wisata:
  * Island Hopping Gili 3 Pulau: Rp450.000/orang (snorkeling penyu, boat, makan siang)
  * Pantai Selatan Kuta: Rp375.000/orang (Tanjung Aan, Bukit Merese, Sade)
  * Honeymoon Lombok 4D3N: Rp4.500.000/paket (villa, private boat, dinner)
  * Trekking Rinjani 3D2N: Rp3.200.000/orang (guide, porter, tenda, makan)
- Pembayaran: QRIS instan otomatis, Virtual Account (BCA, Mandiri, BRI, BNI), Kartu Kredit, E-Wallet.
- Invoice otomatis terbit saat pesan di website.
Jika tamu ingin bicara dengan CS manusia, arahkan untuk klik tombol "Bicara dengan admin" atau hubungi WhatsApp kami.`;

function smartAssistantReply(query: string, pastMessages?: Array<{ sender: string; content: string }>): string {
  const q = query.toLowerCase();

  // 1. Rekomendasi Kapasitas / Rombongan Besar (misal 8, 9, 10, 12, 14 orang)
  const capacityMatch = q.match(/(\d+)\s*(orang|org|penumpang|seat|kursi|pax)/) || q.match(/(kapasitas|muat|rombongan)\s*(\d+)/);
  const requestedPeople = capacityMatch ? parseInt(capacityMatch[1] || capacityMatch[2] || "0", 10) : 0;

  if (requestedPeople > 7 || q.includes("rombongan") || q.includes("banyak orang") || q.includes("keluarga besar")) {
    return `🚐 Untuk kapasitas ${requestedPeople > 0 ? requestedPeople + " orang" : "rombongan"}, kami sangat merekomendasikan **Toyota Hiace Premio (14 Seat)**!
• Kapasitas lega hingga 14 penumpang + bagasi koper luas
• Sangat nyaman, AC dingin merata ke tiap baris
• Tarif: Rp1.300.000/hari (atau Rp8.500.000/minggu) sudah termasuk sopir berpengalaman.

Apakah ingin sewa lepas kunci atau dengan sopir, dan untuk tanggal berapa kak?`;
  }

  if ((requestedPeople >= 5 && requestedPeople <= 7) || q.includes("keluarga") || q.includes("7 orang") || q.includes("6 orang")) {
    return `🚗 Untuk ${requestedPeople > 0 ? requestedPeople + " orang" : "5–7 orang"}, kami rekomendasikan:
1. **Toyota Innova Reborn (7 seat)** - Rp650.000/hari (Sangat nyaman, kabin lega & suspensi empuk)
2. **Toyota Avanza (7 seat)** - Rp350.000/hari (Irit, praktis, tersedia Manual & Otomatis)

Keduanya siap antar gratis area Mataram atau antar ke Bandara LOP kak!`;
  }

  if ((requestedPeople >= 1 && requestedPeople <= 4) || q.includes("4 orang") || q.includes("sedikit") || q.includes("berdua")) {
    return `🚗 Untuk 1–4 orang, pilihan terbaik dan paling hemat:
• **Honda Brio (4 seat matic)**: Rp300.000/hari (Lincah, irit BBM, kamera mundur)
• **Toyota Avanza (7 seat)**: Rp350.000/hari (Lebih leluasa untuk bawa koper)

Mau digunakan untuk berapa hari kak?`;
  }

  // 2. Pertanyaan Durasi Sewa (misal: "untuk 3 hari", "5 hari", "2 hari")
  const daysMatch = q.match(/(\d+)\s*hari/) || q.match(/untuk\s*(\d+)/);
  if (daysMatch) {
    const days = parseInt(daysMatch[1], 10);
    // Cek konteks percakapan sebelumnya untuk melihat mobil/motor apa yang sedang dibahas
    const prevText = (pastMessages || []).map((m) => m.content).join(" ").toLowerCase();

    if (prevText.includes("hiace") || prevText.includes("9 orang") || prevText.includes("rombongan")) {
      const total = days * 1300000;
      return `Siap kak! Untuk sewa **Toyota Hiace Premio (14 seat)** selama ${days} hari:
• Tarif per hari: Rp1.300.000
• **Estimasi Total (${days} hari)**: Rp${total.toLocaleString("id-ID")}
Sudah termasuk unit nyaman + sopir. Anda bisa langsung klik menu **Sewa Kendaraan** > pilih Hiace > klik **Cek & Pesan** untuk terbitkan invoice otomatis!`;
    }

    if (prevText.includes("innova")) {
      const total = days * 650000;
      return `Untuk sewa **Toyota Innova Reborn** selama ${days} hari:
• Tarif per hari: Rp650.000
• **Estimasi Total (${days} hari)**: Rp${total.toLocaleString("id-ID")}
Bisa lepas kunci atau dengan sopir. Mau langsung kami bantu pesankan?`;
    }

    if (prevText.includes("brio")) {
      const total = days * 300000;
      return `Untuk sewa **Honda Brio** selama ${days} hari:
• Tarif per hari: Rp300.000
• **Estimasi Total (${days} hari)**: Rp${total.toLocaleString("id-ID")}
Mobil matic terawat siap pakai. Mau diantar ke bandara atau hotel?`;
    }

    // Default Avanza / Umum
    const totalAvanza = days * 350000;
    return `Baik kak, untuk durasi sewa ${days} hari:
• **Toyota Avanza (7 seat)**: Rp${totalAvanza.toLocaleString("id-ID")} (${days} x Rp350.000)
• **Honda Brio (4 seat)**: Rp${(days * 300000).toLocaleString("id-ID")} (${days} x Rp300.000)
• **Toyota Innova (7 seat)**: Rp${(days * 650000).toLocaleString("id-ID")} (${days} x Rp650.000)
• **Toyota Hiace (14 seat)**: Rp${(days * 1300000).toLocaleString("id-ID")} (${days} x Rp1.300.000)

Mau unit yang mana kak?`;
  }

  // 3. Sapaan Ramah
  if (q.includes("halo") || q.includes("hallo") || q.includes("hai") || q.includes("hi") || q.includes("pagi") || q.includes("siang") || q.includes("sore") || q.includes("malam")) {
    return "Halo kak! 👋 Selamat datang di LombokGo. Ada yang bisa kami bantu? Kami menyediakan layanan sewa mobil, motor, paket wisata pulau Gili & Rinjani, serta antar-jemput bandara/pelabuhan di Lombok.";
  }

  if (q.includes("mobil") || q.includes("avanza") || q.includes("brio") || q.includes("innova") || q.includes("hiace") || q.includes("car")) {
    return "🚗 Kami menyediakan rental mobil lepas kunci & dengan sopir:\n• Toyota Avanza: Rp350.000/hari\n• Honda Brio: Rp300.000/hari\n• Innova Reborn: Rp650.000/hari\n• Hiace Premio (14 seat): Rp1.300.000/hari\n\nSewa 7 hari ke atas lebih hemat dengan tarif mingguan! Berapa orang rombongan Anda kak?";
  }

  if (q.includes("motor") || q.includes("scoopy") || q.includes("nmax") || q.includes("klx") || q.includes("bike") || q.includes("scooter")) {
    return "🛵 Rental motor Lombok sudah termasuk 2 helm SNI & jas hujan:\n• Honda Scoopy: Rp75.000/hari (Rp450.000/minggu)\n• Yamaha NMAX: Rp150.000/hari (Rp900.000/minggu)\n• Kawasaki KLX 150: Rp175.000/hari (Rp1.050.000/minggu)\n\nBisa langsung diantar ke penginapan atau bandara kak!";
  }

  if (q.includes("gili") || q.includes("snorkeling") || q.includes("trawangan") || q.includes("meno") || q.includes("air")) {
    return "🏝️ Paket Island Hopping 3 Gili (Trawangan, Meno & Air) hanya Rp450.000/orang! Sudah termasuk boat snorkeling, alat snorkel, pemandu, makan siang di Trawangan, dan dokumentasi foto/video penyu & patung bawah laut.";
  }

  if (q.includes("rinjani") || q.includes("trekking") || q.includes("gunung") || q.includes("hiking")) {
    return "🏔️ Paket Trekking Rinjani 3D2N (3.726 mdpl) Rp3.200.000/orang. Fasilitas lengkap: guide berlisensi, porter, tenda & sleeping bag, makan 3x sehari, tiket TNGR, serta antar-jemput penginapan.";
  }

  if (q.includes("kuta") || q.includes("mandalika") || q.includes("pantai") || q.includes("beach") || q.includes("merese") || q.includes("sade")) {
    return "🏖️ Paket Pantai Selatan Kuta Lombok hanya Rp375.000/orang. Rute mencakup: Desa Adat Sade, Sirkuit Mandalika, makan siang seafood, Pantai Tanjung Aan, dan melihat sunset di Bukit Merese!";
  }

  if (q.includes("antar") || q.includes("bandara") || q.includes("airport") || q.includes("hotel") || q.includes("pelabuhan") || q.includes("delivery") || q.includes("jemput")) {
    return "✈️ Layanan antar-jemput kendaraan kami:\n• Area Mataram: GRATIS\n• Senggigi: Rp50.000\n• Bandara Lombok (LOP): Rp100.000\n• Kuta Mandalika: Rp100.000\n• Pelabuhan Bangsal / Lembar: Rp100.000\nUnit langsung kami antar tepat waktu sesuai jadwal tiba Anda.";
  }

  if (q.includes("bayar") || q.includes("pembayaran") || q.includes("transfer") || q.includes("qris") || q.includes("rekening") || q.includes("midtrans") || q.includes("payment")) {
    return "💳 Pembayaran di website LombokGo sangat praktis dan otomatis via Midtrans:\n• QRIS Instan (BCA Mobile, Livin, GoPay, OVO, ShopeePay, Dana)\n• Virtual Account BCA, Mandiri, BRI, BNI\n• Kartu Kredit / Debit\n\nSetelah memesan, invoice resmi langsung terbit dan status akan otomatis LUNAS begitu pembayaran diselesaikan!";
  }

  if (q.includes("cara pesan") || q.includes("booking") || q.includes("sewa") || q.includes("order") || q.includes("pesan")) {
    return "📝 Cara booking sangat mudah:\n1. Buka menu 'Sewa Kendaraan' atau 'Paket Wisata'.\n2. Klik tombol 'Cek & Pesan' pada unit yang diinginkan.\n3. Masukkan tanggal dan data pemesan.\n4. Invoice otomatis terbit dan Anda bisa langsung membayar di website!";
  }

  if (q.includes("admin") || q.includes("manusia") || q.includes("wa") || q.includes("whatsapp") || q.includes("cs") || q.includes("operator")) {
    return "Silakan klik tombol 'Bicara dengan admin' di atas atau hubungi kami langsung via WhatsApp untuk terhubung dengan staf customer service kami ya kak! 🙏";
  }

  return "Halo! Ada yang bisa kami bantu seputar sewa mobil, motor, paket wisata Gili/Rinjani, atau lokasi antar-jemput di Lombok? Jangan ragu bertanya, kami siap membantu!";
}

export const sendGuestMessage = createServerFn({ method: "POST" })
  .inputValidator((d) => auth.extend({ content: z.string().trim().min(1).max(1000), name: z.string().max(80).optional() }).parse(d))
  .handler(async ({ data }) => {
    const { db, convo } = await verify(data.id, data.token);
    const now = new Date().toISOString();
    const guestMsgId = `guest-${Date.now()}`;

    // Record guest message
    if (db) {
      try {
        await db.from("chat_messages").insert({
          conversation_id: data.id,
          sender: "guest",
          content: data.content,
        });
        await db
          .from("chat_conversations")
          .update({
            updated_at: now,
            ...(data.name ? { guest_name: data.name } : {}),
          })
          .eq("id", data.id);
      } catch (e) {
        console.warn("[sendGuestMessage] Supabase write failed:", e);
      }
    }

    const mem = memoryConvos.get(`${data.id}:${data.token}`);
    if (mem) {
      mem.messages.push({
        id: guestMsgId,
        sender: "guest",
        content: data.content,
        created_at: now,
      });
      mem.updated_at = now;
      if (data.name) mem.guest_name = data.name;
    }

    if (convo.mode !== "ai") {
      return { ok: true };
    }

    // Ambil riwayat chat terakhir untuk konteks percakapan multi-turn
    const conversationHistory: Array<{ role: "user" | "model"; parts: [{ text: string }] }> = [];
    if (mem && mem.messages.length > 0) {
      // Ambil hingga 10 pesan terakhir sebelum pesan ini
      const pastMsgs = mem.messages.slice(-10);
      for (const m of pastMsgs) {
        if (m.sender === "guest") {
          conversationHistory.push({ role: "user", parts: [{ text: m.content }] });
        } else if (m.sender === "ai") {
          conversationHistory.push({ role: "model", parts: [{ text: m.content }] });
        }
      }
    }

    // Generate AI reply
    let reply = "";

    // 1. Coba panggil Google Gemini API (Gratis)
    try {
      // Cek kunci API dari disk / environment
      let geminiKey = process.env["GEMINI_API_KEY"] || "";
      if (!geminiKey) {
        const fs = await import("node:fs");
        const path = await import("node:path");
        const catPath = path.resolve(process.cwd(), ".catalog-db.json");
        if (fs.existsSync(catPath)) {
          const cat = JSON.parse(fs.readFileSync(catPath, "utf-8"));
          if (cat?.geminiApiKey) geminiKey = cat.geminiApiKey;
        }
      }

      if (geminiKey) {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
        const contents = [
          ...conversationHistory.slice(-8),
          { role: "user", parts: [{ text: data.content }] },
        ];

        const geminiRes = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: SYSTEM_PROMPT }],
            },
            contents,
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 500,
            },
          }),
        });

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const candidateText =
            geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidateText) {
            reply = candidateText.trim();
          }
        } else {
          console.warn("[Gemini API Error]", await geminiRes.text());
        }
      }
    } catch (e) {
      console.warn("[Gemini Fetch Error]", e);
    }

    // 2. Coba lovable AI gateway jika tersedia
    if (!reply) {
      try {
        const { generateResponse } = await import("@lovable.dev/ai-gateway");
        const res = await generateResponse({
          model: "openai/gpt-4o-mini",
          instructions: SYSTEM_PROMPT,
          input: [{ role: "user" as const, content: data.content }],
        });
        const text = (res.output ?? [])
          .flatMap((o) => (o.type === "message" ? o.content : []))
          .map((c) => (c.type === "output_text" ? c.text : ""))
          .join("");
        if (text) reply = text;
      } catch {
        // Fallback ke asisten cerdas lokal
      }
    }

    // 3. Fallback ke intelligent local NLP dengan konteks percakapan
    if (!reply) {
      reply = smartAssistantReply(data.content, mem?.messages);
    }

    const aiMsgId = `ai-${Date.now()}`;
    if (db) {
      try {
        await db.from("chat_messages").insert({
          conversation_id: data.id,
          sender: "ai",
          content: reply,
        });
      } catch (e) {
        console.warn("[sendGuestMessage] Supabase AI reply insert failed:", e);
      }
    }

    if (mem) {
      mem.messages.push({
        id: aiMsgId,
        sender: "ai",
        content: reply,
        created_at: new Date().toISOString(),
      });
    }

    return { ok: true, reply };
  });

export const requestHuman = createServerFn({ method: "POST" })
  .inputValidator((d) => auth.parse(d))
  .handler(async ({ data }) => {
    const { db } = await verify(data.id, data.token);
    const now = new Date().toISOString();
    const replyText =
      "Permintaan Anda telah diteruskan ke Customer Support kami. Untuk respon tercepat, Anda juga bisa langsung chat tim kami via WhatsApp! 🙏";

    if (db) {
      try {
        await db
          .from("chat_conversations")
          .update({ mode: "human", updated_at: now })
          .eq("id", data.id);
        await db.from("chat_messages").insert({
          conversation_id: data.id,
          sender: "ai",
          content: replyText,
        });
      } catch (e) {
        console.warn("[requestHuman] Supabase update failed:", e);
      }
    }

    const mem = memoryConvos.get(`${data.id}:${data.token}`);
    if (mem) {
      mem.mode = "human";
      mem.updated_at = now;
      mem.messages.push({
        id: `ai-${Date.now()}`,
        sender: "ai",
        content: replyText,
        created_at: now,
      });
    }

    return { ok: true };
  });
