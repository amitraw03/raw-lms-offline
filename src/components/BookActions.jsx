import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Stack,
  Button,
  Divider,
  Alert,
  Snackbar,
  CircularProgress,
  Autocomplete,
} from "@mui/material";

import { getCurrentAdmin } from "../services/localAuthService";
import { getInventory, incrementIssued } from "../services/inventoryService";
import { issueBook } from "../services/offlineIssueService";

function BookActions() {
  const admin = getCurrentAdmin();

  const [inventory, setInventory] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);

  const [issuedToName, setIssuedToName] = useState("");
  const [issuedToNumber, setIssuedToNumber] = useState("");
  const [qty, setQty] = useState(1);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  /* ---------- LOAD INVENTORY ---------- */
  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    const data = await getInventory();
    setInventory(data);
  };

  const available = selectedBook
    ? selectedBook.qty_total - selectedBook.qty_issued
    : 0;

  /* ---------- HANDLE ISSUE ---------- */
  const handleIssue = async () => {
    if (!selectedBook) return;

    if (available <= 0) {
      setError("Book not available");
      return;
    }

    if (!issuedToName || !issuedToNumber) {
      setError("Borrower details are required");
      return;
    }

    if (qty < 1 || qty > available) {
      setError("Invalid quantity");
      return;
    }

    setLoading(true);
    setError("");

    await issueBook({
      ap_no: selectedBook.ap_no,
      ap_name: selectedBook.ap_name,
      qty_issued: qty,
      issued_to_name: issuedToName.trim(),
      issued_to_number: issuedToNumber.trim(),
      issued_by_name: admin.name,
      issued_by_number: admin.number,
      status: "ISSUED",
    });

    await incrementIssued(selectedBook.id, qty);

    setLoading(false);
    setSuccess(true);

    // Reset
    setSelectedBook(null);
    setIssuedToName("");
    setIssuedToNumber("");
    setQty(1);
  };

  return (
    <Box sx={{ mb: 1 }}>
      <Typography variant="h6">Issue Book</Typography>

      {/* ---------- BOOK SELECT ---------- */}
      <Autocomplete
        options={inventory}
        value={selectedBook}
        onChange={(_, value) => {
          setSelectedBook(value);
          setQty(1);
          setError("");
        }}
        getOptionLabel={(option) => `${option.ap_no} — ${option.ap_name}`}
        filterOptions={(options, { inputValue }) => {
          const q = inputValue.toLowerCase();
          return options.filter(
            (o) =>
              o.ap_no.toLowerCase().includes(q) ||
              o.ap_name.toLowerCase().includes(q)
          );
        }}
        renderOption={(props, option) => (
          <li
            {...props}
            key={option.id}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "12px",
            }}
          >
            {/* AP NO – fixed width */}
            <span
              style={{
                width: "25%",
                fontWeight: 600,
                whiteSpace: "nowrap",
              }}
            >
              {option.ap_no}
            </span>

            {/* DESCRIPTION – flexible */}
            <span
              style={{
                width: "75%",
                whiteSpace: "normal",
                lineHeight: 1.3,
              }}
            >
              {option.ap_name}
            </span>
          </li>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Search by AP No or Publication Name"
            fullWidth
            sx={{ my: 2 }}
          />
        )}
      />

      {selectedBook && (
        <>
          <Divider sx={{ mb: 2 }} />

          {available <= 0 ? (
            <Typography sx={{ mb: 2, color: "error.main", fontWeight: 600 }}>
              Book not available
            </Typography>
          ) : (
            <Typography sx={{ mb: 2 }}>Available: {available}</Typography>
          )}

          <Stack spacing={2}>
            <TextField
              label="Borrower Name"
              value={issuedToName}
              disabled={available <= 0}
              onChange={(e) => setIssuedToName(e.target.value)}
            />

            <TextField
              label="Borrower Number"
              value={issuedToNumber}
              disabled={available <= 0}
              onChange={(e) => setIssuedToNumber(e.target.value)}
            />

            <TextField
              type="number"
              label="Quantity"
              value={qty}
              disabled={available <= 0}
              inputProps={{
                min: 1,
                max: available,
              }}
              onChange={(e) => setQty(Number(e.target.value))}
            />

            <Button
              variant="contained"
              color="success"
              disabled={loading || available <= 0}
              onClick={handleIssue}
              startIcon={loading && <CircularProgress size={18} />}
            >
              Issue Book
            </Button>
          </Stack>
        </>
      )}

      {error && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      <Snackbar
        open={success}
        autoHideDuration={1800}
        message="Book issued successfully"
        onClose={() => setSuccess(false)}
      />
    </Box>
  );
}

export default BookActions;
