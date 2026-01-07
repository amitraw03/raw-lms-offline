import * as XLSX from "xlsx";

/* Export dashboard records */
export function exportDashboardIssuesToExcel(records, fileName) {
  if (!records.length) {
    alert("No records to export");
    return;
  }

  const rows = records.map(r => ({
    AP_No: r.ap_no,
    AP_Name: r.ap_name,
    Borrower_Name: r.issued_to_name,
    Borrower_Number: r.issued_to_number,
    Qty: r.qty_issued,
    Issued_By: r.issued_by_name,
    Issued_At: new Date(r.issued_at).toLocaleString("en-IN"),
    Status: r.status
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, "Dashboard");

  XLSX.writeFile(wb, fileName);
}
