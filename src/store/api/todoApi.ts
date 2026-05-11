import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';
import type { Todo } from '../../types/todo.types';
import type { ApiResponse } from '../../types/auth.types';

// ─── Query / Response Types ───────────────────────────────────────────────────

export interface TodoQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
}

export interface PaginatedTodos {
  todos: Todo[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── API Slice ────────────────────────────────────────────────────────────────

export const todoApi = createApi({
  reducerPath: 'todoApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Todo'],
  endpoints: (builder) => ({
    getTodos: builder.query<PaginatedTodos, TodoQueryParams>({
      query: (params) => ({ url: '/todos', params }),
      transformResponse: (response: ApiResponse<PaginatedTodos>) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.todos.map(({ _id }) => ({ type: 'Todo' as const, id: _id })),
              { type: 'Todo', id: 'LIST' },
            ]
          : [{ type: 'Todo', id: 'LIST' }],
    }),

    createTodo: builder.mutation<Todo, { text: string }>({
      query: (body) => ({ url: '/todos', method: 'POST', body }),
      transformResponse: (response: ApiResponse<Todo>) => response.data,
      invalidatesTags: [{ type: 'Todo', id: 'LIST' }],
    }),

    updateTodo: builder.mutation<
      Todo,
      { id: string; text?: string; completed?: boolean }
    >({
      query: ({ id, ...body }) => ({
        url: `/todos/${id}`,
        method: 'PATCH',
        body,
      }),
      transformResponse: (response: ApiResponse<Todo>) => response.data,
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Todo', id }],
    }),

    deleteTodo: builder.mutation<void, string>({
      query: (id) => ({ url: `/todos/${id}`, method: 'DELETE' }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Todo', id },
        { type: 'Todo', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetTodosQuery,
  useCreateTodoMutation,
  useUpdateTodoMutation,
  useDeleteTodoMutation,
} = todoApi;
