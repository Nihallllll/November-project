import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const userId = localStorage.getItem('user_id');

    if (!token || !userId) {
      toast.error('Please log in to access this page');
      navigate('/login');
    }
  }, [navigate]);

  const token = localStorage.getItem('auth_token');
  const userId = localStorage.getItem('user_id');

  if (!token || !userId) {
    return null; // Don't render anything while redirecting
  }

  return <>{children}</>;
}
