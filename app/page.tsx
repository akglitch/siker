"use client"
import React from "react";
import { Hero } from "./components/LandingPage";
import AddAssemblyMemberForm from "./dashboard/AddAssemblyMemberForm";


export default function Home() {
  return (
    
    <main className="mx-auto container">
      <AddAssemblyMemberForm />
   <Hero />

    </main>

  );
}
