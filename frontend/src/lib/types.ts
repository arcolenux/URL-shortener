export interface Link {
  shortCode: string;
  shortUrl: string;
  originalUrl: string;
  totalClicks: number;
  createdAt: string;
  expiresAt: string | null;
  lastClickedAt: string | null;
  status: "ACTIVE" | "EXPIRED" | "EXPIRING_SOON";
}

export interface CreateLinkRequest {
  url: string;
  alias?: string;
  expiresAt?: string | null;
}

export interface CreateLinkResponse {
  shortCode: string;
  shortUrl: string;
  originalUrl: string;
  expiresAt: string | null;
  createdAt: string;
}

export interface LinkStatsResponse {
  shortCode: string;
  originalUrl: string;
  totalClicks: number;
  createdAt: string;
  expiresAt: string | null;
  lastClickedAt: string | null;
}

export interface DailyClickPoint {
  date: string;
  clicks: number;
}

export interface DashboardResponse {
  totalLinks: number;
  totalClicks: number;
  activeLinks: number;
  expiringSoonLinks: number;
  recentLinks: Link[];
  clickTraffic: DailyClickPoint[];
}

export interface PaginatedLinksResponse {
  links: Link[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface ApiError {
  error: string;
  message: string;
  timestamp?: string;
  status?: number;
}
