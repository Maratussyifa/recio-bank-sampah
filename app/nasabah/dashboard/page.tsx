"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { setorSampahApi, penukaranPoinApi, authApi } from "@/lib/apiClient";
import Navbar from "@/components/NavbarNasabah";
import Footer from "@/components/Footer";
import {
  Leaf,
  Coins,
  PlusCircle,
  Gift,
  Recycle,
  History,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowRight,
  TrendingUp,
  Sparkles,
  PackageCheck,
  Award,
  ChevronRight,
} from "lucide-react";

function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-[#E4EEEC] rounded-xl ${className}`} />;
}

export default function NasabahDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [totalPoin, setTotalPoin] = useState<number>(0);
  const [riwayatSetor, setRiwayatSetor] = useState<any[]>([]);
  const [riwayatPenukaran, setRiwayatPenukaran] = useState<any[]>([]);
  const [todayLabel, setTodayLabel] = useState<string>("");

  useEffect(() => {
    setTodayLabel(
      new Date().toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    );

    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Gagal parse data user dari localStorage", e);
      }
    }

    authApi
      .getMe()
      .then((res) => {
        const freshUser = res?.data || res;
        if (freshUser) {
          setUser(freshUser);
          localStorage.setItem("user", JSON.stringify(freshUser));
        }
      })
      .catch((e) => {
        console.error("Gagal memuat data user terbaru:", e);
      });

    const loadDashboardData = async () => {
      try {
        const [dataSetor, dataPenukaran] = await Promise.all([
          setorSampahApi.getMySetor().catch(() => []),
          penukaranPoinApi.getMyPenukaran().catch(() => []),
        ]);

        const safeSetor = Array.isArray(dataSetor) ? dataSetor : [];
        const safePenukaran = Array.isArray(dataPenukaran) ? dataPenukaran : [];

        setRiwayatSetor(safeSetor);
        setRiwayatPenukaran(safePenukaran);

        const poinSetor = safeSetor.reduce((acc: number, item: any) => {
          const statusUpper = (item?.status || "").toUpperCase();
          return statusUpper === "SELESAI" ? acc + (item.totalPoin || 0) : acc;
        }, 0);

        const poinTukar = safePenukaran.reduce((acc: number, item: any) => {
          const statusUpper = (item?.status || "").toUpperCase();
          if (
            statusUpper === "SELESAI" ||
            statusUpper === "PENDING" ||
            statusUpper === "MENUNGGU"
          ) {
            return acc + (item.totalPoin || item.poinDibutuhkan || 0);
          }
          return acc;
        }, 0);

        setTotalPoin(Math.max(0, poinSetor - poinTukar));
      } catch (err) {
        console.error("Gagal memuat data dashboard nasabah:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const getStatusBadge = (status: string) => {
    const statusUpper = (status || "").toUpperCase();

    switch (statusUpper) {
      case "SELESAI":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#D9F1EF] text-[#0B4F45] border border-[#B7DFDA]">
            <CheckCircle2 size={12} /> Selesai
          </span>
        );
      case "DITOLAK":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FBEAE5] text-[#B3522F] border border-[#F0CFC5]">
            <XCircle size={12} /> Ditolak
          </span>
        );
      case "PENDING":
      case "MENUNGGU":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FFF8E6] text-[#8C6B00] border border-[#FCE8B3]">
            <Clock size={12} /> Menunggu Verifikasi
          </span>
        );
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    const parsedDate = new Date(dateString);
    if (isNaN(parsedDate.getTime())) return "-";
    return parsedDate.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F8F7] font-sans">
        <Navbar user={user} />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 space-y-8">
          <SkeletonBlock className="h-[420px] sm:h-[480px] rounded-3xl" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SkeletonBlock className="h-24" />
            <SkeletonBlock className="h-24" />
            <SkeletonBlock className="h-24" />
          </div>
          <SkeletonBlock className="h-48 rounded-3xl" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SkeletonBlock className="h-64 rounded-3xl" />
            <SkeletonBlock className="h-64 rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  const totalSetorSelesai = riwayatSetor.filter(
    (i) => (i.status || "").toUpperCase() === "SELESAI"
  ).length;
  const totalPenukaranSelesai = riwayatPenukaran.filter(
    (i) => (i.status || "").toUpperCase() === "SELESAI"
  ).length;

  return (
    <div className="min-h-screen bg-[#F4F8F7] font-sans flex flex-col justify-between">
      <div>
        <Navbar user={user} />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-5 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
            <div className="flex items-center gap-1.5 text-xs font-medium text-[#6B7C7A]">
              <span>Beranda</span>
              <ChevronRight size={12} />
              <span className="text-[#0B4F45] font-semibold">Dashboard Nasabah</span>
            </div>
            <span className="text-xs text-[#6B7C7A]">{todayLabel}</span>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-2 space-y-8">
          <section className="relative overflow-hidden bg-gradient-to-br from-[#1B4D42] via-[#1F7A65] to-[#3CAF93] text-white rounded-3xl min-h-[420px] sm:min-h-[480px] p-6 sm:p-10 shadow-xl shadow-[#0B4F45]/20 grid md:grid-cols-[0.85fr_1.15fr] gap-10 items-center">
            <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
              <Image
                src="/background.png"
                alt=""
                fill
                priority
                aria-hidden="true"
                className="object-cover opacity-100"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#1B4D42]/80 via-[#1F7A65]/40 to-transparent" />
            </div>

            <div className="relative z-10 space-y-4">
              <h1 className="font-display text-2xl sm:text-4xl font-extrabold leading-tight text-white">
                Kelola Sampah Daur Ulang &{" "}
                <span className="text-[#91d7c9]">
                  Kumpulkan Poinmu
                </span>
              </h1>

              <p className="text-xs sm:text-sm text-[#F4F8F7] font-normal leading-relaxed max-w-md">
                Halo <strong className="font-semibold text-white">{user?.nasabah?.namaNasabah || user?.username || "Nasabah"}</strong>, yuk jadikan lingkungan lebih bersih dengan menyetor sampah anorganikmu secara rutin!
              </p>

              <div className="pt-2 flex flex-wrap gap-3">
                <button
                  onClick={() => router.push("/nasabah/setor")}
                  className="px-5 py-2.5 bg-white hover:bg-[#F4F8F7] text-[#0B4F45] rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
                >
                  <PlusCircle size={16} className="text-[#0A7E76]" /> Setor Sampah Sekarang
                </button>
                <button
                  onClick={() => router.push("/nasabah/tukar")}
                  className="px-5 py-2.5 bg-[#0B4F45]/40 hover:bg-[#0B4F45]/60 text-white border border-white/30 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 shadow-sm backdrop-blur-md cursor-pointer"
                >
                  <Gift size={16} className="text-[#8FE3D9]" /> Tukar Hadiah
                </button>
              </div>
            </div>

            <div className="relative z-10 flex justify-center md:justify-end">
              <div className="relative w-full max-w-lg group">
                <svg
                  className="absolute -inset-4 w-[calc(100%+2rem)] h-[calc(100%+2rem)] animate-spin-slow pointer-events-none opacity-40"
                  viewBox="0 0 100 100"
                >
                  <circle
                    cx="50"
                    cy="50"
                    r="46"
                    fill="none"
                    stroke="white"
                    strokeWidth="0.75"
                    strokeDasharray="4 4"
                  />
                </svg>

                <div
                  className="relative w-80 h-80 mx-auto overflow-hidden shadow-xl shadow-[#0B4F45]/50 transition-all duration-500 ease-out group-hover:scale-105 border-2 border-white/40 animate-float"
                  style={{ borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%" }}
                >
                  <Image
                    src="/hero.jpg"
                    alt="Recio Daur Ulang"
                    fill
                    priority
                    className="object-cover object-center transition-transform duration-700 group-hover:scale-110"
                  />
                </div>

                <div
                  className="absolute -bottom-4 -right-6 sm:-right-8 w-24 sm:w-32 animate-float z-20 pointer-events-none"
                  style={{ animationDelay: "0.9s" }}
                >
                  <Image
                    src="/karakter3.png"
                    alt="Karakter Mascot 3"
                    width={140}
                    height={140}
                    className="w-full h-auto drop-shadow-xl object-contain"
                  />
                </div>

                <div
                  className="absolute -bottom-8 -left-8 bg-white/95 backdrop-blur-md border border-[#D9F1EF] p-5 rounded-2xl shadow-xl w-64 transition-transform duration-300 hover:-translate-y-1 animate-float text-[#1F2D2B]"
                  style={{ animationDelay: "0.3s" }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#0A7E76] uppercase tracking-wider">Poin Aktif Saya</span>
                    <div className="w-9 h-9 rounded-xl bg-[#D9F1EF] text-[#0B4F45] flex items-center justify-center">
                      <Coins size={18} />
                    </div>
                  </div>
                  <div className="font-display text-3xl font-semibold text-[#0B4F45] leading-none">
                    {totalPoin.toLocaleString("id-ID")}
                    <span className="text-xs font-medium text-[#6B7C7A] ml-1.5">Poin</span>
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-[11px] font-semibold text-[#0A7E76]">
                    <TrendingUp size={12} />
                    <span>Siap ditukar hadiah</span>
                  </div>
                  <button
                    onClick={() => router.push("/nasabah/tukar")}
                    className="w-full mt-3 py-2 bg-[#0B4F45] hover:bg-[#07352E] text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    Tukarkan Sekarang <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Reveal delay={0} className="bg-white p-5 rounded-2xl border border-[#EAF0EE] shadow-sm flex items-center gap-4 relative overflow-hidden">
              <div className="w-1.5 h-10 bg-[#00B8A9] rounded-full absolute left-0" />
              <div className="w-12 h-12 rounded-2xl bg-[#D9F1EF] text-[#0B4F45] flex items-center justify-center flex-shrink-0 ml-1">
                <PackageCheck size={22} />
              </div>
              <div>
                <p className="text-xs font-medium text-[#6B7C7A]">Setoran Selesai</p>
                <h3 className="font-display text-xl font-semibold text-[#0B4F45] mt-0.5">{totalSetorSelesai} Transaksi</h3>
              </div>
            </Reveal>

            <Reveal delay={100} className="bg-white p-5 rounded-2xl border border-[#EAF0EE] shadow-sm flex items-center gap-4 relative overflow-hidden">
              <div className="w-1.5 h-10 bg-[#0A7E76] rounded-full absolute left-0" />
              <div className="w-12 h-12 rounded-2xl bg-[#EAF6F4] text-[#0A7E76] flex items-center justify-center flex-shrink-0 ml-1">
                <Award size={22} />
              </div>
              <div>
                <p className="text-xs font-medium text-[#6B7C7A]">Hadiah Ditukar</p>
                <h3 className="font-display text-xl font-semibold text-[#0B4F45] mt-0.5">{totalPenukaranSelesai} Klaim</h3>
              </div>
            </Reveal>

            <Reveal delay={200} className="bg-white p-5 rounded-2xl border border-[#EAF0EE] shadow-sm flex items-center gap-4 relative overflow-hidden">
              <div className="w-1.5 h-10 bg-[#0B4F45] rounded-full absolute left-0" />
              <div className="w-12 h-12 rounded-2xl bg-[#E4EEEC] text-[#0B4F45] flex items-center justify-center flex-shrink-0 ml-1">
                <TrendingUp size={22} />
              </div>
              <div>
                <p className="text-xs font-medium text-[#6B7C7A]">Status Keanggotaan</p>
                <h3 className="font-display text-xl font-semibold text-[#0B4F45] mt-0.5">Nasabah Aktif</h3>
              </div>
            </Reveal>
          </section>

          <Reveal delay={0} className="relative bg-white p-6 rounded-3xl border border-[#EAF0EE] shadow-sm space-y-4 mb-14 sm:mb-20 overflow-hidden">
            <div className="absolute inset-0 pointer-events-none select-none opacity-5">
              <Image
                src="/background.png"
                alt=""
                fill
                className="object-cover filter hue-rotate-[140deg]"
              />
            </div>

            <div className="pointer-events-none absolute -right-4 -bottom-14 sm:-right-8 sm:-bottom-20 w-36 sm:w-52 z-20 animate-float">
              <Image
                src="/karakter1.png"
                alt="Maskot Bank Sampah"
                width={320}
                height={320}
                className="w-full h-auto drop-shadow-2xl"
              />
            </div>

            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2">
                <div className="w-2 h-6 bg-[#00B8A9] rounded-full" />
                <div>
                  <h2 className="font-display text-lg font-semibold text-[#0B4F45]">Kategori Sampah Terpopuler</h2>
                  <p className="text-xs text-[#6B7C7A]">Estimasi perolehan poin per kg untuk setiap jenis sampah</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 relative z-10">
              {[
                { name: "Botol Plastik (PET)", points: "100 Poin / kg", icon: Recycle },
                { name: "Kertas & Karton", points: "80 Poin / kg", icon: Leaf },
                { name: "Kaleng & Aluminium", points: "150 Poin / kg", icon: Sparkles },
                { name: "Minyak Jelantah", points: "200 Poin / L", icon: TrendingUp },
              ].map((cat, idx) => (
                <Reveal
                  key={idx}
                  delay={idx * 90}
                  className="bg-[#F4F8F7]/80 backdrop-blur-sm p-4 rounded-2xl border border-[#E2ECE9] space-y-2 hover:border-[#00B8A9] hover:-translate-y-1 transition-all hover:shadow-sm"
                >
                  <div className="w-9 h-9 rounded-xl bg-white text-[#0B4F45] flex items-center justify-center shadow-sm border border-[#EAF0EE]">
                    <cat.icon size={18} />
                  </div>
                  <h4 className="text-xs font-semibold text-[#0B4F45]">{cat.name}</h4>
                  <p className="text-[11px] font-semibold text-[#00B8A9]">{cat.points}</p>
                </Reveal>
              ))}
            </div>
          </Reveal>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Reveal delay={0} className="bg-white p-6 rounded-3xl border border-[#EAF0EE] shadow-sm">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#F0F5F4]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#D9F1EF] text-[#0B4F45] flex items-center justify-center">
                    <Recycle size={16} />
                  </div>
                  <h3 className="font-display font-semibold text-[#0B4F45]">Riwayat Setor Sampah</h3>
                </div>
                <button
                  onClick={() => router.push("/nasabah/setor")}
                  className="text-xs font-semibold text-[#0A7E76] hover:text-[#07352E] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  Buat Setoran <ArrowRight size={12} />
                </button>
              </div>

              {riwayatSetor.length === 0 ? (
                <div className="text-center py-10">
                  <History size={28} className="mx-auto text-[#B7C2C0] mb-2" />
                  <p className="text-xs text-[#6B7C7A] mb-3">Belum ada riwayat setor sampah.</p>
                  <button
                    onClick={() => router.push("/nasabah/setor")}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-[#0B4F45] hover:bg-[#07352E] px-4 py-2 rounded-xl transition-colors"
                  >
                    <PlusCircle size={14} /> Ajukan Setoran Pertama
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#EAF0EE] text-[#6B7C7A]">
                        <th className="py-2.5 px-2 font-medium">Tanggal</th>
                        <th className="py-2.5 px-2 font-medium">Status</th>
                        <th className="py-2.5 px-2 font-medium text-right">Poin</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F4F8F7]">
                      {riwayatSetor.slice(0, 5).map((item: any, idx: number) => (
                        <tr key={item.id || idx} className="hover:bg-[#F9FBFB]">
                          <td className="py-3 px-2 text-[#3E5250]">
                            {formatDate(item.tanggal || item.createdAt)}
                          </td>
                          <td className="py-3 px-2">{getStatusBadge(item.status)}</td>
                          <td className="py-3 px-2 text-right font-semibold text-[#0B4F45]">
                            +{item.totalPoin || 0}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Reveal>

            <Reveal delay={150} className="bg-white p-6 rounded-3xl border border-[#EAF0EE] shadow-sm">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#F0F5F4]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#D9F1EF] text-[#0B4F45] flex items-center justify-center">
                    <Gift size={16} />
                  </div>
                  <h3 className="font-display font-semibold text-[#0B4F45]">Riwayat Penukaran Hadiah</h3>
                </div>
                <button
                  onClick={() => router.push("/nasabah/tukar")}
                  className="text-xs font-semibold text-[#0A7E76] hover:text-[#07352E] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  Tukar Poin <ArrowRight size={12} />
                </button>
              </div>

              {riwayatPenukaran.length === 0 ? (
                <div className="text-center py-10">
                  <Gift size={28} className="mx-auto text-[#B7C2C0] mb-2" />
                  <p className="text-xs text-[#6B7C7A] mb-3">Belum ada riwayat penukaran hadiah.</p>
                  <button
                    onClick={() => router.push("/nasabah/tukar")}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-[#0B4F45] hover:bg-[#07352E] px-4 py-2 rounded-xl transition-colors"
                  >
                    <Gift size={14} /> Lihat Katalog Hadiah
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#EAF0EE] text-[#6B7C7A]">
                        <th className="py-2.5 px-2 font-medium">Tanggal</th>
                        <th className="py-2.5 px-2 font-medium">Hadiah</th>
                        <th className="py-2.5 px-2 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F4F8F7]">
                      {riwayatPenukaran.slice(0, 5).map((item: any, idx: number) => (
                        <tr key={item.id || idx} className="hover:bg-[#F9FBFB]">
                          <td className="py-3 px-2 text-[#3E5250]">
                            {formatDate(item.createdAt)}
                          </td>
                          <td className="py-3 px-2 font-semibold text-[#0B4F45]">
                            {item.hadiah?.namaHadiah || "-"}
                          </td>
                          <td className="py-3 px-2">{getStatusBadge(item.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Reveal>
          </div>
        </div>
      </div>

      <Footer />

      <style jsx global>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
        }
        @keyframes spinSlow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-float {
          animation: float 3.4s ease-in-out infinite;
        }
        .animate-spin-slow {
          animation: spinSlow 20s linear infinite;
        }
      `}</style>
    </div>
  );
}