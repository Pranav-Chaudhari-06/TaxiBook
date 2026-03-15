import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useGetStatesQuery, useGetCitiesQuery } from '../../features/auth/authApi';
import { useCreateRideRequestMutation } from '../../features/rides/ridesApi';
import LocationPicker from '../maps/LocationPicker';
import HereMap from '../maps/HereMap';
import Loader from '../common/Loader';

const schema = z.object({
  passengerCount: z.number().min(1, 'At least 1 passenger required'),
});

const RideRequestForm = () => {
  const navigate = useNavigate();
  const [createRide, { isLoading }] = useCreateRideRequestMutation();
  const { data: states } = useGetStatesQuery();

  const [sourceAddress, setSourceAddress] = useState('');
  const [destAddress, setDestAddress] = useState('');
  const [sourceCoords, setSourceCoords] = useState(null);
  const [destCoords, setDestCoords] = useState(null);
  const [sourceState, setSourceState] = useState('');
  const [destState, setDestState] = useState('');
  const [sourceCity, setSourceCity] = useState('');
  const [destCity, setDestCity] = useState('');
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [distance, setDistance] = useState(null);

  const { data: sourceCities } = useGetCitiesQuery(sourceState, { skip: !sourceState });
  const { data: destCities } = useGetCitiesQuery(destState, { skip: !destState });

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { passengerCount: 1 },
  });

  const handleRouteCalculated = useCallback((dist) => {
    setDistance(dist);
  }, []);

  const onSubmit = async (data) => {
    if (!sourceAddress || !destAddress) {
      toast.error('Please enter source and destination addresses');
      return;
    }
    if (!fromDate || !toDate) {
      toast.error('Please select dates');
      return;
    }

    try {
      await createRide({
        sourceAddress,
        destinationAddress: destAddress,
        sourceCity: sourceCity || undefined,
        destinationCity: destCity || undefined,
        sourceCoords,
        destinationCoords: destCoords,
        fromDateTime: fromDate.toISOString(),
        toDateTime: toDate.toISOString(),
        passengerCount: data.passengerCount,
      }).unwrap();

      toast.success('Ride request created!');
      navigate('/passenger/home');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to create ride request');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Source */}
        <div className="space-y-5">
          <h3 className="section-title">Pickup Location</h3>
          <LocationPicker
            label="Source Address"
            value={sourceAddress}
            onChange={setSourceAddress}
            onCoordsChange={setSourceCoords}
          />
          <div>
            <label className="label">State</label>
            <select
              className="input-field"
              value={sourceState}
              onChange={(e) => { setSourceState(e.target.value); setSourceCity(''); }}
            >
              <option value="">Select state</option>
              {states?.map((s) => (
                <option key={s._id} value={s._id}>{s.stateName}</option>
              ))}
            </select>
          </div>
          {sourceState && (
            <div>
              <label className="label">City</label>
              <select className="input-field" value={sourceCity} onChange={(e) => setSourceCity(e.target.value)}>
                <option value="">Select city</option>
                {sourceCities?.map((c) => (
                  <option key={c._id} value={c._id}>{c.cityName}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Destination */}
        <div className="space-y-5">
          <h3 className="section-title">Drop-off Location</h3>
          <LocationPicker
            label="Destination Address"
            value={destAddress}
            onChange={setDestAddress}
            onCoordsChange={setDestCoords}
          />
          <div>
            <label className="label">State</label>
            <select
              className="input-field"
              value={destState}
              onChange={(e) => { setDestState(e.target.value); setDestCity(''); }}
            >
              <option value="">Select state</option>
              {states?.map((s) => (
                <option key={s._id} value={s._id}>{s.stateName}</option>
              ))}
            </select>
          </div>
          {destState && (
            <div>
              <label className="label">City</label>
              <select className="input-field" value={destCity} onChange={(e) => setDestCity(e.target.value)}>
                <option value="">Select city</option>
                {destCities?.map((c) => (
                  <option key={c._id} value={c._id}>{c.cityName}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Map */}
      {sourceCoords && destCoords && (
        <div>
          <HereMap
            sourceCoords={sourceCoords}
            destinationCoords={destCoords}
            onRouteCalculated={handleRouteCalculated}
          />
          {distance && (
            <p className="text-sm text-surface-500 mt-2">
              Estimated distance: <strong className="text-surface-800">{distance} km</strong>
            </p>
          )}
        </div>
      )}

      {/* Date/Time */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="label">From Date & Time</label>
          <DatePicker
            selected={fromDate}
            onChange={setFromDate}
            showTimeSelect
            dateFormat="dd/MM/yyyy h:mm aa"
            minDate={new Date()}
            className="input-field w-full"
            placeholderText="Select pickup date & time"
          />
        </div>
        <div>
          <label className="label">To Date & Time</label>
          <DatePicker
            selected={toDate}
            onChange={setToDate}
            showTimeSelect
            dateFormat="dd/MM/yyyy h:mm aa"
            minDate={fromDate || new Date()}
            className="input-field w-full"
            placeholderText="Select drop-off date & time"
          />
        </div>
      </div>

      {/* Passenger count */}
      <div>
        <label className="label">Number of Passengers</label>
        <input
          type="number"
          min="1"
          {...register('passengerCount', { valueAsNumber: true })}
          className="input-field max-w-xs"
        />
        {errors.passengerCount && (
          <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.passengerCount.message}</p>
        )}
      </div>

      <button type="submit" disabled={isLoading} className="btn-primary">
        {isLoading ? 'Creating...' : 'Create Ride Request'}
      </button>
    </form>
  );
};

export default RideRequestForm;
