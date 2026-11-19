import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export type AdminVehicle = {
  id: string;
  name: string;
  type: "Mobil" | "Motor";
  seats: number;
  transmission: "Manual" | "Otomatis" | "Manual & Otomatis" | string;
  driver: boolean;
  driverOption?: "both" | "with_driver" | "self_drive" | string;
  // Harga utama (dipakai jika hanya satu varian)
  daily: number;
  weekly: number;
  // Harga per varian transmisi (jika transmission === "Manual & Otomatis")
  dailyManual?: number;
  weeklyManual?: number;
  dailyOtomatis?: number;
  weeklyOtomatis?: number;
  // Biaya tambahan sopir per hari (jika driverOption === "both")
  dailyDriver?: number;
  weeklyDriver?: number;
  year: number;
  condition: string;
  specs: string[];
  image?: string;
};

export type AdminTour = {
  id: string;
  title: string;
  category: "One-Day Tour" | "Keluarga" | "Honeymoon" | "Custom";
  duration: string;
  price: number;
  image: string;
  summary: string;
  itinerary: string[];
  includes: string[];
  pickup: string;
};

export type DeliveryArea = {
  name: string;
  fee: number;
};

export type CatalogData = {
  waNumber: string;
  deliveryAreas: DeliveryArea[];
  vehicles: AdminVehicle[];
  tours: AdminTour[];
  geminiApiKey?: string;
};

async function readCatalogDisk(): Promise<CatalogData> {
  try {
    const fs = await import("node:fs");
    const path = await import("node:path");
    const filePath = path.resolve(process.cwd(), ".catalog-db.json");
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, "utf-8"));
    }
  } catch (e) {
    console.warn("[readCatalogDisk] error:", e);
  }

  // Fallback defaults
  return {
    waNumber: "6287866950767",
    deliveryAreas: [
      { name: "Bandara Lombok (LOP)", fee: 100000 },
      { name: "Pelabuhan Lembar / Bangsal", fee: 100000 },
      { name: "Mataram", fee: 0 },
      { name: "Senggigi", fee: 50000 },
      { name: "Kuta Mandalika", fee: 100000 },
    ],
    vehicles: [],
    tours: [],
  };
}

async function writeCatalogDisk(data: CatalogData) {
  try {
    const fs = await import("node:fs");
    const path = await import("node:path");
    const filePath = path.resolve(process.cwd(), ".catalog-db.json");
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.warn("[writeCatalogDisk] error:", e);
  }
}

async function readOrdersDisk() {
  try {
    const fs = await import("node:fs");
    const path = await import("node:path");
    const filePath = path.resolve(process.cwd(), ".orders-db.json");
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, "utf-8"));
    }
  } catch (e) {
    console.warn("[readOrdersDisk] error:", e);
  }
  return [];
}

async function writeOrdersDisk(list: unknown[]) {
  try {
    const fs = await import("node:fs");
    const path = await import("node:path");
    const filePath = path.resolve(process.cwd(), ".orders-db.json");
    fs.writeFileSync(filePath, JSON.stringify(list, null, 2), "utf-8");
  } catch (e) {
    console.warn("[writeOrdersDisk] error:", e);
  }
}

export const getAdminOverview = createServerFn({ method: "GET" }).handler(async () => {
  const catalog = await readCatalogDisk();
  let ordersList = await readOrdersDisk();

  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: dbOrders } = await supabaseAdmin.from("orders").select("*").order("created_at", { ascending: false });
    if (dbOrders && dbOrders.length > 0) {
      // Merge with disk
      const map = new Map();
      for (const o of ordersList) map.set(o.invoice_number, o);
      for (const o of dbOrders) map.set(o.invoice_number, o);
      ordersList = Array.from(map.values());
    }
  } catch {
    // ignore
  }

  return {
    catalog,
    orders: ordersList,
  };
});

const vehicleSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2),
  type: z.enum(["Mobil", "Motor"]),
  seats: z.number().int().min(1),
  transmission: z.enum(["Manual", "Otomatis", "Manual & Otomatis"]).or(z.string()),
  driver: z.boolean(),
  driverOption: z.string().optional(),
  daily: z.number().int().min(1000),
  weekly: z.number().int().min(5000),
  dailyManual: z.number().int().optional(),
  weeklyManual: z.number().int().optional(),
  dailyOtomatis: z.number().int().optional(),
  weeklyOtomatis: z.number().int().optional(),
  dailyDriver: z.number().int().optional(),
  weeklyDriver: z.number().int().optional(),
  year: z.number().int().min(2000),
  condition: z.string().min(2),
  specs: z.array(z.string()),
  image: z.string().optional(),
});

export const saveVehicle = createServerFn({ method: "POST" })
  .inputValidator((d) => vehicleSchema.parse(d))
  .handler(async ({ data }) => {
    const catalog = await readCatalogDisk();
    const idx = catalog.vehicles.findIndex((v) => v.id === data.id);
    if (idx >= 0) {
      catalog.vehicles[idx] = data;
    } else {
      catalog.vehicles.push(data);
    }
    await writeCatalogDisk(catalog);
    return { success: true, vehicle: data };
  });

export const deleteVehicle = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ id: z.string() }).parse(d))
  .handler(async ({ data }) => {
    const catalog = await readCatalogDisk();
    catalog.vehicles = catalog.vehicles.filter((v) => v.id !== data.id);
    await writeCatalogDisk(catalog);
    return { success: true };
  });

const tourSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(2),
  category: z.enum(["One-Day Tour", "Keluarga", "Honeymoon", "Custom"]),
  duration: z.string().min(1),
  price: z.number().int().min(10000),
  image: z.string().min(1),
  summary: z.string().min(5),
  itinerary: z.array(z.string()),
  includes: z.array(z.string()),
  pickup: z.string().min(2),
});

export const saveTour = createServerFn({ method: "POST" })
  .inputValidator((d) => tourSchema.parse(d))
  .handler(async ({ data }) => {
    const catalog = await readCatalogDisk();
    const idx = catalog.tours.findIndex((t) => t.id === data.id);
    if (idx >= 0) {
      catalog.tours[idx] = data;
    } else {
      catalog.tours.push(data);
    }
    await writeCatalogDisk(catalog);
    return { success: true, tour: data };
  });

export const deleteTour = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ id: z.string() }).parse(d))
  .handler(async ({ data }) => {
    const catalog = await readCatalogDisk();
    catalog.tours = catalog.tours.filter((t) => t.id !== data.id);
    await writeCatalogDisk(catalog);
    return { success: true };
  });

const settingsSchema = z.object({
  waNumber: z.string().min(8),
  deliveryAreas: z.array(z.object({ name: z.string(), fee: z.number().int() })),
  geminiApiKey: z.string().optional(),
});

export const saveSettings = createServerFn({ method: "POST" })
  .inputValidator((d) => settingsSchema.parse(d))
  .handler(async ({ data }) => {
    const catalog = await readCatalogDisk();
    catalog.waNumber = data.waNumber;
    catalog.deliveryAreas = data.deliveryAreas;
    if (data.geminiApiKey !== undefined) {
      catalog.geminiApiKey = data.geminiApiKey.trim();
    }
    await writeCatalogDisk(catalog);
    return { success: true };
  });

export const updateOrderStatus = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ invoice: z.string(), status: z.string() }).parse(d))
  .handler(async ({ data }) => {
    const orders = (await readOrdersDisk()) as Array<{ invoice_number: string; status: string; paid_at?: string | null }>;
    const now = new Date().toISOString();
    const target = orders.find((o) => o.invoice_number === data.invoice);
    if (target) {
      target.status = data.status;
      if (data.status === "lunas" && !target.paid_at) {
        target.paid_at = now;
      }
      await writeOrdersDisk(orders);
    }

    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      await supabaseAdmin.from("orders").update({
        status: data.status,
        ...(data.status === "lunas" ? { paid_at: now } : {}),
      }).eq("invoice_number", data.invoice);
    } catch {
      // ignore
    }

    return { success: true };
  });

// PUBLIC: untuk halaman kendaraan & wisata (tidak butuh autentikasi admin)
export const getCatalogPublic = createServerFn({ method: "GET" }).handler(async () => {
  const catalog = await readCatalogDisk();
  return {
    vehicles: catalog.vehicles,
    tours: catalog.tours,
    deliveryAreas: catalog.deliveryAreas,
    waNumber: catalog.waNumber,
  };
});
