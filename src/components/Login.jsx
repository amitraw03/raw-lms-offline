import { useState } from "react";
import {
  Paper,
  TextField,
  Button,
  Typography,
  Stack
} from "@mui/material";

import { login } from "../services/localAuthService";
import CreateAdmin from "./CreateAdmin";
import ForgotPassword from "./ForgotPassword";

function Login() {
  const [number, setNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [view, setView] = useState("LOGIN"); // LOGIN | CREATE | FORGOT

  if (view === "CREATE") {
    return <CreateAdmin onDone={() => setView("LOGIN")} />;
  }

  if (view === "FORGOT") {
    return <ForgotPassword onDone={() => setView("LOGIN")} />;
  }

  const handleLogin = async () => {
    try {
      await login(number, password);
      window.location.reload();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <Paper sx={{ maxWidth: 420, mx: "auto", mt: 8, p: 3 }}>
      <Typography
        variant="h6"
        align="center"
        sx={{ mb: 2 }}
      >
        Admin Login
      </Typography>

      <Stack spacing={2}>
        <TextField
          label="Admin Number"
          value={number}
          onChange={e => setNumber(e.target.value)}
        />

        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        {error && (
          <Typography color="error">
            {error}
          </Typography>
        )}

        <Button variant="contained" onClick={handleLogin}>
          Login
        </Button>

        {/* ---- EXTRA OPTIONS ---- */}
        <Button
          variant="text"
          size="small"
          onClick={() => setView("CREATE")}
        >
          Don’t have an admin account? Create one
        </Button>

        <Button
          variant="text"
          size="small"
          onClick={() => setView("FORGOT")}
        >
          Forgot password?
        </Button>
      </Stack>
    </Paper>
  );
}

export default Login;
