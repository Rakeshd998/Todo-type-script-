import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import { authApi } from './api/authApi';
import { todoApi } from './api/todoApi';
import { clipApi } from './api/clipApi';

export const store = configureStore({
  reducer: {
    auth:                   authReducer,
    [authApi.reducerPath]:  authApi.reducer,
    [todoApi.reducerPath]:  todoApi.reducer,
    [clipApi.reducerPath]:  clipApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware, todoApi.middleware, clipApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
