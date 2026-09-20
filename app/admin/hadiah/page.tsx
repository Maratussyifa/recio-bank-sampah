"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { hadiahApi } from "@/lib/apiClient";
import {
  Gift,
  Plus,
  Edit,
  Trash2,
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2,
  PackageCheck,
  PackageX,
  Coins,
  ChevronRight,
  X,
  Boxes,
} from "lucide-react";

interface HadiahItem {
  id: string;
  namaHadiah: string;
  poinDibutuhkan?: number;
  poin?: number;
  stok?: number;
  stokHadiah?: number;
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

export default function AdminHadiahPage() {
  const router = useRouter();
  const [todayLabel, setTodayLabel] = useState<string>("");
  const [listHadiah, setListHadiah] = useState<HadiahItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [namaHadiah, setNamaHadiah] = useState("");
  const [poinDibutuhkan, setPoinDibutuhkan] = useState<string>("");
  const [stok, setStok] = useState<string>("");

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
    return [];
  };

  const loadData = async () => {
    try {
      setErrorMsg("");
      const res = await hadiahApi.getAll();
      setListHadiah(extractArray<HadiahItem>(res));
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message || "Gagal memuat daftar hadiah.");
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

  const filteredHadiah = useMemo(() => {
    return listHadiah.filter((item) =>
      (item.namaHadiah || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [listHadiah, searchQuery]);

  const stats = useMemo(() => {
    const totalJenis = listHadiah.length;
    const totalStok = listHadiah.reduce(
      (acc, curr) => acc + (curr.stok ?? curr.stokHadiah ?? 0),
      0
    );
    const stokHabis = listHadiah.filter(
      (item) => (item.stok ?? item.stokHadiah ?? 0) === 0
    ).length;
    return { totalJenis, totalStok, stokHabis };
  }, [listHadiah]);

  const resetForm = () => {
    setEditingId(null);
    setNamaHadiah("");
    setPoinDibutuhkan("");
    setStok("");
    setErrorMsg("");
  };

  const handleEditInit = (item: HadiahItem) => {
    setEditingId(item.id);
    setNamaHadiah(item.namaHadiah || "");
    setPoinDibutuhkan(String(item.poinDibutuhkan ?? item.poin ?? ""));
    setStok(String(item.stok ?? item.stokHadiah ?? ""));
    setErrorMsg("");
    setSuccessMsg("");
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  const handleDelete = async (id: string, nama: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus hadiah "${nama}"?`)) return;

    try {
      setSubmitting(true);
      setErrorMsg("");
      setSuccessMsg("");
      await hadiahApi.delete(id);
      setSuccessMsg(`Hadiah "${nama}" berhasil dihapus.`);
      await loadData();
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message || "Gagal menghapus hadiah.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nilaiPoin = Number(poinDibutuhkan);
    const nilaiStok = Number(stok);

    if (
      !namaHadiah.trim() ||
      poinDibutuhkan === "" ||
      stok === "" ||
      isNaN(nilaiPoin) ||
      isNaN(nilaiStok) ||
      nilaiPoin <= 0 ||
      nilaiStok < 0
    ) {
      setErrorMsg("Harap isi nama hadiah, poin (> 0), dan stok (≥ 0) dengan benar.");
      return;
    }

    const payload = {
      namaHadiah: namaHadiah.trim(),
      poinDibutuhkan: nilaiPoin,
      stok: nilaiStok,
    };

    try {
      setSubmitting(true);
      setErrorMsg("");
      setSuccessMsg("");

      if (editingId) {
        await hadiahApi.update(editingId, payload);
        setSuccessMsg(`Hadiah "${namaHadiah}" berhasil diperbarui.`);
      } else {
        await hadiahApi.create(payload);
        setSuccessMsg(`Hadiah "${namaHadiah}" berhasil ditambahkan.`);
      }

      resetForm();
      await loadData();
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message || "Gagal menyimpan data hadiah.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 space-y-6 w-full">
        <SkeletonBlock className="h-32 rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <SkeletonBlock className="lg:col-span-4 h-96 rounded-3xl" />
          <SkeletonBlock className="lg:col-span-8 h-96 rounded-3xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5 text-xs font-medium text-[#6B7C7A]">
            <span
              onClick={() => router.push("/admin")}
              className="cursor-pointer hover:text-[#0B4F45] transition-colors"
            >
              Beranda
            </span>
            <ChevronRight size={12} />
            <span className="text-[#0B4F45] font-semibold">Katalog Hadiah</span>
          </div>
          <span className="text-xs text-[#6B7C7A]">{todayLabel}</span>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-2 pb-12 space-y-6 w-full">
        <section className="bg-white border border-[#EAF0EE] rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#D9F1EF] text-[#0B4F45] flex items-center justify-center shrink-0">
              <Gift size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#0B4F45]">
                Kelola Katalog Hadiah
              </h1>
              <p className="text-xs text-[#6B7C7A] mt-0.5">
                Atur ketersediaan stok hadiah dan standar penukaran poin nasabah.
              </p>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Reveal delay={0} className="bg-white p-5 rounded-2xl border-l-4 border-l-[#00B8A9] border-t border-r border-b border-[#EAF0EE] shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#6B7C7A] uppercase">Total Jenis Hadiah</span>
              <div className="w-8 h-8 rounded-lg bg-[#D9F1EF] text-[#0B4F45] flex items-center justify-center group-hover:bg-[#00B8A9] group-hover:text-white transition-colors">
                <Boxes size={16} />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="font-display text-2xl font-bold text-[#0B4F45]">{stats.totalJenis}</h3>
              <p className="text-[10px] text-[#6B7C7A] font-medium mt-0.5">Varian Barang</p>
            </div>
          </Reveal>

          <Reveal delay={60} className="bg-white p-5 rounded-2xl border-l-4 border-l-[#0A7E76] border-t border-r border-b border-[#EAF0EE] shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#6B7C7A] uppercase">Total Stok</span>
              <div className="w-8 h-8 rounded-lg bg-[#EAF6F4] text-[#0A7E76] flex items-center justify-center group-hover:bg-[#0A7E76] group-hover:text-white transition-colors">
                <PackageCheck size={16} />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="font-display text-2xl font-bold text-[#0B4F45]">{stats.totalStok.toLocaleString("id-ID")}</h3>
              <p className="text-[10px] text-[#6B7C7A] font-medium mt-0.5">Unit Tersedia</p>
            </div>
          </Reveal>

          <Reveal delay={120} className="bg-white p-5 rounded-2xl border-l-4 border-l-[#B3522F] border-t border-r border-b border-[#EAF0EE] shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#6B7C7A] uppercase">Stok Habis</span>
              <div className="w-8 h-8 rounded-lg bg-[#FBEAE5] text-[#B3522F] flex items-center justify-center group-hover:bg-[#B3522F] group-hover:text-white transition-colors">
                <PackageX size={16} />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="font-display text-2xl font-bold text-[#B3522F]">{stats.stokHabis}</h3>
              <p className="text-[10px] text-[#6B7C7A] font-medium mt-0.5">Perlu Restok</p>
            </div>
          </Reveal>
        </div>

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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-4 space-y-6">
            <Reveal delay={50} className="bg-white p-6 rounded-3xl border border-[#EAF0EE] shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-[#F0F5F4] pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#D9F1EF] text-[#0B4F45] flex items-center justify-center">
                    {editingId ? <Edit size={16} /> : <Plus size={16} />}
                  </div>
                  <h3 className="font-display font-semibold text-[#0B4F45] text-sm">
                    {editingId ? "Edit Hadiah" : "Tambah Hadiah"}
                  </h3>
                </div>
                {editingId && (
                  <button
                    onClick={resetForm}
                    className="text-[11px] font-semibold text-[#6B7C7A] hover:text-[#0B4F45] flex items-center gap-1 cursor-pointer bg-[#F4F8F7] px-2.5 py-1 rounded-lg border border-[#EAF0EE]"
                  >
                    <X size={12} /> Batal
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#0B4F45]">Nama Hadiah</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Minyak Goreng 1L"
                    value={namaHadiah}
                    onChange={(e) => setNamaHadiah(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F4F8F7] border border-[#EAF0EE] rounded-xl text-xs font-medium text-[#1F2D2B] focus:outline-none focus:border-[#00B8A9] focus:bg-white transition-all placeholder:text-[#91A19F]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#0B4F45]">Poin Dibutuhkan</label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="0"
                      value={poinDibutuhkan}
                      onChange={(e) => setPoinDibutuhkan(e.target.value)}
                      className="w-full pl-3.5 pr-12 py-2.5 bg-[#F4F8F7] border border-[#EAF0EE] rounded-xl text-xs font-medium text-[#1F2D2B] focus:outline-none focus:border-[#00B8A9] focus:bg-white transition-all placeholder:text-[#91A19F]"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-[#6B7C7A]">
                      Poin
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#0B4F45]">Jumlah Stok</label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min="0"
                      placeholder="0"
                      value={stok}
                      onChange={(e) => setStok(e.target.value)}
                      className="w-full pl-3.5 pr-12 py-2.5 bg-[#F4F8F7] border border-[#EAF0EE] rounded-xl text-xs font-medium text-[#1F2D2B] focus:outline-none focus:border-[#00B8A9] focus:bg-white transition-all placeholder:text-[#91A19F]"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-[#6B7C7A]">
                      Unit
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-2.5 bg-[#00B8A9] hover:bg-[#00A395] text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : editingId ? (
                      <>
                        <Edit size={15} /> Simpan Perubahan
                      </>
                    ) : (
                      <>
                        <Plus size={15} /> Simpan Hadiah
                      </>
                    )}
                  </button>
                </div>
              </form>
            </Reveal>
          </div>

          <div className="lg:col-span-8 space-y-6">
            <Reveal delay={100} className="bg-white p-6 rounded-3xl border border-[#EAF0EE] shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F0F5F4]">
                <div className="flex items-center gap-2">
                  <Gift size={18} className="text-[#0B4F45]" />
                  <h2 className="font-display font-semibold text-[#0B4F45] text-sm">
                    Daftar Hadiah Penukaran
                  </h2>
                </div>

                <div className="relative w-full sm:w-60">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7C7A]"
                  />
                  <input
                    type="text"
                    placeholder="Cari hadiah..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-[#F4F8F7] border border-[#EAF0EE] rounded-xl text-xs font-medium text-[#1F2D2B] focus:outline-none focus:border-[#00B8A9] focus:bg-white transition-all placeholder:text-[#91A19F]"
                  />
                </div>
              </div>

              {filteredHadiah.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-[#F4F8F7] text-[#6B7C7A] flex items-center justify-center mx-auto">
                    <Gift size={24} />
                  </div>
                  <p className="text-xs text-[#6B7C7A] font-medium">
                    {searchQuery ? "Tidak ada hadiah yang cocok." : "Belum ada data hadiah."}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#EAF0EE] text-[#6B7C7A]">
                        <th className="py-2.5 px-3 font-semibold uppercase tracking-wider text-[10px]">Nama Hadiah</th>
                        <th className="py-2.5 px-3 font-semibold uppercase tracking-wider text-[10px]">Poin Dibutuhkan</th>
                        <th className="py-2.5 px-3 font-semibold uppercase tracking-wider text-[10px]">Stok & Status</th>
                        <th className="py-2.5 px-3 font-semibold uppercase tracking-wider text-[10px] text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F4F8F7]">
                      {filteredHadiah.map((item) => {
                        const jumlahStok = item.stok ?? item.stokHadiah ?? 0;
                        const poinVal = item.poinDibutuhkan ?? item.poin ?? 0;

                        return (
                          <tr key={item.id} className="hover:bg-[#F9FBFB] transition-colors group">
                            <td className="py-3.5 px-3 font-bold text-[#0B4F45]">
                              {item.namaHadiah}
                            </td>
                            <td className="py-3.5 px-3 font-semibold text-[#1F2D2B]">
                              <span className="inline-flex items-center gap-1 text-[#00B8A9] font-extrabold">
                                <Coins size={12} />
                                {poinVal.toLocaleString("id-ID")}
                              </span> Poin
                            </td>
                            <td className="py-3.5 px-3">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-[#1F2D2B]">
                                  {jumlahStok} unit
                                </span>
                                {jumlahStok === 0 ? (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#FBEAE5] text-[#B3522F] border border-[#F0CFC5]">
                                    Habis
                                  </span>
                                ) : jumlahStok <= 5 ? (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#FFF8E6] text-[#8C6B00] border border-[#FCE8B3]">
                                    Menipis
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#D9F1EF] text-[#0B4F45] border border-[#B7DFDA]">
                                    Tersedia
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-3.5 px-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleEditInit(item)}
                                  className="p-1.5 text-[#0A7E76] hover:bg-[#D9F1EF] rounded-lg transition-colors cursor-pointer"
                                  title="Edit"
                                >
                                  <Edit size={15} />
                                </button>
                                <button
                                  onClick={() => handleDelete(item.id, item.namaHadiah)}
                                  disabled={submitting}
                                  className="p-1.5 text-[#B3522F] hover:bg-[#FBEAE5] rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                                  title="Hapus"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
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
        </div>
      </main>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}