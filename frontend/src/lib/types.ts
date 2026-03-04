export interface User {
  id: number;
  email: string;
  role: "guest" | "author" | "admin";
  created_at?: string;
}

export interface Story {
  id: number;
  user_id: number;
  title: string;
  context_json: Record<string, any> | null;
  prototype_json: Record<string, any> | null;
  settings_json: Record<string, any> | null;
  status: string;
  created_at?: string;
  chapter_count: number;
}

export interface Chapter {
  id: number;
  story_id: number;
  chapter_num: number;
  content: string;
  debate_rounds: number;
  critic_score: number;
  quality_report: string;
  status: string;
  created_at?: string;
}

export interface QualityReport {
  final_score: number;
  rounds: number;
  objections: string[];
  verdict: string;
}

export interface DebateLog {
  round_num: number;
  writer_output: string;
  critic_output: string;
  arbiter_output: string;
}

export interface StoryContext {
  genre?: string;
  title_idea?: string;
  characters?: string;
  world?: string;
  themes?: string;
  tone?: string;
  additional_notes?: string;
}

export interface StorySettings {
  pov?: string;
  tone?: string;
  chapter_length?: string;
  style?: string;
}

export interface Prototype {
  synopsis?: string;
  characters?: Array<{
    name: string;
    role: string;
    description: string;
    arc: string;
  }>;
  world?: string;
  themes?: string[];
  tone?: string;
  act_structure?: Array<{
    act: number;
    summary: string;
  }>;
  chapter_outline?: Array<{
    chapter: number;
    title: string;
    summary: string;
  }>;
  raw?: string;
}

export interface AdminUser {
  id: number;
  email: string;
  role: string;
  created_at?: string;
  story_count: number;
}

export interface AdminStory {
  id: number;
  user_id: number;
  author_email: string;
  title: string;
  status: string;
  chapter_count: number;
  created_at?: string;
}
