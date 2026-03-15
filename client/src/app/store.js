import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import { authApi } from '../features/auth/authApi';
import { ridesApi } from '../features/rides/ridesApi';
import { usersApi } from '../features/users/usersApi';
import { adminApi } from '../features/admin/adminApi';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [ridesApi.reducerPath]: ridesApi.reducer,
    [usersApi.reducerPath]: usersApi.reducer,
    [adminApi.reducerPath]: adminApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(authApi.middleware)
      .concat(ridesApi.middleware)
      .concat(usersApi.middleware)
      .concat(adminApi.middleware),
});
