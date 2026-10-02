import {
  fetchBaseQuery,
  type BaseQueryApi,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import { setCredentials, clearCredentials } from '../slices/authSlice';
import type { ApiResponse, AuthResponse } from '../../types/auth.types';

// Minimal local type — avoids a circular import (baseQuery → store → authApi → baseQuery)
type StateWithAuth = { auth: { accessToken: string | null } };

const REFRESH_URL = '/auth/refresh';

// Endpoints where a 401 means "wrong credentials", not "access token expired"
const NO_REAUTH_URLS = ['/auth/login', '/auth/register', REFRESH_URL];

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

type RawResult = Awaited<ReturnType<typeof rawBaseQuery>>;

// ─── Single-flight refresh ────────────────────────────────────────────────────
// The server rotates the refresh token on every use. If several requests hit a
// 401 at once and each called /auth/refresh with the same cookie, all but the
// first would look like token reuse. So every caller shares one in-flight refresh.
let refreshPromise: Promise<RawResult> | null = null;

const refreshAccessToken = (
  api: BaseQueryApi,
  extraOptions: object,
): Promise<RawResult> => {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const result = await rawBaseQuery({ url: REFRESH_URL, method: 'POST' }, api, extraOptions);

      if (result.data) {
        const { data } = result.data as ApiResponse<AuthResponse>;
        api.dispatch(setCredentials({ user: data.user, accessToken: data.accessToken }));
      } else if (result.error?.status === 401 || result.error?.status === 403) {
        // Refresh token is missing/expired/revoked — user must log in again.
        // Network errors and 5xx (e.g. server still waking up) keep the session.
        api.dispatch(clearCredentials());
      }
      return result;
    })().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
};

// Custom base query that auto-refreshes the access token on 401
export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const url = typeof args === 'string' ? args : args.url;

  // Explicit refresh (app start) joins any refresh already in progress
  if (url === REFRESH_URL) return refreshAccessToken(api, extraOptions);

  // A refresh is in progress — wait for it rather than sending a token that will 401
  if (refreshPromise) await refreshPromise;

  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status === 401 && !NO_REAUTH_URLS.includes(url)) {
    const refreshResult = await refreshAccessToken(api, extraOptions);
    if (refreshResult.data) {
      // Retry the original request with the new access token
      result = await rawBaseQuery(args, api, extraOptions);
    }
  }

  return result;
};
