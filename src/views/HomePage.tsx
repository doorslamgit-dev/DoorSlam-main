import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Landing from '@/views/Landing';

export default function HomePage() {
  const navigate = useNavigate();
  const { loading, user, isParent, isChild, isUnresolved, parentChildCount } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user || isUnresolved) return;
    if (isChild) {
      navigate('/child/today', { replace: true });
      return;
    }
    if (isParent) {
      if (parentChildCount === 0) {
        navigate('/parent/onboarding', { replace: true });
      } else {
        navigate('/parent', { replace: true });
      }
    }
  }, [loading, user, isParent, isChild, isUnresolved, parentChildCount, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-neutral-600">
        Loading...
      </div>
    );
  }

  if (!user || isUnresolved) return <Landing />;

  return (
    <div className="min-h-screen flex items-center justify-center text-sm text-neutral-600">
      Loading...
    </div>
  );
}
