"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { nasabahAdminApi } from "@/lib/apiClient";
import {
  Users,
  UserPlus,
  Search,
  Edit3,
  Trash2,
  X,
  Loader2,
  Eye,
  Phone,
  MapPin,
  Coins,
  AlertCircle,
  RefreshCw,
  ChevronRight,
} from "lucide-react";

interface Nasabah {
  id: string;
  namaNasabah?: string;
  telp?: string;
  alamat?: string;
  saldoPoin?: number;
  foto?: string;
  user?: {
    username?: string;
  };
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://learn.smktelkom-mlg.sch.id/bank_sampah/api/v1";
const FILE_BASE_URL = API_BASE_URL.replace(/\/api\/v1\/?$/, "");

function getImageUrl(path?: string | null): string | null {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) {
    return path;
  }
  return `${FILE_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export default function NasabahAdminPage() {
  const [nasabahList, setNasabahList] = useState<Nasabah[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNasabah, setSelectedNasabah] = useState<Nasabah | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    namaNasabah: "",
    username: "",
    password: "",
    telp: "",
    alamat: "",
    tanggalLahir: "",
  });
  const [fotoFile, setFotoFile] = useState<File | null>(null);

  const extractNasabahArray = (res: unknown): Nasabah[] => {
    if (!res || typeof res !== "object") return [];
    const obj = res as Record<string, unknown>;

    if (Array.isArray(obj)) return obj as Nasabah[];
    if (Array.isArray(obj.data)) return obj.data as Nasabah[];
    if (
      obj.data &&
      typeof obj.data === "object" &&
      Array.isArray((obj.data as Record<string, unknown>).data)
    ) {
      return (obj.data as Record<string, unknown>).data as Nasabah[];
    }
    if (
      obj.data &&
      typeof obj.data === "object" &&
      Array.isArray((obj.data as Record<string, unknown>).content)
    ) {
      return (obj.data as Record<string, unknown>).content as Nasabah[];
    }
    if (Array.isArray(obj.content)) return obj.content as Nasabah[];
    if (Array.isArray(obj.nasabah)) return obj.nasabah as Nasabah[];
    if (Array.isArray(obj.nasabahs)) return obj.nasabahs as Nasabah[];
    if (Array.isArray(obj.result)) return obj.result as Nasabah[];
    if (Array.isArray(obj.users)) return obj.users as Nasabah[];
    if (Array.isArray(obj.items)) return obj.items as Nasabah[];

    return [];
  };

  const fetchNasabah = async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      const res = await nasabahAdminApi.getAll();
      const list = extractNasabahArray(res);
      setNasabahList(list);
    } catch (err: unknown) {
      const error = err as Error;
      console.error("Error fetch nasabah:", error);
      setErrorMsg(
        error.message || "Gagal memuat data nasabah. Pastikan API backend aktif dan token admin valid."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNasabah();
  }, []);

  const handleOpenAddModal = () => {
    setSelectedNasabah(null);
    setFormData({ namaNasabah: "", username: "", password: "", telp: "", alamat: "", tanggalLahir: "" });
    setFotoFile(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: Nasabah) => {
    const raw = item as unknown as Record<string, unknown>;
    setSelectedNasabah(item);
    setFormData({
      namaNasabah: item.namaNasabah || "",
      username: item.user?.username || "",
      password: "",
      telp: item.telp || "",
      alamat: item.alamat || "",
      tanggalLahir: String(raw.tanggalLahir || raw.tanggal_lahir || ""),
    });
    setFotoFile(null);
    setIsModalOpen(true);
  };

  const handleOpenDetail = async (item: Nasabah) => {
    setIsDetailOpen(true);
    setLoadingDetail(true);
    setSelectedNasabah(item);

    try {
      const detailRes = await nasabahAdminApi.getById(item.id);
      const extracted =
        (detailRes as Record<string, unknown>)?.data || detailRes;
      if (extracted && typeof extracted === "object") {
        setSelectedNasabah(extracted as Nasabah);
      }
    } catch {
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Ukuran gambar maksimal 2MB!");
        e.target.value = "";
        return;
      }
      setFotoFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (selectedNasabah) {
        const payload = new FormData();
        payload.append("namaLengkap", formData.namaNasabah.trim());
        payload.append("noTelepon", formData.telp.trim());
        payload.append("alamat", formData.alamat.trim());
        payload.append("tanggalLahir", formData.tanggalLahir);
        if (fotoFile) payload.append("foto", fotoFile);

        await nasabahAdminApi.update(selectedNasabah.id, payload);
      } else {
        const payload = new FormData();
        payload.append("namaNasabah", formData.namaNasabah.trim());
        payload.append("telp", formData.telp.trim());
        payload.append("alamat", formData.alamat.trim());
        payload.append("username", formData.username.trim());
        payload.append("password", formData.password);
        if (fotoFile) payload.append("foto", fotoFile);
        await nasabahAdminApi.create(payload);
      }

      setIsModalOpen(false);
      await fetchNasabah();
    } catch (err: unknown) {
      const error = err as Error;
      alert(error.message || "Gagal menyimpan data nasabah");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, nama: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus nasabah "${nama}"?`)) return;

    try {
      await nasabahAdminApi.delete(id);
      await fetchNasabah();
    } catch (err: unknown) {
      const error = err as Error;
      alert(error.message || "Gagal menghapus nasabah");
    }
  };

  const filteredNasabah = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return nasabahList;

    return nasabahList.filter((item) => {
      const nama = String(item.namaNasabah || item.user?.username || "").toLowerCase();
      const username = String(item.user?.username || "").toLowerCase();
      const telp = String(item.telp || "").toLowerCase();

      return nama.includes(q) || username.includes(q) || telp.includes(q);
    });
  }, [nasabahList, search]);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center gap-1.5 text-xs font-medium text-[#6B7C7A]">
        <Link
          href="/admin/dashboard"
          className="hover:text-[#065F56] cursor-pointer transition-colors"
        >
          Beranda
        </Link>
        <ChevronRight size={12} />
        <span className="text-[#065F56] font-semibold">Data Nasabah</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#EAF0EE] shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-[#065F56] flex items-center gap-2">
            <Users className="text-[#00BBA7]" size={28} />
            Data Nasabah
          </h1>
          <p className="text-sm text-[#6B7C7A] mt-1">
            Kelola data akun dan informasi nasabah Bank Sampah Recio.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchNasabah}
            className="p-2.5 bg-[#F4F8F7] hover:bg-[#EAF0EE] text-[#065F56] rounded-2xl transition-all border border-[#EAF0EE] cursor-pointer"
            title="Muat Ulang Data"
          >
            <RefreshCw size={16} />
          </button>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center justify-center gap-2 bg-[#065F56] hover:bg-[#00BBA7] text-white px-5 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer shadow-xs"
          >
            <UserPlus size={16} />
            Tambah Nasabah
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-[#FBEAE5] border border-[#F0CFC5] text-[#B3522F] text-xs rounded-2xl flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle size={18} className="shrink-0 text-[#B3522F]" />
            <span className="font-medium">{errorMsg}</span>
          </div>
          <button
            onClick={fetchNasabah}
            className="px-3 py-1 bg-[#FBEAE5] hover:bg-[#F0CFC5] text-[#B3522F] rounded-xl font-bold cursor-pointer transition-all"
          >
            Coba Lagi
          </button>
        </div>
      )}

      <div className="flex items-center bg-white px-4 py-2 rounded-2xl border border-[#EAF0EE] shadow-xs max-w-md">
        <Search size={18} className="text-[#6B7C7A] mr-2 shrink-0" />
        <input
          type="text"
          placeholder="Cari nama, username, atau no hp..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent text-xs text-[#065F56] focus:outline-none"
        />
      </div>

      <div className="bg-white rounded-3xl border border-[#EAF0EE] shadow-xs overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-[#6B7C7A]">
            <Loader2 className="animate-spin mb-2 text-[#00BBA7]" size={32} />
            <p className="text-xs">Memuat data nasabah...</p>
          </div>
        ) : filteredNasabah.length === 0 ? (
          <div className="text-center py-16 text-[#6B7C7A]">
            <Users size={40} className="mx-auto mb-2 opacity-30" />
            <p className="text-xs font-semibold">Tidak ada data nasabah ditemukan.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F4F8F7] border-b border-[#EAF0EE] text-[#065F56]">
                  <th className="p-4 font-bold">Nasabah</th>
                  <th className="p-4 font-bold">Kontak</th>
                  <th className="p-4 font-bold">Alamat</th>
                  <th className="p-4 font-bold">Saldo Poin</th>
                  <th className="p-4 font-bold text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAF0EE]">
                {filteredNasabah.map((item, idx) => {
                  const nama = item.namaNasabah || item.user?.username || "Nasabah";
                  const username = item.user?.username || "-";
                  const telp = item.telp || "-";
                  const alamat = item.alamat || "-";
                  const saldoPoin = Number(item.saldoPoin) || 0;
                  const fotoSrc = getImageUrl(item.foto);

                  return (
                    <tr key={item.id || `nasabah-${idx}`} className="hover:bg-[#F9FBFB] transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#D9F1EF] text-[#065F56] font-bold flex items-center justify-center border border-[#B7DFDA] overflow-hidden shrink-0">
                            {fotoSrc ? (
                              <img src={fotoSrc} alt={nama} className="w-full h-full object-cover" />
                            ) : (
                              nama.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-[#065F56]">{nama}</p>
                            <p className="text-[11px] text-[#6B7C7A]">@{username}</p>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 text-[#065F56]">
                        <div className="flex items-center gap-1.5">
                          <Phone size={12} className="text-[#6B7C7A]" />
                          {telp}
                        </div>
                      </td>

                      <td className="p-4 text-[#065F56] max-w-[200px] truncate">
                        <div className="flex items-center gap-1.5">
                          <MapPin size={12} className="text-[#6B7C7A] shrink-0" />
                          <span className="truncate">{alamat}</span>
                        </div>
                      </td>

                      <td className="p-4 font-bold text-[#065F56]">
                        <div className="flex items-center gap-1">
                          <Coins size={14} className="text-[#00BBA7]" />
                          {saldoPoin.toLocaleString("id-ID")} Poin
                        </div>
                      </td>

                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenDetail(item)}
                            className="p-1.5 text-[#6B7C7A] hover:text-[#065F56] hover:bg-[#D9F1EF] rounded-lg transition-colors cursor-pointer"
                            title="Detail"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            className="p-1.5 text-[#6B7C7A] hover:text-[#065F56] hover:bg-[#D9F1EF] rounded-lg transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id, nama)}
                            className="p-1.5 text-[#6B7C7A] hover:text-[#B3522F] hover:bg-[#FBEAE5] rounded-lg transition-colors cursor-pointer"
                            title="Hapus"
                          >
                            <Trash2 size={16} />
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
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#065F56]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-xl border border-[#EAF0EE] relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-[#6B7C7A] hover:text-[#065F56] cursor-pointer"
            >
              <X size={20} />
            </button>

            <h2 className="text-lg font-bold text-[#065F56] mb-4">
              {selectedNasabah ? "Edit Data Nasabah" : "Tambah Nasabah Baru"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#065F56] mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={formData.namaNasabah}
                  onChange={(e) => setFormData({ ...formData, namaNasabah: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#EAF0EE] bg-[#F4F8F7] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00BBA7]/30"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#065F56] mb-1">
                  Username {selectedNasabah && "(tidak bisa diubah)"}
                </label>
                <input
                  type="text"
                  required={!selectedNasabah}
                  disabled={!!selectedNasabah}
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#EAF0EE] bg-[#F4F8F7] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00BBA7]/30 disabled:cursor-not-allowed disabled:text-[#6B7C7A]"
                />
              </div>

              {!selectedNasabah && (
                <div>
                  <label className="block font-semibold text-[#065F56] mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#EAF0EE] bg-[#F4F8F7] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00BBA7]/30"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#065F56] mb-1">No HP</label>
                  <input
                    type="text"
                    value={formData.telp}
                    onChange={(e) => setFormData({ ...formData, telp: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#EAF0EE] bg-[#F4F8F7] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00BBA7]/30"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#065F56] mb-1">Foto Profil</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full px-2 py-1.5 rounded-xl border border-[#EAF0EE] bg-[#F4F8F7] text-[10px]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#065F56] mb-1">Alamat</label>
                <textarea
                  rows={3}
                  value={formData.alamat}
                  onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#EAF0EE] bg-[#F4F8F7] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00BBA7]/30"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-[#6B7C7A] bg-[#F4F8F7] font-semibold hover:bg-[#EAF0EE] cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl text-white bg-[#065F56] hover:bg-[#00BBA7] font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-50 transition-all"
                >
                  {isSubmitting && <Loader2 className="animate-spin" size={14} />}
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDetailOpen && selectedNasabah && (
        <div className="fixed inset-0 z-50 bg-[#065F56]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl border border-[#EAF0EE] relative text-xs">
            <button
              onClick={() => setIsDetailOpen(false)}
              className="absolute top-5 right-5 text-[#6B7C7A] hover:text-[#065F56] cursor-pointer"
            >
              <X size={20} />
            </button>

            <h2 className="text-lg font-bold text-[#065F56] mb-4">Detail Nasabah</h2>

            {loadingDetail ? (
              <div className="flex flex-col items-center justify-center py-8 text-[#6B7C7A]">
                <Loader2 className="animate-spin mb-2 text-[#00BBA7]" size={24} />
                <p className="text-xs">Memuat detail nasabah...</p>
              </div>
            ) : (() => {
              const detailNama = selectedNasabah.namaNasabah || selectedNasabah.user?.username || "Nasabah";
              const detailUsername = selectedNasabah.user?.username || "-";
              const detailTelp = selectedNasabah.telp || "-";
              const detailAlamat = selectedNasabah.alamat || "";
              const detailPoin = Number(selectedNasabah.saldoPoin) || 0;
              const detailFotoSrc = getImageUrl(selectedNasabah.foto);

              return (
                <>
                  <div className="flex flex-col items-center text-center p-4 bg-[#F4F8F7] rounded-2xl mb-4 border border-[#EAF0EE]">
                    <div className="w-16 h-16 rounded-full bg-[#D9F1EF] text-[#065F56] font-bold flex items-center justify-center text-xl border border-[#B7DFDA] mb-2 overflow-hidden">
                      {detailFotoSrc ? (
                        <img src={detailFotoSrc} alt={detailNama} className="w-full h-full object-cover" />
                      ) : (
                        detailNama.charAt(0).toUpperCase()
                      )}
                    </div>
                    <h3 className="font-bold text-base text-[#065F56]">{detailNama}</h3>
                    <p className="text-[#6B7C7A]">@{detailUsername}</p>
                  </div>

                  <div className="space-y-2 text-[#065F56]">
                    <div className="flex justify-between py-1 border-b border-[#EAF0EE]">
                      <span className="text-[#6B7C7A]">No. Telepon:</span>
                      <span className="font-semibold">{detailTelp}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#EAF0EE]">
                      <span className="text-[#6B7C7A]">Saldo Poin:</span>
                      <span className="font-bold text-[#065F56]">
                        {detailPoin.toLocaleString("id-ID")} Poin
                      </span>
                    </div>
                    <div className="py-1">
                      <span className="text-[#6B7C7A] block mb-1">Alamat Lengkap:</span>
                      <p className="bg-[#F4F8F7] p-2.5 rounded-xl border border-[#EAF0EE]">
                        {detailAlamat || "Belum ada alamat terdaftar."}
                      </p>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}