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
  CircularProgress
} from "@mui/material";

import { getCurrentAdmin } from "../services/localAuthService";
import { getBookByApNo, incrementIssued } from "../services/inventoryService";
import { issueBook } from "../services/offlineIssueService";

function BookActions() {
  const admin = getCurrentAdmin();

  const [apNo, setApNo] = useState("");
  const [book, setBook] = useState(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [qty, setQty] = useState(1);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const available = book ? book.qty_held - book.qty_issued : 0;

  useEffect(() => {
    if (!apNo) {
      setBook(null);
      return;
    }

    getBookByApNo(apNo).then(b => {
      if (!b) return setError("Book not found");
      if (b.qty_held - b.qty_issued <= 0)
        return setError("No stock available");

      setBook(b);
      setQty(1);
      setError("");
    });
  }, [apNo]);

  /* ---------- VALIDATORS ---------- */
  const handleName = v => {
    if (!/^[A-Z][a-zA-Z ]*$/.test(v) && v !== "") return;
    if (v.length > 12) return;
    setName(v);
  };

  const handlePhone = v => {
    if (!/^\d*$/.test(v)) return;
    if (v.length > 10) return;
    setPhone(v);
  };

  const handleQty = v => {
    let n = Number(v);
    if (isNaN(n)) return;
    if (n < 1) n = 1;
    if (n > available) n = available;
    setQty(n);
  };

  const handleIssue = async () => {
    if (!name || name[0] !== name[0]?.toUpperCase()) {
      setError("Name must start with capital letter");
      return;
    }
    if (phone.length !== 10) {
      setError("Phone must be exactly 10 digits");
      return;
    }

    setLoading(true);

    await issueBook({
      ap_no: book.ap_no,
      ap_name: book.ap_name,
      qty_issued: qty,
      issued_to_name: name,
      issued_to_number: phone,
      issued_by_name: admin.name,
      issued_by_number: admin.number
    });

    await incrementIssued(book.ap_no, qty);

    setLoading(false);
    setSuccess(true);

    setTimeout(() => {
      setApNo("");
      setBook(null);
      setName("");
      setPhone("");
      setQty(1);
    }, 300);
  };

  return (
    <Box sx={{ mb: 1 }}>
      <Typography variant="h6">Issue Book</Typography>

      <TextField
        label="AP No"
        fullWidth
        sx={{ my: 2 }}
        value={apNo}
        onChange={e => setApNo(e.target.value)}
      />

      {book && (
        <>
          <Divider sx={{ mb: 2 }} />

          <Typography>
            {book.ap_name} (Available: {available})
          </Typography>

          <Stack spacing={2} sx={{ my: 2 }}>
            <TextField
              label="Borrower Name"
              value={name}
              onChange={e => handleName(e.target.value)}
              helperText="Start with capital, max 12 chars"
            />

            <TextField
              label="Borrower Phone"
              value={phone}
              onChange={e => handlePhone(e.target.value)}
              helperText="Exactly 10 digits"
            />

            <TextField
              type="number"
              label="Qty"
              value={qty}
              inputProps={{ min: 1, max: available }}
              onChange={e => handleQty(e.target.value)}
            />
          </Stack>

          <Button
            variant="contained"
            color="success"
            disabled={loading}
            onClick={handleIssue}
            startIcon={loading && <CircularProgress size={18} />}
          >
            Confirm Issue
          </Button>
        </>
      )}

      {error && <Alert severity="warning" sx={{ mt: 2 }}>{error}</Alert>}

      <Snackbar
        open={success}
        autoHideDuration={1500}
        message="Book issued successfully"
        onClose={() => setSuccess(false)}
      />
    </Box>
  );
}

export default BookActions;
