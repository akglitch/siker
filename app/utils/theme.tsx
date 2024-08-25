"use client";
import React, { useEffect, ReactNode } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";

export const ColorModeContext = React.createContext({
  toggleColorMode: () => {},
});

export const useThemeHook = () => {
  const isDark = false;
  const userPref = isDark || typeof isDark === "undefined" ? "dark" : "light";
  const [mode, setMode] = React.useState<"light" | "dark">(userPref);
  const colorMode = React.useMemo(
    () => ({
      toggleColorMode: () => {
        const chMode = mode === "light" ? "dark" : "light";
        localStorage.setItem("mode", chMode);
        setMode(chMode);
      },
    }),
    [mode]
  );

  useEffect(() => {
    const lhmode = localStorage.getItem("mode");
    const w = window.matchMedia("(prefers-color-scheme: dark)");
    if (!lhmode && w.matches) setMode("dark");
    else setMode(lhmode === "dark" ? "dark" : "light");
  }, []);

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === "light"
            ? {
                // palette values for light mode
                primary: {
                  main: "#00aaff", // Soft Blue
                },
                secondary: {
                  main: "#ff6f61", // Coral
                },
                text: {
                  primary: "#2f4f4f", // Dark Slate Gray
                  secondary: "#696969", // Dim Gray
                },
              }
            : {
                // palette values for dark mode
                primary: {
                  main: "#008080", // Teal
                },
                secondary: {
                  main: "#8bc34a", // Light Green
                },
                background: {
                  default: "#121212", // Very Dark Gray
                  paper: "#1c1c1c", // Charcoal Gray
                },
                text: {
                  primary: "#e0e0e0", // Light Gray
                  secondary: "#c0c0c0", // Silver
                },
              }),
        },
        typography: {
          fontFamily: "Raleway",
        },
      }),
    [mode]
  );
  return {
    colorMode,
    theme,
  };
};

interface ColorModeProviderProps {
  children: ReactNode;
}

export const ColorModeProvider: React.FC<ColorModeProviderProps> = ({ children }) => {
  const { colorMode, theme } = useThemeHook();

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ColorModeContext.Provider>
  );
};
