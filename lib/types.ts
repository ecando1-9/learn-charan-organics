export type CourseLevel = "Beginner" | "Intermediate" | "Advanced";

export type Lesson = {
  slug: string;
  title: string;
  duration: string;
  is_preview?: boolean;
  completed?: boolean;
  videoId: string;
  bunnyVideoId?: string;
  bunnyLibraryId?: string;
  resources: string[];
};

export type Module = {
  title: string;
  lessons: Lesson[];
};

export type Course = {
  id?: string;
  slug: string;
  title: string;
  category: string;
  instructor: string;
  rating: number;
  students: number;
  duration: string;
  level: CourseLevel;
  language: string;
  price: number;
  thumbnail: string;
  youtubeUrl?: string;
  pdfUrl?: string;
  description: string;
  outcomes: string[];
  materials: string[];
  modules: Module[];
  featured?: boolean;
  trending?: boolean;
  isEnrolled?: boolean;
  createdAt?: string;
};

export type FreeClass = {
  id: string;
  title: string;
  description: string | null;
  youtube_video_id: string;
  thumbnail_url: string | null;
  sort_order: number;
  published: boolean;
  created_at: string;
};

export type Group = {
  id: string;
  name: string;
  description: string | null;
  cover_image_url: string | null;
  created_by: string | null;
  created_at: string;
  member_count?: number;
};

export type GroupMember = {
  id: string;
  group_id: string;
  user_id: string;
  joined_at: string;
  profile?: {
    full_name: string | null;
    email: string;
    avatar_url: string | null;
  };
};

export type GroupMessage = {
  id: string;
  group_id: string;
  user_id: string;
  body: string;
  resource_link: string | null;
  file_url?: string | null;
  file_name?: string | null;
  file_type?: string | null;
  created_at: string;
  profile?: {
    full_name: string | null;
    email: string;
    avatar_url: string | null;
  };
};
