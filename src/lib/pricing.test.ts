import { describe, expect, it } from "vitest";
import { quote } from "./pricing";

describe("quote", () => {
  it("menghitung sewa harian + biaya antar bandara", () => {
    const q = quote({ itemType: "vehicle", itemId: "avanza", quantity: 2, deliveryIndex: 0 });
    expect(q.total).toBe(350000 * 2 + 100000);
  });
  it("memakai tarif mingguan untuk 7 hari", () => {
    expect(quote({ itemType: "vehicle", itemId: "avanza", quantity: 8, deliveryIndex: 2 }).total).toBe(2200000 + 350000);
  });
  it("paket wisata dihitung per orang", () => {
    expect(quote({ itemType: "tour", itemId: "gili", quantity: 3 }).total).toBe(450000 * 3);
  });
});
