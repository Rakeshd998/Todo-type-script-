import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { clearCredentials } from './authSlice';

// Undo actions the toast can offer. Kept as plain data (not callbacks) so the
// Redux state stays serializable; <Toast> maps each kind to the right mutation.
export type ToastUndo = { kind: 'restore-todo'; todoId: string };

export interface ToastState {
  id: number;
  message: string;
  tone: 'info' | 'error';
  undo?: ToastUndo;
}

interface ToastSliceState {
  current: ToastState | null;
}

const initialState: ToastSliceState = { current: null };

let nextId = 1;

const toastSlice = createSlice({
  name: 'toast',
  initialState,
  reducers: {
    // A new toast replaces the current one (only one undo is offered at a time)
    showToast: {
      reducer(state, action: PayloadAction<ToastState>) {
        state.current = action.payload;
      },
      prepare(payload: Omit<ToastState, 'id' | 'tone'> & { tone?: ToastState['tone'] }) {
        return { payload: { tone: 'info' as const, ...payload, id: nextId++ } };
      },
    },
    dismissToast(state, action: PayloadAction<number | undefined>) {
      // Ignore a stale dismiss (e.g. an old timer) when a newer toast is showing
      if (action.payload === undefined || state.current?.id === action.payload) {
        state.current = null;
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(clearCredentials, () => initialState);
  },
});

export const { showToast, dismissToast } = toastSlice.actions;
export default toastSlice.reducer;
