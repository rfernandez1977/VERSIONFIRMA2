declare global {
  namespace NodeJS {
    interface ProcessEnv {
      EXPO_PUBLIC_API_URL: string;
      EXPO_PUBLIC_API_KEY: string;
      EXPO_PUBLIC_API_TOKEN: string;
      EXPO_PUBLIC_COMPANY_ID: string;
    }
  }
}

// Ensure this file is treated as a module
export {};