"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { setorSampahApi, penukaranPoinApi } from "@/lib/apiClient";
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Gift,
  Scale,
  Inbox,
  User,
  ChevronRight,
  X,
} from "lucide-react";

interface ItemSampah {
  id?: string;
  kategoriSampahId?: string;
  beratKg?: number;
  beratRealKg?: number;
  namaKategori?: string;
  kategoriSampah?: {
    id?: string;
    namaKategori?: string;
  };
}

interface SetorSampahItem {
  id: string;
  tanggal?: string;
  createdAt?: string;
  status: string;
  catatan?: string;
  nasabah?: {
    nama?: string;
    user?: { username?: string };
  };
  user?: { username?: string };
  items?: ItemSampah[];
}

interface PenukaranItem {
  id: string;
  tanggal?: string;
  createdAt?: string;
  status?: string;
  jumlah?: number;
  jumlahPoin?: number;
  totalPoin?: number;
  qty?: number;
  nasabah?: {
    nama?: string;
    namaNasabah?: string;
    user?: { username?: string };
  };
  user?: { username?: string };
  hadiah?: {
    namaHadiah?: string;
    nama?: string;
  };
}

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

export default function AdminVerifikasiPage() {
  const router = useRouter();
  const [todayLabel, setTodayLabel] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"setor" | "penukaran">("setor");
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [listSetor, setListSetor] = useState<SetorSampahItem[]>([]);
  const [listPenukaran, setListPenukaran] = useState<PenukaranItem[]>([]);

  const [selectedSetor, setSelectedSetor] = useState<SetorSampahItem | null>(null);
  const [fetchingDetail, setFetchingDetail] = useState(false);
  const [itemsBeratReal, setItemsBeratReal] = useState<{ [key: string]: string }>({});
  const [verifying, setVerifying] = useState(false);
  const [processingPenukaranId, setProcessingPenukaranId] = useState<string | null>(null);

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

  const getItemsList = (setor: SetorSampahItem | null): ItemSampah[] => {
    if (!setor) return [];
    const raw = setor as unknown as Record<string, unknown>;

    if (Array.isArray(raw.detailSetors) && raw.detailSetors.length > 0)
      return raw.detailSetors as ItemSampah[];
    if (Array.isArray(raw.detailSetor) && raw.detailSetor.length > 0)
      return raw.detailSetor as ItemSampah[];
    if (Array.isArray(setor.items) && setor.items.length > 0) return setor.items;
    if (Array.isArray(raw.setorSampahItems) && raw.setorSampahItems.length > 0)
      return raw.setorSampahItems as ItemSampah[];
    if (Array.isArray(raw.itemSetor) && raw.itemSetor.length > 0)
      return raw.itemSetor as ItemSampah[];
    if (Array.isArray(raw.itemsSetor) && raw.itemsSetor.length > 0)
      return raw.itemsSetor as ItemSampah[];
    if (Array.isArray(raw.details) && raw.details.length > 0)
      return raw.details as ItemSampah[];
    return [];
  };

  const getItemEstimasiBerat = (it: ItemSampah): number => {
    const raw = it as unknown as Record<string, unknown>;
    return (
      it.beratKg ??
      (typeof raw.berat === "number" ? raw.berat : undefined) ??
      (typeof raw.jumlah === "number" ? raw.jumlah : undefined) ??
      0
    );
  };

  const getItemKey = (it: ItemSampah, idx: number): string => {
    return it.id || it.kategoriSampahId || it.kategoriSampah?.id || `item-key-${idx}`;
  };

  const getJumlahPenukaran = (item: PenukaranItem): number => {
    const raw = item as unknown as Record<string, unknown>;
    return (
      item.jumlah ??
      item.qty ??
      (typeof raw.jumlahItem === "number" ? raw.jumlahItem : undefined) ??
      1
    );
  };

  const getStatusNormalized = (statusRaw?: string) => {
    const s = String(statusRaw || "").toLowerCase().trim();
    if (s === "selesai" || s === "diverifikasi" || s === "approved" || s === "success") {
      return "selesai";
    }
    if (s === "ditolak" || s === "rejected" || s === "batal" || s === "canceled") {
      return "ditolak";
    }
    return "pending";
  };

  const isPendingStatus = (statusRaw?: string) => {
    return getStatusNormalized(statusRaw) === "pending";
  };

  const loadData = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const [resSetor, resPenukaran] = await Promise.all([
        setorSampahApi.getAllAdmin(),
        penukaranPoinApi.getAllAdmin(),
      ]);

      setListSetor(extractArray<SetorSampahItem>(resSetor));
      setListPenukaran(extractArray<PenukaranItem>(resPenukaran));
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message || "Gagal memuat data verifikasi.");
    } finally {
      setLoading(false);
    }
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
    loadData();
  }, []);

  const clearAlerts = () => {
    setErrorMsg("");
    setSuccessMsg("");
  };

  const handleOpenSetorModal = async (item: SetorSampahItem) => {
    clearAlerts();
    setSelectedSetor(item);
    setFetchingDetail(true);

    let detailData: SetorSampahItem = item;

    try {
      const resDetail = await setorSampahApi.getDetail(item.id);
      const extracted = (resDetail as Record<string, unknown>)?.data || resDetail;
      if (extracted && typeof extracted === "object") {
        detailData = extracted as SetorSampahItem;
      }
    } catch (err) {
      console.error("Gagal memuat detail setoran via getById:", err);
    } finally {
      setFetchingDetail(false);
    }

    setSelectedSetor(detailData);

    const items = getItemsList(detailData);
    const initialBerat: { [key: string]: string } = {};

    items.forEach((it, idx) => {
      const keyId = getItemKey(it, idx);
      const val = it.beratRealKg ?? getItemEstimasiBerat(it);
      initialBerat[keyId] = String(val);
    });

    setItemsBeratReal(initialBerat);
  };

  const totalEstimasiKg = useMemo(() => {
    return getItemsList(selectedSetor).reduce(
      (acc, curr) => acc + getItemEstimasiBerat(curr),
      0
    );
  }, [selectedSetor]);

  const totalRealKg = useMemo(() => {
    return Object.values(itemsBeratReal).reduce((acc, val) => {
      const parsedVal = String(val).replace(",", ".");
      const num = parseFloat(parsedVal);
      return acc + (isNaN(num) ? 0 : num);
    }, 0);
  }, [itemsBeratReal]);

  const handleProcessSetor = async (statusTarget: "selesai" | "ditolak") => {
    if (!selectedSetor) return;

    if (statusTarget === "selesai") {
      const invalidInput = Object.values(itemsBeratReal).some((val) => {
        const parsed = Number(String(val).replace(",", "."));
        return val === "" || isNaN(parsed) || parsed < 0;
      });

      if (invalidInput) {
        setErrorMsg("Harap isi semua nilai berat riil dengan angka non-negatif yang valid.");
        return;
      }
    }

    setVerifying(true);
    clearAlerts();

    try {
      const itemsList = getItemsList(selectedSetor);
      const itemsPayload = itemsList.map((it, idx) => {
        const keyId = getItemKey(it, idx);
        const beratReal = Number(String(itemsBeratReal[keyId] || 0).replace(",", "."));
        return {
          id: it.id || keyId,
          kategoriSampahId: it.kategoriSampahId || it.kategoriSampah?.id || it.id || keyId,
          beratKgReal: beratReal,
        };
      });

      await setorSampahApi.verifikasi(selectedSetor.id, {
        status: statusTarget,
        catatanAdmin: "",
        itemsReal: itemsPayload,
      });

      setSuccessMsg(`Status setoran berhasil diubah menjadi "${statusTarget}".`);
      setSelectedSetor(null);
      await loadData();
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message || "Gagal memproses verifikasi setoran.");
    } finally {
      setVerifying(false);
    }
  };

  const handleProcessPenukaran = async (id: string, statusTarget: "selesai" | "ditolak") => {
    if (!confirm(`Apakah Anda yakin ingin mengubah status penukaran ini menjadi "${statusTarget}"?`)) {
      return;
    }

    setProcessingPenukaranId(id);
    clearAlerts();

    try {
      await penukaranPoinApi.updateStatus(id, statusTarget);
      setSuccessMsg(`Status penukaran berhasil diperbarui menjadi "${statusTarget}".`);
      await loadData();
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message || "Gagal memproses penukaran.");
    } finally {
      setProcessingPenukaranId(null);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 space-y-6 w-full">
        <SkeletonBlock className="h-28 rounded-2xl" />
        <SkeletonBlock className="h-12 rounded-xl" />
        <SkeletonBlock className="h-80 rounded-3xl" />
      </div>
    );
  }

  const countSetorPending = listSetor.filter((i) => isPendingStatus(i.status)).length;
  const countPenukaranPending = listPenukaran.filter((i) => isPendingStatus(i.status)).length;

  return (
    <div className="space-y-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5 text-xs font-medium text-[#6B7C7A]">
            <Link
              href="/admin"
              className="hover:text-[#0B4F45] cursor-pointer transition-colors"
            >
              Beranda
            </Link>
            <ChevronRight size={12} />
            <span className="text-[#0B4F45] font-semibold">Verifikasi Transaksi</span>
          </div>
          <span className="text-xs text-[#6B7C7A]">{todayLabel}</span>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-2 pb-12 space-y-6 w-full">
        <section className="bg-white border border-[#EAF0EE] rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#D9F1EF] text-[#0B4F45] flex items-center justify-center shrink-0">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#0B4F45]">
                Persetujuan & Verifikasi
              </h1>
              <p className="text-xs text-[#6B7C7A] mt-0.5">
                Periksa setoran sampah, sesuaikan timbangan riil, dan konfirmasi klaim penukaran poin.
              </p>
            </div>
          </div>
        </section>

        {errorMsg && (
          <div className="p-4 bg-[#FBEAE5] border border-[#F0CFC5] rounded-2xl text-xs font-semibold text-[#B3522F] flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
            <button onClick={() => setErrorMsg("")} className="text-[#B3522F] hover:opacity-75">
              <X size={16} />
            </button>
          </div>
        )}

        {successMsg && (
          <div className="p-4 bg-[#D9F1EF] border border-[#B7DFDA] rounded-2xl text-xs font-semibold text-[#0B4F45] flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} />
              <span>{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg("")} className="text-[#0B4F45] hover:opacity-75">
              <X size={16} />
            </button>
          </div>
        )}

        <div className="flex border-b border-[#EAF0EE] gap-4 sm:gap-8 pt-2">
          <button
            onClick={() => {
              clearAlerts();
              setActiveTab("setor");
            }}
            className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "setor"
                ? "border-[#00B8A9] text-[#0B4F45]"
                : "border-transparent text-[#6B7C7A] hover:text-[#0B4F45]"
            }`}
          >
            <Scale size={16} />
            <span>Setor Sampah</span>
            <span
              className={`px-2 py-0.5 text-[10px] rounded-full font-bold ${
                countSetorPending > 0
                  ? "bg-[#FBEAE5] text-[#B3522F]"
                  : "bg-[#F4F8F7] text-[#6B7C7A]"
              }`}
            >
              {countSetorPending} Pending
            </span>
          </button>

          <button
            onClick={() => {
              clearAlerts();
              setActiveTab("penukaran");
            }}
            className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "penukaran"
                ? "border-[#00B8A9] text-[#0B4F45]"
                : "border-transparent text-[#6B7C7A] hover:text-[#0B4F45]"
            }`}
          >
            <Gift size={16} />
            <span>Penukaran Hadiah</span>
            <span
              className={`px-2 py-0.5 text-[10px] rounded-full font-bold ${
                countPenukaranPending > 0
                  ? "bg-[#FBEAE5] text-[#B3522F]"
                  : "bg-[#F4F8F7] text-[#6B7C7A]"
              }`}
            >
              {countPenukaranPending} Pending
            </span>
          </button>
        </div>

        {activeTab === "setor" && (
          <Reveal delay={0} className="bg-white rounded-3xl border border-[#EAF0EE] shadow-xs overflow-hidden">
            <div className="p-6 border-b border-[#F0F5F4]">
              <h2 className="font-display text-sm font-bold text-[#0B4F45]">
                Daftar Pengajuan Setor Sampah
              </h2>
              <p className="text-xs text-[#6B7C7A] mt-0.5">
                Tinjau pengajuan dan verifikasi timbangan riil nasabah
              </p>
            </div>

            {listSetor.length === 0 ? (
              <div className="text-center py-12 px-4 space-y-2">
                <Inbox size={36} className="text-[#6B7C7A] mx-auto opacity-50" />
                <p className="text-xs text-[#6B7C7A] font-medium">Belum ada data pengajuan setor.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#EAF0EE] text-[#6B7C7A]">
                      <th className="py-2.5 px-6 font-semibold uppercase tracking-wider text-[10px]">Tanggal</th>
                      <th className="py-2.5 px-6 font-semibold uppercase tracking-wider text-[10px]">Nasabah</th>
                      <th className="py-2.5 px-6 font-semibold uppercase tracking-wider text-[10px]">Catatan</th>
                      <th className="py-2.5 px-6 font-semibold uppercase tracking-wider text-[10px]">Status</th>
                      <th className="py-2.5 px-6 font-semibold uppercase tracking-wider text-[10px] text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F4F8F7]">
                    {listSetor.map((item) => {
                      const statusNorm = getStatusNormalized(item.status);
                      const isSelesai = statusNorm === "selesai";
                      const isDitolak = statusNorm === "ditolak";
                      const isPending = statusNorm === "pending";

                      return (
                        <tr key={item.id} className="hover:bg-[#F9FBFB] transition-colors">
                          <td className="py-3.5 px-6 text-[#6B7C7A]">
                            {formatDate(item.tanggal || item.createdAt)}
                          </td>
                          <td className="py-3.5 px-6 text-[#0B4F45] font-bold">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-[#F4F8F7] text-[#6B7C7A] flex items-center justify-center text-[10px] shrink-0">
                                <User size={12} />
                              </div>
                              <span>{getNasabahNama(item)}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-6 text-[#6B7C7A] max-w-xs truncate">
                            {item.catatan || "-"}
                          </td>
                          <td className="py-3.5 px-6">
                            {isSelesai ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-[#D9F1EF] text-[#0B4F45] border border-[#B7DFDA]">
                                Selesai
                              </span>
                            ) : isDitolak ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-[#FBEAE5] text-[#B3522F] border border-[#F0CFC5]">
                                Ditolak
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-[#FFF8E6] text-[#8C6B00] border border-[#FCE8B3]">
                                Pending
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-6 text-right">
                            {isPending ? (
                              <button
                                onClick={() => handleOpenSetorModal(item)}
                                className="px-3 py-1.5 text-xs font-bold text-white bg-[#00B8A9] hover:bg-[#00A395] rounded-xl transition-all shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                              >
                                <ShieldCheck size={14} /> Verifikasi
                              </button>
                            ) : (
                              <span className="text-xs text-[#6B7C7A] font-medium">Terproses</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Reveal>
        )}

        {activeTab === "penukaran" && (
          <Reveal delay={0} className="bg-white rounded-3xl border border-[#EAF0EE] shadow-xs overflow-hidden">
            <div className="p-6 border-b border-[#F0F5F4]">
              <h2 className="font-display text-sm font-bold text-[#0B4F45]">
                Daftar Penukaran Hadiah
              </h2>
              <p className="text-xs text-[#6B7C7A] mt-0.5">
                Konfirmasi klaim penukaran poin dari nasabah
              </p>
            </div>

            {listPenukaran.length === 0 ? (
              <div className="text-center py-12 px-4 space-y-2">
                <Inbox size={36} className="text-[#6B7C7A] mx-auto opacity-50" />
                <p className="text-xs text-[#6B7C7A] font-medium">Belum ada data penukaran.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#EAF0EE] text-[#6B7C7A]">
                      <th className="py-2.5 px-6 font-semibold uppercase tracking-wider text-[10px]">Tanggal</th>
                      <th className="py-2.5 px-6 font-semibold uppercase tracking-wider text-[10px]">Nasabah</th>
                      <th className="py-2.5 px-6 font-semibold uppercase tracking-wider text-[10px]">Hadiah</th>
                      <th className="py-2.5 px-6 font-semibold uppercase tracking-wider text-[10px]">Jumlah</th>
                      <th className="py-2.5 px-6 font-semibold uppercase tracking-wider text-[10px]">Status</th>
                      <th className="py-2.5 px-6 font-semibold uppercase tracking-wider text-[10px] text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F4F8F7]">
                    {listPenukaran.map((item) => {
                      const statusNorm = getStatusNormalized(item.status);
                      const isSelesai = statusNorm === "selesai";
                      const isDitolak = statusNorm === "ditolak";
                      const isPending = statusNorm === "pending";
                      const isProcessingThis = processingPenukaranId === item.id;
                      const jumlahPcs = getJumlahPenukaran(item);

                      return (
                        <tr key={item.id} className="hover:bg-[#F9FBFB] transition-colors">
                          <td className="py-3.5 px-6 text-[#6B7C7A]">
                            {formatDate(item.createdAt || item.tanggal)}
                          </td>
                          <td className="py-3.5 px-6 text-[#0B4F45] font-bold">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-[#F4F8F7] text-[#6B7C7A] flex items-center justify-center text-[10px] shrink-0">
                                <User size={12} />
                              </div>
                              <span>{getNasabahNama(item)}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-6 text-[#1F2D2B] font-semibold">
                            {item.hadiah?.namaHadiah || item.hadiah?.nama || "-"}
                          </td>
                          <td className="py-3.5 px-6 text-[#1F2D2B] font-bold">{jumlahPcs} pcs</td>
                          <td className="py-3.5 px-6">
                            {isSelesai ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-[#D9F1EF] text-[#0B4F45] border border-[#B7DFDA]">
                                Selesai
                              </span>
                            ) : isDitolak ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-[#FBEAE5] text-[#B3522F] border border-[#F0CFC5]">
                                Ditolak
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-[#FFF8E6] text-[#8C6B00] border border-[#FCE8B3]">
                                Pending
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-6 text-right">
                            {isPending ? (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  disabled={isProcessingThis}
                                  onClick={() => handleProcessPenukaran(item.id, "selesai")}
                                  className="px-3 py-1.5 text-xs font-bold text-[#0B4F45] bg-[#D9F1EF] hover:bg-[#B7DFDA] rounded-xl transition-all disabled:opacity-50 cursor-pointer"
                                >
                                  {isProcessingThis ? "Wait..." : "Setujui"}
                                </button>
                                <button
                                  disabled={isProcessingThis}
                                  onClick={() => handleProcessPenukaran(item.id, "ditolak")}
                                  className="px-3 py-1.5 text-xs font-bold text-[#B3522F] bg-[#FBEAE5] hover:bg-[#F0CFC5] rounded-xl transition-all disabled:opacity-50 cursor-pointer"
                                >
                                  Tolak
                                </button>
                              </div>
                            ) : (
                              <span className="text-xs text-[#6B7C7A] font-medium">Terproses</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Reveal>
        )}

        {selectedSetor && (
          <div className="fixed inset-0 bg-[#0B4F45]/30 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl border border-[#EAF0EE]">
              <div className="flex items-center justify-between border-b border-[#F0F5F4] pb-3">
                <h3 className="font-display text-sm font-bold text-[#0B4F45]">
                  Verifikasi Timbangan Sampah
                </h3>
                <button
                  onClick={() => setSelectedSetor(null)}
                  className="text-[#6B7C7A] hover:text-[#0B4F45] p-1 rounded-lg"
                >
                  <X size={16} />
                </button>
              </div>

              <p className="text-xs text-[#6B7C7A]">
                Inputkan timbangan riil untuk nasabah{" "}
                <strong className="text-[#0B4F45]">{getNasabahNama(selectedSetor)}</strong>
              </p>

              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {fetchingDetail ? (
                  <div className="py-8 text-center flex flex-col items-center gap-2 text-[#6B7C7A]">
                    <Loader2 size={20} className="animate-spin text-[#00B8A9]" />
                    <span className="text-xs">Mengambil detail item...</span>
                  </div>
                ) : getItemsList(selectedSetor).length === 0 ? (
                  <div className="p-4 bg-[#FFF8E6] border border-[#FCE8B3] rounded-2xl text-center">
                    <p className="text-xs text-[#8C6B00] font-semibold">
                      Detail item sampah tidak ditemukan pada data transaksi ini.
                    </p>
                  </div>
                ) : (
                  getItemsList(selectedSetor).map((it, idx) => {
                    const itemKey = getItemKey(it, idx);
                    const estimasi = getItemEstimasiBerat(it);
                    return (
                      <div
                        key={itemKey}
                        className="flex justify-between items-center p-3.5 bg-[#F4F8F7] rounded-2xl border border-[#EAF0EE]"
                      >
                        <div>
                          <p className="text-xs font-bold text-[#0B4F45]">
                            {it.kategoriSampah?.namaKategori || it.namaKategori || "Kategori Sampah"}
                          </p>
                          <p className="text-[11px] text-[#6B7C7A] mt-0.5">
                            Estimasi: {estimasi} Kg
                          </p>
                        </div>
                        <div className="w-32">
                          <label className="block text-[10px] text-[#6B7C7A] font-semibold mb-1 uppercase tracking-wider">
                            Berat Riil (Kg)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={itemsBeratReal[itemKey] ?? ""}
                            onChange={(e) => {
                              const newVal = e.target.value;
                              setItemsBeratReal((prev) => ({
                                ...prev,
                                [itemKey]: newVal,
                              }));
                            }}
                            className="w-full px-3 py-1.5 bg-white border border-[#EAF0EE] rounded-xl text-xs font-bold text-[#1F2D2B] focus:outline-none focus:border-[#00B8A9]"
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}