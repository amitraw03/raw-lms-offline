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
  Chip,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@mui/material";

import { getAllIssues, deleteIssuesByIds } from "../services/offlineIssueService";
import { verifyMasterKey } from "../services/localAuthService";

function BorrowHistory() {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");

  const [askKey, setAskKey] = useState(false);
  const [masterKey, setMasterKey] = useState("");

  const load = async () => {
    const all = await getAllIssues();
    setRows(all.filter(i => i.status === "RETURNED"));
  };

  useEffect(() => {
    load();
    window.addEventListener("issues-updated", load);
    return () => window.removeEventListener("issues-updated", load);
  }, []);

  const filtered = useMemo(() => {
    if (!search) return rows;
    const q = search.toLowerCase();
    return rows.filter(
      r =>
        r.ap_no.toLowerCase().includes(q) ||
        r.ap_name.toLowerCase().includes(q) ||
        r.issued_to_name.toLowerCase().includes(q)
    );
  }, [rows, search]);

  /* ---------- DELETE ALL ---------- */
  const handleDeleteAll = async () => {
    if (!verifyMasterKey(masterKey)) {
      alert("Invalid Master Key");
      return;
    }

    const ids = rows.map(r => r.id);
    await deleteIssuesByIds(ids);

    setMasterKey("");
    setAskKey(false);
  };

  return (
    <Box sx={{ mt: 3 }}>
      {/* HEADER */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2
        }}
      >
        <Typography variant="h6">Return History</Typography>

        {rows.length > 0 && (
          <Button
            color="error"
            size="small"
            variant="outlined"
            onClick={() => setAskKey(true)}
          >
            DELETE ALL
          </Button>
        )}
      </Box>

      <TextField
        fullWidth
        size="small"
        sx={{ mb: 2 }}
        label="Search by AP No / AP Name / Borrower"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {/* ✅ SCROLL CONTAINER */}
      <Paper
        sx={{
          height: "70vh",
          overflowY: "auto",
          overscrollBehavior: "contain",
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" }
        }}
      >
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell>AP No</TableCell>
              <TableCell>AP Name</TableCell>
              <TableCell>Borrower</TableCell>
              <TableCell>Qty</TableCell>
              <TableCell>Issued By</TableCell>
              <TableCell>Issued At</TableCell>
              <TableCell>Returned At</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filtered.map(r => (
              <TableRow key={r.id}>
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
                    timeStyle: "short"
                  })}
                </TableCell>

                <TableCell>
                  {new Date(r.returned_at).toLocaleString("en-IN", {
                    dateStyle: "medium",
                    timeStyle: "short"
                  })}
                </TableCell>

                <TableCell>
                  <Chip size="small" label="RETURNED" color="success" />
                </TableCell>
              </TableRow>
            ))}

            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No completed records
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      {/* ---------- MASTER KEY DIALOG ---------- */}
      <Dialog open={askKey} onClose={() => setAskKey(false)}>
        <DialogTitle>Admin Authorization</DialogTitle>
        <DialogContent>
          <TextField
            type="password"
            fullWidth
            label="Enter Master Key"
            value={masterKey}
            onChange={e => setMasterKey(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAskKey(false)}>Cancel</Button>
          <Button color="error" onClick={handleDeleteAll}>
            Confirm Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default BorrowHistory;
