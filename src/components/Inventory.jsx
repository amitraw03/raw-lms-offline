import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper
} from "@mui/material";

import {
  uploadInventoryExcel,
  getInventory,
  exportInventoryExcel
} from "../services/inventoryService";

function Inventory() {
  const [rows, setRows] = useState([]);

  const load = async () => {
    const data = await getInventory();
    setRows(data);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Inventory
      </Typography>

      <Button component="label" variant="contained">
        Upload Inventory Excel
        <input
          hidden
          type="file"
          accept=".xlsx"
          onChange={async e => {
            if (e.target.files?.length) {
              await uploadInventoryExcel(e.target.files[0]);
              load();
            }
          }}
        />
      </Button>

      <Button sx={{ ml: 2 }} onClick={exportInventoryExcel}>
        Export Inventory
      </Button>

      {/* ✅ SCROLL CONTAINER */}
      <Paper
        sx={{
          mt: 2,
          height: "60vh",
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
              <TableCell>Held</TableCell>
              <TableCell>Issued</TableCell>
              <TableCell>Available</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.map(r => (
              <TableRow key={r.ap_no}>
                <TableCell>{r.ap_no}</TableCell>
                <TableCell>{r.ap_name}</TableCell>
                <TableCell>{r.qty_held}</TableCell>
                <TableCell>{r.qty_issued}</TableCell>
                <TableCell>{r.qty_held - r.qty_issued}</TableCell>
              </TableRow>
            ))}

            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No inventory data
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}

export default Inventory;
