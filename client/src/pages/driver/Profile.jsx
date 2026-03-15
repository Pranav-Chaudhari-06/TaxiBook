import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { User, Lock, Car } from 'lucide-react';
import { useGetDriverProfileQuery, useUpdateDriverProfileMutation, useChangeDriverPasswordMutation } from '../../features/users/usersApi';
import { useGetMyVehicleQuery, useUpdateVehicleMutation } from '../../features/rides/ridesApi';
import { useGetStatesQuery, useGetCitiesQuery } from '../../features/auth/authApi';
import Loader from '../../components/common/Loader';

const DriverProfile = () => {
  const { data: profile, isLoading } = useGetDriverProfileQuery();
  const [updateProfile, { isLoading: updating }] = useUpdateDriverProfileMutation();
  const [changePassword, { isLoading: changingPw }] = useChangeDriverPasswordMutation();
  const { data: vehicle } = useGetMyVehicleQuery();
  const [updateVehicle, { isLoading: updatingVehicle }] = useUpdateVehicleMutation();
  const { data: states } = useGetStatesQuery();

  const [tab, setTab] = useState('profile');
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [imageFile, setImageFile] = useState(null);

  const { data: cities } = useGetCitiesQuery(selectedState, { skip: !selectedState });

  const { register: regProfile, handleSubmit: handleProfile } = useForm();
  const { register: regPw, handleSubmit: handlePw, reset: resetPw, formState: { errors: pwErrors } } = useForm();
  const { register: regVehicle, handleSubmit: handleVehicle } = useForm();

  if (isLoading) return <Loader />;

  const onProfileSubmit = async (data) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value) formData.append(key, value);
    });
    if (selectedCity) formData.append('city', selectedCity);
    if (imageFile) formData.append('image', imageFile);
    try {
      await updateProfile(formData).unwrap();
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err?.data?.message || 'Update failed');
    }
  };

  const onPasswordSubmit = async (data) => {
    try {
      await changePassword(data).unwrap();
      toast.success('Password changed!');
      resetPw();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed');
    }
  };

  const onVehicleSubmit = async (data) => {
    if (!vehicle) return;
    try {
      const numData = { ...data };
      if (numData.mileage) numData.mileage = parseFloat(numData.mileage);
      if (numData.passengerCapacity) numData.passengerCapacity = parseInt(numData.passengerCapacity);
      await updateVehicle({ id: vehicle._id, ...numData }).unwrap();
      toast.success('Vehicle updated!');
    } catch (err) {
      toast.error(err?.data?.message || 'Update failed');
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 animate-slide-up">
      <h1 className="page-title">My Profile</h1>

      <div className="flex gap-2 mb-6 flex-wrap">
        <button onClick={() => setTab('profile')} className={tab === 'profile' ? 'tab-btn-active' : 'tab-btn-inactive'}>
          <User className="w-4 h-4 inline mr-1" /> Profile
        </button>
        <button onClick={() => setTab('vehicle')} className={tab === 'vehicle' ? 'tab-btn-active' : 'tab-btn-inactive'}>
          <Car className="w-4 h-4 inline mr-1" /> Vehicle
        </button>
        <button onClick={() => setTab('password')} className={tab === 'password' ? 'tab-btn-active' : 'tab-btn-inactive'}>
          <Lock className="w-4 h-4 inline mr-1" /> Password
        </button>
      </div>

      {tab === 'profile' && (
        <div className="card">
          {profile?.image && <img src={profile.image} alt="Profile" className="w-20 h-20 rounded-full object-cover mb-4" />}
          <form onSubmit={handleProfile(onProfileSubmit)} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="label">First Name</label>
                <input {...regProfile('fname')} defaultValue={profile?.fname} className="input-field" />
              </div>
              <div>
                <label className="label">Middle Name</label>
                <input {...regProfile('mname')} defaultValue={profile?.mname} className="input-field" />
              </div>
              <div>
                <label className="label">Last Name</label>
                <input {...regProfile('lname')} defaultValue={profile?.lname} className="input-field" />
              </div>
            </div>
            <div>
              <label className="label">Contact</label>
              <input {...regProfile('contact')} defaultValue={profile?.contact} className="input-field" />
            </div>
            <div>
              <label className="label">Address</label>
              <input {...regProfile('address')} defaultValue={profile?.address} className="input-field" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">State</label>
                <select className="input-field" value={selectedState} onChange={(e) => { setSelectedState(e.target.value); setSelectedCity(''); }}>
                  <option value="">Select</option>
                  {states?.map((s) => <option key={s._id} value={s._id}>{s.stateName}</option>)}
                </select>
              </div>
              <div>
                <label className="label">City</label>
                <select className="input-field" value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} disabled={!selectedState}>
                  <option value="">Select</option>
                  {cities?.map((c) => <option key={c._id} value={c._id}>{c.cityName}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="label">Profile Picture</label>
              <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} className="input-field" />
            </div>
            <button type="submit" disabled={updating} className="btn-primary">{updating ? 'Saving...' : 'Save Changes'}</button>
          </form>
        </div>
      )}

      {tab === 'vehicle' && vehicle && (
        <div className="card">
          <form onSubmit={handleVehicle(onVehicleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Company Name</label>
                <input {...regVehicle('companyName')} defaultValue={vehicle.companyName} className="input-field" />
              </div>
              <div>
                <label className="label">Model</label>
                <input {...regVehicle('model')} defaultValue={vehicle.model} className="input-field" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="label">Mileage</label>
                <input type="number" {...regVehicle('mileage')} defaultValue={vehicle.mileage} className="input-field" />
              </div>
              <div>
                <label className="label">Capacity</label>
                <input type="number" {...regVehicle('passengerCapacity')} defaultValue={vehicle.passengerCapacity} className="input-field" />
              </div>
              <div>
                <label className="label">Vehicle Number</label>
                <input {...regVehicle('vehicleNumber')} defaultValue={vehicle.vehicleNumber} className="input-field" />
              </div>
            </div>
            <button type="submit" disabled={updatingVehicle} className="btn-primary">{updatingVehicle ? 'Saving...' : 'Update Vehicle'}</button>
          </form>
        </div>
      )}

      {tab === 'password' && (
        <div className="card">
          <form onSubmit={handlePw(onPasswordSubmit)} className="space-y-4">
            <div>
              <label className="label">Current Password</label>
              <input type="password" {...regPw('currentPassword', { required: 'Required' })} className="input-field" />
              {pwErrors.currentPassword && <p className="text-red-500 text-sm mt-1">{pwErrors.currentPassword.message}</p>}
            </div>
            <div>
              <label className="label">New Password</label>
              <input type="password" {...regPw('newPassword', { required: 'Required', minLength: { value: 6, message: 'Min 6 chars' } })} className="input-field" />
              {pwErrors.newPassword && <p className="text-red-500 text-sm mt-1">{pwErrors.newPassword.message}</p>}
            </div>
            <button type="submit" disabled={changingPw} className="btn-primary">{changingPw ? 'Changing...' : 'Change Password'}</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default DriverProfile;
