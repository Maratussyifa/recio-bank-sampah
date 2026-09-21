"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { kategoriSampahApi } from "@/lib/apiClient";
import {
  FolderCog,
  Plus,
  Edit,
  Trash2,
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Recycle,
  ChevronRight,
  X,
  Boxes,
  Layers,
  Coins,
  Tags,
  Image as ImageIcon,
  Upload,
} from "lucide-react";

interface KategoriItem {
  id: string;
  namaKategori: string;
  jenis?: string;
  jenisSampah?: string;
  poinPerKg?: number;
  harga?: number;
  hargaPerKg?: number;
  foto?: string;
  gambarUrl?: string;
  imageUrl?: string;
}

const JENIS_OPTIONS = [
  { label: "Plastik", value: "plastik" },
  { label: "Kertas", value: "kertas" },
  { label: "Logam", value: "logam" },
  { label: "Kaca", value: "kaca" },
  { label: "Organik", value: "organik" },
  { label: "Lainnya", value: "lainnya" },
];

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

export default function AdminKategoriPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [todayLabel, setTodayLabel] = useState<string>("");
  const [listKategori, setListKategori] = useState<KategoriItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [namaKategori, setNamaKategori] = useState("");
  const [jenisSampah, setJenisSampah] = useState("plastik");
  const [poinPerKg, setPoinPerKg] = useState<string>("");
  
  // State untuk unggah foto
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);

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
      const res = await kategoriSampahApi.getAll();
      setListKategori(extractArray<KategoriItem>(res));
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message || "Gagal memuat kategori sampah.");
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

  const filteredKategori = useMemo(() => {
    return listKategori.filter((item) =>
      (item.namaKategori || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [listKategori, searchQuery]);

  const stats = useMemo(() => {
    const totalKategori = listKategori.length;
    const jenisUnik = new Set(
      listKategori.map((k) => (k.jenis || k.jenisSampah || "").toLowerCase()).filter(Boolean)
    ).size;

    const avgPoin =
      totalKategori > 0
        ? Math.round(
            listKategori.reduce(
              (acc, curr) => acc + (curr.poinPerKg ?? curr.harga ?? curr.hargaPerKg ?? 0),
              0
            ) / totalKategori
          )
        : 0;

    return { totalKategori, jenisUnik, avgPoin };
  }, [listKategori]);

  const resetForm = () => {
    setEditingId(null);
    setNamaKategori("");
    setJenisSampah("plastik");
    setPoinPerKg("");
    setFotoFile(null);
    setFotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setErrorMsg("");
  };

  const handleEditInit = (item: KategoriItem) => {
    setEditingId(item.id);
    setNamaKategori(item.namaKategori || "");
    setJenisSampah((item.jenis || item.jenisSampah || "plastik").toLowerCase());
    setPoinPerKg(String(item.poinPerKg ?? item.harga ?? item.hargaPerKg ?? ""));
    setFotoFile(null);
    setFotoPreview(item.foto || item.gambarUrl || item.imageUrl || null);
    setErrorMsg("");
    setSuccessMsg("");
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFotoFile(file);
      setFotoPreview(URL.createObjectURL(file));
    }
  };

  const handleDelete = async (id: string, nama: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus kategori "${nama}"?`)) return;

    try {
      setSubmitting(true);
      setErrorMsg("");
      setSuccessMsg("");
      await kategoriSampahApi.delete(id);
      setSuccessMsg(`Kategori "${nama}" berhasil dihapus.`);
      await loadData();
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message || "Gagal menghapus kategori.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nilaiAngka = Number(poinPerKg);

    if (!namaKategori.trim() || poinPerKg === "" || isNaN(nilaiAngka) || nilaiAngka < 0) {
      setErrorMsg("Harap isi nama kategori dan nilai poin/harga dengan benar.");
      return;
    }

    // Gunakan FormData untuk pengiriman payload beserta file foto
    const formData = new FormData();
    formData.append("namaKategori", namaKategori.trim());
    formData.append("hargaPerKg", String(nilaiAngka));
    formData.append("poinPerKg", String(nilaiAngka));
    formData.append("jenis", jenisSampah);
    
    if (fotoFile) {
      formData.append("foto", fotoFile); // Sesuaikan key 'foto' sesuai kontrak backend API
    }

    try {
      setSubmitting(true);
      setErrorMsg("");
      setSuccessMsg("");

      if (editingId) {
        await kategoriSampahApi.update(editingId, formData);
        setSuccessMsg(`Kategori "${namaKategori}" berhasil diperbarui.`);
      } else {
        await kategoriSampahApi.create(formData);
        setSuccessMsg(`Kategori "${namaKategori}" berhasil ditambahkan.`);
      }

      resetForm();
      await loadData();
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message || "Gagal menyimpan data kategori.");
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
            <span className="text-[#0B4F45] font-semibold">Master Kategori</span>
          </div>
          <span className="text-xs text-[#6B7C7A]">{todayLabel}</span>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-2 pb-12 space-y-6 w-full">
        <section className="bg-white border border-[#EAF0EE] rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#D9F1EF] text-[#0B4F45] flex items-center justify-center shrink-0">
              <Tags size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#0B4F45]">
                Kelola Kategori Sampah
              </h1>
              <p className="text-xs text-[#6B7C7A] mt-0.5">
                Atur pengelompokan jenis sampah, foto kategori, dan konversi poin per kilogram.
              </p>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Reveal delay={0} className="bg-white p-5 rounded-2xl border-l-4 border-l-[#00B8A9] border-t border-r border-b border-[#EAF0EE] shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#6B7C7A] uppercase">Total Kategori</span>
              <div className="w-8 h-8 rounded-lg bg-[#D9F1EF] text-[#0B4F45] flex items-center justify-center group-hover:bg-[#00B8A9] group-hover:text-white transition-colors">
                <Boxes size={16} />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="font-display text-2xl font-bold text-[#0B4F45]">{stats.totalKategori}</h3>
              <p className="text-[10px] text-[#6B7C7A] font-medium mt-0.5">Item Terdaftar</p>
            </div>
          </Reveal>

          <Reveal delay={60} className="bg-white p-5 rounded-2xl border-l-4 border-l-[#0A7E76] border-t border-r border-b border-[#EAF0EE] shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#6B7C7A] uppercase">Variasi Jenis</span>
              <div className="w-8 h-8 rounded-lg bg-[#EAF6F4] text-[#0A7E76] flex items-center justify-center group-hover:bg-[#0A7E76] group-hover:text-white transition-colors">
                <Layers size={16} />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="font-display text-2xl font-bold text-[#0B4F45]">{stats.jenisUnik}</h3>
              <p className="text-[10px] text-[#6B7C7A] font-medium mt-0.5">Kelompok Material</p>
            </div>
          </Reveal>

          <Reveal delay={120} className="bg-white p-5 rounded-2xl border-l-4 border-l-[#0B4F45] border-t border-r border-b border-[#EAF0EE] shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#6B7C7A] uppercase">Rata-rata Poin</span>
              <div className="w-8 h-8 rounded-lg bg-[#D9F1EF] text-[#0B4F45] flex items-center justify-center group-hover:bg-[#0B4F45] group-hover:text-white transition-colors">
                <Coins size={16} />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="font-display text-2xl font-bold text-[#0B4F45]">{stats.avgPoin.toLocaleString("id-ID")}</h3>
              <p className="text-[10px] text-[#6B7C7A] font-medium mt-0.5">Poin / Kg</p>
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
                    {editingId ? "Edit Kategori" : "Tambah Kategori"}
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
                {/* Field Foto Kategori */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#0B4F45]">Foto Kategori</label>
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-xl border border-[#EAF0EE] bg-[#F4F8F7] flex items-center justify-center overflow-hidden shrink-0">
                      {fotoPreview ? (
                        <img src={fotoPreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon size={20} className="text-[#6B7C7A]" />
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="foto-kategori-input"
                    />
                    <label
                      htmlFor="foto-kategori-input"
                      className="px-3 py-2 bg-[#F4F8F7] hover:bg-[#EAF0EE] border border-[#EAF0EE] rounded-xl text-xs font-semibold text-[#0B4F45] cursor-pointer transition-all flex items-center gap-1.5"
                    >
                      <Upload size={14} /> Pilih Foto
                    </label>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#0B4F45]">Nama Kategori</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Botol PET Bening"
                    value={namaKategori}
                    onChange={(e) => setNamaKategori(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F4F8F7] border border-[#EAF0EE] rounded-xl text-xs font-medium text-[#1F2D2B] focus:outline-none focus:border-[#00B8A9] focus:bg-white transition-all placeholder:text-[#91A19F]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#0B4F45]">Jenis Sampah</label>
                  <select
                    value={jenisSampah}
                    onChange={(e) => setJenisSampah(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F4F8F7] border border-[#EAF0EE] rounded-xl text-xs font-medium text-[#1F2D2B] focus:outline-none focus:border-[#00B8A9] focus:bg-white transition-all capitalize"
                  >
                    {JENIS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#0B4F45]">Poin / Harga Per Kg</label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min="0"
                      placeholder="0"
                      value={poinPerKg}
                      onChange={(e) => setPoinPerKg(e.target.value)}
                      className="w-full pl-3.5 pr-12 py-2.5 bg-[#F4F8F7] border border-[#EAF0EE] rounded-xl text-xs font-medium text-[#1F2D2B] focus:outline-none focus:border-[#00B8A9] focus:bg-white transition-all placeholder:text-[#91A19F]"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-[#6B7C7A]">
                      Poin
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
                        <Plus size={15} /> Simpan Kategori
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
                  <Recycle size={18} className="text-[#0B4F45]" />
                  <h2 className="font-display font-semibold text-[#0B4F45] text-sm">
                    Daftar Kategori Sampah
                  </h2>
                </div>

                <div className="relative w-full sm:w-60">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7C7A]"
                  />
                  <input
                    type="text"
                    placeholder="Cari kategori..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-[#F4F8F7] border border-[#EAF0EE] rounded-xl text-xs font-medium text-[#1F2D2B] focus:outline-none focus:border-[#00B8A9] focus:bg-white transition-all placeholder:text-[#91A19F]"
                  />
                </div>
              </div>

              {filteredKategori.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-[#F4F8F7] text-[#6B7C7A] flex items-center justify-center mx-auto">
                    <FolderCog size={24} />
                  </div>
                  <p className="text-xs text-[#6B7C7A] font-medium">
                    {searchQuery ? "Tidak ada kategori yang cocok." : "Belum ada data kategori."}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#EAF0EE] text-[#6B7C7A]">
                        <th className="py-2.5 px-3 font-semibold uppercase tracking-wider text-[10px]">Foto</th>
                        <th className="py-2.5 px-3 font-semibold uppercase tracking-wider text-[10px]">Nama Kategori</th>
                        <th className="py-2.5 px-3 font-semibold uppercase tracking-wider text-[10px]">Jenis</th>
                        <th className="py-2.5 px-3 font-semibold uppercase tracking-wider text-[10px]">Poin / Kg</th>
                        <th className="py-2.5 px-3 font-semibold uppercase tracking-wider text-[10px] text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F4F8F7]">
                      {filteredKategori.map((item) => {
                        const jenisStr = item.jenis || item.jenisSampah || "Lainnya";
                        const poinVal = item.poinPerKg ?? item.harga ?? item.hargaPerKg ?? 0;
                        const itemFoto = item.foto || item.gambarUrl || item.imageUrl;

                        return (
                          <tr key={item.id} className="hover:bg-[#F9FBFB] transition-colors group">
                            <td className="py-3.5 px-3">
                              <div className="w-10 h-10 rounded-lg bg-[#F4F8F7] border border-[#EAF0EE] overflow-hidden flex items-center justify-center">
                                {itemFoto ? (
                                  <img src={itemFoto} alt={item.namaKategori} className="w-full h-full object-cover" />
                                ) : (
                                  <ImageIcon size={16} className="text-[#6B7C7A]" />
                                )}
                              </div>
                            </td>
                            <td className="py-3.5 px-3 font-bold text-[#0B4F45]">
                              {item.namaKategori}
                            </td>
                            <td className="py-3.5 px-3">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#D9F1EF] text-[#0B4F45] border border-[#B7DFDA] capitalize">
                                {jenisStr}
                              </span>
                            </td>
                            <td className="py-3.5 px-3 font-semibold text-[#1F2D2B]">
                              <span className="text-[#00B8A9] font-extrabold">{poinVal.toLocaleString("id-ID")}</span> Poin
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
                                  onClick={() => handleDelete(item.id, item.namaKategori)}
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