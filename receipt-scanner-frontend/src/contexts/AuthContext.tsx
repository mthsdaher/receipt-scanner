//AuthContext + useAuth hook

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  token: string | null;
  isLoggedIn: boolean;
  signIn: (token: string) => void;
  signOut: () => void;
}

// 1. Create the context with default empty values
const AuthContext = createContext<AuthContextType>({
  token: null,
  isLoggedIn: false,
  signIn: () => {},
  signOut: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const navigate = useNavigate();

  // 2. On mount, read existing token from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('token');
    if (stored) setToken(stored);
  }, []);

  // 3. signIn: save token and update state
  const signIn = (newToken: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  // 4. signOut: remove token, update state and redirect to Sign In
  const signOut = () => {
    localStorage.removeItem('token');
    setToken(null);
    navigate('/signin', { replace: true });
  };

  return (
    <AuthContext.Provider value={{ token, isLoggedIn: !!token, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

// 5. Hook to consume the auth state anywhere
export const useAuth = () => useContext(AuthContext);
