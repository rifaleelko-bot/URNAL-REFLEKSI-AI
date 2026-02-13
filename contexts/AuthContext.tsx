import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState } from '../types';

interface AuthContextType extends AuthState {
  login: (email: string, name: string) => Promise<void>;
  logout: () => void;
  register: (email: string, name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    // Simulate checking local storage for session
    const storedUser = localStorage.getItem('journal_user');
    if (storedUser) {
      setState({
        user: JSON.parse(storedUser),
        isAuthenticated: true,
        isLoading: false,
      });
    } else {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = async (email: string, name: string) => {
    setState((prev) => ({ ...prev, isLoading: true }));
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    // Simple mock auth - in real app, verify credentials
    const user: User = {
      id: btoa(email), // simple mock ID
      email,
      name,
    };
    
    localStorage.setItem('journal_user', JSON.stringify(user));
    setState({
      user,
      isAuthenticated: true,
      isLoading: false,
    });
  };

  const register = async (email: string, name: string) => {
    // For this mock, register is same as login
    return login(email, name);
  };

  const logout = () => {
    localStorage.removeItem('journal_user');
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};