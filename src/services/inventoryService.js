import * as XLSX from "xlsx";
import { getDb, STORE_INVENTORY } from "../db/libraryDb";

/* Upload Excel and overwrite inventory */
export async function uploadInventoryExcel(file) {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];

  // defval ensures empty cells are not skipped
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

  const db = await getDb();
  const tx = db.transaction(STORE_INVENTORY, "readwrite");
  await tx.store.clear();

  for (const row of rows) {
    const apNo =
      row["AP NO."] ||
      row["AP NO"] ||
      row["AP_No"] ||
      row["Ap No"];

    const name =
      row["Air Publication Description"] ||
      row["Air Publication"] ||
      row["AP Name"];

    if (!apNo || !name) continue;

    const authQty = Number(row["Auth Qty"] || 0);
    const heldQty = Number(row["Held Qty"] || 0);

    await tx.store.put({
      ap_no: String(apNo).trim(),
      ap_name: String(name).trim(),
      qty_total: authQty,
      qty_issued: heldQty
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
      "Air Publication Description": r.ap_name,
      "AP NO.": r.ap_no,
      "Auth Qty": r.qty_total,
      "Held Qty": r.qty_issued,
      "Available": r.qty_total - r.qty_issued
    }))
  );

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Inventory");
  XLSX.writeFile(wb, "inventory_snapshot.xlsx");
}
