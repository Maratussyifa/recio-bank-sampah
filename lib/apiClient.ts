const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://learn.smktelkom-mlg.sch.id/bank_sampah/api/v1";
const APP_KEY =
  process.env.NEXT_PUBLIC_APP_KEY || "ed3908cc-8717-4f42-a910-fea489ee14e0";

async function fetcher(endpoint: string, options: RequestInit = {}) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const headers: Record<string, string> = {
    "x-app-key": APP_KEY,
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  if (options.body && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
    cache: "no-store",
  });

  const data = await res.json();

  if (!res.ok || data.success === false) {
    throw new Error(
      data.message || `HTTP Error ${res.status}: Terjadi kesalahan pada server`,
    );
  }

  return data.data || data;
}

// ================================================================
// PATCH untuk apiClient.ts — ganti authApi.login & authApi.logout
// dengan versi ini. Bagian lain file (fetcher, nasabahAdminApi, dst.)
// TIDAK berubah, cukup replace dua fungsi ini.
// ================================================================

export const authApi = {
  login: async (credentials: Record<string, any>) => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

    const res = await fetcher("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    if (res.token) {
      const role = res.user?.role || res.role;

      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user || res));
      document.cookie = `token=${res.token}; path=/; max-age=86400`;

      // WAJIB di-set di sini juga — middleware.ts butuh cookie "role"
      // untuk lolos proteksi route. Kalau sebelumnya ini di-set manual
      // di halaman login, sekarang cukup andalkan authApi.login().
      if (role) {
        document.cookie = `role=${role}; path=/; max-age=86400`;
      }
    }
    return res;
  },

  registerNasabah: (data: FormData | Record<string, any>) =>
    fetcher("/auth/nasabah/register", {
      method: "POST",
      body: data instanceof FormData ? data : JSON.stringify(data),
    }),

  registerAdmin: (data: Record<string, any>) =>
    fetcher("/auth/admin/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getMe: () => fetcher("/auth/me"),

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // Cookie "token" DAN "role" dua-duanya harus dihapus —
    // middleware.ts mengecek keduanya untuk memutuskan redirect.
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    window.location.href = "/login";
  },
};

export const nasabahAdminApi = {
  getAll: () => fetcher("/admin/nasabah"),

  getById: (id: string) => fetcher(`/admin/nasabah/${id}`),

  create: (data: FormData | Record<string, any>) =>
    fetcher("/admin/nasabah", {
      method: "POST",
      body: data instanceof FormData ? data : JSON.stringify(data),
    }),

  update: (id: string, data: FormData | Record<string, any>) =>
    fetcher(`/admin/nasabah/${id}`, {
      method: "PUT",
      body: data instanceof FormData ? data : JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetcher(`/admin/nasabah/${id}`, {
      method: "DELETE",
    }),
};

export const kategoriSampahApi = {
  getAll: () => fetcher("/kategori-sampah"),

  getById: (id: string) => fetcher(`/kategori-sampah/${id}`),

  create: (
    data:
      | FormData
      | {
          namaKategori: string;
          hargaPerKg: number;
          poinPerKg: number;
          jenis: string;
        },
  ) =>
    fetcher("/kategori-sampah", {
      method: "POST",
      body: data instanceof FormData ? data : JSON.stringify(data),
    }),

  update: (
    id: string,
    data:
      | FormData
      | {
          namaKategori: string;
          hargaPerKg: number;
          poinPerKg: number;
          jenis: string;
        },
  ) =>
    fetcher(`/kategori-sampah/${id}`, {
      method: "PUT",
      body: data instanceof FormData ? data : JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetcher(`/kategori-sampah/${id}`, {
      method: "DELETE",
    }),
};

export const setorSampahApi = {
  createPengajuan: (payload: {
    tanggal: string;
    catatan?: string;
    items: { kategoriSampahId: string; beratKg: number }[];
  }) =>
    fetcher("/setor-sampah/pengajuan", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getMySetor: () => fetcher("/setor-sampah/my-setor"),

  getAllAdmin: () => fetcher("/setor-sampah/admin/list"),

  getDetail: (id: string) => fetcher(`/setor-sampah/${id}`),

  verifikasi: (
    id: string,
    payload: {
      status: "diverifikasi" | "selesai" | "ditolak";
      catatanAdmin?: string;
      itemsReal?: { kategoriSampahId: string; beratKgReal: number }[];
    },
  ) =>
    fetcher(`/setor-sampah/admin/verify/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
};

export const dashboardApi = {
  getSummary: () => fetcher("/dashboard/summary"),
  getStats: () => fetcher("/dashboard/stats"),
};

export const hadiahApi = {
  getAll: () => fetcher("/hadiah"),

  getById: (id: string) => fetcher(`/hadiah/${id}`),

  create: (
    data:
      | FormData
      | { namaHadiah: string; poinDibutuhkan: number; stok: number },
  ) =>
    fetcher("/hadiah", {
      method: "POST",
      body: data instanceof FormData ? data : JSON.stringify(data),
    }),

  update: (
    id: string,
    data:
      | FormData
      | { namaHadiah: string; poinDibutuhkan: number; stok: number },
  ) =>
    fetcher(`/hadiah/${id}`, {
      method: "PUT",
      body: data instanceof FormData ? data : JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetcher(`/hadiah/${id}`, {
      method: "DELETE",
    }),
};

export const penukaranPoinApi = {
  tukar: (payload: { hadiahId: string }) =>
    fetcher("/penukaran-poin/tukar", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getMyPenukaran: () => fetcher("/penukaran-poin/my-penukaran"),

  getAllAdmin: () => fetcher("/penukaran-poin/admin/list"),

  updateStatus: (id: string, status: string) =>
    fetcher(`/penukaran-poin/admin/status/${id}`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    }),

  getNota: (id: string) => fetcher(`/penukaran-poin/nota/${id}`),
};
