"use client";

import Link from "next/link";
import Image from "next/image";
import { Leaf, ShieldCheck, Mail, MapPin, UserCheck, Layers, Gift, FileText, Users } from "lucide-react";

export default function AdminFooter() {
  return (
    <footer className="bg-white border-t border-[#EAF0EE] mt-16 text-[#6B7C7A] text-xs relative print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 md:grid-cols-4 gap-8 relative">
        <div className="pointer-events-none absolute -top-8 left-4 sm:left-6 animate-float-slow w-14 sm:w-16 z-10">
          <Image
            src="/bumi.png"
            alt="Maskot Bumi"
            width={120}
            height={120}
            className="w-full h-auto drop-shadow-md"
          />
        </div>

        <div className="space-y-3 md:col-span-1 pt-6 sm:pt-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#0B4F45] flex items-center justify-center text-white">
              <Leaf size={14} />
            </div>
            <span className="font-display font-semibold text-lg text-[#0B4F45]">Recio</span>
            <span className="text-[10px] font-bold text-[#0B4F45] bg-[#E6F7F5] border border-[#B7DFDA] px-2 py-0.5 rounded-md uppercase tracking-wider">
              Admin Panel
            </span>
          </div>
          <p className="text-[11px] leading-relaxed text-[#3E5250]">
            Pusat kontrol pengelolaan data bank sampah, verifikasi transaksi setor, manajemen hadiah, dan rekapitulasi laporan.
          </p>
        </div>

        <div className="pt-0 md:pt-4">
          <h4 className="font-semibold text-[#0B4F45] mb-3 text-xs uppercase tracking-wider">Menu Kelola</h4>
          <ul className="space-y-2 text-[11px]">
            <li>
              <Link href="/admin/dashboard" className="hover:text-[#00B8A9] transition-colors flex items-center gap-1.5">
                <span>Dashboard Admin</span>
              </Link>
            </li>
            <li>
              <Link href="/admin/verifikasi" className="hover:text-[#00B8A9] transition-colors flex items-center gap-1.5">
                <UserCheck size={12} className="text-[#00B8A9]" />
                <span>Verifikasi Setoran</span>
              </Link>
            </li>
            <li>
              <Link href="/admin/nasabah" className="hover:text-[#00B8A9] transition-colors flex items-center gap-1.5">
                <Users size={12} className="text-[#00B8A9]" />
                <span>Kelola Nasabah</span>
              </Link>
            </li>
            <li>
              <Link href="/admin/kategori" className="hover:text-[#00B8A9] transition-colors flex items-center gap-1.5">
                <Layers size={12} className="text-[#00B8A9]" />
                <span>Kategori Sampah</span>
              </Link>
            </li>
            <li>
              <Link href="/admin/hadiah" className="hover:text-[#00B8A9] transition-colors flex items-center gap-1.5">
                <Gift size={12} className="text-[#00B8A9]" />
                <span>Katalog Hadiah</span>
              </Link>
            </li>
            <li>
              <Link href="/admin/rekapitulasi" className="hover:text-[#00B8A9] transition-colors flex items-center gap-1.5">
                <FileText size={12} className="text-[#00B8A9]" />
                <span>Rekapitulasi Laporan</span>
              </Link>
            </li>
          </ul>
        </div>

        <div className="pt-0 md:pt-4">
          <h4 className="font-semibold text-[#0B4F45] mb-3 text-xs uppercase tracking-wider">Bantuan Sistem</h4>
          <ul className="space-y-2 text-[11px]">
            <li className="flex items-center gap-1.5">
              <ShieldCheck size={13} className="text-[#00B8A9]" />
              <span>Standard Operational Procedure</span>
            </li>
            <li className="flex items-center gap-1.5">
              <Mail size={13} className="text-[#00B8A9]" />
              <span>admin-support@recio.id</span>
            </li>
            <li className="flex items-center gap-1.5">
              <MapPin size={13} className="text-[#00B8A9]" />
              <span>Indonesia</span>
            </li>
          </ul>
        </div>

        <div className="bg-[#F4F8F7] p-4 rounded-2xl border border-[#DCE7E5] flex flex-col justify-between">
          <div>
            <span className="inline-block text-[10px] font-bold text-[#0B4F45] bg-[#D9F1EF] px-2 py-0.5 rounded-md mb-1">
              SYSTEM CONTROL
            </span>
            <p className="text-[11px] font-medium text-[#3E5250] mt-1">
              Pastikan verifikasi data timbangan dan mutasi poin nasabah terekam dengan teliti.
            </p>
          </div>
          <p className="text-[10px] text-[#0A7E76] font-semibold mt-3">
            #RecioAdminControl
          </p>
        </div>
      </div>

      <div className="border-t border-[#F0F5F4] py-4 bg-[#F4F8F7]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px]">
          <p>© {new Date().getFullYear()} Recio Eco-System Admin. Hak Cipta Dilindungi.</p>
          <p className="flex items-center gap-1">
            Mar&apos;atussyifa ussakinah RPL SMK TELKOM MALANG 2026
          </p>  
        </div>
      </div>

      <style jsx global>{`
        @keyframes float-slow {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-5px);
          }
        }
        .animate-float-slow {
          animation: float-slow 3.5s ease-in-out infinite;
        }
      `}</style>
    </footer>
  );
}