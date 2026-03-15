import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { logout, updateToken } from '../auth/authSlice';

const baseQuery = fetchBaseQuery({
  baseUrl: '/api',
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.accessToken;
    if (token) headers.set('authorization', `Bearer ${token}`);
    return headers;
  },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);
  if (result?.error?.status === 401) {
    const refreshResult = await baseQuery(
      { url: '/auth/refresh-token', method: 'POST' },
      api,
      extraOptions
    );
    if (refreshResult?.data) {
      api.dispatch(updateToken(refreshResult.data.accessToken));
      result = await baseQuery(args, api, extraOptions);
    } else {
      api.dispatch(logout());
    }
  }
  return result;
};

export const usersApi = createApi({
  reducerPath: 'usersApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Profile'],
  endpoints: (builder) => ({
    getPassengerProfile: builder.query({
      query: () => '/passenger/profile',
      providesTags: ['Profile'],
    }),
    updatePassengerProfile: builder.mutation({
      query: (formData) => ({
        url: '/passenger/profile',
        method: 'PUT',
        body: formData,
      }),
      invalidatesTags: ['Profile'],
    }),
    changePassengerPassword: builder.mutation({
      query: (body) => ({
        url: '/passenger/change-password',
        method: 'PUT',
        body,
      }),
    }),
    getDriverProfile: builder.query({
      query: () => '/driver/profile',
      providesTags: ['Profile'],
    }),
    updateDriverProfile: builder.mutation({
      query: (formData) => ({
        url: '/driver/profile',
        method: 'PUT',
        body: formData,
      }),
      invalidatesTags: ['Profile'],
    }),
    changeDriverPassword: builder.mutation({
      query: (body) => ({
        url: '/driver/change-password',
        method: 'PUT',
        body,
      }),
    }),
  }),
});

export const {
  useGetPassengerProfileQuery,
  useUpdatePassengerProfileMutation,
  useChangePassengerPasswordMutation,
  useGetDriverProfileQuery,
  useUpdateDriverProfileMutation,
  useChangeDriverPasswordMutation,
} = usersApi;
