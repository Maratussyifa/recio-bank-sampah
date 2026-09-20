"use client";

import { useEffect, useState } from "react";
import NavbarAdmin from "@/components/NavbarAdmin";
import Footer from "@/components/FooterAdmin";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Gagal parse data user", e);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#F4F8F7] font-sans flex flex-col justify-between">
      <div>
        <NavbarAdmin user={user} />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-12">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
}