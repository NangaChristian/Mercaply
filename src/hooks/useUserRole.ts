import { useAuth } from '../store/useAuth';

export function useUserRole() {
  const { user, isLoading } = useAuth();
  
  return {
    role: user?.role || null,
    isAdmin: user?.role === 'admin',
    isSeller: user?.role === 'seller',
    isBuyer: user?.role === 'buyer',
    isLoading
  };
}
