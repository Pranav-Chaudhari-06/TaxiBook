import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { User, Lock } from 'lucide-react';
import { useGetPassengerProfileQuery, useUpdatePassengerProfileMutation, useChangePassengerPasswordMutation } from '../../features/users/usersApi';
import { useGetStatesQuery, useGetCitiesQuery } from '../../features/auth/authApi';
import Loader from '../../components/common/Loader';

const PassengerProfile = () => {
  const { data: profile, isLoading } = useGetPassengerProfileQuery();
  const [updateProfile, { isLoading: updating }] = useUpdatePassengerProfileMutation();
  const [changePassword, { isLoading: changingPw }] = useChangePassengerPasswordMutation();
  const { data: states } = useGetStatesQuery();

  const [tab, setTab] = useState('profile');
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [imageFile, setImageFile] = useState(null);

  const { data: cities } = useGetCitiesQuery(selectedState, { skip: !selectedState });

  const { register: regProfile, handleSubmit: handleProfile, formState: { errors: profileErrors } } = useForm();
  const { register: regPw, handleSubmit: handlePw, reset: resetPw, formState: { errors: pwErrors } } = useForm();

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
      toast.error(err?.data?.message || 'Failed to change password');
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 animate-slide-up">
      <h1 className="page-title">My Profile</h1>

      <div className="flex gap-2 mb-6">
        <button onClick={() => setTab('profile')} className={tab === 'profile' ? 'tab-btn-active' : 'tab-btn-inactive'}>
          <User className="w-4 h-4 inline mr-1" /> Profile
        </button>
        <button onClick={() => setTab('password')} className={tab === 'password' ? 'tab-btn-active' : 'tab-btn-inactive'}>
          <Lock className="w-4 h-4 inline mr-1" /> Password
        </button>
      </div>

      {tab === 'profile' && (
        <div className="card">
          {profile?.image && (
            <div className="mb-5">
              <img src={profile.image} alt="Profile" className="w-20 h-20 rounded-full object-cover ring-2 ring-primary-100" />
            </div>
          )}

          <form onSubmit={handleProfile(onProfileSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

            <button type="submit" disabled={updating} className="btn-primary">
              {updating ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      )}

      {tab === 'password' && (
        <div className="card">
          <form onSubmit={handlePw(onPasswordSubmit)} className="space-y-5">
            <div>
              <label className="label">Current Password</label>
              <input type="password" {...regPw('currentPassword', { required: 'Required' })} className="input-field" />
              {pwErrors.currentPassword && <p className="text-red-500 text-xs mt-1.5 font-medium">{pwErrors.currentPassword.message}</p>}
            </div>
            <div>
              <label className="label">New Password</label>
              <input type="password" {...regPw('newPassword', { required: 'Required', minLength: { value: 6, message: 'Min 6 chars' } })} className="input-field" />
              {pwErrors.newPassword && <p className="text-red-500 text-xs mt-1.5 font-medium">{pwErrors.newPassword.message}</p>}
            </div>
            <button type="submit" disabled={changingPw} className="btn-primary">
              {changingPw ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default PassengerProfile;
