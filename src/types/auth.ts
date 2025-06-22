import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      username: string;
      firstName: string;
      lastName: string;
      bio: string;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    bio: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    bio: string;
  }
}

export interface UserData {
  _id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  bio?: string;
}

export interface CourseData {
  _id?: string;
  user_id: string;
  author_name?: string;
  author_username?: string;
  title: string;
  description: string;
  language: string;
  chapters: Chapter[];
  topic: string;
  is_public?: boolean;
  install_count?: number;
  likes?: string[];
  like_count?: number;
  original_course_id?: string;
  original_author?: string;
  created_at: Date;
  updated_at?: Date;
  installed_at?: Date;
}

export interface PublicCourse extends CourseData {
  is_public: true;
  author_name: string;
  author_username: string;
  install_count: number;
  like_count: number;
  likes: string[];
}

export interface Chapter {
  n: string; // name
  d: string; // description
  s: Section[]; // sections
}

export interface Section {
  t: string; // title
  c: string; // content
}
