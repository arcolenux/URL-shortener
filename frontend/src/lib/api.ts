import {
  CreateLinkRequest,
  CreateLinkResponse,
  DashboardResponse,
  Link,
  LinkStatsResponse,
  PaginatedLinksResponse,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

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
    const res = await fetch(`${API_BASE}/api/v1/links`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(request),
    });
    return await this.handleResponse<CreateLinkResponse>(res);
  }

  async listLinks(
    search?: string,
    status?: string,
    page: number = 0,
    size: number = 10
  ): Promise<PaginatedLinksResponse> {
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
  }

  async getDashboard(): Promise<DashboardResponse> {
    const res = await fetch(`${API_BASE}/api/v1/links/dashboard`, {
      method: "GET",
      headers: this.getHeaders(),
      cache: "no-store",
    });
    return await this.handleResponse<DashboardResponse>(res);
  }

  async getLink(code: string): Promise<Link> {
    const res = await fetch(`${API_BASE}/api/v1/links/${encodeURIComponent(code)}`, {
      method: "GET",
      headers: this.getHeaders(),
      cache: "no-store",
    });
    return await this.handleResponse<Link>(res);
  }

  async getStats(code: string): Promise<LinkStatsResponse> {
    const res = await fetch(`${API_BASE}/api/v1/links/${encodeURIComponent(code)}/stats`, {
      method: "GET",
      headers: this.getHeaders(),
      cache: "no-store",
    });
    return await this.handleResponse<LinkStatsResponse>(res);
  }

  async updateLink(code: string, url: string, expiresAt?: string | null): Promise<Link> {
    const res = await fetch(`${API_BASE}/api/v1/links/${encodeURIComponent(code)}`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify({ url, expiresAt }),
    });
    return await this.handleResponse<Link>(res);
  }

  async deleteLink(code: string): Promise<void> {
    const res = await fetch(`${API_BASE}/api/v1/links/${encodeURIComponent(code)}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${res.status}`);
    }
  }
}

export const api = new ApiClient();
