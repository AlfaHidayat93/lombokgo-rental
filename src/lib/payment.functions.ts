import { createServerFn } from "@tanstack/start";
import { z } from "zod";

// Pastikan env var ada (Vercel, local .env, atau vercel env)
const SERVER_KEY = process.env.MIDTRANS_SERVER_KEY;
if (!SERVER_KEY) throw new Error("MIDTRANS_SERVER_KEY tidak diset");

export const createSnapToken = createServerFn({
  method: "POST",
})
  .inputValidator(
    z.object({
      orderId: z.string(),
      amount: z.number().int().min(1000), // dalam Rupiah
      customer: z.object({
        name: z.string(),
        email: z.string().email(),
        phone: z.string().optional(),
      }),
    })
  )
  .handler(async ({ data }) => {
    const payload = {
      transaction_details: {
        order_id: data.orderId,
        gross_amount: data.amount,
      },
      credit_card: {
        secure: true,
      },
      customer_details: {
        first_name: data.customer.name,
        email: data.customer.email,
        phone: data.customer.phone ?? "",
      },
    };

    const res = await fetch("https://app.sandbox.midtrans.com/snap/v1/transactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + Buffer.from(SERVER_KEY + ":").toString("base64"),
      },
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    if (!res.ok) {
      const msg = json?.error_messages?.join(", ") ?? "Gagal membuat token Midtrans";
      throw new Error(msg);
    }
    return { snapToken: json.token };
  });

// Optional: webhook endpoint (set di Vercel routing /api/midtrans-webhook)
export const midtransWebhook = createServerFn({
  method: "POST",
})
  .inputValidator(z.any())
  .handler(async ({ request }) => {
    const signature = request.headers.get("x-signature") ?? "";
    const body = await request.text();
    const secret = process.env.MIDTRANS_SERVER_KEY!; // gunakan same key as secret
    const crypto = await import("crypto");
    const hash = crypto.createHmac("sha512", secret).update(body).digest("hex");
    if (hash !== signature) throw new Error("Signature tidak valid");
    const data = JSON.parse(body);
    // TODO: Simpan atau update status order di .orders-db.json atau DB lain
    console.log("Midtrans webhook data:", data);
    return { ok: true };
  });
