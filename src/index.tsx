import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./application";

const rootElement = document.getElementById("root")!;
const root = ReactDOM.createRoot(rootElement);
const client = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
    },
  },
});
root.render(
  <QueryClientProvider client={client}>
    <App />
  </QueryClientProvider>
);
