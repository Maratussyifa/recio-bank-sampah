"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Leaf, LogOut, User, Menu, X, Home, PlusCircle, Gift, History } from "lucide-react";
import { authApi } from "@/lib/apiClient";

interface NavbarProps {
  user?: any;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://learn.smktelkom-mlg.sch.id/bank_sampah/api/v1";
const FILE_BASE_URL = API_BASE_URL.replace(/\/api\/v1\/?$/, "");

function buildFotoUrl(path?: string | null): string | null {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${FILE_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export default function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "Dashboard", href: "/nasabah/dashboard", icon: Home },
    { name: "Setor Sampah", href: "/nasabah/setor", icon: PlusCircle },
    { name: "Tukar Hadiah", href: "/nasabah/tukar", icon: Gift },
    { name: "Riwayat", href: "/nasabah/riwayat", icon: History },
  ];

  const fotoUrl = buildFotoUrl(
    user?.nasabah?.fotoUrl || user?.nasabah?.foto || user?.fotoUrl || user?.foto
  );

  return (
    <nav className="bg-white/90 backdrop-blur-md border-b border-[#EAF0EE] sticky top-0 z-50 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/nasabah/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-[#0B4F45] flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
            <Leaf size={18} />
          </div>
          <span className="font-display font-semibold text-xl text-[#0B4F45] tracking-tight">Recio</span>
        </Link>

        <div className="hidden md:flex items-center gap-1 bg-[#F4F8F7] p-1 rounded-full border border-[#DCE7E5]">
          {navLinks.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== "/nasabah/dashboard" && pathname.startsWith(link.href));
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-[#0B4F45] text-white shadow-xs"
                    : "text-[#6B7C7A] hover:text-[#0B4F45] hover:bg-white/60"
                }`}
              >
                <Icon size={14} />
                {link.name}
              </Link>
            );
          })}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/nasabah/profile"
            className="flex items-center gap-2.5 bg-[#F4F8F7] border border-[#DCE7E5] hover:border-[#00B8A9] pl-1.5 pr-3.5 py-1 rounded-full shadow-xs transition-all cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-full bg-[#D9F1EF] text-[#0B4F45] border border-[#B7DFDA] flex items-center justify-center text-xs font-bold relative overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform">
              {fotoUrl ? (
                <Image
                  src={fotoUrl}
                  alt={user?.username || "Foto Profil"}
                  fill
                  className="object-cover"
                />
              ) : (
                <User size={15} className="text-[#0B4F45]" />
              )}
            </div>
            <span className="text-xs font-semibold text-[#3E5250] group-hover:text-[#0B4F45]">
              {user?.nasabah?.namaNasabah || user?.username || user?.nama || "Nasabah"}
            </span>
          </Link>

          <button
            onClick={() => authApi.logout()}
            className="p-2 text-[#6B7C7A] hover:text-[#B3522F] hover:bg-[#FBEAE5] rounded-full transition-colors cursor-pointer"
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-[#0B4F45] hover:bg-[#F4F8F7] rounded-xl transition-colors cursor-pointer"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-[#EAF0EE] px-4 pt-2 pb-4 space-y-3">
          <Link
            href="/nasabah/profile"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 p-2 bg-[#F4F8F7] hover:bg-[#EAF0EE] rounded-2xl border border-[#DCE7E5] transition-colors cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-[#D9F1EF] text-[#0B4F45] border border-[#B7DFDA] flex items-center justify-center relative overflow-hidden flex-shrink-0">
              {fotoUrl ? (
                <Image
                  src={fotoUrl}
                  alt={user?.username || "Foto Profil"}
                  fill
                  className="object-cover"
                />
              ) : (
                <User size={18} className="text-[#0B4F45]" />
              )}
            </div>
            <div>
              <p className="text-xs font-bold text-[#0B4F45]">
                {user?.nasabah?.namaNasabah || user?.username || user?.nama || "Nasabah"}
              </p>
              <p className="text-[10px] text-[#00B8A9] font-medium">Lihat Detail Profil &rarr;</p>
            </div>
          </Link>

          <div className="space-y-1">
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== "/nasabah/dashboard" && pathname.startsWith(link.href));
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-[#0B4F45] text-white"
                      : "text-[#3E5250] hover:bg-[#F4F8F7]"
                  }`}
                >
                  <Icon size={16} />
                  {link.name}
                </Link>
              );
            })}
          </div>

          <button
            onClick={() => authApi.logout()}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 bg-[#FBEAE5] text-[#B3522F] rounded-xl text-xs font-semibold transition-colors mt-2 cursor-pointer"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      )}
    </nav>
  );
}