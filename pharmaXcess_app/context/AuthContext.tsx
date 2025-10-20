import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  login: (email: string, password: string, userType?: UserType) => Promise<boolean>;
  register: (email: string, password: string, userType?: UserType, name?: string) => Promise<boolean>;
  logout: () => Promise<void>;
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

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      const token = await AsyncStorage.getItem('authToken');
      const storedUserType = await AsyncStorage.getItem('userType');
      
      if (userData && token) {
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
      setIsLoading(true);
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (email === 'test@example.com' && password === 'password') {
        const userData: User = {
          id: '1',
          email: email,
          name: 'Utilisateur Test',
          userType: userType
        };
        
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        await AsyncStorage.setItem('authToken', 'fake-jwt-token');

        // Store user type if provided 
        if (userType) {
          await AsyncStorage.setItem('userType', userType);
          setUserTypeState(userType); 
        }
        
        setUser(userData);
        return true;
      } else {
        throw new Error('Identifiants invalides');
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, userType?: UserType, name?: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const userData: User = {
        id: Date.now().toString(),
        email: email,
        name: name || 'Nouvel utilisateur',
        userType: userType
      };
      
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      await AsyncStorage.setItem('authToken', 'fake-jwt-token');
      
      // Store user type if provided
      if (userType) {
        await AsyncStorage.setItem('userType', userType);
        setUserTypeState(userType);
      }
      
      setUser(userData);
      return true;
    } catch (error) {
      console.error('Register error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userType');
      setUser(null);
      setUserTypeState(null);
    } catch (error) {
      console.error('Logout error:', error);
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
    login,
    register,
    logout,
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
