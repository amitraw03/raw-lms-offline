import { getDb, STORE_INVENTORY } from "../db/libraryDb";

export async function seedInventoryIfEmpty() {
  const db = await getDb();
  const tx = db.transaction(STORE_INVENTORY, "readonly");
  const store = tx.objectStore(STORE_INVENTORY);

  const count = await store.count();

  // ✅ Do nothing if inventory already exists
  if (count > 0) return;

  const seedData = [
    {
      ap_no: "AP1001",
      ap_name: "Operating Systems",
      qty_held: 10,
      qty_issued: 2
    },
    {
      ap_no: "AP1002",
      ap_name: "Database Management Systems",
      qty_held: 8,
      qty_issued: 1
    },
    {
      ap_no: "AP1003",
      ap_name: "Computer Networks",
      qty_held: 12,
      qty_issued: 5
    },
    {
      ap_no: "AP1004",
      ap_name: "Data Structures",
      qty_held: 15,
      qty_issued: 4
    },
    {
      ap_no: "AP1005",
      ap_name: "Software Engineering",
      qty_held: 6,
      qty_issued: 0
    }
  ];

  const writeTx = db.transaction(STORE_INVENTORY, "readwrite");
  const writeStore = writeTx.objectStore(STORE_INVENTORY);

  for (const book of seedData) {
    await writeStore.put(book);
  }

  await writeTx.done;
}
