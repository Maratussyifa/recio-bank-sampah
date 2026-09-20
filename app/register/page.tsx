"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { authApi } from "@/lib/apiClient";
import {
  Leaf,
  User,
  Building2,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Recycle,
  Coins,
  Gift,
  Upload,
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<"NASABAH" | "ADMIN">("NASABAH");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [formNasabah, setFormNasabah] = useState({
    username: "",
    password: "",
    namaNasabah: "",
    alamat: "",
    telp: "",
  });

  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);

  const [formAdmin, setFormAdmin] = useState({
    username: "",
    password: "",
    namaUnit: "",
    namaPengelola: "",
    telp: "",
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (fotoPreview) {
        URL.revokeObjectURL(fotoPreview);
      }
      setFotoFile(file);
      setFotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    try {
      if (role === "NASABAH") {
        const formData = new FormData();
        formData.append("username", formNasabah.username);
        formData.append("password", formNasabah.password);
        formData.append("namaNasabah", formNasabah.namaNasabah);
        formData.append("alamat", formNasabah.alamat);
        formData.append("telp", formNasabah.telp);

        if (fotoFile) {
          formData.append("foto", fotoFile);
        }

        await authApi.registerNasabah(formData);
        setSuccessMsg("Registrasi Nasabah berhasil! Silakan login.");

        if (fotoPreview) URL.revokeObjectURL(fotoPreview);
        setFotoFile(null);
        setFotoPreview(null);
      } else {
        await authApi.registerAdmin(formAdmin);
        setSuccessMsg("Pendaftaran Unit Admin berhasil! Silakan login.");
      }
      setTimeout(() => router.push("/login"), 1500);
    } catch (err: any) {
      setErrorMsg(err?.message || "Registrasi gagal, periksa data kamu.");
    } finally {
      setLoading(false);
    }
  };

  const inputBase =
    "w-full px-4 py-2.5 bg-white border border-[#DCE7E5] rounded-xl text-[#1F2D2B] placeholder:text-[#9AAEAB] focus:outline-none focus:ring-2 focus:ring-[#00B8A9]/30 focus:border-[#00B8A9] transition-colors";
  const labelBase = "block text-sm font-medium text-[#3E5250] mb-1.5";
  const iconChip =
    "w-8 h-8 rounded-xl bg-[#D9F1EF] flex items-center justify-center text-[#0B4F45] flex-shrink-0";

  return (
    <main className="min-h-screen flex bg-[#F4F8F7]">
      <svg width="0" height="0" className="absolute">
        <defs>
          <clipPath id="heroWaveClip" clipPathUnits="objectBoundingBox">
            <path d="M0,0 H0.88 C0.72,0.18 1,0.38 0.84,0.55 C0.72,0.68 0.96,0.82 0.82,1 H0 Z" />
          </clipPath>
        </defs>
      </svg>

      <div
        className="hidden lg:flex lg:w-[48%] relative p-8 flex-col justify-between overflow-hidden"
        style={{ clipPath: "url(#heroWaveClip)" }}
      >
        <Image
          src="/hero.jpg"
          alt="Recio Daur Ulang"
          fill
          priority
          className="object-cover object-center"
        />

        <div className="absolute inset-0 bg-gradient-to-b from-[#07352E]/80 via-[#0B4F45]/55 to-[#07352E]/85" />
        <div className="absolute inset-0 bg-[#0B4F45]/25" />

        <svg
          className="absolute -right-16 top-24 opacity-40 pointer-events-none"
          width="260"
          height="260"
          viewBox="0 0 260 260"
          fill="none"
        >
          <circle cx="130" cy="130" r="129" stroke="white" strokeOpacity="0.35" />
          <circle cx="130" cy="130" r="95" stroke="white" strokeOpacity="0.25" />
        </svg>

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex items-center gap-2.5 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 shadow-sm">
            <div className="w-7 h-7 rounded-full bg-[#0B4F45] flex items-center justify-center">
              <Leaf size={15} className="text-white" />
            </div>
            <span className="font-display font-semibold text-base tracking-tight text-[#0B4F45]">
              Recio
            </span>
          </div>
        </div>

        <div className="relative z-10 bg-white/90 backdrop-blur-md border border-white/60 p-6 rounded-3xl shadow-2xl shadow-black/10 space-y-4">
          <div className="h-1 w-10 rounded-full bg-[#00B8A9]" />
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#0A7E76]">
              Bank Sampah Digital
            </span>
            <h2 className="font-display text-xl font-semibold text-[#0B4F45] leading-snug mt-1">
              Ubah sampah jadi{" "}
              <span className="text-[#0A7E76]">poin bernilai</span>, mulai
              hari ini.
            </h2>
          </div>

          <div className="space-y-3 pt-1 border-t border-[#DCE7E5]/60">
            <div className="flex items-center gap-3">
              <div className={iconChip}>
                <Recycle size={16} />
              </div>
              <div>
                <p className="text-xs font-medium text-[#3E5250]">
                  Setor sampah daur ulang terpilah mudah
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className={iconChip}>
                <Coins size={16} />
              </div>
              <div>
                <p className="text-xs font-medium text-[#3E5250]">
                  Verifikasi cepat & poin langsung bertambah
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className={iconChip}>
                <Gift size={16} />
              </div>
              <div>
                <p className="text-xs font-medium text-[#3E5250]">
                  Tukar poin dengan berbagai jenis hadiah
                </p>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-[#6B7C7A] pt-2" style={{ maxWidth: "85%" }}>
            © {new Date().getFullYear()} Recio. Dibuat untuk lingkungan bersih.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md bg-white lg:border lg:border-[#EAF0EE] lg:shadow-xl lg:shadow-[#0B4F45]/5 lg:rounded-3xl lg:p-9 p-0">
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="w-9 h-9 rounded-lg bg-[#0B4F45] flex items-center justify-center">
              <Leaf size={19} className="text-white" />
            </div>
            <span className="font-display font-semibold text-lg text-[#0B4F45]">
              Recio
            </span>
          </div>

          <div className="mb-7">
            <h1 className="font-display text-2xl font-semibold text-[#0B4F45]">
              Buat akun baru
            </h1>
            <p className="text-sm text-[#6B7C7A] mt-1">
              Daftar sebagai nasabah atau daftarkan unit bank sampahmu
            </p>
          </div>

          <div className="flex bg-[#F4F8F7] border border-[#DCE7E5] p-1 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => setRole("NASABAH")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                role === "NASABAH"
                  ? "bg-[#0B4F45] text-white shadow-sm"
                  : "text-[#6B7C7A] hover:text-[#0B4F45]"
              }`}
            >
              <User size={15} />
              Nasabah
            </button>
            <button
              type="button"
              onClick={() => setRole("ADMIN")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                role === "ADMIN"
                  ? "bg-[#0B4F45] text-white shadow-sm"
                  : "text-[#6B7C7A] hover:text-[#0B4F45]"
              }`}
            >
              <Building2 size={15} />
              Admin Unit
            </button>
          </div>

          {errorMsg && (
            <div className="mb-5 p-3.5 bg-[#FBEAE5] border border-[#F0CFC5] rounded-xl flex items-start gap-2.5">
              <AlertCircle size={17} className="text-[#C1573A] flex-shrink-0 mt-0.5" />
              <p className="text-sm text-[#B3522F]">{errorMsg}</p>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-3.5 bg-[#D9F1EF] border border-[#B7DFDA] rounded-xl flex items-start gap-2.5">
              <CheckCircle2 size={17} className="text-[#0B4F45] flex-shrink-0 mt-0.5" />
              <p className="text-sm text-[#0B4F45]">{successMsg}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={labelBase}>Username</label>
              <input
                type="text"
                required
                value={role === "NASABAH" ? formNasabah.username : formAdmin.username}
                onChange={(e) =>
                  role === "NASABAH"
                    ? setFormNasabah({ ...formNasabah, username: e.target.value })
                    : setFormAdmin({ ...formAdmin, username: e.target.value })
                }
                placeholder="Username unik"
                className={inputBase}
              />
            </div>

            <div>
              <label className={labelBase}>Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={role === "NASABAH" ? formNasabah.password : formAdmin.password}
                  onChange={(e) =>
                    role === "NASABAH"
                      ? setFormNasabah({ ...formNasabah, password: e.target.value })
                      : setFormAdmin({ ...formAdmin, password: e.target.value })
                  }
                  placeholder="Minimal 6 karakter"
                  className={`${inputBase} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9AAEAB] hover:text-[#3E5250]"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {role === "NASABAH" ? (
              <>
                <div>
                  <label className={labelBase}>Nama Lengkap</label>
                  <input
                    type="text"
                    required
                    value={formNasabah.namaNasabah}
                    onChange={(e) =>
                      setFormNasabah({ ...formNasabah, namaNasabah: e.target.value })
                    }
                    placeholder="Nama nasabah"
                    className={inputBase}
                  />
                </div>
                <div>
                  <label className={labelBase}>Alamat</label>
                  <input
                    type="text"
                    required
                    value={formNasabah.alamat}
                    onChange={(e) =>
                      setFormNasabah({ ...formNasabah, alamat: e.target.value })
                    }
                    placeholder="Alamat domisili"
                    className={inputBase}
                  />
                </div>
                <div>
                  <label className={labelBase}>Foto Profil (JPG/PNG)</label>
                  <div className="flex items-center gap-4">
                    {fotoPreview ? (
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-[#DCE7E5] flex-shrink-0">
                        <Image
                          src={fotoPreview}
                          alt="Preview Foto"
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-[#F4F8F7] border border-dashed border-[#9AAEAB] flex items-center justify-center flex-shrink-0 text-[#9AAEAB]">
                        <User size={24} />
                      </div>
                    )}
                    <label className="flex-1 cursor-pointer bg-white border border-[#DCE7E5] hover:border-[#00B8A9] px-4 py-2.5 rounded-xl text-xs font-medium text-[#3E5250] flex items-center justify-center gap-2 transition-colors">
                      <Upload size={15} className="text-[#0B4F45]" />
                      <span className="truncate">
                        {fotoFile ? fotoFile.name : "Pilih foto profil"}
                      </span>
                      <input
                        type="file"
                        accept="image/png, image/jpeg"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className={labelBase}>Nama Unit Bank Sampah</label>
                  <input
                    type="text"
                    required
                    value={formAdmin.namaUnit}
                    onChange={(e) =>
                      setFormAdmin({ ...formAdmin, namaUnit: e.target.value })
                    }
                    placeholder="Contoh: Bank Sampah Asri Jaya"
                    className={inputBase}
                  />
                </div>
                <div>
                  <label className={labelBase}>Nama Pengelola</label>
                  <input
                    type="text"
                    required
                    value={formAdmin.namaPengelola}
                    onChange={(e) =>
                      setFormAdmin({ ...formAdmin, namaPengelola: e.target.value })
                    }
                    placeholder="Nama penanggung jawab"
                    className={inputBase}
                  />
                </div>
              </>
            )}

            <div>
              <label className={labelBase}>Nomor Telepon / WA</label>
              <input
                type="text"
                required
                value={role === "NASABAH" ? formNasabah.telp : formAdmin.telp}
                onChange={(e) =>
                  role === "NASABAH"
                    ? setFormNasabah({ ...formNasabah, telp: e.target.value })
                    : setFormAdmin({ ...formAdmin, telp: e.target.value })
                }
                placeholder="081234567890"
                className={inputBase}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#0B4F45] hover:bg-[#07352E] text-white font-semibold rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2 flex items-center justify-center gap-2 shadow-md hover:shadow-lg cursor-pointer"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? "Memproses..." : "Daftar Sekarang"}
            </button>
          </form>

          <p className="text-center text-sm text-[#6B7C7A] mt-6">
            Sudah punya akun?{" "}
            <button
              onClick={() => router.push("/login")}
              className="text-[#0B4F45] font-semibold hover:underline cursor-pointer"
            >
              Masuk di sini
            </button>
          </p>
        </div>
      </div>
    </main>
  );
}