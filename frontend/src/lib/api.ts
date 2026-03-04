const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

class ApiClient {
  private getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
  }

  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(error.detail || "API request failed");
    }

    if (res.status === 204) return undefined as T;

    const contentType = res.headers.get("content-type");
    if (contentType?.includes("text/")) {
      return (await res.text()) as T;
    }

    return res.json();
  }

  // Auth
  async register(email: string, password: string) {
    return this.request<{ id: number; email: string; role: string }>(
      "/auth/register",
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }
    );
  }

  async login(email: string, password: string) {
    const data = await this.request<{
      access_token: string;
      token_type: string;
    }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (typeof window !== "undefined") {
      localStorage.setItem("token", data.access_token);
    }
    return data;
  }

  async getMe() {
    return this.request<{
      id: number;
      email: string;
      role: string;
      created_at: string;
    }>("/auth/me");
  }

  // Stories
  async createStory(title: string, context: object, settings: object) {
    return this.request<any>("/story", {
      method: "POST",
      body: JSON.stringify({ title, context, settings }),
    });
  }

  async getStories() {
    return this.request<any[]>("/story");
  }

  async getStory(id: number) {
    return this.request<any>(`/story/${id}`);
  }

  async updateStory(id: number, data: object) {
    return this.request<any>(`/story/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteStory(id: number) {
    return this.request<void>(`/story/${id}`, { method: "DELETE" });
  }

  // Prototype
  async generatePrototype(storyId: number) {
    return this.request<{ story_id: number; prototype: object }>(
      `/story/${storyId}/prototype`,
      { method: "POST" }
    );
  }

  // Chapters
  async generateChapter(storyId: number, chapterNum: number) {
    return this.request<any>(`/story/${storyId}/chapter`, {
      method: "POST",
      body: JSON.stringify({ chapter_num: chapterNum }),
    });
  }

  async getChapters(storyId: number) {
    return this.request<any[]>(`/story/${storyId}/chapter`);
  }

  async getDebateLogs(storyId: number, chapterId: number) {
    return this.request<any[]>(`/story/${storyId}/chapter/${chapterId}/debate-logs`);
  }

  // Export
  async exportStory(storyId: number) {
    return this.request<string>(`/story/${storyId}/export`);
  }

  // Admin
  async getUsers() {
    return this.request<any[]>("/admin/users");
  }

  async deleteUser(userId: number) {
    return this.request<void>(`/admin/users/${userId}`, { method: "DELETE" });
  }

  async getAdminStories() {
    return this.request<any[]>("/admin/stories");
  }
}

export const api = new ApiClient();
