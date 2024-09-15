
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  if (!isAuthenticated) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
