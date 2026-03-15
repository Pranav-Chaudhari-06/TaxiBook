import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { logout, updateToken } from './authSlice';

const baseQuery = fetchBaseQuery({
  baseUrl: '/api',
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.accessToken;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  // Skip reauth for auth endpoints (login, register, etc.) to avoid retry loops
  const url = typeof args === 'string' ? args : args.url;
  if (result?.error?.status === 401 && !url.startsWith('/auth/')) {
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

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    registerPassenger: builder.mutation({
      query: (body) => ({ url: '/auth/register/passenger', method: 'POST', body }),
    }),
    registerDriver: builder.mutation({
      query: (body) => ({ url: '/auth/register/driver', method: 'POST', body }),
    }),
    login: builder.mutation({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
    }),
    verifyOTP: builder.mutation({
      query: (body) => ({ url: '/auth/verify-otp', method: 'POST', body }),
    }),
    resendOTP: builder.mutation({
      query: (body) => ({ url: '/auth/resend-otp', method: 'POST', body }),
    }),
    logout: builder.mutation({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
    }),
    getStates: builder.query({
      query: () => '/location/states',
    }),
    getCities: builder.query({
      query: (stateId) => `/location/cities/${stateId}`,
    }),
    searchCities: builder.query({
      query: (q) => `/location/cities/search?q=${q}`,
    }),
    getFuelTypes: builder.query({
      query: () => '/location/fuel-types',
    }),
  }),
});

export const {
  useRegisterPassengerMutation,
  useRegisterDriverMutation,
  useLoginMutation,
  useVerifyOTPMutation,
  useResendOTPMutation,
  useLogoutMutation,
  useGetStatesQuery,
  useGetCitiesQuery,
  useSearchCitiesQuery,
} = authApi;
