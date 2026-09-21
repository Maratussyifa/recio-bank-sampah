"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { hadiahApi, penukaranPoinApi, setorSampahApi } from "@/lib/apiClient";
import Navbar from "@/components/NavbarNasabah";
import Footer from "@/components/Footer";
import {
  Gift,
  Coins,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  PackageCheck,
  ShoppingBag,
  Sparkles,
  ImageIcon,
} from "lucide-react";

export default function NasabahTukarPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [listHadiah, setListHadiah] = useState<any[]>([]);
  const [totalPoin, setTotalPoin] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Gagal parse data user", e);
      }
    }

    const loadData = async () => {
      try {
        const [dataHadiah, dataSetor, dataPenukaran] = await Promise.all([
          hadiahApi.getAll().catch(() => []),
          setorSampahApi.getMySetor().catch(() => []),
          penukaranPoinApi.getMyPenukaran().catch(() => []),
        ]);

        const safeHadiah = Array.isArray(dataHadiah) ? dataHadiah : [];
        const safeSetor = Array.isArray(dataSetor) ? dataSetor : [];
        const safePenukaran = Array.isArray(dataPenukaran) ? dataPenukaran : [];

        setListHadiah(safeHadiah);

        const poinSetor = safeSetor.reduce((acc: number, item: any) => {
          const statusUpper = (item?.status || "").toUpperCase();
          if (
            statusUpper === "SELESAI" ||
            statusUpper === "SUCCESS" ||
            statusUpper === "COMPLETED"
          ) {
            return acc + (item.totalPoin || item.poin || item.poinDiterima || 0);
          }
          return acc;
        }, 0);

        const poinTukar = safePenukaran.reduce((acc: number, item: any) => {
          const statusUpper = (item?.status || "").toUpperCase();
          if (
            statusUpper === "SELESAI" ||
            statusUpper === "PENDING" ||
            statusUpper === "MENUNGGU" ||
            statusUpper === "SUCCESS" ||
            statusUpper === "COMPLETED"
          ) {
            return (
              acc + (item.totalPoin || item.poinDibutuhkan || item.poin || 0)
            );
          }
          return acc;
        }, 0);

        setTotalPoin(Math.max(0, poinSetor - poinTukar));
      } catch (err: any) {
        setErrorMsg("Gagal memuat katalog hadiah.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleTukar = async (item: any) => {
    const butuhPoin = item.poinDibutuhkan || item.poin || 0;

    if (totalPoin < butuhPoin) {
      setErrorMsg(
        `Poin tidak cukup. Kamu butuh ${butuhPoin} Poin untuk penukaran ini.`
      );
      return;
    }

    if (
      !confirm(
        `Yakin ingin menukarkan ${butuhPoin} poin dengan ${item.namaHadiah}?`
      )
    ) {
      return;
    }

    setErrorMsg("");
    setSuccessMsg("");
    setSubmittingId(item.id);

    try {
      const res = await penukaranPoinApi.tukar({
        hadiahId: item.id,
      });

      const newNotaId = res?.data?.id || res?.id || res?.kodeNota;

      setSuccessMsg(`Berhasil mengajukan penukaran ${item.namaHadiah}!`);
      setTotalPoin((prev) => Math.max(0, prev - butuhPoin));

      setTimeout(() => {
        if (newNotaId) {
          router.push(`/nasabah/riwayat/tukar/${newNotaId}`);
        } else {
          router.push("/nasabah/riwayat");
        }
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal mengajukan penukaran hadiah.");
    } finally {
      setSubmittingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F8F7]">
        <div className="flex items-center gap-3 text-[#0B4F45]">
          <Loader2 size={24} className="animate-spin text-[#0A7E76]" />
          <span className="font-medium text-sm">Memuat katalog hadiah...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F8F7] font-sans flex flex-col justify-between">
      <div>
        <Navbar user={user} />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 pb-12 space-y-6">
          <div className="relative bg-[#D9F1EF]/80 p-5 sm:p-6 rounded-2xl border border-[#B7DFDA] shadow-xs overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pr-16 sm:pr-24 z-10 relative">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-white text-[#0B4F45] shadow-xs flex items-center justify-center flex-shrink-0">
                  <Gift size={22} />
                </div>
                <div>
                  <h1 className="font-display text-lg sm:text-xl font-bold text-[#0B4F45]">
                    Katalog Hadiah
                  </h1>
                  <p className="text-xs text-[#4E6864] mt-0.5">
                    Tukarkan poin hasil penyetoran sampahmu dengan barang atau voucher menarik
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
                <div className="flex items-center gap-2 bg-white text-[#0B4F45] px-3.5 py-2 rounded-xl border border-[#B7DFDA] shadow-2xs">
                  <Coins size={16} className="text-[#0A7E76]" />
                  <span className="text-xs font-bold">
                    {totalPoin.toLocaleString("id-ID")} Poin
                  </span>
                </div>

                <button
                  onClick={() => router.push("/nasabah/dashboard")}
                  className="inline-flex items-center gap-2 text-xs font-semibold px-3.5 py-2 bg-white text-[#0B4F45] hover:bg-[#F4F8F7] rounded-xl border border-[#DCE7E5] shadow-2xs transition-all cursor-pointer"
                >
                  <ArrowLeft size={14} /> Kembali
                </button>
              </div>
            </div>

            <div className="pointer-events-none absolute -bottom-2 right-1 sm:right-4 w-24 sm:w-28 z-20 animate-bounce [animation-duration:3s]">
              <Image
                src="/karakter2.png"
                alt="Karakter Mascot Tukar Hadiah"
                width={130}
                height={130}
                className="w-full h-auto object-contain block filter drop-shadow-md"
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
              <CheckCircle2
                size={18}
                className="flex-shrink-0 text-[#00B8A9]"
              />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {listHadiah.length === 0 ? (
              <div className="col-span-full bg-white p-12 rounded-3xl border border-[#EAF0EE] text-center space-y-3">
                <ShoppingBag size={36} className="mx-auto text-[#B7C2C0]" />
                <p className="text-xs text-[#6B7C7A] font-medium">
                  Belum ada hadiah yang tersedia saat ini.
                </p>
              </div>
            ) : (
              listHadiah.map((item) => {
                const poinNeeded = item.poinDibutuhkan || item.poin || 0;
                const isOutOfStock = item.stok <= 0;
                const isPoinEnough = totalPoin >= poinNeeded;
                const fotoUrl = item.foto || item.gambar || item.imageUrl;

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-3xl border border-[#EAF0EE] flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md hover:-translate-y-1 transition-all group"
                  >
                    <div>
                      {/* Area Foto Hadiah */}
                      <div className="relative w-full h-44 bg-[#F4F8F7] flex items-center justify-center overflow-hidden border-b border-[#EAF0EE]">
                        {fotoUrl ? (
                          <img
                            src={fotoUrl}
                            alt={item.namaHadiah}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-[#B7C2C0] gap-1.5">
                            <ImageIcon size={32} />
                            <span className="text-[11px] font-medium">Tidak ada foto</span>
                          </div>
                        )}

                        <span className="absolute top-3 right-3 inline-flex items-center gap-1 text-[11px] font-semibold text-[#0B4F45] bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-full border border-[#DCE7E5] shadow-2xs">
                          <PackageCheck size={12} /> Stok: {item.stok}
                        </span>
                      </div>

                      {/* Detail Konten */}
                      <div className="p-5 space-y-3">
                        <div>
                          <h3 className="font-display font-semibold text-[#0B4F45] text-base leading-snug">
                            {item.namaHadiah}
                          </h3>
                          {item.deskripsi && (
                            <p className="text-xs text-[#6B7C7A] mt-1 line-clamp-2">
                              {item.deskripsi}
                            </p>
                          )}
                        </div>

                        <div className="pt-1">
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0B4F45] bg-[#D9F1EF] px-3 py-1.5 rounded-xl border border-[#B7DFDA]">
                            <Coins size={14} className="text-[#0A7E76]" />
                            {poinNeeded.toLocaleString("id-ID")} Poin
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 pt-0">
                      <button
                        disabled={
                          submittingId === item.id ||
                          isOutOfStock ||
                          !isPoinEnough
                        }
                        onClick={() => handleTukar(item)}
                        className={`w-full py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                          isOutOfStock
                            ? "bg-[#EAF0EE] text-[#94A3A1] border border-[#DCE7E5] cursor-not-allowed"
                            : !isPoinEnough
                            ? "bg-[#F4F8F7] text-[#6B7C7A] border border-[#DCE7E5] hover:bg-[#EAF0EE]"
                            : "bg-[#00B8A9] hover:bg-[#00A395] text-white shadow-xs"
                        }`}
                      >
                        {submittingId === item.id ? (
                          <>
                            <Loader2 size={14} className="animate-spin" /> Memproses...
                          </>
                        ) : isOutOfStock ? (
                          "Stok Habis"
                        ) : !isPoinEnough ? (
                          "Poin Tidak Cukup"
                        ) : (
                          <>
                            <Sparkles size={14} /> Tukar Hadiah
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}