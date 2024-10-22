"use client";
import React from "react";
import Dashboard from "./Dashboard";
import { ColorModeProvider } from "@/app/utils/theme";
import ProtectedRoute from "../ProtectedRoute";
const [currentUser, setCurrentUser] = React.useState('');



export default function Home() {
  return (
<ProtectedRoute>
<ColorModeProvider>
    <Dashboard username={currentUser} />
</ColorModeProvider>
</ProtectedRoute>    
  );
}
