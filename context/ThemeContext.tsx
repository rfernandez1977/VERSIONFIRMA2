import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeType = 'light' | 'dark' | 'system';
type PrintSizeType = 'letter' | 'ticket';
type PrinterType = 'epson' | 'zebra' | 'generic' | 'star';
type PaymentGatewayType = 'mercadopago' | 'getnet' | 'bcipagos' | 'sumup' | 'compraqui' | 'tuu' | 'halmer' | 'haulmer' | 'transbank' | 'klap' | 'none';
type AIProviderType = 'gemini' | 'openai' | 'anthropic' | 'cohere' | 'mistral' | 'llama' | 'palm' | 'azure' | 'none';

interface AIConfig {
  provider: AIProviderType;
  apiKey: string;
  organizationId?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  endpoint?: string;
  projectNumber?: string;
}

interface CAFConfig {
  folioRange: {
    start: number;
    end: number;
  };
  expirationDate: string;
  uploadDate: string;
  fileName: string;
  isValid: boolean;
}

interface PrinterConfig {
  type: PrinterType;
  model?: string;
  connection?: 'bluetooth' | 'wifi' | 'usb';
  address?: string;
  port?: number;
}

interface Settings {
  theme: ThemeType;
  printSize: PrintSizeType;
  printerType: PrinterType;
  printerConfig: PrinterConfig;
  paymentGateway: PaymentGatewayType;
  paymentGatewayEnabled: boolean;
  aiConfig: AIConfig;
  aiEnabled: boolean;
  offlineMode: boolean;
  notifications: boolean;
  language: string;
  caf: CAFConfig | null;
}

interface ThemeContextType extends Settings {
  isDark: boolean;
  setTheme: (theme: ThemeType) => void;
  setPrintSize: (size: PrintSizeType) => void;
  setPrinterType: (type: PrinterType) => void;
  setPrinterConfig: (config: PrinterConfig) => void;
  setPaymentGateway: (gateway: PaymentGatewayType) => void;
  setPaymentGatewayEnabled: (enabled: boolean) => void;
  setAIConfig: (config: AIConfig) => void;
  setAIEnabled: (enabled: boolean) => void;
  setOfflineMode: (enabled: boolean) => void;
  setNotifications: (enabled: boolean) => void;
  setLanguage: (lang: string) => void;
  setCAF: (caf: CAFConfig | null) => void;
}

const defaultSettings: Settings = {
  theme: 'light',
  printSize: 'letter',
  printerType: 'generic',
  printerConfig: {
    type: 'generic',
    model: undefined,
    connection: undefined,
    address: undefined,
    port: undefined
  },
  paymentGateway: 'none',
  paymentGatewayEnabled: false,
  aiConfig: {
    provider: 'gemini',
    apiKey: 'AIzaSyBA05yNc7Ua7LkmT4qbUzLkTKin2bXMtjM',
    projectNumber: '1069124584649',
    model: 'gemini-pro',
    temperature: 0.7,
    maxTokens: 1000
  },
  aiEnabled: true,
  offlineMode: false,
  notifications: true,
  language: 'es',
  caf: null
};

const STORAGE_KEY = '@settings';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  // Load settings from AsyncStorage on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const storedSettings = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedSettings) {
        setSettings(JSON.parse(storedSettings));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async (newSettings: Settings) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const isDark = 
    settings.theme === 'system' 
      ? systemColorScheme === 'dark'
      : settings.theme === 'dark';

  const setTheme = (theme: ThemeType) => {
    saveSettings({ ...settings, theme });
  };

  const setPrintSize = (printSize: PrintSizeType) => {
    saveSettings({ ...settings, printSize });
  };

  const setPrinterType = (printerType: PrinterType) => {
    saveSettings({ ...settings, printerType });
  };

  const setPrinterConfig = (printerConfig: PrinterConfig) => {
    saveSettings({ ...settings, printerConfig });
  };

  const setPaymentGateway = (paymentGateway: PaymentGatewayType) => {
    saveSettings({ ...settings, paymentGateway });
  };

  const setPaymentGatewayEnabled = (paymentGatewayEnabled: boolean) => {
    saveSettings({ ...settings, paymentGatewayEnabled });
  };

  const setAIConfig = (aiConfig: AIConfig) => {
    saveSettings({ ...settings, aiConfig });
  };

  const setAIEnabled = (aiEnabled: boolean) => {
    saveSettings({ ...settings, aiEnabled });
  };

  const setOfflineMode = (offlineMode: boolean) => {
    saveSettings({ ...settings, offlineMode });
  };

  const setNotifications = (notifications: boolean) => {
    saveSettings({ ...settings, notifications });
  };

  const setLanguage = (language: string) => {
    saveSettings({ ...settings, language });
  };

  const setCAF = (caf: CAFConfig | null) => {
    saveSettings({ ...settings, caf });
  };

  return (
    <ThemeContext.Provider value={{ 
      ...settings,
      isDark,
      setTheme,
      setPrintSize,
      setPrinterType,
      setPrinterConfig,
      setPaymentGateway,
      setPaymentGatewayEnabled,
      setAIConfig,
      setAIEnabled,
      setOfflineMode,
      setNotifications,
      setLanguage,
      setCAF
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}