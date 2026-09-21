"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { kategoriSampahApi } from "@/lib/apiClient";
import Navbar from "@/components/NavbarNasabah";
import Footer from "@/components/Footer";
import {
  Boxes,
  Search,
  Recycle,
  Leaf,
  FlaskConical,
  ArrowLeft,
  ArrowRight,
  Coins,
  ImageIcon,
  PackageSearch,
} from "lucide-react";

interface Kategori {
  id: string;
  namaKategori: string;
  hargaPerKg: number;
  poinPerKg: number;
  jenis: string;
  foto?: string;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://learn.smktelkom-mlg.sch.id/bank_sampah/api/v1";
const FILE_BASE_URL = API_BASE_URL.replace(/\/api\/v1\/?$/, "");

function buildFotoUrl(path?: string | null): string | null {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${FILE_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

function extractArray(res: unknown): Kategori[] {
  if (!res || typeof res !== "object") return Array.isArray(res) ? (res as Kategori[]) : [];
  const obj = res as Record<string, unknown>;
  if (Array.isArray(obj)) return obj as Kategori[];
  if (Array.isArray(obj.data)) return obj.data as Kategori[];
  return [];
}

function jenisIcon(jenis?: string) {
  const j = (jenis || "").toLowerCase();
  if (j === "organik") return Leaf;
  if (j === "b3") return FlaskConical;
  return Recycle;
}

function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-[#E4EEEC] rounded-xl ${className}`} />;
}

export default function KatalogKategoriPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [kategoriList, setKategoriList] = useState<Kategori[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterJenis, setFilterJenis] = useState("ALL");

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Gagal parse data user", e);
      }
    }

    fetchKategori();
  }, []);

  const fetchKategori = async () => {
    try {
      setLoading(true);
      const res = await kategoriSampahApi.getAll();
      setKategoriList(extractArray(res));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredKategori = kategoriList.filter((item) => {
    const matchSearch = (item.namaKategori || "")
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchJenis =
      filterJenis === "ALL" ||
      (item.jenis || "").toLowerCase() === filterJenis.toLowerCase();
    return matchSearch && matchJenis;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F8F7] font-sans">
        <Navbar user={user} />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-12 space-y-6">
          <SkeletonBlock className="h-28 rounded-2xl" />
          <SkeletonBlock className="h-14 rounded-2xl" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <SkeletonBlock key={i} className="h-72 rounded-3xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F8F7] font-sans flex flex-col justify-between">
      <div>
        <Navbar user={user} />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-12 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#D9F1EF]/80 p-5 sm:p-6 rounded-2xl border border-[#B7DFDA] shadow-xs">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-white text-[#0B4F45] shadow-xs flex items-center justify-center flex-shrink-0">
                <Boxes size={22} />
              </div>
              <div>
                <h1 className="font-display text-lg sm:text-xl font-bold text-[#0B4F45]">
                  Katalog Kategori Sampah
                </h1>
                <p className="text-xs text-[#4E6864] mt-0.5">
                  Cek jenis sampah yang diterima beserta nilai poin dan harga per kilogramnya
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
              <div className="flex items-center gap-2 bg-white text-[#0B4F45] px-3.5 py-2 rounded-xl border border-[#B7DFDA] shadow-2xs">
                <Boxes size={16} className="text-[#0A7E76]" />
                <span className="text-xs font-bold">
                  {kategoriList.length} Kategori
                </span>
              </div>

              <button
                onClick={() => router.push("/nasabah/setor")}
                className="inline-flex items-center gap-2 text-xs font-semibold px-3.5 py-2 bg-white text-[#0B4F45] hover:bg-[#F4F8F7] rounded-xl border border-[#DCE7E5] shadow-2xs transition-all cursor-pointer"
              >
                <ArrowLeft size={14} /> Kembali
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 bg-white p-3 rounded-2xl border border-[#EAF0EE] shadow-xs">
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9AAEAB]"
              />
              <input
                type="text"
                placeholder="Cari nama jenis sampah..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-[#F4F8F7] border border-[#DCE7E5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00B8A9]/30 focus:border-[#00B8A9] transition-colors"
              />
            </div>

            <select
              value={filterJenis}
              onChange={(e) => setFilterJenis(e.target.value)}
              className="px-4 py-2 text-sm bg-[#F4F8F7] border border-[#DCE7E5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00B8A9]/30 focus:border-[#00B8A9] transition-colors text-[#1F2D2B] font-medium cursor-pointer"
            >
              <option value="ALL">Semua Tipe</option>
              <option value="organik">Organik</option>
              <option value="anorganik">Anorganik</option>
              <option value="B3">B3</option>
            </select>
          </div>

          {filteredKategori.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-dashed border-[#DCE7E5] text-center space-y-3">
              <PackageSearch size={36} className="mx-auto text-[#B7C2C0]" />
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-[#1F2D2B]">
                  Kategori Tidak Ditemukan
                </h3>
                <p className="text-xs text-[#6B7C7A]">
                  Coba gunakan kata kunci pencarian atau filter tipe yang berbeda.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {filteredKategori.map((item) => {
                const Icon = jenisIcon(item.jenis);
                const fotoUrl = buildFotoUrl(item.foto);

                return (
                  <div
                    key={item.id}
                    className="group bg-white rounded-3xl border border-[#EAF0EE] shadow-xs hover:shadow-md hover:-translate-y-1 transition-all flex flex-col justify-between overflow-hidden"
                  >
                    <div>
                      <div className="relative w-full h-40 bg-[#F4F8F7] flex items-center justify-center overflow-hidden border-b border-[#EAF0EE]">
                        {fotoUrl ? (
                          <img
                            src={fotoUrl}
                            alt={item.namaKategori}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-[#B7C2C0] gap-1.5">
                            <ImageIcon size={28} />
                            <span className="text-[11px] font-medium">Tidak ada foto</span>
                          </div>
                        )}

                        <span className="absolute top-3 right-3 inline-flex items-center gap-1 text-[10px] font-bold text-[#0B4F45] bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-full border border-[#DCE7E5] shadow-2xs uppercase tracking-wide">
                          <Icon size={11} /> {item.jenis || "Umum"}
                        </span>
                      </div>

                      <div className="p-5 space-y-3">
                        <h3 className="font-display font-semibold text-[#0B4F45] text-base leading-snug line-clamp-1">
                          {item.namaKategori}
                        </h3>

                        <div className="space-y-2 pt-2 border-t border-[#F0F5F4]">
                          <div className="flex justify-between items-center text-xs text-[#6B7C7A]">
                            <span>Perolehan Poin</span>
                            <span className="inline-flex items-center gap-1 font-bold text-[#0B4F45] bg-[#D9F1EF] px-2 py-0.5 rounded-md border border-[#B7DFDA]">
                              <Coins size={11} className="text-[#0A7E76]" />
                              +{item.poinPerKg ?? 0} / kg
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-xs text-[#6B7C7A]">
                            <span>Estimasi Harga</span>
                            <span className="font-semibold text-[#1F2D2B]">
                              Rp {(item.hargaPerKg ?? 0).toLocaleString("id-ID")} / kg
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 pt-0">
                      <button
                        onClick={() => router.push(`/nasabah/setor?kategoriId=${item.id}`)}
                        className="w-full inline-flex items-center justify-center gap-1.5 bg-[#0B4F45] hover:bg-[#07352E] text-white font-semibold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
                      >
                        Setor Jenis Ini <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
