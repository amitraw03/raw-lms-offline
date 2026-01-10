import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  TextField,
  Button,
  Chip,
  Stack,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

import {
  getAllIssues,
  deleteIssuesByIds,
} from "../services/offlineIssueService";
import { verifyMasterKey } from "../services/localAuthService";
import { exportDashboardIssuesToExcel } from "../services/exportService";
import { exportFullSync, importFullSync } from "../services/syncService";
import ReturnBookDialog from "./ReturnBookDialog";

const FILTERS = ["ALL", "ISSUED", "RETURNED"];

function Dashboard() {
  const [issues, setIssues] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ISSUED");
  const [selectedIssue, setSelectedIssue] = useState(null);

  const [selectedIds, setSelectedIds] = useState([]);
  const [askKey, setAskKey] = useState(false);
  const [masterKey, setMasterKey] = useState("");

  const load = async () => {
    const all = await getAllIssues();
    setIssues(all);
  };

  useEffect(() => {
    load();
    window.addEventListener("issues-updated", load);
    return () => window.removeEventListener("issues-updated", load);
  }, []);

  const filtered = useMemo(() => {
    let data = issues;
    if (filter !== "ALL") data = data.filter((r) => r.status === filter);

    if (!search) return data;
    const q = search.toLowerCase();
    return data.filter(
      (r) =>
        r.ap_no.toLowerCase().includes(q) ||
        r.ap_name.toLowerCase().includes(q) ||
        r.issued_to_name.toLowerCase().includes(q) ||
        r.issued_to_number.toLowerCase().includes(q)
    );
  }, [issues, filter, search]);

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleDeleteConfirm = async () => {
    if (!verifyMasterKey(masterKey)) {
      alert("Invalid Master Key");
      return;
    }

    await deleteIssuesByIds(selectedIds);
    setSelectedIds([]);
    setMasterKey("");
    setAskKey(false);
  };

  return (
    <Box
    // sx={{
    //   // mt: 3,
    //   flex: 1,
    //   display: "flex",
    //   flexDirection: "column",
    //   minHeight: 0 // 🔑 REQUIRED for flex scrolling
    // }}
    >
      <Typography variant="h6">Issues</Typography>

      <Stack direction="row" spacing={1} sx={{ mb: 2, alignItems: "center" }}>
        {FILTERS.map((f) => (
          <Button
            key={f}
            size="small"
            variant={filter === f ? "contained" : "outlined"}
            onClick={() => setFilter(f)}
          >
            {f}
          </Button>
        ))}

        <Button
          size="small"
          onClick={() =>
            exportDashboardIssuesToExcel(issues, "dashboard_all.xlsx")
          }
        >
          Export All
        </Button>

        <Button
          size="small"
          onClick={() =>
            exportDashboardIssuesToExcel(
              filtered,
              `dashboard_${filter.toLowerCase()}.xlsx`
            )
          }
        >
          Export Filtered
        </Button>

        {/* 🔁 PUSH SYNC TO EXTREME RIGHT */}
        <Box sx={{ ml: "auto", display: "flex", gap: 1 }}>
          <Button
            size="small"
            sx={{
              backgroundColor: "#ea5151ff",
              color: "#fff",
              "&:hover": {
                backgroundColor: "#f90000ff",
              },
            }}
            onClick={exportFullSync}
          >
            Sync ↻ Export
          </Button>

          <Button
            component="label"
            size="small"
            sx={{
              backgroundColor: "success.main",
              color: "#fff",
              "&:hover": {
                backgroundColor: "success.dark",
              },
            }}
          >
            Sync ↻ Import
            <input
              hidden
              type="file"
              accept=".xlsx"
              onChange={(e) => {
                if (e.target.files?.length) {
                  importFullSync(e.target.files[0]);
                }
              }}
            />
          </Button>
        </Box>

        {selectedIds.length > 0 && (
          <Button color="error" onClick={() => setAskKey(true)}>
            DELETE ({selectedIds.length})
          </Button>
        )}
      </Stack>

      <TextField
        fullWidth
        size="small"
        sx={{ mb: 1 }}
        label="Search by AP / Name / Borrower"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* ✅ TRUE SCROLL AREA */}
      <Paper
        sx={{
          height: "50vh",
          overflowY: "auto",
          overscrollBehavior: "contain",
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>AP No</TableCell>
              <TableCell>AP Name</TableCell>
              <TableCell>Borrower</TableCell>
              <TableCell>Qty</TableCell>
              <TableCell>Issued By</TableCell>
              <TableCell>Issued At</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filtered.map((r) => (
              <TableRow key={r.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedIds.includes(r.id)}
                    onChange={() => toggleSelect(r.id)}
                  />
                </TableCell>

                <TableCell>{r.ap_no}</TableCell>
                <TableCell>{r.ap_name}</TableCell>

                <TableCell>
                  {r.issued_to_name}
                  <br />
                  <small>{r.issued_to_number}</small>
                </TableCell>

                <TableCell>{r.qty_issued}</TableCell>
                <TableCell>{r.issued_by_name}</TableCell>

                <TableCell>
                  {new Date(r.issued_at).toLocaleString("en-IN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </TableCell>

                <TableCell>
                  <Chip
                    size="small"
                    label={r.status}
                    color={r.status === "ISSUED" ? "warning" : "success"}
                  />
                </TableCell>

                <TableCell>
                  {r.status === "ISSUED" ? (
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => setSelectedIssue(r)}
                    >
                      Return
                    </Button>
                  ) : (
                    "--"
                  )}
                </TableCell>
              </TableRow>
            ))}

            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  No records found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      <ReturnBookDialog
        open={!!selectedIssue}
        issue={selectedIssue}
        onClose={() => setSelectedIssue(null)}
      />

      <Dialog open={askKey} onClose={() => setAskKey(false)}>
        <DialogTitle>Admin Authorization</DialogTitle>
        <DialogContent>
          <TextField
            type="password"
            fullWidth
            label="Enter Master Key"
            value={masterKey}
            onChange={(e) => setMasterKey(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAskKey(false)}>Cancel</Button>
          <Button color="error" onClick={handleDeleteConfirm}>
            Confirm Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Dashboard;
