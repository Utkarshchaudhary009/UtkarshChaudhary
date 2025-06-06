"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

// Define the NextThemesProvider props
type ThemeProviderProps = {
  children: React.ReactNode;
} & React.ComponentProps<typeof NextThemesProvider>;

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
