"use client";
import React from "react";
import Dashboard from "./Dashboard";
import { ColorModeProvider } from "@/app/utils/theme";


export default function Home() {
  return (
   
<ColorModeProvider>
          <Dashboard />
          </ColorModeProvider>
   
    
  );
}
