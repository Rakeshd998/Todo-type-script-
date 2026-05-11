import {
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import { setCredentials, clearCredentials } from '../slices/authSlice';
import type { ApiResponse, AuthResponse } from '../../types/auth.types';

// Minimal local type — avoids a circular import (baseQuery → store → authApi → baseQuery)
type StateWithAuth = { auth: { accessToken: string | null } };


const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL ?? '/api',
  credentials: 'include', // send HttpOnly refresh cookie automatically
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as StateWithAuth).auth.accessToken;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

// Custom base query that auto-refreshes the access token on 401
export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    // Try to get a new access token using the refresh cookie
    const refreshResult = await rawBaseQuery(
      { url: '/auth/refresh', method: 'POST' },
      api,
      extraOptions,
    );

    if (refreshResult.data) {
      const response = refreshResult.data as ApiResponse<AuthResponse>;
      // Save the new access token in Redux state
      api.dispatch(setCredentials({ accessToken: response.data.accessToken }));
      // Retry the original query with the new token
      result = await rawBaseQuery(args, api, extraOptions);
    } else {
      // Refresh also failed — user must log in again
      api.dispatch(clearCredentials());
    }
  }

  return result;
};
