"use client"
import React from "react";
import { Hero } from "./components/LandingPage";
import AddGovernmentAppointeeForm from "./dashboard/AddGovernmentAppointeeForm";




export default function Home() {
  return (
    
    <main className="mx-auto container">
      <AddGovernmentAppointeeForm />
     
   <Hero />

    </main>

  );
}
