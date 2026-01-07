import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography
} from "@mui/material";

import { returnBook } from "../services/offlineIssueService";
import { decrementIssued } from "../services/inventoryService";

function ReturnBookDialog({ open, onClose, issue }) {
  if (!issue) return null;

  const handleConfirm = async () => {
    await returnBook(issue.id);
    await decrementIssued(issue.ap_no, issue.qty_issued);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Confirm Return</DialogTitle>

      <DialogContent>
        <Typography>AP No: {issue.ap_no}</Typography>
        <Typography>Book: {issue.ap_name}</Typography>
        <Typography>Borrower: {issue.issued_to_name}</Typography>
        <Typography>Qty: {issue.qty_issued}</Typography>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button color="success" variant="contained" onClick={handleConfirm}>
          Return Book
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ReturnBookDialog;
