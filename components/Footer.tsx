import Link from "next/link";
import Image from "next/image";
import { Leaf, ShieldCheck, Mail, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-[#EAF0EE] mt-16 text-[#6B7C7A] text-xs relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 md:grid-cols-4 gap-8 relative">
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
          </div>
          <p className="text-[11px] leading-relaxed text-[#3E5250]">
            Sistem pengolahan dan penyetoran sampah terpadu untuk menciptakan lingkungan yang lebih bersih dan berkelanjutan.
          </p>
        </div>

        <div className="pt-0 md:pt-4">
          <h4 className="font-semibold text-[#0B4F45] mb-3 text-xs uppercase tracking-wider">Navigasi</h4>
          <ul className="space-y-2 text-[11px]">
            <li>
              <Link href="/nasabah/dashboard" className="hover:text-[#00B8A9] transition-colors">
                Dashboard
              </Link>
            </li>
            <li>
              <Link href="/nasabah/setor" className="hover:text-[#00B8A9] transition-colors">
                Setor Sampah
              </Link>
            </li>
            <li>
              <Link href="/nasabah/tukar" className="hover:text-[#00B8A9] transition-colors">
                Tukar Hadiah
              </Link>
            </li>
            <li>
              <Link href="/nasabah/riwayat" className="hover:text-[#00B8A9] transition-colors">
                Riwayat Setor
              </Link>
            </li>
          </ul>
        </div>

        <div className="pt-0 md:pt-4">
          <h4 className="font-semibold text-[#0B4F45] mb-3 text-xs uppercase tracking-wider">Bantuan</h4>
          <ul className="space-y-2 text-[11px]">
            <li className="flex items-center gap-1.5">
              <ShieldCheck size={13} className="text-[#00B8A9]" />
              <span>Panduan Memilah Sampah</span>
            </li>
            <li className="flex items-center gap-1.5">
              <Mail size={13} className="text-[#00B8A9]" />
              <span>support@recio.id</span>
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
              ECO ACTION
            </span>
            <p className="text-[11px] font-medium text-[#3E5250] mt-1">
              Mari bersama-sama wujudkan Indonesia Zero Waste.
            </p>
          </div>
          <p className="text-[10px] text-[#0A7E76] font-semibold mt-3">
            #RecioGreenMovement
          </p>
        </div>
      </div>

      <div className="border-t border-[#F0F5F4] py-4 bg-[#F4F8F7]/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px]">
          <p>© {new Date().getFullYear()} Recio Eco-System. Hak Cipta Dilindungi.</p>
          <p className="flex items-center gap-1">
            Mar'atussyifa ussakinah RPL SMK TELKOM MALANG 2026
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