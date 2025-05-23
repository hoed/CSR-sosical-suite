import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { ThemeProvider } from "next-themes";
import { MockAuthProvider } from "./lib/mock-auth-provider";

import { Toaster } from "@/components/ui/toaster";

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light">
      <MockAuthProvider>
        <App />
        <Toaster />
      </MockAuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);
