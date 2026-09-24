"use client";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { setorSampahApi, penukaranPoinApi } from "@/lib/apiClient";
import {
  FileSpreadsheet,
  Gift,
  Search,
  Printer,
  Scale,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  AlertCircle,
  ChevronRight,
  FileText,
  CalendarDays,
  TrendingUp,
} from "lucide-react";

interface ItemSetor {
  id: string;
  beratKg: number;
  beratRealKg?: number;
  namaKategori?: string;
  kategoriSampah?: {
    namaKategori?: string;
  };
}

interface SetorItem {
  id: string;
  tanggal?: string;
  createdAt?: string;
  status: string;
  catatan?: string;
  nasabah?: {
    nama?: string;
    namaNasabah?: string;
    user?: { username?: string };
  };
  user?: { username?: string };
  items?: ItemSetor[];
  detailSetors?: ItemSetor[];
  detailSetor?: ItemSetor[];
}

interface PenukaranItem {
  id: string;
  tanggal?: string;
  createdAt?: string;
  status: string;
  jumlah?: number;
  qty?: number;
  poinDigunakan?: number;
  poinTerpakai?: number;
  totalPoin?: number;
  nasabah?: {
    nama?: string;
    namaNasabah?: string;
    user?: { username?: string };
  };
  user?: { username?: string };
  hadiah?: {
    namaHadiah?: string;
    nama?: string;
    poinDibutuhkan?: number;
  };
}

const BULAN_OPTIONS = [
  { value: "01", label: "Januari" },
  { value: "02", label: "Februari" },
  { value: "03", label: "Maret" },
  { value: "04", label: "April" },
  { value: "05", label: "Mei" },
  { value: "06", label: "Juni" },
  { value: "07", label: "Juli" },
  { value: "08", label: "Agustus" },
  { value: "09", label: "September" },
  { value: "10", label: "Oktober" },
  { value: "11", label: "November" },
  { value: "12", label: "Desember" },
];

const BULAN_SHORT = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];

const getJumlahPenukaran = (item: PenukaranItem): number => {
  const raw = item as unknown as Record<string, unknown>;
  return (
    item.jumlah ??
    item.qty ??
    (typeof raw.jumlahItem === "number" ? raw.jumlahItem : undefined) ??
    1
  );
};

const getTotalPoinPenukaran = (item: PenukaranItem): number => {
  const jumlah = getJumlahPenukaran(item);
  return (
    item.totalPoin ??
    item.poinDigunakan ??
    item.poinTerpakai ??
    (item.hadiah?.poinDibutuhkan ? item.hadiah.poinDibutuhkan * jumlah : undefined) ??
    0
  );
};

const getNasabahNama = (item: unknown): string => {
  const raw = (item || {}) as Record<string, unknown>;
  const nasabah = (raw.nasabah || {}) as Record<string, unknown>;
  const nasabahUser = (nasabah.user || {}) as Record<string, unknown>;
  const topUser = (raw.user || {}) as Record<string, unknown>;

  return (
    (nasabah.namaNasabah as string) ||
    (nasabah.nama as string) ||
    (nasabahUser.username as string) ||
    (topUser.username as string) ||
    (raw.namaNasabah as string) ||
    (raw.username as string) ||
    "Nasabah"
  );
};

const matchBulanTahun = (
  dateStr: string | undefined,
  bulanFilter: string,
  tahunFilter: string
): boolean => {
  if (bulanFilter === "SEMUA") return true;
  if (!dateStr) return false;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return false;
  const bulan = String(d.getMonth() + 1).padStart(2, "0");
  const tahun = String(d.getFullYear());
  return bulan === bulanFilter && tahun === tahunFilter;
};

export default function AdminRekapitulasiPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"setor" | "penukaran">("setor");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("semua");
  const [bulanFilter, setBulanFilter] = useState<string>("SEMUA");
  const [tahunFilter, setTahunFilter] = useState<string>(String(new Date().getFullYear()));

  const [listSetor, setListSetor] = useState<SetorItem[]>([]);
  const [listPenukaran, setListPenukaran] = useState<PenukaranItem[]>([]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return isNaN(date.getTime())
      ? "-"
      : date.toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
  };

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

  const getSetorItems = (item: SetorItem): ItemSetor[] => {
    return item.items || item.detailSetors || item.detailSetor || [];
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [resSetor, resPenukaran] = await Promise.all([
        setorSampahApi.getAllAdmin(),
        penukaranPoinApi.getAllAdmin(),
      ]);

      setListSetor(extractArray<SetorItem>(resSetor));
      setListPenukaran(extractArray<PenukaranItem>(resPenukaran));
    } catch (err: unknown) {
      console.error("Gagal memuat rekapitulasi data:", err);
      setError(
        "Gagal memuat data dari server. Silakan periksa koneksi Anda dan coba lagi."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const tahunOptions = useMemo(() => {
    const years = new Set<number>();
    years.add(new Date().getFullYear());
    [...listSetor, ...listPenukaran].forEach((item) => {
      const d = new Date(item.tanggal || item.createdAt || "");
      if (!isNaN(d.getTime())) years.add(d.getFullYear());
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [listSetor, listPenukaran]);

  const filteredSetor = useMemo(() => {
    return listSetor.filter((item) => {
      const nama = getNasabahNama(item).toLowerCase();
      const matchSearch =
        nama.includes(searchQuery.toLowerCase()) ||
        (item.catatan || "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus =
        statusFilter === "semua" ||
        item.status?.toLowerCase() === statusFilter.toLowerCase();
      const matchBulan = matchBulanTahun(item.tanggal || item.createdAt, bulanFilter, tahunFilter);
      return matchSearch && matchStatus && matchBulan;
    });
  }, [listSetor, searchQuery, statusFilter, bulanFilter, tahunFilter]);

  const filteredPenukaran = useMemo(() => {
    return listPenukaran.filter((item) => {
      const nama = getNasabahNama(item).toLowerCase();
      const hadiah = (
        item.hadiah?.namaHadiah ||
        item.hadiah?.nama ||
        ""
      ).toLowerCase();
      const matchSearch =
        nama.includes(searchQuery.toLowerCase()) ||
        hadiah.includes(searchQuery.toLowerCase());
      const matchStatus =
        statusFilter === "semua" ||
        item.status?.toLowerCase() === statusFilter.toLowerCase();
      const matchBulan = matchBulanTahun(item.createdAt || item.tanggal, bulanFilter, tahunFilter);
      return matchSearch && matchStatus && matchBulan;
    });
  }, [listPenukaran, searchQuery, statusFilter, bulanFilter, tahunFilter]);

  // Data Pertumbuhan Bulanan untuk Grafik
  const monthlyData = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, i) => ({
      bulanIndex: i,
      label: BULAN_SHORT[i],
      valSetorKg: 0,
      valPenukaranQty: 0,
      countSetor: 0,
      countPenukaran: 0,
    }));

    listSetor.forEach((item) => {
      if (item.status?.toLowerCase() !== "selesai") return;
      const d = new Date(item.tanggal || item.createdAt || "");
      if (isNaN(d.getTime())) return;
      if (String(d.getFullYear()) === tahunFilter) {
        const m = d.getMonth();
        const items = getSetorItems(item);
        const berat = items.reduce((a, b) => a + (b.beratRealKg ?? b.beratKg ?? 0), 0);
        months[m].valSetorKg += berat;
        months[m].countSetor += 1;
      }
    });

    listPenukaran.forEach((item) => {
      if (item.status?.toLowerCase() !== "selesai") return;
      const d = new Date(item.tanggal || item.createdAt || "");
      if (isNaN(d.getTime())) return;
      if (String(d.getFullYear()) === tahunFilter) {
        const m = d.getMonth();
        months[m].valPenukaranQty += getJumlahPenukaran(item);
        months[m].countPenukaran += 1;
      }
    });

    const maxKg = Math.max(...months.map((m) => m.valSetorKg), 1);
    const maxQty = Math.max(...months.map((m) => m.valPenukaranQty), 1);

    return { months, maxKg, maxQty };
  }, [listSetor, listPenukaran, tahunFilter]);

  const stats = useMemo(() => {
    const setorSelesai = filteredSetor.filter(
      (s) => s.status?.toLowerCase() === "selesai"
    );
    const penukaranSelesai = filteredPenukaran.filter(
      (p) => p.status?.toLowerCase() === "selesai"
    );

    const totalBeratKg = setorSelesai.reduce((acc, curr) => {
      const items = getSetorItems(curr);
      const totalItem = items.reduce(
        (a, b) => a + (b.beratRealKg ?? b.beratKg ?? 0),
        0
      );
      return acc + totalItem;
    }, 0);

    const totalPenukaranItem = penukaranSelesai.reduce(
      (acc, curr) => acc + getJumlahPenukaran(curr),
      0
    );

    return {
      totalTransaksiSetor: filteredSetor.length,
      setorSelesaiCount: setorSelesai.length,
      totalBeratKg,
      totalTransaksiPenukaran: filteredPenukaran.length,
      penukaranSelesaiCount: penukaranSelesai.length,
      totalPenukaranItem,
    };
  }, [filteredSetor, filteredPenukaran]);

  const handlePrint = () => {
    window.print();
  };

  const labelBulanTerpilih =
    bulanFilter === "SEMUA"
      ? `Semua Bulan (${tahunFilter})`
      : `${BULAN_OPTIONS.find((b) => b.value === bulanFilter)?.label} ${tahunFilter}`;

  if (loading) {
    return (
      <div className="py-20 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3 text-[#065F56]">
          <Loader2 size={32} className="animate-spin text-[#00BBA7]" />
          <span className="font-semibold text-sm">Memuat rekapitulasi data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 print:m-0 print:p-0">
      <style jsx global>{`
        @media print {
          header, nav, sidebar, aside, footer {
            display: none !important;
          }

          @page {
            size: A4 portrait;
            margin: 10mm 14mm;
          }

          body {
            background: #ffffff !important;
            color: #000000 !important;
            font-size: 10.5px !important;
            line-height: 1.35 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .print-area {
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          table {
            width: 100% !important;
            border-collapse: collapse !important;
            margin-top: 6px !important;
            page-break-inside: avoid;
          }

          th, td {
            border: 1px solid #000000 !important;
            padding: 5px 7px !important;
            color: #000000 !important;
          }

          th {
            background-color: #eef2f1 !important;
            font-weight: 700 !important;
            text-transform: uppercase;
            font-size: 9px !important;
            letter-spacing: 0.02em;
          }

          .no-print-break {
            page-break-inside: avoid;
          }
        }
      `}</style>

      {/* Header Breadcrumb */}
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-1.5 text-xs font-medium text-[#6B7C7A]">
          <Link
            href="/admin/dashboard"
            className="hover:text-[#065F56] transition-colors"
          >
            Beranda
          </Link>
          <ChevronRight size={12} />
          <span className="text-[#065F56] font-semibold">Rekapitulasi Laporan</span>
        </div>
        <div className="text-xs text-[#6B7C7A] font-medium">
          {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-2xl flex items-center justify-between shadow-xs print:hidden">
          <div className="flex items-center gap-2.5">
            <AlertCircle size={18} className="shrink-0 text-rose-600" />
            <span className="font-medium">{error}</span>
          </div>
          <button
            onClick={loadData}
            className="px-3.5 py-1.5 bg-white hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer border border-rose-200"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* Action Banner */}
      <div className="bg-white rounded-2xl p-6 border border-[#EAF0EE] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#E6F7F5] text-[#065F56] rounded-xl flex items-center justify-center shrink-0">
            <FileText size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#065F56] tracking-tight">
              Rekapitulasi Transaksi
            </h1>
            <p className="text-xs text-[#6B7C7A] mt-0.5">
              Pantau statistik keseluruhan aktivitas setor sampah dan penukaran poin secara akurat.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          <button
            onClick={loadData}
            className="p-2.5 bg-[#F4F8F7] hover:bg-[#EAF0EE] text-[#065F56] rounded-xl transition-all border border-[#DCE7E5] cursor-pointer"
            title="Muat Ulang Data"
          >
            <RefreshCw size={16} />
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 bg-[#065F56] hover:bg-[#0A4D46] text-white rounded-xl text-xs font-semibold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <Printer size={15} /> Cetak Nota Laporan
          </button>
        </div>
      </div>

      {/* Filter Control */}
      <div className="bg-white rounded-2xl p-4 border border-[#EAF0EE] shadow-xs flex flex-col sm:flex-row sm:items-center gap-3 print:hidden">
        <div className="flex items-center gap-2 text-xs font-bold text-[#065F56] shrink-0">
          <CalendarDays size={16} />
          Filter Periode
        </div>

        <div className="flex flex-wrap items-center gap-2 flex-1">
          <select
            value={bulanFilter}
            onChange={(e) => setBulanFilter(e.target.value)}
            className="px-3.5 py-2 bg-[#F4F8F7] border border-[#DCE7E5] rounded-xl text-xs font-semibold text-[#1F2D2B] focus:outline-none focus:ring-2 focus:ring-[#00BBA7]/30 transition-all cursor-pointer"
          >
            <option value="SEMUA">Semua Bulan</option>
            {BULAN_OPTIONS.map((b) => (
              <option key={b.value} value={b.value}>
                {b.label}
              </option>
            ))}
          </select>

          <select
            value={tahunFilter}
            onChange={(e) => setTahunFilter(e.target.value)}
            className="px-3.5 py-2 bg-[#F4F8F7] border border-[#DCE7E5] rounded-xl text-xs font-semibold text-[#1F2D2B] focus:outline-none focus:ring-2 focus:ring-[#00BBA7]/30 transition-all cursor-pointer"
          >
            {tahunOptions.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          {bulanFilter !== "SEMUA" && (
            <button
              onClick={() => setBulanFilter("SEMUA")}
              className="text-[11px] font-semibold text-[#B3522F] hover:underline cursor-pointer"
            >
              Reset Filter
            </button>
          )}
        </div>

        <span className="text-[11px] font-semibold text-[#065F56] bg-[#E6F7F5] px-3 py-1.5 rounded-lg border border-[#B7DFDA] whitespace-nowrap">
          Menampilkan: {labelBulanTerpilih}
        </span>
      </div>

      {/* Header Nota Saat Dicetak */}
      <div className="hidden print:block mb-3 print-area">
        <div className="flex items-end justify-between border-b-[3px] border-[#0B4F45] pb-2.5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-[#0B4F45] flex items-center justify-center text-white font-black text-base leading-none">
              R
            </div>
            <div>
              <h1 className="text-[15px] font-black uppercase tracking-wide text-black leading-tight">
                Recio &mdash; Bank Sampah Digital
              </h1>
              <p className="text-[9px] text-gray-600 mt-0.5">
                Nota Rekapitulasi Transaksi &middot; Kategori:{" "}
                <span className="font-bold uppercase">
                  {activeTab === "setor" ? "Setor Sampah Nasabah" : "Penukaran Hadiah"}
                </span>
                {" "}&middot; Periode: <span className="font-bold uppercase">{labelBulanTerpilih}</span>
              </p>
            </div>
          </div>
          <div className="text-right text-[9.5px] text-gray-700 leading-snug">
            <p>
              Tanggal Cetak:{" "}
              <span className="font-bold text-black">
                {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
              </span>
            </p>
            <p>
              Filter Status: <span className="font-bold text-black capitalize">{statusFilter}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Widget KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 print:hidden">
        <div className="bg-white p-5 rounded-2xl border border-[#EAF0EE] shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-[#6B7C7A] uppercase tracking-wider">
              Total Setor Sampah
            </p>
            <h3 className="font-display text-2xl font-bold text-[#065F56] mt-1">
              {stats.totalTransaksiSetor}
            </h3>
            <p className="text-[11px] text-[#00BBA7] font-semibold mt-0.5">
              {stats.setorSelesaiCount} Selesai Disetujui
            </p>
          </div>
          <div className="w-10 h-10 bg-[#E6F7F5] text-[#065F56] rounded-xl flex items-center justify-center shrink-0">
            <ArrowUpRight size={18} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#EAF0EE] shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-[#6B7C7A] uppercase tracking-wider">
              Total Sampah Terkumpul
            </p>
            <h3 className="font-display text-2xl font-bold text-[#065F56] mt-1">
              {stats.totalBeratKg.toFixed(1)}{" "}
              <span className="text-xs font-normal text-[#6B7C7A]">Kg</span>
            </h3>
            <p className="text-[11px] text-[#6B7C7A] font-medium mt-0.5">
              Berat Riil Timbangan
            </p>
          </div>
          <div className="w-10 h-10 bg-[#E6F7F5] text-[#065F56] rounded-xl flex items-center justify-center shrink-0">
            <Scale size={18} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#EAF0EE] shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-[#6B7C7A] uppercase tracking-wider">
              Total Penukaran
            </p>
            <h3 className="font-display text-2xl font-bold text-[#065F56] mt-1">
              {stats.totalTransaksiPenukaran}
            </h3>
            <p className="text-[11px] text-[#00BBA7] font-semibold mt-0.5">
              {stats.penukaranSelesaiCount} Klaim Disetujui
            </p>
          </div>
          <div className="w-10 h-10 bg-[#E6F7F5] text-[#065F56] rounded-xl flex items-center justify-center shrink-0">
            <ArrowDownRight size={18} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#EAF0EE] shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-[#6B7C7A] uppercase tracking-wider">
              Item Hadiah Keluar
            </p>
            <h3 className="font-display text-2xl font-bold text-[#065F56] mt-1">
              {stats.totalPenukaranItem}{" "}
              <span className="text-xs font-normal text-[#6B7C7A]">pcs</span>
            </h3>
            <p className="text-[11px] text-[#6B7C7A] font-medium mt-0.5">
              Total Penukaran Barang
            </p>
          </div>
          <div className="w-10 h-10 bg-[#E6F7F5] text-[#065F56] rounded-xl flex items-center justify-center shrink-0">
            <Gift size={18} />
          </div>
        </div>
      </div>

      {/* Summary Box pada Nota Cetak */}
      <div className="hidden print:grid grid-cols-4 gap-3 mb-3 py-2.5 px-3 bg-[#F4F8F7] border border-[#0B4F45]/25 rounded no-print-break">
        <div>
          <span className="text-gray-600 block text-[9px] uppercase tracking-wide">Total Transaksi Setor</span>
          <span className="font-bold text-[11px]">{stats.totalTransaksiSetor} Transaksi ({stats.setorSelesaiCount} Selesai)</span>
        </div>
        <div>
          <span className="text-gray-600 block text-[9px] uppercase tracking-wide">Total Berat Sampah</span>
          <span className="font-bold text-[11px]">{stats.totalBeratKg.toFixed(1)} Kg</span>
        </div>
        <div>
          <span className="text-gray-600 block text-[9px] uppercase tracking-wide">Total Transaksi Penukaran</span>
          <span className="font-bold text-[11px]">{stats.totalTransaksiPenukaran} Transaksi</span>
        </div>
        <div>
          <span className="text-gray-600 block text-[9px] uppercase tracking-wide">Total Hadiah Terdistribusi</span>
          <span className="font-bold text-[11px]">{stats.totalPenukaranItem} Pcs</span>
        </div>
      </div>

      {/* BAGIAN GRAFIK PERTUMBUHAN PER BULAN (Tampil di Layar & Nota Cetak) */}
      <div className="bg-white rounded-2xl p-5 border border-[#EAF0EE] shadow-xs print:border print:border-black print:p-3 print:my-3 no-print-break">
        <div className="flex items-center justify-between mb-3 border-b border-[#F0F5F4] print:border-black pb-2">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-[#065F56] print:text-black" />
            <h2 className="text-sm font-bold text-[#065F56] print:text-black uppercase tracking-wider">
              Grafik Pertumbuhan Perbulan Tahun {tahunFilter}
            </h2>
          </div>
          <span className="text-[10px] font-semibold text-[#6B7C7A] print:text-black">
            Metrik: {activeTab === "setor" ? "Berat Sampah (Kg)" : "Jumlah Hadiah (Pcs)"}
          </span>
        </div>

        {/* Visualisasi Bar Chart SVG */}
        <div className="w-full h-32 pt-4 pb-1">
          <div className="h-full flex items-end justify-between gap-1 sm:gap-2">
            {monthlyData.months.map((m) => {
              const val = activeTab === "setor" ? m.valSetorKg : m.valPenukaranQty;
              const maxVal = activeTab === "setor" ? monthlyData.maxKg : monthlyData.maxQty;
              const heightPercent = Math.max((val / maxVal) * 100, 4); // Minimal 4% agar bar tetap terlihat sedikit meski 0

              return (
                <div key={m.bulanIndex} className="flex-1 flex flex-col items-center h-full justify-end group">
                  {/* Tooltip Nilai/Label Atas */}
                  <span className="text-[9px] font-bold text-[#065F56] print:text-black mb-1 opacity-80 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {val > 0 ? (activeTab === "setor" ? `${val.toFixed(0)}k` : val) : "-"}
                  </span>

                  {/* Batang Grafik */}
                  <div className="w-full max-w-[28px] bg-[#E6F7F5] print:bg-slate-200 rounded-t-md relative flex items-end overflow-hidden h-full">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full bg-[#00BBA7] print:bg-black rounded-t-md transition-all duration-300"
                    />
                  </div>

                  {/* Label Bulan */}
                  <span className="text-[9px] font-bold text-[#6B7C7A] print:text-black mt-1.5 uppercase">
                    {m.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tabel Data Rekapitulasi */}
      <div className="bg-white rounded-2xl border border-[#EAF0EE] shadow-xs overflow-hidden print:border-none print:shadow-none print:rounded-none">
        <div className="p-5 border-b border-[#F0F5F4] space-y-4 print:hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-6 border-b border-[#EAF0EE] w-full sm:w-auto">
              <button
                onClick={() => setActiveTab("setor")}
                className={`pb-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                  activeTab === "setor"
                    ? "border-[#065F56] text-[#065F56]"
                    : "border-transparent text-[#6B7C7A] hover:text-[#1F2D2B]"
                }`}
              >
                Rekap Setor Sampah ({filteredSetor.length})
              </button>
              <button
                onClick={() => setActiveTab("penukaran")}
                className={`pb-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                  activeTab === "penukaran"
                    ? "border-[#065F56] text-[#065F56]"
                    : "border-transparent text-[#6B7C7A] hover:text-[#1F2D2B]"
                }`}
              >
                Rekap Penukaran Hadiah ({filteredPenukaran.length})
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative w-full sm:w-48">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#F4F8F7] border border-[#DCE7E5] rounded-xl text-xs font-semibold text-[#1F2D2B] focus:outline-none focus:ring-2 focus:ring-[#00BBA7]/30 transition-all cursor-pointer"
                >
                  <option value="semua">Semua Status</option>
                  <option value="selesai">Selesai</option>
                  <option value="pending">Pending</option>
                  <option value="menunggu_konfirmasi">Menunggu Konfirmasi</option>
                  <option value="ditolak">Ditolak</option>
                </select>
              </div>

              <div className="relative w-full sm:w-60">
                <input
                  type="text"
                  placeholder="Cari nasabah/item..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-[#F4F8F7] border border-[#DCE7E5] rounded-xl text-xs text-[#1F2D2B] focus:outline-none focus:ring-2 focus:ring-[#00BBA7]/30 transition-all placeholder:text-[#9AAEAB]"
                />
                <Search size={15} className="text-[#9AAEAB] absolute left-3 top-2.5" />
              </div>
            </div>
          </div>
        </div>

        {activeTab === "setor" && (
          <>
            {filteredSetor.length === 0 ? (
              <div className="text-center py-12 px-4 print:py-4">
                <FileSpreadsheet size={36} className="text-[#B7C2C0] mx-auto mb-2 print:hidden" />
                <p className="text-xs font-bold text-[#3E5250]">Tidak ada rekap setor sampah ditemukan</p>
              </div>
            ) : (
              <div className="overflow-x-auto print:overflow-visible">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-[#F4F8F7] border-b border-[#EAF0EE] text-[#6B7C7A] font-bold text-xs uppercase tracking-wider print:bg-slate-100 print:text-black">
                      <th className="py-2.5 px-4 w-10 text-center">No</th>
                      <th className="py-2.5 px-4 whitespace-nowrap">Tanggal</th>
                      <th className="py-2.5 px-4">Nasabah</th>
                      <th className="py-2.5 px-4">Rincian Item Sampah</th>
                      <th className="py-2.5 px-4 whitespace-nowrap">Total Berat (Riil)</th>
                      <th className="py-2.5 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F4F8F7] print:divide-black">
                    {filteredSetor.map((item, idx) => {
                      const statusLower = item.status?.toLowerCase() || "";
                      const isSelesai = statusLower === "selesai";
                      const isDitolak = statusLower === "ditolak";

                      const items = getSetorItems(item);
                      const totalBerat = items.reduce(
                        (acc, it) => acc + (it.beratRealKg ?? it.beratKg ?? 0),
                        0
                      );

                      return (
                        <tr key={item.id} className="hover:bg-[#F9FBFB] transition-colors print:hover:bg-transparent">
                          <td className="py-2.5 px-4 text-[#9AAEAB] font-medium text-center print:text-black">{idx + 1}</td>
                          <td className="py-2.5 px-4 text-[#6B7C7A] font-medium whitespace-nowrap print:text-black">
                            {formatDate(item.tanggal || item.createdAt)}
                          </td>
                          <td className="py-2.5 px-4 text-[#1F2D2B] font-bold print:text-black">
                            {getNasabahNama(item)}
                          </td>
                          <td className="py-2.5 px-4">
                            <div className="space-y-0.5">
                              {items.length > 0 ? (
                                items.map((it, i) => (
                                  <div key={i} className="text-xs text-[#3E5250] print:text-black print:text-[10px]">
                                    &bull; {it.kategoriSampah?.namaKategori || it.namaKategori || "Sampah"} (
                                    <span className="font-semibold">{it.beratRealKg ?? it.beratKg} Kg</span>)
                                  </div>
                                ))
                              ) : (
                                <span className="text-xs text-[#9AAEAB]">-</span>
                              )}
                            </div>
                          </td>
                          <td className="py-2.5 px-4 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#E6F7F5] text-[#065F56] font-bold rounded-lg text-xs border border-[#B7DFDA] print:bg-transparent print:border-none print:p-0 print:text-black print:text-xs">
                              <Scale size={13} className="text-[#00BBA7] print:hidden" />
                              {totalBerat.toFixed(2)} Kg
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-center">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider print:bg-transparent print:border-none print:p-0 print:text-black print:capitalize print:font-semibold ${
                                isSelesai
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : isDitolak
                                  ? "bg-rose-50 text-rose-700 border border-rose-200"
                                  : "bg-amber-50 text-amber-700 border border-amber-200"
                              }`}
                            >
                              {isSelesai ? (
                                <CheckCircle2 size={12} className="print:hidden text-emerald-600" />
                              ) : isDitolak ? (
                                <XCircle size={12} className="print:hidden text-rose-600" />
                              ) : (
                                <Clock size={12} className="print:hidden text-amber-600" />
                              )}
                              {item.status?.replace("_", " ")}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {activeTab === "penukaran" && (
          <>
            {filteredPenukaran.length === 0 ? (
              <div className="text-center py-12 px-4 print:py-4">
                <Gift size={36} className="text-[#B7C2C0] mx-auto mb-2 print:hidden" />
                <p className="text-xs font-bold text-[#3E5250]">Tidak ada rekap penukaran hadiah ditemukan</p>
              </div>
            ) : (
              <div className="overflow-x-auto print:overflow-visible">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-[#F4F8F7] border-b border-[#EAF0EE] text-[#6B7C7A] font-bold text-xs uppercase tracking-wider print:bg-slate-100 print:text-black">
                      <th className="py-2.5 px-4 w-10 text-center">No</th>
                      <th className="py-2.5 px-4 whitespace-nowrap">Tanggal</th>
                      <th className="py-2.5 px-4">Nasabah</th>
                      <th className="py-2.5 px-4">Hadiah Dikeluarkan</th>
                      <th className="py-2.5 px-4 text-center">Jumlah</th>
                      <th className="py-2.5 px-4 text-right">Poin Digunakan</th>
                      <th className="py-2.5 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F4F8F7] print:divide-black">
                    {filteredPenukaran.map((item, idx) => {
                      const statusLower = item.status?.toLowerCase() || "";
                      const isSelesai = statusLower === "selesai";
                      const isDitolak = statusLower === "ditolak";
                      const totalPoin = getTotalPoinPenukaran(item);
                      const jumlah = getJumlahPenukaran(item);

                      return (
                        <tr key={item.id} className="hover:bg-[#F9FBFB] transition-colors print:hover:bg-transparent">
                          <td className="py-2.5 px-4 text-[#9AAEAB] font-medium text-center print:text-black">{idx + 1}</td>
                          <td className="py-2.5 px-4 text-[#6B7C7A] font-medium whitespace-nowrap print:text-black">
                            {formatDate(item.tanggal || item.createdAt)}
                          </td>
                          <td className="py-2.5 px-4 text-[#1F2D2B] font-bold print:text-black">
                            {getNasabahNama(item)}
                          </td>
                          <td className="py-2.5 px-4 text-[#3E5250] font-semibold print:text-black">
                            {item.hadiah?.namaHadiah || item.hadiah?.nama || "Hadiah"}
                          </td>
                          <td className="py-2.5 px-4 text-center font-bold text-[#065F56] print:text-black">
                            {jumlah} Pcs
                          </td>
                          <td className="py-2.5 px-4 text-right font-bold text-[#065F56] print:text-black">
                            {totalPoin.toLocaleString("id-ID")} Poin
                          </td>
                          <td className="py-2.5 px-4 text-center">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider print:bg-transparent print:border-none print:p-0 print:text-black print:capitalize print:font-semibold ${
                                isSelesai
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : isDitolak
                                  ? "bg-rose-50 text-rose-700 border border-rose-200"
                                  : "bg-amber-50 text-amber-700 border border-amber-200"
                              }`}
                            >
                              {isSelesai ? (
                                <CheckCircle2 size={12} className="print:hidden text-emerald-600" />
                              ) : isDitolak ? (
                                <XCircle size={12} className="print:hidden text-rose-600" />
                              ) : (
                                <Clock size={12} className="print:hidden text-amber-600" />
                              )}
                              {item.status?.replace("_", " ")}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}