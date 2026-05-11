import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../../types/auth.types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
}

const TOKEN_KEY = 'accessToken';

// Read persisted token on app startup — this is what keeps the user logged in on page refresh
const storedToken = localStorage.getItem(TOKEN_KEY);

const initialState: AuthState = {
  user: null,
  accessToken: storedToken,
  isAuthenticated: !!storedToken, // true immediately if token exists
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user?: User; accessToken: string }>,
    ) => {
      if (action.payload.user) {
        state.user = action.payload.user;
      }
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
      // Persist so page refresh keeps the user logged in
      localStorage.setItem(TOKEN_KEY, action.payload.accessToken);
    },
    clearCredentials: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      localStorage.removeItem(TOKEN_KEY);
    },
  },
});

export const { setCredentials, clearCredentials } = authSlice.actions;
export default authSlice.reducer;
