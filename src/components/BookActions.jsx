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

  /* ---------- VALIDATION REGEX ---------- */
  const nameRegex = /^[A-Z][a-zA-Z ]{0,11}$/; // capital first, max 12
  const numberRegex = /^[a-zA-Z0-9]{0,10}$/; // alphanumeric, max 10

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

    if (!nameRegex.test(issuedToName)) {
      setError(
        "Borrower name must start with a capital letter and be max 12 characters"
      );
      return;
    }

    if (!numberRegex.test(issuedToNumber) || issuedToNumber.length === 0) {
      setError(
        "Borrower number must be alphanumeric and max 10 characters"
      );
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

    await incrementIssued(selectedBook.ap_no, qty);

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
            key={option.ap_no}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "12px",
            }}
          >
            <span style={{ width: "25%", fontWeight: 600, whiteSpace: "nowrap" }}>
              {option.ap_no}
            </span>
            <span style={{ width: "75%", lineHeight: 1.3 }}>
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
              onChange={(e) => {
                const v = e.target.value;
                if (v === "" || nameRegex.test(v)) {
                  setIssuedToName(v);
                }
              }}
              helperText="Start with capital, max 12 letters"
            />

            <TextField
              label="Borrower Number"
              value={issuedToNumber}
              disabled={available <= 0}
              onChange={(e) => {
                const v = e.target.value;
                if (numberRegex.test(v)) {
                  setIssuedToNumber(v);
                }
              }}
              helperText="Alphanumeric, max 10 characters"
            />

            <TextField
              type="number"
              label="Quantity"
              value={qty}
              disabled={available <= 0}
              inputProps={{ min: 1, max: available }}
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
