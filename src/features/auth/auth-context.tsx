import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../../types';
import { SEED_USERS } from '../../services/mock/seed-data';

interface AuthContextType {
  currentUser: User | null;
  currentRole: UserRole;
  isAuthenticated: boolean;
  loginAsRole: (role: UserRole) => void;
  logout: () => void;
  canAccessRole: (allowedRoles: UserRole[]) => boolean;
}

const AUTH_STORAGE_KEY = 'safedrive_auth_user_v1';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse saved user:', e);
    }
    // Default to Fleet Owner on initial load for richest product view
    return SEED_USERS.find(u => u.role === 'owner') || SEED_USERS[0];
  });

  const currentRole: UserRole = currentUser?.role || 'owner';

  const loginAsRole = (role: UserRole) => {
    const user = SEED_USERS.find(u => u.role === role) || {
      id: `USR-${role.toUpperCase()}`,
      name: `${role.charAt(0).toUpperCase() + role.slice(1)} User`,
      email: `${role}@safedrive.ai`,
      phone: '+91 98000 00000',
      role,
      organizationId: 'ORG-BHARAT-01',
      organizationName: 'Bharat Logistics Ltd',
      lastActive: new Date().toISOString(),
    };

    setCurrentUser(user);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } catch (e) {
      console.warn('Failed to save user session:', e);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to clear user session:', e);
    }
  };

  const canAccessRole = (allowedRoles: UserRole[]): boolean => {
    if (!currentUser) return false;
    // Admin has platform-wide superuser access
    if (currentUser.role === 'admin') return true;
    return allowedRoles.includes(currentUser.role);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentRole,
        isAuthenticated: !!currentUser,
        loginAsRole,
        logout,
        canAccessRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
