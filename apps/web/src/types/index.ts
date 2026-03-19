export interface User {
  id: string;
  email: string;
  name?: string | null;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  accessTokenExpiresIn: string;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string | null;
  completed: boolean;
  dueDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TasksResponse {
  items: Task[];
  pageInfo: {
    nextCursor: string | null;
    hasMore: boolean;
  };
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}
