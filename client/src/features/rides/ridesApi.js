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

export const ridesApi = createApi({
  reducerPath: 'ridesApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Rides', 'Interests', 'Bookings', 'Payment', 'Feedback'],
  endpoints: (builder) => ({
    // Ride Requests
    createRideRequest: builder.mutation({
      query: (body) => ({ url: '/rides', method: 'POST', body }),
      invalidatesTags: ['Rides'],
    }),
    getMyRideRequests: builder.query({
      query: () => '/rides/my',
      providesTags: ['Rides'],
    }),
    getAvailableRides: builder.query({
      query: () => '/rides/available',
      providesTags: ['Rides'],
    }),
    getRideRequest: builder.query({
      query: (id) => `/rides/${id}`,
      providesTags: ['Rides'],
    }),
    cancelRideRequest: builder.mutation({
      query: (id) => ({ url: `/rides/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Rides'],
    }),
    estimateCost: builder.query({
      query: ({ distance, fuelTypeId }) =>
        `/rides/estimate-cost?distance=${distance}&fuelTypeId=${fuelTypeId}`,
    }),

    // Interest
    expressInterest: builder.mutation({
      query: (body) => ({ url: '/interest', method: 'POST', body }),
      invalidatesTags: ['Interests', 'Rides'],
    }),
    getInterestsForRide: builder.query({
      query: (rideId) => `/interest/ride/${rideId}`,
      providesTags: ['Interests'],
    }),
    getMyInterests: builder.query({
      query: () => '/interest/my',
      providesTags: ['Interests'],
    }),
    withdrawInterest: builder.mutation({
      query: (id) => ({ url: `/interest/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Interests'],
    }),

    // Booking
    createBooking: builder.mutation({
      query: (body) => ({ url: '/booking', method: 'POST', body }),
      invalidatesTags: ['Bookings', 'Rides', 'Interests'],
    }),
    getMyBookings: builder.query({
      query: () => '/booking/my',
      providesTags: ['Bookings'],
    }),
    getDriverBookings: builder.query({
      query: () => '/booking/driver',
      providesTags: ['Bookings'],
    }),
    getBooking: builder.query({
      query: (id) => `/booking/${id}`,
      providesTags: ['Bookings'],
    }),
    startRide: builder.mutation({
      query: (id) => ({ url: `/booking/${id}/start`, method: 'PUT' }),
      invalidatesTags: ['Bookings'],
    }),
    endRide: builder.mutation({
      query: (id) => ({ url: `/booking/${id}/end`, method: 'PUT' }),
      invalidatesTags: ['Bookings'],
    }),
    cancelBooking: builder.mutation({
      query: (id) => ({ url: `/booking/${id}/cancel`, method: 'PUT' }),
      invalidatesTags: ['Bookings'],
    }),

    // Payment
    createPayment: builder.mutation({
      query: (body) => ({ url: '/payment', method: 'POST', body }),
      invalidatesTags: ['Payment', 'Bookings'],
    }),
    getPaymentByBooking: builder.query({
      query: (bookingId) => `/payment/booking/${bookingId}`,
      providesTags: ['Payment'],
    }),

    // Feedback
    createFeedback: builder.mutation({
      query: (body) => ({ url: '/feedback', method: 'POST', body }),
      invalidatesTags: ['Feedback'],
    }),
    getFeedbackByBooking: builder.query({
      query: (bookingId) => `/feedback/booking/${bookingId}`,
      providesTags: ['Feedback'],
    }),

    // Vehicle
    registerVehicle: builder.mutation({
      query: (body) => ({ url: '/vehicle', method: 'POST', body }),
    }),
    getMyVehicle: builder.query({
      query: () => '/vehicle/my',
    }),
    updateVehicle: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/vehicle/${id}`, method: 'PUT', body }),
    }),
  }),
});

export const {
  useCreateRideRequestMutation,
  useGetMyRideRequestsQuery,
  useGetAvailableRidesQuery,
  useGetRideRequestQuery,
  useCancelRideRequestMutation,
  useEstimateCostQuery,
  useExpressInterestMutation,
  useGetInterestsForRideQuery,
  useGetMyInterestsQuery,
  useWithdrawInterestMutation,
  useCreateBookingMutation,
  useGetMyBookingsQuery,
  useGetDriverBookingsQuery,
  useGetBookingQuery,
  useStartRideMutation,
  useEndRideMutation,
  useCancelBookingMutation,
  useCreatePaymentMutation,
  useGetPaymentByBookingQuery,
  useCreateFeedbackMutation,
  useGetFeedbackByBookingQuery,
  useRegisterVehicleMutation,
  useGetMyVehicleQuery,
  useUpdateVehicleMutation,
} = ridesApi;
