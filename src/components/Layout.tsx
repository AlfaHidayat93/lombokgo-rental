import { Link } from "@tanstack/react-router";
import { MessageCircle, Menu, X } from "lucide-react";
import { ChatWidget } from "./ChatWidget";
import { useState, type ReactNode } from "react";
import { waLink } from "@/lib/data";

const nav = [
  { to: "/kendaraan", label: "Sewa Kendaraan" },
  { to: "/paket", label: "Paket Wisata" },
  { to: "/ulasan", label: "Ulasan" },
  { to: "/blog", label: "Blog" },
] as const;

export function Layout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="font-display text-2xl font-semibold text-primary">Lombok<span className="text-accent">Go</span></Link>
          <nav className="hidden gap-6 md:flex">
            {nav.map((n) => (
              <Link key={n.to} to={n.to} className="text-sm font-medium text-muted-foreground hover:text-primary" activeProps={{ className: "text-primary" }}>{n.label}</Link>
            ))}
          </nav>
          <a href={waLink("Halo LombokGo, saya ingin konsultasi.")} target="_blank" rel="noreferrer" className="hidden rounded-full bg-whatsapp px-4 py-2 text-sm font-semibold text-primary-foreground md:inline-flex">Chat WhatsApp</a>
          <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">{open ? <X /> : <Menu />}</button>
        </div>
        {open && (
          <nav className="flex flex-col gap-3 border-t px-4 py-4 md:hidden">
            {nav.map((n) => <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="font-medium">{n.label}</Link>)}
          </nav>
        )}
      </header>
      <main className="flex-1">{children}</main>
      <footer className="bg-primary text-primary-foreground">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 md:grid-cols-3">
          <div>
            <p className="font-display text-2xl font-semibold">Lombok<span className="text-accent">Go</span></p>
            <p className="mt-2 text-sm opacity-80">Sewa kendaraan & paket wisata Lombok — praktis, cepat, terpercaya.</p>
            <div className="mt-4">
              <Link to="/admin" className="text-xs opacity-60 hover:opacity-100 transition underline underline-offset-4">
                Portal Admin & Kelola Harga →
              </Link>
            </div>
          </div>
          <div className="text-sm opacity-90"><p className="font-semibold">Layanan antar-jemput</p><p>Bandara LOP · Pelabuhan · Senggigi · Kuta · Mataram</p></div>
          <div className="text-sm opacity-90"><p className="font-semibold">Pembayaran</p><p>Transfer Bank · E-Wallet · Kartu Kredit</p></div>
        </div>
      </footer>
      <ChatWidget />
      <a href={waLink("Halo LombokGo, saya ingin konsultasi.")} target="_blank" rel="noreferrer" aria-label="WhatsApp"
        className="fixed bottom-4 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-whatsapp text-primary-foreground shadow-card transition hover:scale-105 active:scale-95 print:hidden">
        <MessageCircle className="h-7 w-7" />
      </a>
    </div>
  );
}
