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

export const adminApi = createApi({
  reducerPath: 'adminApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['AdminStats', 'AdminPassengers', 'AdminDrivers', 'AdminRides', 'AdminBookings'],
  endpoints: (builder) => ({
    getStats: builder.query({
      query: () => '/admin/stats',
      providesTags: ['AdminStats'],
    }),
    getPassengers: builder.query({
      query: ({ page = 1, limit = 20, search = '' } = {}) =>
        `/admin/passengers?page=${page}&limit=${limit}&search=${search}`,
      providesTags: ['AdminPassengers'],
    }),
    getDrivers: builder.query({
      query: ({ page = 1, limit = 20, search = '' } = {}) =>
        `/admin/drivers?page=${page}&limit=${limit}&search=${search}`,
      providesTags: ['AdminDrivers'],
    }),
    getRides: builder.query({
      query: ({ page = 1, limit = 20, status = '' } = {}) =>
        `/admin/rides?page=${page}&limit=${limit}&status=${status}`,
      providesTags: ['AdminRides'],
    }),
    getBookings: builder.query({
      query: ({ page = 1, limit = 20, status = '' } = {}) =>
        `/admin/bookings?page=${page}&limit=${limit}&status=${status}`,
      providesTags: ['AdminBookings'],
    }),
    deletePassenger: builder.mutation({
      query: (id) => ({ url: `/admin/passenger/${id}`, method: 'DELETE' }),
      invalidatesTags: ['AdminPassengers', 'AdminStats'],
    }),
    deleteDriver: builder.mutation({
      query: (id) => ({ url: `/admin/driver/${id}`, method: 'DELETE' }),
      invalidatesTags: ['AdminDrivers', 'AdminStats'],
    }),
  }),
});

export const {
  useGetStatsQuery,
  useGetPassengersQuery,
  useGetDriversQuery,
  useGetRidesQuery,
  useGetBookingsQuery,
  useDeletePassengerMutation,
  useDeleteDriverMutation,
} = adminApi;
