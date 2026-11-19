import { useEffect, useRef, useState } from "react";
import { MessageSquare, Send, X, UserRound, Sparkles, MessageCircle, Bot } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { getChat, requestHuman, sendGuestMessage, startChat } from "@/lib/chat.functions";
import { waLink } from "@/lib/data";

type Msg = { id: string; sender: string; content: string };
const KEY = "lombokgo-chat-v2";

const QUICK_PROMPTS = [
  "🚗 Tarif sewa mobil",
  "🛵 Sewa motor apa saja?",
  "🏝️ Info paket wisata Gili",
  "💳 Cara bayar & invoice",
  "✈️ Biaya antar bandara",
];

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState<{ id: string; token: string } | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [mode, setMode] = useState("ai");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [hasNewMsg, setHasNewMsg] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const start = useServerFn(startChat);
  const load = useServerFn(getChat);
  const send = useServerFn(sendGuestMessage);
  const human = useServerFn(requestHuman);

  useEffect(() => {
    try {
      const s = localStorage.getItem(KEY);
      if (s) setSession(JSON.parse(s));
    } catch {
      localStorage.removeItem(KEY);
    }
  }, []);

  useEffect(() => {
    if (!open || !session) return;
    let alive = true;
    const tick = () =>
      load({ data: session })
        .then((r) => {
          if (alive) {
            setMsgs(r.messages);
            setMode(r.mode);
          }
        })
        .catch(() => {
          // If session expired or invalid, reset
          localStorage.removeItem(KEY);
          setSession(null);
        });

    tick();
    const t = setInterval(tick, 4000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [open, session, load]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs.length, busy, open]);

  async function ensureSession() {
    if (session) return session;
    const s = await start();
    localStorage.setItem(KEY, JSON.stringify(s));
    setSession(s);
    return s;
  }

  async function handleSend(contentToSend?: string) {
    const content = (contentToSend ?? text).trim();
    if (!content || busy) return;
    setText("");
    setBusy(true);

    const tempId = `tmp-${Date.now()}`;
    setMsgs((m) => [...m, { id: tempId, sender: "guest", content }]);

    try {
      const s = await ensureSession();
      const res = await send({ data: { ...s, content } });
      if (res && res.reply) {
        setMsgs((m) => [...m, { id: `ai-${Date.now()}`, sender: "ai", content: res.reply }]);
      } else {
        const r = await load({ data: s });
        setMsgs(r.messages);
        setMode(r.mode);
      }
    } catch (e) {
      console.error(e);
      setMsgs((m) => [
        ...m,
        {
          id: `err-${Date.now()}`,
          sender: "ai",
          content: "Maaf, koneksi sedang sibuk. Silakan tanyakan kembali atau klik hubungi WhatsApp.",
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  async function askHuman() {
    setBusy(true);
    try {
      const s = await ensureSession();
      await human({ data: s });
      const r = await load({ data: s });
      setMsgs(r.messages);
      setMode("human");
    } finally {
      setBusy(false);
    }
  }

  const latestGuestMsg = msgs.filter((m) => m.sender === "guest").slice(-1)[0]?.content || "";
  const waChatText = `Halo CS LombokGo, saya ingin konsultasi dari Live Chat website:\n"${latestGuestMsg || "Halo, saya butuh info sewa & tur di Lombok"}"`;

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={() => {
          setOpen(!open);
          setHasNewMsg(false);
        }}
        aria-label="Buka Live Chat"
        className="fixed bottom-20 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-card transition-all hover:scale-105 active:scale-95 print:hidden"
      >
        {open ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
        {!open && hasNewMsg && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75"></span>
            <span className="relative inline-flex h-4 w-4 rounded-full bg-accent"></span>
          </span>
        )}
      </button>

      {/* Live Chat Modal Window */}
      {open && (
        <div className="fixed bottom-36 right-5 z-50 flex h-[520px] w-[calc(100vw-2.5rem)] max-w-sm flex-col overflow-hidden rounded-3xl border bg-card shadow-2xl animate-in fade-in slide-in-from-bottom-4 print:hidden">
          {/* Header */}
          <div className="bg-primary px-4 py-3.5 text-primary-foreground flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-primary-foreground/20 text-primary-foreground">
                <Bot className="h-5 w-5" />
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-primary bg-emerald-400" />
              </div>
              <div>
                <p className="font-semibold text-sm leading-tight">Live Chat LombokGo</p>
                <p className="text-[11px] opacity-80 flex items-center gap-1">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  {mode === "ai" ? "Asisten Virtual 24 Jam" : "Customer Support Human"}
                </p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-full p-1 text-primary-foreground/80 hover:bg-primary-foreground/20"
              aria-label="Tutup chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 space-y-3 overflow-y-auto p-3.5 text-sm bg-muted/20">
            <div className="rounded-2xl border bg-card p-3.5 shadow-sm text-xs text-muted-foreground">
              <p className="font-semibold text-foreground text-sm flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-accent" />
                Halo! Ada yang bisa kami bantu?
              </p>
              <p className="mt-1">
                Tanyakan harga rental mobil, motor, paket snorkeling Gili, trekking Rinjani, atau cara pembayaran otomatis.
              </p>
            </div>

            {msgs.map((m) => {
              const isGuest = m.sender === "guest";
              const isAdmin = m.sender === "admin";
              return (
                <div key={m.id} className={isGuest ? "flex justify-end" : "flex justify-start"}>
                  <div
                    className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed shadow-sm ${
                      isGuest
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : isAdmin
                          ? "bg-accent text-accent-foreground rounded-bl-sm"
                          : "bg-card border text-foreground rounded-bl-sm"
                    }`}
                  >
                    {isAdmin && (
                      <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-accent-foreground/80">
                        Admin CS
                      </p>
                    )}
                    {m.content}
                  </div>
                </div>
              );
            })}

            {busy && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground p-1">
                <div className="flex gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-primary/60" style={{ animationDelay: "0ms" }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-primary/60" style={{ animationDelay: "150ms" }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-primary/60" style={{ animationDelay: "300ms" }} />
                </div>
                <span>Mengetik jawaban...</span>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Quick Questions Chips */}
          <div className="border-t bg-card px-3 py-2">
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
              {QUICK_PROMPTS.map((q) => (
                <button
                  key={q}
                  disabled={busy}
                  onClick={() => handleSend(q)}
                  className="shrink-0 rounded-full border bg-secondary/80 px-2.5 py-1 text-[11px] font-medium text-foreground hover:bg-secondary transition disabled:opacity-50"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Admin / WhatsApp Handover Action */}
          <div className="flex items-center justify-between border-t bg-muted/40 px-3 py-2 text-xs">
            {mode === "ai" ? (
              <button
                disabled={busy}
                onClick={askHuman}
                className="flex items-center gap-1.5 font-medium text-primary hover:underline disabled:opacity-50"
              >
                <UserRound className="h-3.5 w-3.5" />
                Bicara dengan admin
              </button>
            ) : (
              <span className="text-[11px] font-semibold text-emerald-600">Mode CS Aktif</span>
            )}

            <a
              href={waLink(waChatText)}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 rounded-full bg-whatsapp px-2.5 py-1 text-[11px] font-semibold text-primary-foreground shadow-sm hover:opacity-95"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              Lanjut WhatsApp
            </a>
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2 border-t bg-card p-3"
          >
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Tulis pesan..."
              disabled={busy}
              className="flex-1 rounded-full border bg-background px-4 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <button
              disabled={busy || !text.trim()}
              aria-label="Kirim pesan"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition hover:opacity-90 disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
