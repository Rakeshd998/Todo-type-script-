import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';
import { setCredentials, clearCredentials } from '../slices/authSlice';
import { todoApi } from './todoApi';
import { clipApi } from './clipApi';
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  ApiResponse,
} from '../../types/auth.types';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    register: builder.mutation<ApiResponse<AuthResponse>, RegisterRequest>({
      query: (body) => ({ url: '/auth/register', method: 'POST', body }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            setCredentials({
              user: data.data.user,
              accessToken: data.data.accessToken,
            }),
          );
        } catch {
          // error handled by component
        }
      },
    }),

    login: builder.mutation<ApiResponse<AuthResponse>, LoginRequest>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            setCredentials({
              user: data.data.user,
              accessToken: data.data.accessToken,
            }),
          );
        } catch {
          // error handled by component
        }
      },
    }),

    logout: builder.mutation<ApiResponse, void>({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch {
          // Force logout on client even if server fails
        } finally {
          // Always clear auth state AND wipe all caches so the next
          // user never sees the previous user's data.
          dispatch(clearCredentials());
          dispatch(todoApi.util.resetApiState());
          dispatch(clipApi.util.resetApiState());
        }
      },
    }),

    // Called on app start to restore session from HttpOnly refresh cookie
    refreshToken: builder.mutation<ApiResponse<AuthResponse>, void>({
      query: () => ({ url: '/auth/refresh', method: 'POST' }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials({user: data.data.user, accessToken: data.data.accessToken }));
        } catch {
          // Cookie expired / missing — clear everything including all caches.
          dispatch(clearCredentials());
          dispatch(todoApi.util.resetApiState());
          dispatch(clipApi.util.resetApiState());
        }
      },
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useRefreshTokenMutation,
} = authApi;
