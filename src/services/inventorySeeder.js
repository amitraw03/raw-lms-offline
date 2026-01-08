import { getDb, STORE_INVENTORY } from "../db/libraryDb";

export async function seedInventoryIfEmpty() {
  const db = await getDb();
  const store = db.transaction(STORE_INVENTORY, "readonly").objectStore(STORE_INVENTORY);
  const count = await store.count();

  if (count > 0) return;

  const seedData = [
    {
      ap_no: "101B-2800-1A",
      ap_name: "AMM VOL I",
      qty_total: 2,
      qty_issued: 0
    },
    {
      ap_no: "101B-2800-1B",
      ap_name: "AMM VOL II",
      qty_total: 2,
      qty_issued: 1
    },
    {
      ap_no: "101B-2800-1C",
      ap_name: "AMM VOL III",
      qty_total: 2,
      qty_issued: 0
    },
    {
      ap_no: "101B-2800-1D",
      ap_name: "AMM VOL IV",
      qty_total: 2,
      qty_issued: 2
    },
    {
      ap_no: "101B-2800-1E",
      ap_name: "AMM VOL V",
      qty_total: 2,
      qty_issued: 0
    }
  ];

  const tx = db.transaction(STORE_INVENTORY, "readwrite");
  for (const item of seedData) {
    await tx.store.put(item);
  }

  await tx.done;
}
