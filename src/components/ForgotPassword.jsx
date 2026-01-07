import { useState } from "react";
import {
  Paper,
  TextField,
  Button,
  Typography,
  Stack
} from "@mui/material";

import { resetAdminPassword } from "../services/localAuthService";

function ForgotPassword({ onDone }) {
  const [number, setNumber] = useState("");
  const [password, setPassword] = useState("");
  const [masterKey, setMasterKey] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleReset = async () => {
    if (!number || !password || !masterKey) {
      setError("All fields are required");
      return;
    }

    try {
      await resetAdminPassword(number, password, masterKey);
      setSuccess("Password reset successfully");
      setTimeout(onDone, 1200);
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
        Reset Admin Password
      </Typography>

      <Stack spacing={2}>
        <TextField
          label="Admin Number"
          value={number}
          onChange={e => setNumber(e.target.value)}
        />

        <TextField
          label="New Password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        <TextField
          label="Master Key"
          type="password"
          value={masterKey}
          onChange={e => setMasterKey(e.target.value)}
        />

        {error && <Typography color="error">{error}</Typography>}
        {success && <Typography color="success.main">{success}</Typography>}

        <Button variant="contained" onClick={handleReset}>
          Reset Password
        </Button>

        <Button variant="text" size="small" onClick={onDone}>
          Back to Login
        </Button>
      </Stack>
    </Paper>
  );
}

export default ForgotPassword;
