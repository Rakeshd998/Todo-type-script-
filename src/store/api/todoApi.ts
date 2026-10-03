import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';
import type { DueFilter, Todo, TodoPriority, TodoStats } from '../../types/todo.types';
import type { ApiResponse } from '../../types/auth.types';

// ─── Query / Response Types ───────────────────────────────────────────────────

export interface TodoQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  startDate?: string; // YYYY-MM-DD (created-at range)
  endDate?: string;   // YYYY-MM-DD
  due?: DueFilter;
  today?: string;     // client's local date, sent with `due`
}

export interface PaginatedTodos {
  todos: Todo[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TodoFields {
  text?: string;
  completed?: boolean;
  dueDate?: string | null;
  priority?: TodoPriority;
}

const STATS_TAG = { type: 'TodoStats' as const, id: 'ALL' };

// ─── API Slice ────────────────────────────────────────────────────────────────

export const todoApi = createApi({
  reducerPath: 'todoApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Todo', 'TodoStats'],
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

    // Counts for the overview tile and the due-filter chips
    getTodoStats: builder.query<TodoStats, { today: string }>({
      query: (params) => ({ url: '/todos/stats', params }),
      transformResponse: (response: ApiResponse<TodoStats>) => response.data,
      providesTags: [STATS_TAG],
    }),

    createTodo: builder.mutation<Todo, TodoFields & { text: string }>({
      query: (body) => ({ url: '/todos', method: 'POST', body }),
      transformResponse: (response: ApiResponse<Todo>) => response.data,
      invalidatesTags: [{ type: 'Todo', id: 'LIST' }, STATS_TAG],
    }),

    updateTodo: builder.mutation<Todo, { id: string } & TodoFields>({
      query: ({ id, ...body }) => ({
        url: `/todos/${id}`,
        method: 'PATCH',
        body,
      }),
      transformResponse: (response: ApiResponse<Todo>) => response.data,
      // LIST too: a changed due date / completion can move a todo in or out of a filtered view
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Todo', id },
        { type: 'Todo', id: 'LIST' },
        STATS_TAG,
      ],
    }),

    // Moves the todo to the server-side trash (restorable for ~1 minute)
    deleteTodo: builder.mutation<void, string>({
      query: (id) => ({ url: `/todos/${id}`, method: 'DELETE' }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Todo', id },
        { type: 'Todo', id: 'LIST' },
        STATS_TAG,
      ],
    }),

    restoreTodo: builder.mutation<Todo, string>({
      query: (id) => ({ url: `/todos/${id}/restore`, method: 'POST' }),
      transformResponse: (response: ApiResponse<Todo>) => response.data,
      invalidatesTags: [{ type: 'Todo', id: 'LIST' }, STATS_TAG],
    }),
  }),
});

export const {
  useGetTodosQuery,
  useGetTodoStatsQuery,
  useCreateTodoMutation,
  useUpdateTodoMutation,
  useDeleteTodoMutation,
  useRestoreTodoMutation,
} = todoApi;
