import { useState } from "react";
import {
  Paper,
  TextField,
  Button,
  Typography,
  Stack
} from "@mui/material";

import { setupInitialAdmin, verifyMasterKey } from "../services/localAuthService";

function CreateAdmin({ onDone }) {
  const [form, setForm] = useState({
    name: "",
    number: "",
    password: "",
    masterKey: ""
  });
  const [error, setError] = useState("");

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreate = async () => {
    if (!form.name || !form.number || !form.password) {
      setError("All fields are required");
      return;
    }

    if (!verifyMasterKey(form.masterKey)) {
      setError("Invalid master key");
      return;
    }

    try {
      await setupInitialAdmin(
        form.name,
        form.number,
        form.password
      );
      onDone(); // return to login
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
        Create Admin Profile
      </Typography>

      <Stack spacing={2}>
        <TextField
          label="Admin Name"
          name="name"
          onChange={handleChange}
        />

        <TextField
          label="Admin Number"
          name="number"
          onChange={handleChange}
        />

        <TextField
          label="Password"
          type="password"
          name="password"
          onChange={handleChange}
        />

        <TextField
          label="Master Key"
          type="password"
          name="masterKey"
          onChange={handleChange}
        />

        {error && (
          <Typography color="error">
            {error}
          </Typography>
        )}

        <Button
          variant="contained"
          onClick={handleCreate}
        >
          Create Admin
        </Button>

        {/* ---- BACK TO LOGIN ---- */}
        <Button
          variant="text"
          size="small"
          onClick={onDone}
        >
          Already have an admin account? Go to Login
        </Button>
      </Stack>
    </Paper>
  );
}

export default CreateAdmin;
