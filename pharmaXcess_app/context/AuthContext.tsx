import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authApi from '../utils/api/auth';

type UserType = 'patient' | 'professional';

interface User {
  id: string;
  email: string;
  name?: string;
  userType?: UserType;
}

interface AuthContextType {
  user: User | null;
  userType: UserType | null;
  isLoading: boolean;
  authError: { message?: string; status?: number } | null;
  clearAuthError?: () => void;
  login: (email: string, password: string, userType?: UserType) => Promise<boolean>;
  register: (email: string, password: string, userType?: UserType, name?: string) => Promise<boolean>;
  logout: () => Promise<void>;
    forgotPassword?: (email: string) => Promise<string | null>;
    resetPassword?: (token: string, newPassword: string) => Promise<boolean>;
  setUserType: (type: UserType) => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userType, setUserTypeState] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<{ message?: string; status?: number } | null>(null);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      const storedUserType = await AsyncStorage.getItem('userType');
      
      if (userData) {
        setUser(JSON.parse(userData));
        if (storedUserType) {
          setUserTypeState(storedUserType as UserType);
        }
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string, userType?: UserType): Promise<boolean> => {
    try {
      // Clear any previous auth error so UI doesn't show stale messages while attempting login
      setAuthError(null);
      setIsLoading(true);
      // Call backend
      const result = await authApi.login(email, password);

      if (result.ok && result.data) {
        // backend returns user_id and sets session cookie (credentials: include)
        const userData: User = {
          id: String(result.data.user_id || ''),
          email: email,
          name: (result.data.name as string) || undefined,
          userType: userType,
        };

        await AsyncStorage.setItem('user', JSON.stringify(userData));
        // we don't use token-based auth here; session cookie is managed by backend
        if (userType) {
          await AsyncStorage.setItem('userType', userType);
          setUserTypeState(userType);
        }
        setUser(userData);
  // Clear any auth error on successful login
  setAuthError(null);
        return true;
      }

  const err = result.error || 'Email ou mot de passe incorrect';
  // Create an Error object and attach HTTP status so UI can react specifically (e.g., 401 -> offer signup)
  const e: any = new Error(err);
  e.status = result.status;
  // Store auth error in context so UI survives navigation remounts
  setAuthError({ message: err, status: result.status });
  throw e;
    } catch (error) {
      // propagate the error so the calling screen can show a friendly message
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, userType?: UserType, name?: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      // call backend register endpoint
      // backend expects nom/prenom/email/password — we'll try to split name
      const prenom = name || '';
      const nom = name || '';
      const result = await authApi.register(nom, prenom, email, password);

      if (result.ok) {
        // Optionally auto-login after register
        const logged = await login(email, password, userType);
        return logged;
      }

      const err = result.error || 'Registration failed';
      // Throw so calling screen can display backend message
      throw new Error(err);
    } catch (error) {
      // propagate the error up to the screen
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      // call backend logout to clear session if any
      try {
        await authApi.logout();
      } catch (e) {
        // Non-fatal
        console.warn('Backend logout failed', e);
      }

      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('userType');
      setUser(null);
      setUserTypeState(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const forgotPassword = async (email: string): Promise<string | null> => {
    // NOTE: do not toggle the global isLoading here because toggling it
    // causes RootNavigation to unmount and remount navigation stacks which
    // breaks navigation callbacks (Alert -> navigate). The screen should
    // show its own local loading indicator instead.
    try {
      const result = await authApi.forgotPassword(email);
      if (result.ok && result.data) {
        // backend in dev returns the token in the response body
        return (result.data.token as string) || null;
      }
      throw new Error(result.error || 'Impossible de générer le token');
    } catch (e) {
      throw e;
    }
  };

  const resetPassword = async (token: string, newPassword: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const result = await authApi.resetPassword(token, newPassword);
      if (result.ok) return true;
      return false;
    } catch (e) {
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const setUserType = async (type: UserType): Promise<void> => {
    try {
      await AsyncStorage.setItem('userType', type);
      setUserTypeState(type);
    } catch (error) {
      console.error('Error setting user type:', error);
    }
  };

  const value: AuthContextType = {
    user,
    userType,
    isLoading,
    authError,
    clearAuthError: () => setAuthError(null),
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    setUserType,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
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
