import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { Toaster } from "react-hot-toast";
import App from "./App";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 5 * 60 * 1000 } },
});

const muiTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#ff4d3a", dark: "#c42515", light: "#ff7a6a" },
    secondary: { main: "#3b82f6" },
    background: { default: "#ffffff", paper: "#ffffff" },
    text: { primary: "#1f2937", secondary: "#6b7280" },
  },
  typography: {
    fontFamily: '"Outfit", sans-serif',
    h1: { fontFamily: '"Sora", sans-serif', fontWeight: 700 },
    h2: { fontFamily: '"Sora", sans-serif', fontWeight: 700 },
    h3: { fontFamily: '"Sora", sans-serif', fontWeight: 600 },
    button: {
      fontFamily: '"Sora", sans-serif',
      fontWeight: 600,
      textTransform: "none",
    },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            background: "#ffffff",
            "& fieldset": { borderColor: "rgba(15,23,42,0.14)" },
            "&:hover fieldset": { borderColor: "rgba(15,23,42,0.24)" },
            "&.Mui-focused fieldset": { borderColor: "rgba(255,77,58,0.5)" },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          background: "#ffffff",
          border: "1px solid rgba(15,23,42,0.1)",
        },
      },
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={muiTheme}>
          <CssBaseline />
          <div className="noise-overlay">
            <App />
          </div>
          <Toaster
            position="top-right"
            gutter={8}
            toastOptions={{
              duration: 3500,
              style: {
                background: "#ffffff",
                color: "#1f2937",
                border: "1px solid rgba(15,23,42,0.1)",
                borderRadius: "14px",
                fontFamily: '"Outfit", sans-serif',
                fontSize: "14px",
                padding: "12px 16px",
              },
              success: { iconTheme: { primary: "#10b981", secondary: "#fff" } },
              error: { iconTheme: { primary: "#ff4d3a", secondary: "#fff" } },
            }}
          />
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
