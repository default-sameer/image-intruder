"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

interface GlobalProviderProps {
  children: React.ReactNode;
}

const GlobalProvider = ({ children }: GlobalProviderProps) => {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

export default GlobalProvider;
