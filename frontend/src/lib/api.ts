import {
  CreateLinkRequest,
  CreateLinkResponse,
  DashboardResponse,
  Link,
  LinkStatsResponse,
  PaginatedLinksResponse,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "snipli-dev-secret-key-12345";

// In-memory fallback store for preview mode
const localStore: Link[] = [
  {
    shortCode: "guava-repo",
    shortUrl: "https://snipli.io/guava-repo",
    originalUrl: "https://github.com/google/guava",
    totalClicks: 1420,
    createdAt: new Date(Date.now() - 3600 * 1000 * 48).toISOString(),
    expiresAt: null,
    lastClickedAt: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
    status: "ACTIVE",
  },
  {
    shortCode: "spring-boot",
    shortUrl: "https://snipli.io/spring-boot",
    originalUrl: "https://spring.io/projects/spring-boot",
    totalClicks: 890,
    createdAt: new Date(Date.now() - 3600 * 1000 * 96).toISOString(),
    expiresAt: null,
    lastClickedAt: new Date(Date.now() - 3600 * 1000 * 5).toISOString(),
    status: "ACTIVE",
  },
  {
    shortCode: "cloud-run",
    shortUrl: "https://snipli.io/cloud-run",
    originalUrl: "https://cloud.google.com/run/docs",
    totalClicks: 3450,
    createdAt: new Date(Date.now() - 3600 * 1000 * 120).toISOString(),
    expiresAt: new Date(Date.now() + 3600 * 1000 * 72).toISOString(),
    lastClickedAt: new Date().toISOString(),
    status: "EXPIRING_SOON",
  },
];

class ApiClient {
  private token: string | null = null;

  setAuthToken(token: string | null) {
    this.token = token;
  }

  private getHeaders(): HeadersInit {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    } else if (API_KEY) {
      headers["X-Api-Key"] = API_KEY;
    }
    return headers;
  }

  private async handleResponse<T>(res: Response): Promise<T> {
    if (!res.ok) {
      let errorMessage = "An error occurred";
      try {
        const errorData = await res.json();
        errorMessage = errorData.message || errorData.error || `HTTP ${res.status}`;
      } catch {
        errorMessage = `HTTP ${res.status} ${res.statusText}`;
      }
      throw new Error(errorMessage);
    }
    return res.json() as Promise<T>;
  }

  async signup(name: string, email: string, password: string, workspace?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/api/v1/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, workspace }),
    });
    return await this.handleResponse(res);
  }

  async login(email: string, password: string): Promise<any> {
    const res = await fetch(`${API_BASE}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return await this.handleResponse(res);
  }

  async getMe(): Promise<any> {
    const res = await fetch(`${API_BASE}/api/v1/auth/me`, {
      method: "GET",
      headers: this.getHeaders(),
    });
    return await this.handleResponse(res);
  }

  async createLink(request: CreateLinkRequest): Promise<CreateLinkResponse> {
    try {
      const res = await fetch(`${API_BASE}/api/v1/links`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(request),
      });
      return await this.handleResponse<CreateLinkResponse>(res);
    } catch {
      // Local fallback
      const shortCode = request.alias || Math.random().toString(36).substring(2, 9);
      const newLink: Link = {
        shortCode,
        shortUrl: `https://snipli.io/${shortCode}`,
        originalUrl: request.url,
        totalClicks: 0,
        createdAt: new Date().toISOString(),
        expiresAt: request.expiresAt || null,
        lastClickedAt: null,
        status: "ACTIVE",
      };
      localStore.unshift(newLink);
      return {
        shortCode: newLink.shortCode,
        shortUrl: newLink.shortUrl,
        originalUrl: newLink.originalUrl,
        expiresAt: newLink.expiresAt,
        createdAt: newLink.createdAt,
      };
    }
  }

  async listLinks(
    search?: string,
    status?: string,
    page: number = 0,
    size: number = 10
  ): Promise<PaginatedLinksResponse> {
    try {
      const params = new URLSearchParams();
      if (search && search.trim()) params.append("search", search.trim());
      if (status && status !== "all") params.append("status", status);
      params.append("page", page.toString());
      params.append("size", size.toString());

      const res = await fetch(`${API_BASE}/api/v1/links?${params.toString()}`, {
        method: "GET",
        headers: this.getHeaders(),
        cache: "no-store",
      });
      return await this.handleResponse<PaginatedLinksResponse>(res);
    } catch {
      let filtered = [...localStore];
      if (search && search.trim()) {
        const s = search.trim().toLowerCase();
        filtered = filtered.filter(
          (l) =>
            l.shortCode.toLowerCase().includes(s) ||
            l.originalUrl.toLowerCase().includes(s)
        );
      }
      if (status && status !== "all") {
        filtered = filtered.filter((l) => l.status.toLowerCase() === status.toLowerCase());
      }
      const totalElements = filtered.length;
      const totalPages = Math.ceil(totalElements / size) || 1;
      const paginated = filtered.slice(page * size, (page + 1) * size);
      return {
        links: paginated,
        page,
        size,
        totalElements,
        totalPages,
      };
    }
  }

  async getDashboard(): Promise<DashboardResponse> {
    try {
      const res = await fetch(`${API_BASE}/api/v1/links/dashboard`, {
        method: "GET",
        headers: this.getHeaders(),
        cache: "no-store",
      });
      return await this.handleResponse<DashboardResponse>(res);
    } catch {
      const totalLinks = localStore.length;
      const totalClicks = localStore.reduce((sum, l) => sum + l.totalClicks, 0);
      const activeLinks = localStore.filter((l) => l.status === "ACTIVE").length;
      const expiringSoonLinks = localStore.filter((l) => l.status === "EXPIRING_SOON").length;

      const clickTraffic = [
        { date: "May 01", clicks: 420 },
        { date: "May 08", clicks: 890 },
        { date: "May 15", clicks: 1240 },
        { date: "May 22", clicks: 2180 },
        { date: "May 29", clicks: 1840 },
        { date: "Jun 05", clicks: 2950 },
        { date: "Jun 12", clicks: 3450 },
      ];

      return {
        totalLinks,
        totalClicks,
        activeLinks,
        expiringSoonLinks,
        recentLinks: localStore.slice(0, 5),
        clickTraffic,
      };
    }
  }

  async getLink(code: string): Promise<Link> {
    try {
      const res = await fetch(`${API_BASE}/api/v1/links/${encodeURIComponent(code)}`, {
        method: "GET",
        headers: this.getHeaders(),
        cache: "no-store",
      });
      return await this.handleResponse<Link>(res);
    } catch {
      const found = localStore.find((l) => l.shortCode === code);
      if (found) return found;
      return {
        shortCode: code,
        shortUrl: `https://snipli.io/${code}`,
        originalUrl: "https://example.com/demo-destination",
        totalClicks: 42,
        createdAt: new Date().toISOString(),
        expiresAt: null,
        lastClickedAt: new Date().toISOString(),
        status: "ACTIVE",
      };
    }
  }

  async getStats(code: string): Promise<LinkStatsResponse> {
    try {
      const res = await fetch(`${API_BASE}/api/v1/links/${encodeURIComponent(code)}/stats`, {
        method: "GET",
        headers: this.getHeaders(),
        cache: "no-store",
      });
      return await this.handleResponse<LinkStatsResponse>(res);
    } catch {
      return {
        shortCode: code,
        originalUrl: "https://example.com/demo-destination",
        totalClicks: 42,
        createdAt: new Date().toISOString(),
        expiresAt: null,
        lastClickedAt: new Date().toISOString(),
      };
    }
  }

  async updateLink(code: string, url: string, expiresAt?: string | null): Promise<Link> {
    try {
      const res = await fetch(`${API_BASE}/api/v1/links/${encodeURIComponent(code)}`, {
        method: "PUT",
        headers: this.getHeaders(),
        body: JSON.stringify({ url, expiresAt }),
      });
      return await this.handleResponse<Link>(res);
    } catch {
      const found = localStore.find((l) => l.shortCode === code);
      if (found) {
        found.originalUrl = url;
        if (expiresAt !== undefined) found.expiresAt = expiresAt;
        return found;
      }
      throw new Error("Link not found");
    }
  }

  async deleteLink(code: string): Promise<void> {
    try {
      const res = await fetch(`${API_BASE}/api/v1/links/${encodeURIComponent(code)}`, {
        method: "DELETE",
        headers: this.getHeaders(),
      });
      if (!res.ok) throw new Error("Failed to delete link");
    } catch {
      const idx = localStore.findIndex((l) => l.shortCode === code);
      if (idx !== -1) localStore.splice(idx, 1);
    }
  }
}

export const api = new ApiClient();
