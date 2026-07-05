import axios from 'axios';
import type { Todo, Pagination, TodoFilters } from '../types/todo';

const API_BASE_URL = 'http://localhost:5000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface FetchTodosResponse {
  success: boolean;
  data: Todo[];
  pagination: Pagination;
}

export interface CommonResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export const todoApi = {
  getTodos: async (filters: TodoFilters): Promise<FetchTodosResponse> => {
    const params: Record<string, any> = {
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
      page: filters.page.toString(),
      limit: filters.limit.toString(),
    };

    if (filters.search) params.search = filters.search;
    if (filters.status) params.status = filters.status;

    const response = await apiClient.get<FetchTodosResponse>('/todos', { params });
    return response.data;
  },

  getTodoById: async (id: string): Promise<CommonResponse<Todo>> => {
    const response = await apiClient.get<CommonResponse<Todo>>(`/todos/${id}`);
    return response.data;
  },

  createTodo: async (data: {
    title: string;
    description?: string | null;
    dueDate?: string | null;
  }): Promise<CommonResponse<Todo>> => {
    const response = await apiClient.post<CommonResponse<Todo>>('/todos', data);
    return response.data;
  },

  updateTodo: async (
    id: string,
    data: {
      title?: string;
      description?: string | null;
      dueDate?: string | null;
      status?: 'pending' | 'completed';
    }
  ): Promise<CommonResponse<Todo>> => {
    const response = await apiClient.put<CommonResponse<Todo>>(`/todos/${id}`, data);
    return response.data;
  },

  toggleTodoStatus: async (id: string): Promise<CommonResponse<Todo>> => {
    const response = await apiClient.patch<CommonResponse<Todo>>(`/todos/${id}/toggle`);
    return response.data;
  },

  deleteTodo: async (id: string): Promise<CommonResponse<Todo>> => {
    const response = await apiClient.delete<CommonResponse<Todo>>(`/todos/${id}`);
    return response.data;
  },
};
