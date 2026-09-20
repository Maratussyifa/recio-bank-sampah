"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { authApi } from "@/lib/apiClient";
import Navbar from "@/components/NavbarNasabah";
import Footer from "@/components/Footer";
import {
  User,
  AtSign,
  Phone,
  MapPin,
  Loader2,
  AlertCircle,
  ShieldCheck,
  ArrowLeft,
  Info,
  Calendar,
  Coins,
} from "lucide-react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://learn.smktelkom-mlg.sch.id/bank_sampah/api/v1";
const FILE_BASE_URL = API_BASE_URL.replace(/\/api\/v1\/?$/, "");

function buildFotoUrl(path?: string | null): string | null {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${FILE_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

function formatTanggal(value?: string | null) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

export default function DetailProfilNasabahPage() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [username, setUsername] = useState("");
  const [nama, setNama] = useState("");
  const [noHp, setNoHp] = useState("");
  const [alamat, setAlamat] = useState("");
  const [saldoPoin, setSaldoPoin] = useState<number | null>(null);
  const [bergabungSejak, setBergabungSejak] = useState<string | null>(null);
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);

  useEffect(() => {
    authApi
      .getMe()
      .then((res) => {
        const userData = res?.data || res;
        const detail = userData?.nasabah || {};

        setUser(userData);
        setUsername(userData.username || "");
        setNama(detail.namaNasabah || userData.username || "");
        setNoHp(detail.telp || "");
        setAlamat(detail.alamat || "");
        setSaldoPoin(typeof detail.saldoPoin === "number" ? detail.saldoPoin : null);
        setBergabungSejak(userData.createdAt || detail.createdAt || null);
        setFotoUrl(buildFotoUrl(detail.foto || detail.fotoUrl));
      })
      .catch(() => setErrorMsg("Gagal memuat detail profil nasabah."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F8F7]">
        <div className="flex items-center gap-3 text-[#0B4F45]">
          <Loader2 size={24} className="animate-spin text-[#0A7E76]" />
          <span className="font-medium text-sm">Memuat profil...</span>
        </div>
      </div>
    );
  }

  const infoItems = [
    { icon: AtSign, label: "Username (Login)", value: username || "-" },
    { icon: Phone, label: "Nomor Telepon / WhatsApp", value: noHp || "Belum diisi" },
    { icon: MapPin, label: "Alamat Lengkap", value: alamat || "Belum diisi" },
    { icon: Calendar, label: "Bergabung Sejak", value: formatTanggal(bergabungSejak) },
  ];

  return (
    <div className="min-h-screen bg-[#F4F8F7] font-sans flex flex-col justify-between">
      <div>
        <Navbar user={user} />

        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 pb-12 space-y-6">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-[#EAF0EE] shadow-xs">
            <button
              onClick={() => router.push("/nasabah/dashboard")}
              className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 bg-[#F4F8F7] text-[#0B4F45] hover:bg-[#EAF0EE] rounded-xl border border-[#DCE7E5] transition-all cursor-pointer"
            >
              <ArrowLeft size={14} /> Kembali ke Dashboard
            </button>
            <span className="text-xs text-[#6B7C7A] font-medium">Profil Saya</span>
          </div>

          {errorMsg && (
            <div className="p-4 bg-[#FBEAE5] border border-[#F0CFC5] text-[#B3522F] text-xs sm:text-sm rounded-2xl flex items-center gap-3">
              <AlertCircle size={18} className="flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#EAF0EE] shadow-sm space-y-8">
            <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-[#EAF0EE]">
              <div className="w-24 h-24 rounded-full bg-[#D9F1EF] border-2 border-[#00B8A9] relative overflow-hidden flex items-center justify-center shadow-xs flex-shrink-0">
                {fotoUrl ? (
                  <Image src={fotoUrl} alt="Foto Profil" fill className="object-cover" />
                ) : (
                  <User size={40} className="text-[#0B4F45]" />
                )}
              </div>

              <div className="text-center sm:text-left space-y-1">
                <h1 className="font-display text-xl font-bold text-[#0B4F45]">
                  {nama || "Nasabah Bank Sampah"}
                </h1>
                <p className="text-xs text-[#6B7C7A] flex items-center justify-center sm:justify-start gap-1">
                  <ShieldCheck size={14} className="text-[#00B8A9]" /> Akun Nasabah Terverifikasi
                </p>
                {saldoPoin !== null && (
                  <p className="text-xs font-semibold text-[#0B4F45] flex items-center justify-center sm:justify-start gap-1 pt-1">
                    <Coins size={13} className="text-[#00B8A9]" />
                    {saldoPoin.toLocaleString("id-ID")} poin
                  </p>
                )}
              </div>
            </div>

            <div className="p-4 bg-[#EAF6F4] border border-[#B7DFDA] text-[#0B4F45] text-xs sm:text-sm rounded-2xl flex items-start gap-3">
              <Info size={18} className="flex-shrink-0 mt-0.5" />
              <span>
                Data profil ini hanya bisa diubah oleh admin bank sampah. Kalau ada data yang
                perlu diperbarui (nomor telepon, alamat, atau foto), silakan hubungi admin di
                unit bank sampah kamu.
              </span>
            </div>

            <div className="space-y-1">
              {infoItems.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-3 py-3.5 border-b border-[#F0F5F4] last:border-b-0"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#F4F8F7] border border-[#EAF0EE] text-[#6B7C7A] flex items-center justify-center flex-shrink-0">
                    <item.icon size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium text-[#94A3A1]">{item.label}</p>
                    <p className="text-sm text-[#1F2D2B] break-words">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}