"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { kategoriSampahApi, setorSampahApi } from "@/lib/apiClient";
import Navbar from "@/components/NavbarNasabah";
import Footer from "@/components/Footer";
import {
  Recycle,
  Plus,
  Trash2,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Coins,
  Scale,
  FileText,
  Camera,
  Upload,
  X,
} from "lucide-react";

export default function NasabahSetorPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [user, setUser] = useState<any>(null);
  const [listKategori, setListKategori] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [catatan, setCatatan] = useState("");
  const [fotoBukti, setFotoBukti] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<
    { kategoriSampahId: string; beratKg: number }[]
  >([{ kategoriSampahId: "", beratKg: 0 }]);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Gagal parse data user", e);
      }
    }

    const fetchKategori = async () => {
      try {
        const data = await kategoriSampahApi.getAll();
        setListKategori(data || []);
      } catch (err: any) {
        setErrorMsg("Gagal memuat kategori sampah. Coba muat ulang halaman.");
      } finally {
        setLoading(false);
      }
    };

    fetchKategori();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg("Ukuran foto terlalu besar. Maksimal 5 MB.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoBukti(reader.result as string);
        setErrorMsg("");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setFotoBukti(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAddItem = () => {
    setSelectedItems([
      ...selectedItems,
      { kategoriSampahId: "", beratKg: 0 },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    const updated = selectedItems.filter((_, i) => i !== index);
    setSelectedItems(updated);
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const updated = [...selectedItems];
    updated[index] = { ...updated[index], [field]: value };
    setSelectedItems(updated);
  };

  const calculateTotalEstimasiPoin = () => {
    return selectedItems.reduce((acc, item) => {
      const kat = listKategori.find((k) => k.id === item.kategoriSampahId);
      const poinPerKg = kat?.poinPerKg || kat?.poin || 0;
      const berat = Number(item.beratKg) || 0;
      return acc + poinPerKg * berat;
    }, 0);
  };

  const isFormValid =
    selectedItems.length > 0 &&
    selectedItems.every(
      (item) => item.kategoriSampahId !== "" && item.beratKg > 0
    );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!isFormValid) {
      setErrorMsg(
        "Harap lengkapi semua Item Sampah (pilih kategori dan isi berat > 0 kg)."
      );
      return;
    }

    setSubmitting(true);
    try {
      await setorSampahApi.createPengajuan({
        tanggal: new Date().toISOString(),
        catatan,
        items: selectedItems.map((it) => ({
          kategoriSampahId: it.kategoriSampahId,
          beratKg: Number(it.beratKg),
        })),
      });

      setSuccessMsg("Pengajuan penyetoran sampah berhasil dikirim!");
      setTimeout(() => {
        router.push("/nasabah/dashboard");
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal mengirim pengajuan setor sampah.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F8F7]">
        <div className="flex items-center gap-3 text-[#0B4F45]">
          <Loader2 size={24} className="animate-spin text-[#0A7E76]" />
          <span className="font-medium text-sm">Memuat data kategori...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F8F7] font-sans flex flex-col justify-between">
      <div>
        <Navbar user={user} />

        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 pb-12 space-y-6">
          <div className="relative bg-[#D9F1EF]/70 p-5 sm:p-6 pb-6 sm:pb-7 rounded-2xl border border-[#C5E8E3] overflow-hidden">
            <div className="max-w-xs sm:max-w-sm space-y-2 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-white text-[#0B4F45] shadow-xs flex items-center justify-center">
                <Recycle size={22} />
              </div>
              <div>
                <h1 className="font-display text-lg sm:text-xl font-bold text-[#0B4F45]">
                  Form Setor Sampah
                </h1>
                <p className="text-xs text-[#4E6864] mt-0.5">
                  Ajukan penimbangan sampah daur ulang kamu di sini
                </p>
              </div>
            </div>

            <button
              onClick={() => router.push("/nasabah/dashboard")}
              className="absolute top-5 right-5 inline-flex items-center gap-2 text-xs font-semibold px-3.5 py-2 bg-white text-[#0B4F45] hover:bg-[#F4F8F7] rounded-xl border border-[#DCE7E5] shadow-2xs transition-all cursor-pointer z-20"
            >
              <ArrowLeft size={14} /> Kembali ke Dashboard
            </button>

            <div className="pointer-events-none absolute bottom-0 right-3 sm:right-8 w-24 sm:w-28 z-10">
              <Image
                src="/karakter4.png"
                alt="Karakter Tempat Sampah - Ayo Setor Sampah"
                width={120}
                height={120}
                className="w-full h-auto object-contain block"
                priority
              />
            </div>
          </div>

          {errorMsg && (
            <div className="p-4 bg-[#FBEAE5] border border-[#F0CFC5] text-[#B3522F] text-xs sm:text-sm rounded-2xl flex items-center gap-3">
              <AlertCircle size={18} className="flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-4 bg-[#D9F1EF] border border-[#B7DFDA] text-[#0B4F45] text-xs sm:text-sm rounded-2xl flex items-center gap-3">
              <CheckCircle2 size={18} className="flex-shrink-0 text-[#00B8A9]" />
              <span>{successMsg}</span>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="bg-white p-6 sm:p-8 rounded-3xl border border-[#EAF0EE] shadow-sm space-y-6"
          >
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#0B4F45] flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Camera size={14} className="text-[#0A7E76]" /> Foto Bukti Sampah (Opsional)
                </span>
                <span className="text-[11px] text-[#6B7C7A] font-normal">Maks. 5 MB</span>
              </label>

              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />

              {!fotoBukti ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#DCE7E5] hover:border-[#00B8A9] bg-[#F4F8F7] hover:bg-[#EAF6F4] transition-all p-7 rounded-2xl text-center cursor-pointer flex flex-col items-center justify-center gap-2 group"
                >
                  <div className="w-11 h-11 rounded-2xl bg-white text-[#0A7E76] shadow-xs flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Upload size={18} />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-[#0B4F45]">
                      Klik untuk unggah foto atau ambil dari kamera
                    </p>
                    <p className="text-[11px] text-[#6B7C7A] mt-0.5">
                      Format PNG, JPG, atau JPEG
                    </p>
                  </div>
                </div>
              ) : (
                <div className="relative rounded-2xl overflow-hidden border border-[#DCE7E5] bg-[#F4F8F7] p-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-200 border border-[#DCE7E5] flex-shrink-0">
                      <img
                        src={fotoBukti}
                        alt="Bukti Sampah"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[#0B4F45] truncate">
                        Foto Bukti Terunggah
                      </p>
                      <p className="text-[11px] text-[#00B8A9] font-medium flex items-center gap-1 mt-0.5">
                        <CheckCircle2 size={12} /> Siap dikirim
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="p-2 text-[#B3522F] hover:bg-[#FBEAE5] rounded-xl transition-colors cursor-pointer border border-[#F0CFC5]"
                    title="Hapus Foto"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#0B4F45] flex items-center gap-1.5">
                <FileText size={14} className="text-[#0A7E76]" /> Catatan Setoran (Opsional)
              </label>
              <input
                type="text"
                placeholder="Contoh: Ditaruh di depan pagar / Botol bening terpisah"
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#F4F8F7] border border-[#DCE7E5] rounded-xl text-xs sm:text-sm text-[#1F2D2B] placeholder-[#94A3A1] focus:outline-none focus:ring-2 focus:ring-[#00B8A9] focus:bg-white transition-all"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-[#0B4F45] flex items-center gap-1.5">
                  <Scale size={14} className="text-[#0A7E76]" /> Daftar Item Sampah
                </label>
                <button
                  type="button"
                  onClick={handleAddItem}
                  disabled={
                    selectedItems.length > 0 &&
                    (selectedItems[selectedItems.length - 1].kategoriSampahId === "" ||
                      selectedItems[selectedItems.length - 1].beratKg <= 0)
                  }
                  className="inline-flex items-center gap-1 text-xs text-[#0A7E76] hover:text-[#0B4F45] font-semibold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus size={14} /> Tambah Jenis Sampah
                </button>
              </div>

              <div className="space-y-3">
                {selectedItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end p-4 rounded-2xl bg-[#F4F8F7] border border-[#DCE7E5]"
                  >
                    <div className="flex-1 space-y-1">
                      <label className="block text-[11px] text-[#6B7C7A] font-semibold">
                        Kategori Sampah
                      </label>
                      <select
                        value={item.kategoriSampahId}
                        onChange={(e) =>
                          handleItemChange(index, "kategoriSampahId", e.target.value)
                        }
                        className={`w-full px-3 py-2 bg-white border ${
                          item.kategoriSampahId === "" ? "border-amber-300" : "border-[#DCE7E5]"
                        } rounded-xl text-xs text-[#1F2D2B] focus:outline-none focus:ring-2 focus:ring-[#00B8A9]`}
                      >
                        <option value="" disabled>
                          -- Pilih Jenis Sampah --
                        </option>
                        {listKategori.map((kat) => (
                          <option key={kat.id} value={kat.id}>
                            {kat.namaKategori} ({kat.poinPerKg || kat.poin || 0} Poin/Kg)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="w-full sm:w-36 space-y-1">
                      <label className="block text-[11px] text-[#6B7C7A] font-semibold">
                        Estimasi Berat (Kg)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        value={item.beratKg === 0 ? "" : item.beratKg}
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            "beratKg",
                            Math.max(0, Number(e.target.value))
                          )
                        }
                        placeholder="0.0"
                        className={`w-full px-3 py-2 bg-white border ${
                          item.beratKg <= 0 ? "border-amber-300" : "border-[#DCE7E5]"
                        } rounded-xl text-xs text-[#1F2D2B] focus:outline-none focus:ring-2 focus:ring-[#00B8A9]`}
                      />
                    </div>

                    {selectedItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="p-2 text-[#B3522F] hover:bg-[#FBEAE5] rounded-xl border border-[#F0CFC5] transition-colors flex items-center justify-center cursor-pointer"
                        title="Hapus Item"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-r from-[#0B4F45] to-[#07352E] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-[#00B8A9]">
                  <Coins size={18} />
                </div>
                <div>
                  <p className="text-[11px] text-[#DCE7E5]">Estimasi Poin yang Diperoleh</p>
                  <p className="text-xs text-[#DCE7E5]/80">
                    *Poin akhir disesuaikan hasil verifikasi timbangan admin
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-display text-xl font-bold text-[#00B8A9]">
                  +{calculateTotalEstimasiPoin().toLocaleString("id-ID")}
                </span>
                <span className="text-xs text-[#DCE7E5] ml-1">Poin</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || !isFormValid}
              className="w-full py-3 bg-[#00B8A9] hover:bg-[#00A395] text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Mengirim Pengajuan...
                </>
              ) : !isFormValid ? (
                <>
                  <AlertCircle size={16} /> Pilih Kategori & Berat Sampah
                </>
              ) : (
                <>
                  <Sparkles size={16} /> Kirim Pengajuan Setoran
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
}