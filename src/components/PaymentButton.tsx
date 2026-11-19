import React, { useEffect } from "react";

declare global {
  interface Window {
    snap: any;
  }
}

type Props = {
  orderId: string;
  amount: number; // dalam Rupiah
  customer: { name: string; email: string; phone?: string };
  onSuccess: (result: any) => void;
  onPending?: () => void;
  onError?: (error: any) => void;
};

export function PaymentButton({ orderId, amount, customer, onSuccess, onPending, onError }: Props) {
  // Load Midtrans Snap script once
  useEffect(() => {
    if (window.snap) return;
    const script = document.createElement("script");
    script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
    script.setAttribute("data-client-key", import.meta.env.VITE_MIDTRANS_CLIENT_KEY as string);
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePay = async () => {
    try {
      const res = await fetch("/api/createSnapToken", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          amount,
          customer,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message ?? "Gagal membuat token pembayaran");

      const token = data.snapToken;
      window.snap?.pay(token, {
        onSuccess,
        onPending: onPending ?? (() => console.log("Payment pending")),
        onError: onError ?? ((e) => console.error(e)),
        onClose: () => console.log("Widget pembayaran ditutup"),
      });
    } catch (e) {
      console.error(e);
      onError?.(e);
    }
  };

  return (
    <button
      type="button"
      onClick={handlePay}
      className="rounded-full bg-primary px-6 py-2 text-white"
    >
      Bayar dengan Midtrans
    </button>
  );
}
