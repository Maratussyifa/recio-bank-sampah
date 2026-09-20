"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { authApi } from "@/lib/apiClient";
import {
  Leaf,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  Recycle,
  Coins,
  Gift,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const res: any = await authApi.login({ username, password });

      const userObj = res?.user || res?.data?.user || res?.result?.user;
      const token =
        res?.token ||
        res?.accessToken ||
        res?.data?.token ||
        res?.result?.token;

      const role = (
        userObj?.role ||
        res?.role ||
        res?.data?.role ||
        "NASABAH"
      ).toUpperCase();

      if (!token) {
        throw new Error("Token autentikasi tidak ditemukan dari server.");
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userObj || {}));

      document.cookie = `token=${token}; path=/; max-age=86400; SameSite=Lax`;
      document.cookie = `role=${role}; path=/; max-age=86400; SameSite=Lax`;

      if (role === "ADMIN") {
        window.location.href = "/admin/dashboard";
      } else {
        window.location.href = "/nasabah/dashboard";
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Login gagal. Cek koneksi backend & data akun kamu.";
      setErrorMsg(msg);
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
              Selamat datang kembali di{" "}
              <span className="text-[#0A7E76]">Recio</span>.
            </h2>
          </div>

          <div className="space-y-3 pt-1 border-t border-[#DCE7E5]/60">
            <div className="flex items-center gap-3">
              <div className={iconChip}>
                <Recycle size={16} />
              </div>
              <div>
                <p className="text-xs font-medium text-[#3E5250]">
                  Setor sampah daur ulang
                </p>
                <p className="text-[11px] text-[#6B7C7A]">
                  Ajukan lewat aplikasi, tinggal antar ke unit terdekat
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className={iconChip}>
                <Coins size={16} />
              </div>
              <div>
                <p className="text-xs font-medium text-[#3E5250]">
                  Kumpulkan poin otomatis
                </p>
                <p className="text-[11px] text-[#6B7C7A]">
                  Poin masuk begitu admin selesai verifikasi timbangan
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className={iconChip}>
                <Gift size={16} />
              </div>
              <div>
                <p className="text-xs font-medium text-[#3E5250]">
                  Tukar dengan hadiah
                </p>
                <p className="text-[11px] text-[#6B7C7A]">
                  Voucher, sembako, hingga merchandise
                </p>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-[#6B7C7A] pt-2" style={{ maxWidth: "85%" }}>
            © {new Date().getFullYear()} Recio. Untuk lingkungan yang lebih baik.
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
              Masuk ke akunmu
            </h1>
            <p className="text-sm text-[#6B7C7A] mt-1">
              Eco-Waste Management System
            </p>
          </div>

          {errorMsg && (
            <div className="mb-5 p-3.5 bg-[#FBEAE5] border border-[#F0CFC5] rounded-xl flex items-start gap-2.5">
              <AlertCircle size={17} className="text-[#C1573A] flex-shrink-0 mt-0.5" />
              <p className="text-sm text-[#B3522F]">{errorMsg}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className={labelBase}>Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username"
                className={inputBase}
              />
            </div>

            <div>
              <label className={labelBase}>Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#0B4F45] hover:bg-[#07352E] text-white font-semibold rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2 flex items-center justify-center gap-2 shadow-md hover:shadow-lg cursor-pointer"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? "Memproses..." : "Masuk"}
            </button>
          </form>

          <p className="text-center text-sm text-[#6B7C7A] mt-6">
            Belum punya akun?{" "}
            <button
              onClick={() => router.push("/register")}
              className="text-[#0B4F45] font-semibold hover:underline cursor-pointer"
            >
              Daftar di sini
            </button>
          </p>
        </div>
      </div>
    </main>
  );
}