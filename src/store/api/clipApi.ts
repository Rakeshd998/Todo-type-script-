import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';
import type { Clip, CreateClipRequest, UpdateClipRequest } from '../../types/clip.types';
import type { ApiResponse } from '../../types/auth.types';

export const clipApi = createApi({
  reducerPath: 'clipApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Clip'],
  endpoints: (builder) => ({
    getClips: builder.query<Clip[], void>({
      query: () => '/clips',
      transformResponse: (response: ApiResponse<Clip[]>) => response.data,
      providesTags: (result) =>
        result
          ? [...result.map(({ _id }) => ({ type: 'Clip' as const, id: _id })), { type: 'Clip', id: 'LIST' }]
          : [{ type: 'Clip', id: 'LIST' }],
    }),

    createClip: builder.mutation<Clip, CreateClipRequest>({
      query: (body) => ({ url: '/clips', method: 'POST', body }),
      transformResponse: (response: ApiResponse<Clip>) => response.data,
      invalidatesTags: [{ type: 'Clip', id: 'LIST' }],
    }),

    updateClip: builder.mutation<Clip, { id: string } & UpdateClipRequest>({
      query: ({ id, ...body }) => ({ url: `/clips/${id}`, method: 'PUT', body }),
      transformResponse: (response: ApiResponse<Clip>) => response.data,
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Clip', id }],
    }),

    deleteClip: builder.mutation<void, string>({
      query: (id) => ({ url: `/clips/${id}`, method: 'DELETE' }),
      invalidatesTags: (_result, _error, id) => [{ type: 'Clip', id }, { type: 'Clip', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetClipsQuery,
  useCreateClipMutation,
  useUpdateClipMutation,
  useDeleteClipMutation,
} = clipApi;
