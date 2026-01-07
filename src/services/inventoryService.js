import * as XLSX from "xlsx";
import { getDb, STORE_INVENTORY } from "../db/libraryDb";

/* Upload Excel and overwrite inventory */
export async function uploadInventoryExcel(file) {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet);

  const db = await getDb();
  const tx = db.transaction(STORE_INVENTORY, "readwrite");
  await tx.store.clear();

  for (const row of rows) {
    if (!row.AP_No || !row.AP_Name || row.Qty_Held == null) {
      throw new Error("Invalid Excel format");
    }

    await tx.store.put({
      ap_no: String(row.AP_No).trim(),
      ap_name: String(row.AP_Name).trim(),
      qty_held: Number(row.Qty_Held),
      qty_issued: 0
    });
  }

  await tx.done;
}

/* Inventory helpers */
export async function getInventory() {
  const db = await getDb();
  return db.getAll(STORE_INVENTORY);
}

export async function getBookByApNo(apNo) {
  const db = await getDb();
  return db.get(STORE_INVENTORY, apNo);
}

export async function incrementIssued(apNo, qty = 1) {
  const db = await getDb();
  const item = await db.get(STORE_INVENTORY, apNo);
  item.qty_issued += qty;
  await db.put(STORE_INVENTORY, item);
}

export async function decrementIssued(apNo, qty = 1) {
  const db = await getDb();
  const item = await db.get(STORE_INVENTORY, apNo);
  item.qty_issued -= qty;
  await db.put(STORE_INVENTORY, item);
}

/* Export inventory snapshot */
export async function exportInventoryExcel() {
  const rows = await getInventory();
  const ws = XLSX.utils.json_to_sheet(
    rows.map(r => ({
      AP_No: r.ap_no,
      AP_Name: r.ap_name,
      Qty_Held: r.qty_held,
      Qty_Issued: r.qty_issued,
      Qty_Available: r.qty_held - r.qty_issued
    }))
  );

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Inventory");
  XLSX.writeFile(wb, "inventory_snapshot.xlsx");
}
