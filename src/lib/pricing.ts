import { deliveryAreas, tours, vehicles } from "./data";

export type QuoteInput = {
  itemType: "vehicle" | "tour";
  itemId: string;
  quantity: number;
  deliveryIndex?: number;
  // Pilihan varian (dari BookingDialog)
  transmissionChoice?: "Manual" | "Otomatis";
  driverChoice?: "self_drive" | "with_driver";
  // Jika data kendaraan langsung dikirim (dari catalog DB)
  vehicleData?: {
    daily: number; weekly: number;
    dailyManual?: number; weeklyManual?: number;
    dailyOtomatis?: number; weeklyOtomatis?: number;
    dailyDriver?: number; weeklyDriver?: number;
    driverOption?: string;
    transmission?: string;
  };
};

export function quote(input: QuoteInput) {
  const qty = Math.max(1, Math.floor(input.quantity));

  if (input.itemType === "vehicle") {
    // Coba cari dari catalog DB jika vehicleData dikirim, fallback ke static
    const v = input.vehicleData ?? vehicles.find((x) => x.id === input.itemId);
    if (!v) throw new Error("Kendaraan tidak ditemukan");

    const area = deliveryAreas[input.deliveryIndex ?? 2] ?? deliveryAreas[2]!;
    const weeks = Math.floor(qty / 7);
    const days = qty % 7;

    // Tentukan harga dasar berdasarkan pilihan transmisi
    let baseDaily = v.daily;
    let baseWeekly = v.weekly;

    const isMultiTrans = (v as any).transmission === "Manual & Otomatis" ||
      ((v as any).dailyManual && (v as any).dailyOtomatis);

    if (isMultiTrans && input.transmissionChoice) {
      if (input.transmissionChoice === "Manual" && (v as any).dailyManual) {
        baseDaily = (v as any).dailyManual;
        baseWeekly = (v as any).weeklyManual ?? baseWeekly;
      } else if (input.transmissionChoice === "Otomatis" && (v as any).dailyOtomatis) {
        baseDaily = (v as any).dailyOtomatis;
        baseWeekly = (v as any).weeklyOtomatis ?? baseWeekly;
      }
    }

    // Tambahan biaya sopir jika dipilih
    let driverExtra = 0;
    let driverExtraWeekly = 0;
    const hasBothDriver = (v as any).driverOption === "both";
    if (hasBothDriver && input.driverChoice === "with_driver" && (v as any).dailyDriver) {
      driverExtra = (v as any).dailyDriver;
      driverExtraWeekly = (v as any).weeklyDriver ?? (v as any).dailyDriver * 7;
    }

    const subtotal = weeks * (baseWeekly + driverExtraWeekly) + days * (baseDaily + driverExtra);

    return {
      itemName: (v as any).name ?? input.itemId,
      unitPrice: baseDaily + driverExtra,
      unitLabel: "hari",
      quantity: qty,
      subtotal,
      deliveryArea: area.name,
      deliveryFee: area.fee,
      total: subtotal + area.fee,
      transmissionChoice: input.transmissionChoice,
      driverChoice: input.driverChoice,
    };
  }

  const t = tours.find((x) => x.id === input.itemId);
  if (!t) throw new Error("Paket tidak ditemukan");
  const subtotal = t.price * qty;
  return {
    itemName: t.title,
    unitPrice: t.price,
    unitLabel: "orang",
    quantity: qty,
    subtotal,
    deliveryArea: null,
    deliveryFee: 0,
    total: subtotal,
    transmissionChoice: undefined,
    driverChoice: undefined,
  };
}
