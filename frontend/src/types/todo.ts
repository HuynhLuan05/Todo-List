export interface Todo {
  id: string;
  title: string;
  description: string | null;
  status: 'pending' | 'completed';
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  totalCount: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

export interface TodoFilters {
  search?: string;
  status?: 'pending' | 'completed' | '';
  sortBy: 'createdAt' | 'title' | 'dueDate';
  sortOrder: 'asc' | 'desc';
  page: number;
  limit: number;
}
