export interface JwtPayload extends Record<string, unknown> {
  userId: string;
  username: string;
  email: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  bio: string | null;
  avatar_url: string | null;
  website: string | null;
  location: string | null;
  posts_count: number;
  followers_count: number;
  following_count: number;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

export interface PublicUser
  extends Omit<User, "email" | "last_login" | "updated_at"> {}

export interface Post {
  id: string;
  content: string;
  author_id: string;
  image_url: string | null;
  is_active: boolean;
  like_count: number;
  comment_count: number;
  created_at: string;
  updated_at: string;
}

export interface PostWithAuthor extends Post {
  author: Pick<
    User,
    "id" | "username" | "first_name" | "last_name" | "avatar_url"
  >;
  liked_by_me?: boolean;
}

export interface Comment {
  id: string;
  content: string;
  user_id: string;
  post_id: string;
  created_at: string;
  updated_at: string;
}

export interface CommentWithAuthor extends Comment {
  author: Pick<
    User,
    "id" | "username" | "first_name" | "last_name" | "avatar_url"
  >;
}

export interface ApiError {
  message: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
}
