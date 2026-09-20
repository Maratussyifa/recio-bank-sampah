"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  kategoriSampahApi,
  hadiahApi,
  setorSampahApi,
  penukaranPoinApi,
} from "@/lib/apiClient";
import {
  Boxes,
  Gift,
  Clock,
  FolderCog,
  ShieldCheck,
  ArrowRight,
  FileSpreadsheet,
  Recycle,
  Activity,
  ArrowUpRight,
  Users,
  ChevronRight,
  CheckCircle2,
  XCircle,
  SlidersHorizontal,
  Sparkles,
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

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [todayLabel, setTodayLabel] = useState<string>("");

  const [totalKategori, setTotalKategori] = useState(0);
  const [totalHadiah, setTotalHadiah] = useState(0);
  const [pendingSetor, setPendingSetor] = useState(0);
  const [pendingPenukaran, setPendingPenukaran] = useState(0);

  const [recentSetor, setRecentSetor] = useState<any[]>([]);
  const [recentPenukaran, setRecentPenukaran] = useState<any[]>([]);

  const extractArray = <T,>(res: unknown): T[] => {
    if (!res || typeof res !== "object") return [];
    const obj = res as Record<string, unknown>;
    if (Array.isArray(obj)) return obj as T[];
    if (Array.isArray(obj.data)) return obj.data as T[];
    if (
      obj.data &&
      typeof obj.data === "object" &&
      Array.isArray((obj.data as Record<string, unknown>).data)
    ) {
      return (obj.data as Record<string, unknown>).data as T[];
    }
    if (Array.isArray(obj.penukaran)) return obj.penukaran as T[];
    if (Array.isArray(obj.setorSampah)) return obj.setorSampah as T[];
    if (Array.isArray(obj.result)) return obj.result as T[];
    return [];
  };

  const isPendingStatus = (statusRaw?: string) => {
    const s = String(statusRaw || "").toLowerCase().trim();
    return (
      s === "pending" ||
      s === "menunggu" ||
      s === "menunggu_konfirmasi" ||
      s === "pengajuan"
    );
  };

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
        console.error("Gagal parse data user", e);
      }
    }

    const loadStats = async () => {
      try {
        const [kategori, hadiah, setor, penukaran] = await Promise.all([
          kategoriSampahApi.getAll().catch(() => []),
          hadiahApi.getAll().catch(() => []),
          setorSampahApi.getAllAdmin().catch(() => []),
          penukaranPoinApi.getAllAdmin().catch(() => []),
        ]);

        const listKategori = extractArray(kategori);
        const listHadiah = extractArray(hadiah);
        const listSetor = extractArray(setor);
        const listPenukaran = extractArray(penukaran);

        setTotalKategori(listKategori.length);
        setTotalHadiah(listHadiah.length);

        setPendingSetor(listSetor.filter((item: any) => isPendingStatus(item.status)).length);
        setPendingPenukaran(listPenukaran.filter((item: any) => isPendingStatus(item.status)).length);

        setRecentSetor(listSetor);
        setRecentPenukaran(listPenukaran);
      } catch (err) {
        console.error("Gagal memuat statistik admin:", err);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const getStatusBadge = (status: string) => {
    const s = (status || "").toLowerCase().trim();
    if (s === "selesai" || s === "diverifikasi" || s === "approved") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#D9F1EF] text-[#0B4F45] border border-[#B7DFDA]">
          <CheckCircle2 size={12} /> {s === "diverifikasi" ? "Diverifikasi" : "Selesai"}
        </span>
      );
    }
    if (s === "ditolak" || s === "rejected" || s === "batal") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FBEAE5] text-[#B3522F] border border-[#F0CFC5]">
          <XCircle size={12} /> Ditolak
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FFF8E6] text-[#8C6B00] border border-[#FCE8B3]">
        <Clock size={12} /> Pending
      </span>
    );
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 space-y-6 w-full">
        <SkeletonBlock className="h-[380px] rounded-3xl" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <SkeletonBlock className="lg:col-span-8 h-96 rounded-3xl" />
          <SkeletonBlock className="lg:col-span-4 h-96 rounded-3xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5 text-xs font-medium text-[#6B7C7A]">
            <span>Beranda</span>
            <ChevronRight size={12} />
            <span className="text-[#0B4F45] font-semibold">Dashboard Admin</span>
          </div>
          <span className="text-xs text-[#6B7C7A]">{todayLabel}</span>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-2 pb-12 space-y-8 w-full">
        <section className="relative overflow-hidden bg-gradient-to-br from-[#1B4D42] via-[#1F7A65] to-[#3CAF93] text-white rounded-3xl min-h-[380px] p-6 sm:p-10 shadow-xl shadow-[#0B4F45]/20 grid lg:grid-cols-[1.1fr_0.9fr] gap-8 items-center">
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

          <div className="absolute -right-12 -top-12 w-72 h-72 bg-[#00B8A9]/20 rounded-full blur-3xl pointer-events-none" />

          <svg
            className="absolute -left-16 -top-16 opacity-25 pointer-events-none"
            width="280"
            height="280"
            viewBox="0 0 280 280"
            fill="none"
          >
            <circle cx="140" cy="140" r="138" stroke="white" strokeOpacity="0.5" />
            <circle cx="140" cy="140" r="104" stroke="white" strokeOpacity="0.3" />
          </svg>

          <div className="relative z-10 space-y-5">
            <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#8FE3D9]">
              <ShieldCheck size={14} />
              Admin Console
            </div>

            <div className="space-y-1.5">
              <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-tight text-white drop-shadow-md">
                Konsol Operasional <br />
                <span className="text-[#91d7c9] drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]">
                  Bank Sampah Digital
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-white font-medium leading-relaxed max-w-lg drop-shadow-sm">
                Selamat bertugas, <strong className="text-white font-extrabold underline decoration-[#00B8A9] decoration-2">{user?.username || user?.nama || "Administrator"}</strong>. Pantau metrik sistem, verifikasi timbangan real-time, dan kelola inventaris transaksi secara efisien.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={() => router.push("/admin/verifikasi")}
                className="px-5 py-2.5 bg-white hover:bg-[#F4F8F7] text-[#0B4F45] rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
              >
                <ShieldCheck size={16} className="text-[#0A7E76]" /> Verifikasi Timbangan
              </button>
              <button
                onClick={() => router.push("/admin/rekapitulasi")}
                className="px-5 py-2.5 bg-[#0B4F45]/40 hover:bg-[#0B4F45]/60 text-white border border-white/30 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 shadow-sm backdrop-blur-md cursor-pointer"
              >
                <FileSpreadsheet size={16} className="text-[#8FE3D9]" /> Rekap Laporan
              </button>
            </div>
          </div>

          <div className="relative z-10 hidden sm:block">
            <div className="p-6 bg-white/95 backdrop-blur-md border border-[#D9F1EF] rounded-3xl shadow-xl space-y-5 text-[#1F2D2B]">
              <div className="flex items-center justify-between pb-3.5 border-b border-[#EAF0EE]">
                <div className="flex items-center gap-2.5">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00B8A9] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00B8A9]"></span>
                  </span>
                  <span className="text-xs font-bold text-[#0A7E76] tracking-wide uppercase">
                    Status Antrean Real-Time
                  </span>
                </div>
                <Activity size={18} className="text-[#0A7E76]" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-[#1F2D2B] flex items-center gap-2">
                    <Clock size={14} className="text-[#0A7E76]" /> Pending Verifikasi Timbang
                  </span>
                  <span className="font-semibold text-[#0B4F45] bg-[#D9F1EF] px-2.5 py-0.5 rounded-lg">
                    {pendingSetor} Transaksi
                  </span>
                </div>
                <div className="w-full bg-[#EAF0EE] h-2.5 rounded-full overflow-hidden p-0.5">
                  <div
                    className="bg-gradient-to-r from-[#0B4F45] to-[#00B8A9] h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(pendingSetor * 25, 100)}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-[#1F2D2B] flex items-center gap-2">
                    <Gift size={14} className="text-[#0A7E76]" /> Pending Approval Klaim
                  </span>
                  <span className="font-semibold text-[#0B4F45] bg-[#D9F1EF] px-2.5 py-0.5 rounded-lg">
                    {pendingPenukaran} Klaim
                  </span>
                </div>
                <div className="w-full bg-[#EAF0EE] h-2.5 rounded-full overflow-hidden p-0.5">
                  <div
                    className="bg-gradient-to-r from-[#0B4F45] to-[#00B8A9] h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(pendingPenukaran * 25, 100)}%` }}
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs bg-[#F4F8F7] px-3.5 py-2.5 rounded-2xl border border-[#EAF0EE]">
                <span className="font-medium text-[#1F2D2B]">Beban Kerja Antrean:</span>
                <span
                  className={`font-semibold px-2.5 py-0.5 rounded-lg text-[11px] ${
                    pendingSetor + pendingPenukaran > 0
                      ? "bg-[#FFF8E6] text-[#8C6B00]"
                      : "bg-[#D9F1EF] text-[#0B4F45]"
                  }`}
                >
                  {pendingSetor + pendingPenukaran > 0 ? "Membutuhkan Tindakan" : "Normal / Optimal"}
                </span>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Reveal delay={0} className="bg-white p-5 rounded-2xl border-l-4 border-l-[#00B8A9] border-t border-r border-b border-[#EAF0EE] shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#6B7C7A] uppercase">Kategori</span>
                  <div className="w-8 h-8 rounded-lg bg-[#D9F1EF] text-[#0B4F45] flex items-center justify-center group-hover:bg-[#00B8A9] group-hover:text-white transition-colors">
                    <Boxes size={16} />
                  </div>
                </div>
                <div className="mt-3">
                  <h3 className="font-display text-2xl font-bold text-[#0B4F45]">{totalKategori}</h3>
                  <p className="text-[10px] text-[#6B7C7A] font-medium mt-0.5">Jenis Sampah</p>
                </div>
              </Reveal>

              <Reveal delay={60} className="bg-white p-5 rounded-2xl border-l-4 border-l-[#0A7E76] border-t border-r border-b border-[#EAF0EE] shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#6B7C7A] uppercase">Hadiah</span>
                  <div className="w-8 h-8 rounded-lg bg-[#EAF6F4] text-[#0A7E76] flex items-center justify-center group-hover:bg-[#0A7E76] group-hover:text-white transition-colors">
                    <Gift size={16} />
                  </div>
                </div>
                <div className="mt-3">
                  <h3 className="font-display text-2xl font-bold text-[#0B4F45]">{totalHadiah}</h3>
                  <p className="text-[10px] text-[#6B7C7A] font-medium mt-0.5">Item Katalog</p>
                </div>
              </Reveal>

              <Reveal delay={120} className="bg-white p-5 rounded-2xl border-l-4 border-l-[#D97706] border-t border-r border-b border-[#FCE8B3] shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#D97706] uppercase">Setor Pending</span>
                  <div className="w-8 h-8 rounded-lg bg-[#FEF3C7] text-[#D97706] flex items-center justify-center group-hover:bg-[#D97706] group-hover:text-white transition-colors">
                    <Clock size={16} />
                  </div>
                </div>
                <div className="mt-3">
                  <h3 className="font-display text-2xl font-bold text-[#8C6B00]">{pendingSetor}</h3>
                  <p className="text-[10px] text-[#8C6B00] font-medium mt-0.5">Butuh Timbang</p>
                </div>
              </Reveal>

              <Reveal delay={180} className="bg-white p-5 rounded-2xl border-l-4 border-l-[#6366F1] border-t border-r border-b border-[#E0E7FF] shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#4F46E5] uppercase">Tukar Pending</span>
                  <div className="w-8 h-8 rounded-lg bg-[#EEF2FF] text-[#6366F1] flex items-center justify-center group-hover:bg-[#6366F1] group-hover:text-white transition-colors">
                    <Activity size={16} />
                  </div>
                </div>
                <div className="mt-3">
                  <h3 className="font-display text-2xl font-bold text-[#4338CA]">{pendingPenukaran}</h3>
                  <p className="text-[10px] text-[#4338CA] font-medium mt-0.5">Butuh Approval</p>
                </div>
              </Reveal>
            </div>

            <Reveal delay={100} className="relative bg-white p-6 rounded-3xl border border-[#EAF0EE] shadow-xs space-y-4 overflow-hidden">
              <div className="absolute inset-0 pointer-events-none select-none opacity-5">
                <Image
                  src="/background.png"
                  alt=""
                  fill
                  className="object-cover filter hue-rotate-[140deg]"
                />
              </div>

              <div className="relative z-10 flex items-center justify-between border-b border-[#F0F5F4] pb-3">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={16} className="text-[#00B8A9]" />
                  <h2 className="font-display text-sm font-semibold text-[#0B4F45]">Navigasi Master Data & Modul</h2>
                </div>
                <span className="text-[11px] font-semibold text-[#0A7E76] bg-[#D9F1EF] px-2.5 py-0.5 rounded-full border border-[#B7DFDA]">5 Modul Sistem</span>
              </div>

              <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { label: "Master Kategori", desc: "Jenis & harga/kg", icon: FolderCog, path: "/admin/kategori" },
                  { label: "Katalog Hadiah", desc: "Stok & Poin", icon: Gift, path: "/admin/hadiah" },
                  { label: "Data Nasabah", desc: "Kelola akun pengguna", icon: Users, path: "/admin/nasabah" },
                  { label: "Verifikasi Transaksi", desc: "Timbangan real & approval", icon: ShieldCheck, path: "/admin/verifikasi" },
                  { label: "Rekap Laporan", desc: "Laporan & rekapitulasi", icon: FileSpreadsheet, path: "/admin/rekapitulasi" },
                ].map((m, idx) => (
                  <button
                    key={idx}
                    onClick={() => router.push(m.path)}
                    className="p-3.5 text-left border border-[#EAF0EE] rounded-xl bg-[#F4F8F7]/80 backdrop-blur-sm hover:bg-white hover:border-[#00B8A9] hover:shadow-md transition-all flex items-center gap-3 group cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-lg bg-[#D9F1EF] text-[#0B4F45] flex items-center justify-center group-hover:bg-[#0B4F45] group-hover:text-white transition-colors flex-shrink-0">
                      <m.icon size={16} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-[#0B4F45] text-xs truncate group-hover:text-[#00B8A9] transition-colors">{m.label}</h3>
                      <p className="text-[10px] text-[#6B7C7A] truncate">{m.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </Reveal>

            <Reveal delay={150} className="bg-white p-6 rounded-3xl border border-[#EAF0EE] shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#F0F5F4]">
                <div className="flex items-center gap-2">
                  <Recycle size={16} className="text-[#0B4F45]" />
                  <h3 className="font-display font-semibold text-[#0B4F45] text-sm">Pengajuan Setor Sampah Terbaru</h3>
                </div>
                <button
                  onClick={() => router.push("/admin/verifikasi")}
                  className="text-xs font-semibold text-[#0A7E76] hover:text-[#07352E] flex items-center gap-1 cursor-pointer"
                >
                  Buka Antrean <ArrowUpRight size={13} />
                </button>
              </div>

              {recentSetor.length === 0 ? (
                <p className="text-center py-6 text-xs text-[#6B7C7A]">Belum ada aktivitas setoran.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#EAF0EE] text-[#6B7C7A]">
                        <th className="py-2 px-2 font-medium">Nasabah</th>
                        <th className="py-2 px-2 font-medium">Tanggal</th>
                        <th className="py-2 px-2 font-medium">Status</th>
                        <th className="py-2 px-2 font-medium text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F4F8F7]">
                      {recentSetor.slice(0, 4).map((item: any, idx: number) => {
                        const namaNasabah =
                          item.nasabah?.user?.username ||
                          item.nasabah?.nama ||
                          item.user?.username ||
                          item.user?.nama ||
                          "Nasabah";

                        return (
                          <tr key={item.id || idx} className="hover:bg-[#F9FBFB]">
                            <td className="py-2.5 px-2 font-semibold text-[#1F2D2B]">
                              {namaNasabah}
                            </td>
                            <td className="py-2.5 px-2 text-[#6B7C7A]">
                              {new Date(item.tanggal || item.createdAt).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                              })}
                            </td>
                            <td className="py-2.5 px-2">{getStatusBadge(item.status)}</td>
                            <td className="py-2.5 px-2 text-right">
                              <button
                                onClick={() => router.push("/admin/verifikasi")}
                                className="text-xs font-semibold text-[#0A7E76] hover:underline cursor-pointer"
                              >
                                Verifikasi
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </Reveal>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <Reveal delay={50} className="bg-gradient-to-br from-[#D9F1EF] via-[#EAF6F4] to-[#F4F8F7] p-6 rounded-3xl border border-[#B7DFDA] shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#B7DFDA] pb-3">
                <span className="text-[11px] font-bold text-[#0B4F45] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles size={13} className="text-[#00B8A9]" /> Timbang Fisik
                </span>
                <div className="w-8 h-8 rounded-xl bg-white text-[#0B4F45] flex items-center justify-center shadow-xs">
                  <Activity size={18} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-3xl font-extrabold text-[#0B4F45]">{pendingSetor} Pengajuan</div>
                <p className="text-xs text-[#6B7C7A] font-medium leading-relaxed">
                  Nasabah menunggu penimbangan fisik sampah di lokasi bank sampah.
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => router.push("/admin/verifikasi")}
                  className="w-full py-2.5 bg-[#00B8A9] hover:bg-[#00A395] text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer transform hover:-translate-y-0.5"
                >
                  <ShieldCheck size={15} /> Mulai Verifikasi <ArrowRight size={13} />
                </button>
              </div>
            </Reveal>

            <Reveal delay={150} className="bg-white p-6 rounded-3xl border border-[#EAF0EE] shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#F0F5F4]">
                <div className="flex items-center gap-2">
                  <Gift size={16} className="text-[#0B4F45]" />
                  <h3 className="font-display font-semibold text-[#0B4F45] text-sm">Klaim Hadiah</h3>
                </div>
                <span className="text-[11px] font-bold text-[#00B8A9] bg-[#D9F1EF] px-2 py-0.5 rounded-md border border-[#B7DFDA]">{pendingPenukaran} Pending</span>
              </div>

              {recentPenukaran.length === 0 ? (
                <p className="text-center py-6 text-xs text-[#6B7C7A]">Belum ada klaim hadiah.</p>
              ) : (
                <div className="space-y-3">
                  {recentPenukaran.slice(0, 4).map((item: any, idx: number) => {
                    const namaNasabah =
                      item.nasabah?.user?.username ||
                      item.nasabah?.nama ||
                      item.nasabah?.namaNasabah ||
                      item.user?.username ||
                      item.user?.nama ||
                      "Nasabah";

                    return (
                      <div key={item.id || idx} className="p-3 bg-[#F4F8F7] rounded-xl border border-[#EAF0EE] flex items-center justify-between text-xs">
                        <div className="min-w-0 pr-2">
                          <p className="font-semibold text-[#0B4F45] truncate">
                            {namaNasabah}
                          </p>
                          <p className="text-[10px] text-[#6B7C7A] truncate">
                            {item.hadiah?.namaHadiah || item.hadiah?.nama || item.namaHadiah || "Hadiah"}
                          </p>
                        </div>
                        {getStatusBadge(item.status)}
                      </div>
                    );
                  })}
                </div>
              )}
            </Reveal>
          </div>
        </div>
      </main>

      <style jsx global>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
        }
        .animate-float {
          animation: float 3.4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}