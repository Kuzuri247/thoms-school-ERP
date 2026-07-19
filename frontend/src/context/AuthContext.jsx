import React, { createContext } from 'react';
import useAuthStore from '../store/authStore';

export const AuthContext = createContext({
  user: null,
  token: null,
  login: async () => {},
  logout: async () => {},
  loading: false,
});

export const AuthProvider = ({ children }) => {
  const { user, accessToken: token, login, logout, isLoading: loading } = useAuthStore();

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;