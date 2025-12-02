import React from "react";
import ReactDOM from "react-dom/client";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// Ändring 1: Byt BrowserRouter till HashRouter
import { HashRouter } from "react-router-dom";
import App from "./App";
import { theme } from "./theme";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "./i18n";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <MantineProvider theme={theme} forceColorScheme="light">
        {/* Ändring 2: Byt <BrowserRouter> till <HashRouter> */}
        <HashRouter>
          <App />
          <Notifications />
        </HashRouter>
      </MantineProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
