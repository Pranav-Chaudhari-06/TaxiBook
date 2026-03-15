import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: JSON.parse(localStorage.getItem('user')) || null,
  accessToken: sessionStorage.getItem('accessToken') || null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, accessToken } = action.payload;
      state.user = user;
      state.accessToken = accessToken;
      localStorage.setItem('user', JSON.stringify(user));
      sessionStorage.setItem('accessToken', accessToken);
    },
    updateToken: (state, action) => {
      state.accessToken = action.payload;
      sessionStorage.setItem('accessToken', action.payload);
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      localStorage.removeItem('user');
      sessionStorage.removeItem('accessToken');
    },
  },
});

export const { setCredentials, updateToken, logout } = authSlice.actions;
export const selectCurrentUser = (state) => state.auth.user;
export const selectAccessToken = (state) => state.auth.accessToken;
export default authSlice.reducer;
