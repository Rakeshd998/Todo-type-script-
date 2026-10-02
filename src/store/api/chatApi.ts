import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';
import type { ChatUser, Message, UnreadCounts } from '../../types/chat.types';
import type { ApiResponse } from '../../types/auth.types';

export const chatApi = createApi({
  reducerPath: 'chatApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['ChatHistory', 'Unread'],
  endpoints: (builder) => ({
    // List all registered users (for starting a chat)
    getChatUsers: builder.query<ChatUser[], void>({
      query: () => '/chat/users',
      transformResponse: (res: ApiResponse<ChatUser[]>) => res.data,
    }),

    // Paginated message history between two users
    getChatHistory: builder.query<Message[], { userId: string; page?: number }>({
      query: ({ userId, page = 1 }) => `/chat/history/${userId}?page=${page}&limit=50`,
      transformResponse: (res: ApiResponse<Message[]>) => res.data,
      providesTags: (_result, _err, { userId }) => [{ type: 'ChatHistory', id: userId }],
    }),

    // Mark all messages from a user as read
    markRead: builder.mutation<void, string>({
      query: (userId) => ({ url: `/chat/read/${userId}`, method: 'PATCH' }),
      invalidatesTags: ['Unread'],
    }),

    // Get unread message counts grouped by sender
    getUnreadCounts: builder.query<UnreadCounts, void>({
      query: () => '/chat/unread',
      transformResponse: (res: ApiResponse<UnreadCounts>) => res.data,
      providesTags: ['Unread'],
    }),
  }),
});

export const {
  useGetChatUsersQuery,
  useGetChatHistoryQuery,
  useMarkReadMutation,
  useGetUnreadCountsQuery,
} = chatApi;
