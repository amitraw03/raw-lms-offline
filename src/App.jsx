import { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Stack,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box
} from "@mui/material";

import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";

import { seedInventoryIfEmpty } from "./services/inventorySeeder";
import { logout } from "./services/localAuthService";

import Dashboard from "./components/Dashboard";
import BorrowHistory from "./components/BorrowHistory";
import Inventory from "./components/Inventory";
import BookActions from "./components/BookActions";

function App({ mode, setMode }) {
  const [view, setView] = useState("DASHBOARD");
  const [confirmLogout, setConfirmLogout] = useState(false);

  useEffect(() => {
    seedInventoryIfEmpty();
  }, []);

  const handleLogout = () => {
    logout();
    window.location.reload();
  };

  return (
    <Container
      maxWidth="lg"
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden" // 🔒 VERY IMPORTANT
      }}
    >
      {/* ===== HEADER (STICKY) ===== */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          py: 2,
          position: "sticky",
          top: 0,
          zIndex: 10,
          backgroundColor: "background.default"
        }}
      >
        <Typography
          sx={{
            fontSize: "1.6rem",
            fontWeight: 700,
            letterSpacing: "0.15em",
            color: "primary.main",
            userSelect: "none"
          }}
        >
          RAW-LMS
        </Typography>

        <Stack direction="row" spacing={1} alignItems="center">
          <Button
            variant={view === "DASHBOARD" ? "contained" : "text"}
            onClick={() => setView("DASHBOARD")}
          >
            Issue
          </Button>

          <Button
            variant={view === "INVENTORY" ? "contained" : "text"}
            onClick={() => setView("INVENTORY")}
          >
            Inventory
          </Button>

          <Button
            variant={view === "HISTORY" ? "contained" : "text"}
            onClick={() => setView("HISTORY")}
          >
            History
          </Button>

          <IconButton onClick={() => setMode(mode === "dark" ? "light" : "dark")}>
            {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>

          <Button size="small" color="error" onClick={() => setConfirmLogout(true)}>
            Logout
          </Button>
        </Stack>
      </Stack>

      {/* ===== MAIN CONTENT (FIXED HEIGHT) ===== */}
      <Box
        sx={{
          flex: 1,
          overflow: "hidden", // 🔒 prevents page scroll
          display: "flex",
          flexDirection: "column"
        }}
      >
        {view === "DASHBOARD" && (
          <>
            <BookActions />
            <Dashboard />
          </>
        )}

        {view === "INVENTORY" && <Inventory />}
        {view === "HISTORY" && <BorrowHistory />}
      </Box>

      {/* ===== LOGOUT CONFIRM ===== */}
      <Dialog open={confirmLogout} onClose={() => setConfirmLogout(false)}>
        <DialogTitle>Confirm Logout</DialogTitle>
        <DialogContent>Are you sure you want to logout?</DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmLogout(false)}>Cancel</Button>
          <Button color="error" onClick={handleLogout}>
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default App;
