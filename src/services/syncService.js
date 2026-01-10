import * as XLSX from "xlsx";
import { getDb, STORE_INVENTORY, STORE_ISSUES } from "../db/libraryDb";
import { getInventory } from "./inventoryService";
import { getAllIssues } from "./offlineIssueService";

/* ===========================
   EXPORT FULL SYNC (INVENTORY + ISSUES)
   =========================== */
export async function exportFullSync() {
  const inventory = await getInventory();
  const issues = await getAllIssues();

  if (!inventory.length && !issues.length) {
    alert("No data available to sync");
    return;
  }

  const wb = XLSX.utils.book_new();

  /* ---- Inventory Sheet ---- */
  const inventorySheet = XLSX.utils.json_to_sheet(
    inventory.map(r => ({
      "AP NO.": r.ap_no,
      "Air Publication Description": r.ap_name,
      "Auth Qty": r.qty_total,
      "Held Qty": r.qty_issued,
      "Available": r.qty_total - r.qty_issued
    }))
  );

  XLSX.utils.book_append_sheet(wb, inventorySheet, "Inventory");

  /* ---- Issues Sheet ---- */
  const issuesSheet = XLSX.utils.json_to_sheet(
    issues.map(r => ({
      AP_No: r.ap_no,
      AP_Name: r.ap_name,
      Borrower_Name: r.issued_to_name,
      Borrower_Number: r.issued_to_number,
      Qty: r.qty_issued,
      Issued_By: r.issued_by_name,
      Issued_At: r.issued_at,
      Status: r.status,
      Returned_At: r.returned_at || ""
    }))
  );

  XLSX.utils.book_append_sheet(wb, issuesSheet, "Issues");

  XLSX.writeFile(wb, "raw_lms_full_sync.xlsx");
}

/* ===========================
   IMPORT FULL SYNC (RESTORE DATA)
   =========================== */
export async function importFullSync(file) {
  if (!file) return;

  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer);

  const inventoryRows = XLSX.utils.sheet_to_json(
    wb.Sheets["Inventory"],
    { defval: "" }
  );

  const issueRows = XLSX.utils.sheet_to_json(
    wb.Sheets["Issues"],
    { defval: "" }
  );

  const db = await getDb();
  const tx = db.transaction([STORE_INVENTORY, STORE_ISSUES], "readwrite");

  /* ---- CLEAR EXISTING DATA ---- */
  await tx.objectStore(STORE_INVENTORY).clear();
  await tx.objectStore(STORE_ISSUES).clear();

  /* ---- RESTORE INVENTORY ---- */
  for (const r of inventoryRows) {
    if (!r["AP NO."] || !r["Air Publication Description"]) continue;

    await tx.objectStore(STORE_INVENTORY).put({
      ap_no: String(r["AP NO."]).trim(),
      ap_name: String(r["Air Publication Description"]).trim(),
      qty_total: Number(r["Auth Qty"]) || 0,
      qty_issued: Number(r["Held Qty"]) || 0
    });
  }

  /* ---- RESTORE ISSUES ---- */
  for (const r of issueRows) {
    if (!r.AP_No || !r.AP_Name) continue;

    await tx.objectStore(STORE_ISSUES).add({
      ap_no: r.AP_No,
      ap_name: r.AP_Name,
      issued_to_name: r.Borrower_Name || "",
      issued_to_number: r.Borrower_Number || "",
      qty_issued: Number(r.Qty) || 0,
      issued_by_name: r.Issued_By || "",
      issued_at: r.Issued_At || new Date().toISOString(),
      status: r.Status || "RETURNED",
      returned_at: r.Returned_At || null
    });
  }

  await tx.done;

  window.dispatchEvent(new Event("issues-updated"));
}
