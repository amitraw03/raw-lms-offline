import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import Login from "./components/Login";
import CreateAdmin from "./components/CreateAdmin";

import { ThemeProvider, CssBaseline } from "@mui/material";
import { getTheme } from "./theme";

import {
  isLoggedIn,
  hasAnyAdmin
} from "./services/localAuthService";

function Root() {
  const [mode, setMode] = React.useState("dark");

  return (
    <ThemeProvider theme={getTheme(mode)}>
      <CssBaseline />

      {!hasAnyAdmin() ? (
        <CreateAdmin onDone={() => window.location.reload()} />
      ) : isLoggedIn() ? (
        <App mode={mode} setMode={setMode} />
      ) : (
        <Login />
      )}
    </ThemeProvider>
  );
}

ReactDOM.createRoot(
  document.getElementById("root")
).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
