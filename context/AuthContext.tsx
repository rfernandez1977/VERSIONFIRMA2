import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Authentication context types
interface Company {
  id: number;
  name: string;
  // Other company fields as needed
}

interface User {
  id: number;
  email: string;
  name: string;
  token: string;
  companies: Company[];
  // Other user fields as needed
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  setActiveCompany: (companyId: number) => void;
  activeCompany: Company | null;
}

// Storage keys
const AUTH_USER_KEY = '@auth_user';
const ACTIVE_COMPANY_KEY = '@active_company';

// Create the context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  signIn: async () => {},
  signOut: async () => {},
  setActiveCompany: () => {},
  activeCompany: null,
});

// Authentication provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCompany, setActiveCompanyState] = useState<Company | null>(null);

  // Load stored authentication state on mount
  useEffect(() => {
    loadStoredAuth();
  }, []);

  // Load stored authentication data
  const loadStoredAuth = async () => {
    try {
      setIsLoading(true);
      
      // Get stored user data
      const userJson = await AsyncStorage.getItem(AUTH_USER_KEY);
      if (userJson) {
        const userData = JSON.parse(userJson);
        setUser(userData);
        
        // Get stored active company
        const activeCompanyJson = await AsyncStorage.getItem(ACTIVE_COMPANY_KEY);
        if (activeCompanyJson) {
          setActiveCompanyState(JSON.parse(activeCompanyJson));
        } else if (userData.companies && userData.companies.length > 0) {
          // Default to first company if none selected
          setActiveCompanyState(userData.companies[0]);
          await AsyncStorage.setItem(
            ACTIVE_COMPANY_KEY, 
            JSON.stringify(userData.companies[0])
          );
        }
      }
    } catch (error) {
      console.error('Error loading authentication data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Convert login/password to Base64 encoded JSON
  const encodeLoginCredentials = (login: string, password: string): string => {
    const json = JSON.stringify({ login, password });
    // In a browser environment use btoa, otherwise use a proper Base64 encoding library
    if (typeof btoa === 'function') {
      return btoa(json);
    } else {
      // For React Native, we need to use a different approach
      // This is a simple implementation and might need to be replaced with a proper library
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
      let base64 = '';
      let bytes = new Uint8Array([...json].map(c => c.charCodeAt(0)));
      let byteRemainder = bytes.length % 3;
      let mainLength = bytes.length - byteRemainder;
      let a, b, c, d;
      let chunk;

      // Main loop deals with bytes in chunks of 3
      for (let i = 0; i < mainLength; i = i + 3) {
        // Combine the three bytes into a single integer
        chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];

        // Use bitmasks to extract 6-bit segments from the triplet
        a = (chunk & 16515072) >> 18; // 16515072 = (2^6 - 1) << 18
        b = (chunk & 258048) >> 12; // 258048 = (2^6 - 1) << 12
        c = (chunk & 4032) >> 6; // 4032 = (2^6 - 1) << 6
        d = chunk & 63; // 63 = 2^6 - 1

        // Convert the raw binary segments to the appropriate ASCII encoding
        base64 += chars[a] + chars[b] + chars[c] + chars[d];
      }

      // Deal with the remaining bytes and padding
      if (byteRemainder === 1) {
        chunk = bytes[mainLength];
        a = (chunk & 252) >> 2; // 252 = (2^6 - 1) << 2
        b = (chunk & 3) << 4; // 3 = 2^2 - 1
        base64 += chars[a] + chars[b] + '==';
      } else if (byteRemainder === 2) {
        chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1];
        a = (chunk & 64512) >> 10; // 64512 = (2^6 - 1) << 10
        b = (chunk & 1008) >> 4; // 1008 = (2^6 - 1) << 4
        c = (chunk & 15) << 2; // 15 = 2^4 - 1
        base64 += chars[a] + chars[b] + chars[c] + '=';
      }

      return base64;
    }
  };

  // Handle sign in
  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      // Encode login credentials
      const encodedCredentials = encodeLoginCredentials(email, password);
      const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://produccion.facturamovil.cl';
      
      // Make API request
      const response = await fetch(`${API_BASE}/services/common/user/${encodedCredentials}`);
      const data = await response.json();
      
      if (!response.ok || data.success === false) {
        throw new Error(data.details || 'Authentication failed');
      }
      
      // Create user object from response
      const userData: User = {
        id: data.id,
        email: data.email,
        name: data.name || data.email,
        token: data.token,
        companies: data.companies || []
      };
      
      // Save user data to storage
      await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(userData));
      
      // Set default active company if available
      if (userData.companies && userData.companies.length > 0) {
        setActiveCompanyState(userData.companies[0]);
        await AsyncStorage.setItem(
          ACTIVE_COMPANY_KEY, 
          JSON.stringify(userData.companies[0])
        );
      }
      
      // Update state
      setUser(userData);
    } catch (error) {
      console.error('Authentication error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Handle sign out
  const signOut = async () => {
    try {
      await AsyncStorage.removeItem(AUTH_USER_KEY);
      await AsyncStorage.removeItem(ACTIVE_COMPANY_KEY);
      setUser(null);
      setActiveCompanyState(null);
    } catch (error) {
      console.error('Error during sign out:', error);
    }
  };

  // Set active company
  const setActiveCompany = async (companyId: number) => {
    if (!user || !user.companies) return;
    
    const company = user.companies.find(c => c.id === companyId);
    if (company) {
      setActiveCompanyState(company);
      await AsyncStorage.setItem(ACTIVE_COMPANY_KEY, JSON.stringify(company));
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    signIn,
    signOut,
    activeCompany,
    setActiveCompany
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}