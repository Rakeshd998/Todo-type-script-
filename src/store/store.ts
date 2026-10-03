import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import chatReducer from './slices/chatSlice';
import toastReducer from './slices/toastSlice';
import { authApi } from './api/authApi';
import { todoApi } from './api/todoApi';
import { clipApi } from './api/clipApi';
import { chatApi } from './api/chatApi';

export const store = configureStore({
  reducer: {
    auth:                   authReducer,
    chat:                   chatReducer,
    toast:                  toastReducer,
    [authApi.reducerPath]:  authApi.reducer,
    [todoApi.reducerPath]:  todoApi.reducer,
    [clipApi.reducerPath]:  clipApi.reducer,
    [chatApi.reducerPath]:  chatApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      todoApi.middleware,
      clipApi.middleware,
      chatApi.middleware,
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

