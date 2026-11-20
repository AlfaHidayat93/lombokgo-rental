import { Link } from "@tanstack/react-router";
import { MessageCircle, Menu, X, MapPin, Clock, Mail, Phone, ShieldCheck, Instagram } from "lucide-react";
import { ChatWidget } from "./ChatWidget";
import { useState, type ReactNode } from "react";
import { waLink, WA_NUMBER } from "@/lib/data";
import logoImg from "@/assets/logo.png";

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
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-md shadow-xs">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2.5">
          <Link to="/" className="flex items-center gap-2 group">
            <img
              src={logoImg}
              alt="LombokGo Transport & Rental"
              className="h-10 md:h-12 w-auto object-contain transition group-hover:scale-102"
            />
            <div className="hidden sm:flex flex-col leading-tight">
              <span className="font-display font-bold text-lg text-primary tracking-tight">
                Lombok<span className="text-accent">Go</span>
              </span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium -mt-1">
                Transport & Rental · BIZAM
              </span>
            </div>
          </Link>
          <nav className="hidden gap-6 md:flex items-center">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="text-sm font-medium text-muted-foreground transition hover:text-primary"
                activeProps={{ className: "text-primary font-semibold" }}
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <a
              href={waLink("Halo LombokGo, saya ingin reservasi transportasi / paket wisata.")}
              target="_blank"
              rel="noreferrer"
              className="hidden rounded-full bg-whatsapp px-4 py-2 text-sm font-semibold text-primary-foreground md:inline-flex items-center gap-1.5 shadow-sm transition hover:opacity-90"
            >
              <MessageCircle className="h-4 w-4" />
              Chat WhatsApp
            </a>
            <button
              className="md:hidden p-2 rounded-lg hover:bg-muted text-foreground"
              onClick={() => setOpen(!open)}
              aria-label="Menu"
            >
              {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
        {open && (
          <nav className="flex flex-col gap-3 border-t bg-card px-4 py-4 md:hidden animate-in slide-in-from-top-2">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="font-medium text-foreground py-1 border-b border-border/50"
              >
                {n.label}
              </Link>
            ))}
            <a
              href={waLink("Halo LombokGo, saya ingin konsultasi.")}
              target="_blank"
              rel="noreferrer"
              className="mt-2 rounded-full bg-whatsapp py-2.5 text-center text-sm font-semibold text-primary-foreground flex items-center justify-center gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              Chat WhatsApp ({WA_NUMBER})
            </a>
          </nav>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="bg-primary text-primary-foreground pt-12 pb-8 border-t border-primary/20">
        <div className="mx-auto max-w-6xl px-4 grid gap-8 md:grid-cols-4">
          <div className="md:col-span-1.5 space-y-3">
            <div className="flex items-center gap-2">
              <img
                src={logoImg}
                alt="LombokGo Logo"
                className="h-12 w-auto object-contain drop-shadow-sm"
              />
              <div>
                <p className="font-display text-xl font-bold">LombokGo</p>
                <p className="text-[11px] text-accent font-semibold tracking-wider uppercase">Transport & Rental</p>
              </div>
            </div>
            <p className="text-xs text-primary-foreground/80 leading-relaxed italic">
              "Your Seamless Gateway to Exploring Lombok — Right from the Airport Gate"
            </p>
            <p className="text-xs text-primary-foreground/75 leading-relaxed">
              Penyedia jasa sewa mobil & motor, antar-jemput bandara (airport transfer), serta paket wisata terpercaya berbasis langsung di Bandara BIZAM Lombok.
            </p>
          </div>

          <div className="text-xs space-y-2.5">
            <p className="font-semibold text-sm text-accent uppercase tracking-wider">Kantor & Layanan</p>
            <p className="flex items-start gap-2 text-primary-foreground/85">
              <MapPin className="h-4 w-4 text-accent shrink-0 mt-0.5" />
              <span>Kawasan Bandara Internasional Zainuddin Abdul Madjid (BIZAM), Jl. Bypass BIL – Mandalika, Praya, Lombok Tengah, NTB</span>
            </p>
            <p className="flex items-center gap-2 text-primary-foreground/85">
              <Clock className="h-4 w-4 text-accent shrink-0" />
              <span>06.00 – 23.00 WITA (Layanan Bandara 24 Jam)</span>
            </p>
            <p className="flex items-center gap-2 text-primary-foreground/85">
              <ShieldCheck className="h-4 w-4 text-accent shrink-0" />
              <span>Inspeksi Keselamatan & Bantuan 24/7</span>
            </p>
          </div>

          <div className="text-xs space-y-2.5">
            <p className="font-semibold text-sm text-accent uppercase tracking-wider">Kontak Resmi</p>
            <p className="flex items-center gap-2 text-primary-foreground/85">
              <Phone className="h-4 w-4 text-accent shrink-0" />
              <span>+{WA_NUMBER.slice(0, 2)} {WA_NUMBER.slice(2, 5)}-{WA_NUMBER.slice(5, 9)}-{WA_NUMBER.slice(9)}</span>
            </p>
            <p className="flex items-center gap-2 text-primary-foreground/85">
              <Mail className="h-4 w-4 text-accent shrink-0" />
              <a href="mailto:info@lombokgotransport.com" className="hover:underline">info@lombokgotransport.com</a>
            </p>
            <p className="flex items-center gap-2 text-primary-foreground/85">
              <Instagram className="h-4 w-4 text-accent shrink-0" />
              <span>@lombokgotransport (IG & TikTok)</span>
            </p>
          </div>

          <div className="text-xs space-y-2.5">
            <p className="font-semibold text-sm text-accent uppercase tracking-wider">Sistem Pembayaran</p>
            <p className="text-primary-foreground/80 leading-relaxed">
              Didukung payment gateway resmi Midtrans: QRIS, Transfer Virtual Account (BCA, Mandiri, BRI, BNI), E-Wallet & Kartu Kredit.
            </p>
            <div className="pt-2">
              <Link to="/admin" className="text-[11px] text-primary-foreground/50 hover:text-accent transition underline underline-offset-4">
                Portal Admin & Kelola Harga →
              </Link>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 mt-8 pt-4 border-t border-primary-foreground/10 flex flex-col md:flex-row items-center justify-between text-[11px] text-primary-foreground/60 gap-2">
          <p>© {new Date().getFullYear()} LombokGo Transport and Rental. All rights reserved.</p>
          <p>Bandara Internasional Lombok (BIZAM) • Car • Bike • Tour</p>
        </div>
      </footer>
      <ChatWidget />
      <a href={waLink("Halo LombokGo, saya ingin konsultasi transportasi / tur.")} target="_blank" rel="noreferrer" aria-label="WhatsApp"
        className="fixed bottom-4 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-whatsapp text-primary-foreground shadow-card transition hover:scale-105 active:scale-95 print:hidden">
        <MessageCircle className="h-7 w-7" />
      </a>
    </div>
  );
}
