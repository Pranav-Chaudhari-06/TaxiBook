import { useSelector } from 'react-redux';
import { selectCurrentUser, selectAccessToken } from '../features/auth/authSlice';

export const useAuth = () => {
  const user = useSelector(selectCurrentUser);
  const accessToken = useSelector(selectAccessToken);

  return {
    user,
    accessToken,
    isAuthenticated: !!accessToken && !!user,
    isPassenger: user?.role === 'passenger',
    isDriver: user?.role === 'driver',
    isAdmin: user?.role === 'admin',
  };
};
