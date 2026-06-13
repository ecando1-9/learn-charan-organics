export type CourseLevel = "Beginner" | "Intermediate" | "Advanced";

export type Lesson = {
  slug: string;
  title: string;
  duration: string;
  preview?: boolean;
  completed?: boolean;
  videoId: string;
  resources: string[];
};

export type Module = {
  title: string;
  lessons: Lesson[];
};

export type Course = {
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
};
