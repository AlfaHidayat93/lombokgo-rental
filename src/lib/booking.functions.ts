import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { quote } from "./pricing";
import initialCatalog from "@/data/initialCatalog.json";

const orderSchema = z.object({
  itemType: z.enum(["vehicle", "tour"]),
  itemId: z.string().min(1).max(50),
  quantity: z.number().int().min(1).max(60),
  deliveryIndex: z.number().int().min(0).max(10).optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().min(6).max(30),
  paymentMethod: z.string(),
  transmissionChoice: z.enum(["Manual", "Otomatis"]).optional(),
  driverChoice: z.enum(["self_drive", "with_driver"]).optional(),
});

type SafeOrder = {
  invoice_number: string;
  access_token: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  item_type: string;
  item_name: string;
  start_date: string;
  quantity: number;
  unit_label: string;
  unit_price: number;
  delivery_area: string | null;
  delivery_fee: number;
  total: number;
  payment_method: string;
  status: string;
  paid_at: string | null;
  created_at: string;
};

// In-memory fallback cache for high availability
const memoryOrders = new Map<string, SafeOrder>();

async function getDiskOrders(): Promise<Map<string, SafeOrder>> {
  const map = new Map<string, SafeOrder>();
  try {
    const fs = await import("node:fs");
    const path = await import("node:path");
    const filePath = path.resolve(process.cwd(), ".orders-db.json");
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      if (Array.isArray(data)) {
        for (const item of data) {
          map.set(`${item.invoice_number}:${item.access_token}`, item);
        }
      }
    }
  } catch (e) {
    console.warn("[getDiskOrders] read error:", e);
  }
  return map;
}

async function saveDiskOrder(order: SafeOrder) {
  try {
    const fs = await import("node:fs");
    const path = await import("node:path");
    const filePath = path.resolve(process.cwd(), ".orders-db.json");
    let list: SafeOrder[] = [];
    if (fs.existsSync(filePath)) {
      list = JSON.parse(fs.readFileSync(filePath, "utf-8")) || [];
    }
    const idx = list.findIndex(
      (x) => x.invoice_number === order.invoice_number && x.access_token === order.access_token
    );
    if (idx >= 0) {
      list[idx] = order;
    } else {
      list.push(order);
    }
    fs.writeFileSync(filePath, JSON.stringify(list, null, 2), "utf-8");
  } catch (e) {
    console.warn("[saveDiskOrder] write error:", e);
  }
}

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

export const createOrder = createServerFn({ method: "POST" })
  .inputValidator((d) => orderSchema.parse(d))
  .handler(async ({ data }) => {
    let vehicleData: any = undefined;
    if (data.itemType === "vehicle") {
      try {
        const fs = await import("node:fs");
        const path = await import("node:path");
        const catPath = path.resolve(process.cwd(), ".catalog-db.json");
        if (fs.existsSync(catPath)) {
          const cat = JSON.parse(fs.readFileSync(catPath, "utf-8"));
          vehicleData = cat?.vehicles?.find((v: any) => v.id === data.itemId);
        }
      } catch (e) {
        console.warn("[createOrder] read catalog disk error:", e);
      }
      if (!vehicleData) {
        vehicleData = (initialCatalog.vehicles as any)?.find((v: any) => v.id === data.itemId);
      }
    }

    const q = quote({
      itemType: data.itemType,
      itemId: data.itemId,
      quantity: data.quantity,
      deliveryIndex: data.deliveryIndex,
      transmissionChoice: data.transmissionChoice,
      driverChoice: data.driverChoice,
      vehicleData,
    });
    const now = new Date();
    const invoice = `INV-${now.toISOString().slice(0, 10).replace(/-/g, "")}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
    const token = generateUuid();

    const orderRow: SafeOrder = {
      invoice_number: invoice,
      access_token: token,
      customer_name: data.name,
      customer_email: data.email,
      customer_phone: data.phone,
      item_type: data.itemType,
      item_name: q.itemName,
      start_date: data.startDate,
      quantity: q.quantity,
      unit_label: q.unitLabel,
      unit_price: q.unitPrice,
      delivery_area: q.deliveryArea,
      delivery_fee: q.deliveryFee,
      total: q.total,
      payment_method: data.paymentMethod,
      status: "menunggu_pembayaran",
      paid_at: null,
      created_at: now.toISOString(),
    };

    memoryOrders.set(`${invoice}:${token}`, orderRow);
    await saveDiskOrder(orderRow);

    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: row, error } = await supabaseAdmin.from("orders").insert({
        invoice_number: invoice,
        access_token: token,
        customer_name: data.name,
        customer_email: data.email,
        customer_phone: data.phone,
        item_type: data.itemType,
        item_name: q.itemName,
        start_date: data.startDate,
        quantity: q.quantity,
        unit_label: q.unitLabel,
        unit_price: q.unitPrice,
        delivery_area: q.deliveryArea,
        delivery_fee: q.deliveryFee,
        total: q.total,
        payment_method: data.paymentMethod,
      }).select("invoice_number, access_token").single();

      if (!error && row) {
        return { invoice: row.invoice_number, token: row.access_token };
      }
    } catch (e) {
      console.warn("[createOrder] Supabase write failed, using persistent order store:", e);
    }

    return { invoice, token };
  });

export const getInvoice = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ invoice: z.string().max(40), token: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const cacheKey = `${data.invoice}:${data.token}`;
    let order: SafeOrder | null = memoryOrders.get(cacheKey) || null;

    if (!order) {
      const diskMap = await getDiskOrders();
      order = diskMap.get(cacheKey) || null;
      if (order) memoryOrders.set(cacheKey, order);
    }

    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: row } = await supabaseAdmin.from("orders").select("*")
        .eq("invoice_number", data.invoice).eq("access_token", data.token).maybeSingle();

      if (row) {
        order = {
          invoice_number: row.invoice_number,
          access_token: row.access_token,
          customer_name: row.customer_name,
          customer_email: row.customer_email,
          customer_phone: row.customer_phone,
          item_type: row.item_type,
          item_name: row.item_name,
          start_date: row.start_date,
          quantity: row.quantity,
          unit_label: row.unit_label,
          unit_price: row.unit_price,
          delivery_area: row.delivery_area,
          delivery_fee: row.delivery_fee,
          total: row.total,
          payment_method: row.payment_method,
          status: row.status,
          paid_at: row.paid_at,
          created_at: row.created_at,
        };
        memoryOrders.set(cacheKey, order);
        await saveDiskOrder(order);
      }
    } catch (e) {
      console.warn("[getInvoice] Supabase read failed, checking in-memory cache:", e);
    }

    if (!order) return null;
    const { access_token: _t, ...safe } = order;
    return safe;
  });

const paySchema = z.object({
  invoice: z.string().max(40),
  token: z.string().uuid(),
  paymentMethod: z.string().optional(),
  referenceId: z.string().optional(),
});

export const payOrder = createServerFn({ method: "POST" })
  .inputValidator((d) => paySchema.parse(d))
  .handler(async ({ data }) => {
    const cacheKey = `${data.invoice}:${data.token}`;
    const paidAt = new Date().toISOString();
    let updated = false;

    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { error } = await supabaseAdmin
        .from("orders")
        .update({
          status: "lunas",
          paid_at: paidAt,
          ...(data.paymentMethod ? { payment_method: data.paymentMethod } : {}),
        })
        .eq("invoice_number", data.invoice)
        .eq("access_token", data.token);

      if (!error) updated = true;
    } catch (e) {
      console.warn("[payOrder] Supabase update failed, updating memory store:", e);
    }

    let cached = memoryOrders.get(cacheKey);
    if (!cached) {
      const diskMap = await getDiskOrders();
      cached = diskMap.get(cacheKey);
    }

    if (cached) {
      cached.status = "lunas";
      cached.paid_at = paidAt;
      if (data.paymentMethod) cached.payment_method = data.paymentMethod;
      memoryOrders.set(cacheKey, cached);
      await saveDiskOrder(cached);
      updated = true;
    }

    return { success: updated, paidAt, status: "lunas" };
  });

export const getPaymentToken = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ invoice: z.string(), token: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const serverKey = process.env["MIDTRANS_SERVER_KEY"];
    const isProduction = process.env["MIDTRANS_IS_PRODUCTION"] === "true";

    // If Midtrans credentials configured, create transaction token with Midtrans Snap API
    if (serverKey) {
      try {
        const invoiceData = await getInvoice({ data });
        if (!invoiceData) throw new Error("Invoice tidak ditemukan");

        const authString = Buffer.from(`${serverKey}:`).toString("base64");
        const snapEndpoint = isProduction
          ? "https://app.midtrans.com/snap/v1/transactions"
          : "https://app.sandbox.midtrans.com/snap/v1/transactions";

        const response = await fetch(snapEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${authString}`,
          },
          body: JSON.stringify({
            transaction_details: {
              order_id: invoiceData.invoice_number,
              gross_amount: invoiceData.total,
            },
            customer_details: {
              first_name: invoiceData.customer_name,
              email: invoiceData.customer_email,
              phone: invoiceData.customer_phone,
            },
            item_details: [
              {
                id: invoiceData.invoice_number,
                price: invoiceData.total,
                quantity: 1,
                name: invoiceData.item_name.slice(0, 50),
              },
            ],
          }),
        });

        if (response.ok) {
          const snapResult = await response.json();
          return {
            snapToken: snapResult.token as string,
            redirectUrl: snapResult.redirect_url as string,
            simulated: false,
          };
        }
      } catch (err) {
        console.error("[getPaymentToken] Midtrans API error:", err);
      }
    }

    // Default: Return simulated gateway config for instant automated checkout
    return {
      snapToken: null,
      redirectUrl: null,
      simulated: true,
      clientKey: process.env["VITE_MIDTRANS_CLIENT_KEY"] || null,
    };
  });
