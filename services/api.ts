import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as crypto from 'crypto-js';
import { Platform } from 'react-native';

// API Configuration - Using environment variables
const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://produccion.facturamovil.cl';
const API_TOKEN = process.env.EXPO_PUBLIC_API_TOKEN || '431ab8e9-7867-416b-9aab-0c32c924973c';
const COMPANY_ID = process.env.EXPO_PUBLIC_COMPANY_ID || '29';

// Authentication storage keys
const AUTH_USER_KEY = '@auth_user';
const ACTIVE_COMPANY_KEY = '@active_company';

// Cache keys
const CACHE_KEYS = {
  PRODUCTS: '@products',
  CLIENTS: '@clients',
  SALES: '@sales',
  INVOICE_DETAILS: '@invoice_details'
};

// Mock data for web environment to handle CORS issues
const mockProducts = [
  {
    id: 1,
    code: 'PRD001',
    name: 'Laptop HP EliteBook',
    price: 850000,
    unit: {
      id: 1,
      code: 'UN',
      name: 'Unidad',
    },
    category: {
      id: 1,
      code: 'TECH',
      name: 'Tecnología',
      otherTax: null,
    },
  },
  {
    id: 2,
    code: 'PRD002',
    name: 'Monitor Dell 24"',
    price: 150000,
    unit: {
      id: 1,
      code: 'UN',
      name: 'Unidad',
    },
    category: {
      id: 1,
      code: 'TECH',
      name: 'Tecnología',
      otherTax: null,
    },
  },
  {
    id: 3,
    code: 'PRD003',
    name: 'Smartphone Samsung Galaxy',
    price: 450000,
    unit: {
      id: 1,
      code: 'UN',
      name: 'Unidad',
    },
    category: {
      id: 1,
      code: 'TECH',
      name: 'Tecnología',
      otherTax: null,
    },
  },
  {
    id: 4,
    code: 'PRD004',
    name: 'Vino Reserva Especial',
    price: 25000,
    unit: {
      id: 1,
      code: 'UN',
      name: 'Unidad',
    },
    category: {
      id: 2,
      code: 'ALC',
      name: 'Alcoholes',
      otherTax: {
        id: 1,
        code: 'ILA',
        name: 'Impuesto Ley de Alcoholes',
        percent: 10,
      },
    },
  },
  {
    id: 5,
    code: 'PRD005',
    name: 'Licor Artesanal',
    price: 15000,
    unit: {
      id: 1,
      code: 'UN',
      name: 'Unidad',
    },
    category: {
      id: 2,
      code: 'ALC',
      name: 'Alcoholes',
      otherTax: {
        id: 1,
        code: 'ILA',
        name: 'Impuesto Ley de Alcoholes',
        percent: 10,
      },
    },
  },
  {
    id: 6,
    code: 'PRD006',
    name: 'Servicio de Mantenimiento',
    price: 45000,
    unit: {
      id: 2,
      code: 'HRA',
      name: 'Hora',
    },
    category: {
      id: 3,
      code: 'SERV',
      name: 'Servicios',
      otherTax: null,
    },
  },
];

const mockClients = [
  {
    id: 1,
    code: '76543210-1',
    name: 'Comercial XYZ S.A.',
    line: 'Empresa',
    email: 'contacto@xyz.cl',
    address: 'Av. Principal 123',
    municipality: {
      id: 1,
      code: 'STGO',
      name: 'Santiago',
    },
    activity: {
      id: 1,
      code: 'TECH',
      name: 'Tecnología',
    },
  },
  {
    id: 2,
    code: '12345678-9',
    name: 'Juan Pérez González',
    line: 'Persona',
    email: 'juan.perez@email.com',
    address: 'Los Aromos 456',
    municipality: {
      id: 2,
      code: 'PROV',
      name: 'Providencia',
    },
    activity: {
      id: 2,
      code: 'PROF',
      name: 'Profesional',
    },
  },
  {
    id: 3,
    code: '87654321-0',
    name: 'Distribuidora Nacional Ltda.',
    line: 'Empresa',
    email: 'ventas@distribuidora.cl',
    address: 'Calle Comercio 789',
    municipality: {
      id: 3,
      code: 'LC',
      name: 'Las Condes',
    },
    activity: {
      id: 3,
      code: 'DIST',
      name: 'Distribución',
    },
  },
];

// Mock sales data to include recent invoices
const mockSales = [
  {
    id: 1001,
    type: 'FACTURA',
    assignedFolio: '1001',
    externalFolio: null,
    state: ['ACCEPTED', 'Aceptado'],
    date: new Date().toISOString().split('T')[0],
    client: {
      id: 1,
      rut: '76543210-1',
      name: 'Comercial XYZ S.A.'
    },
    total: 1000000,
    validation: 'OK'
  },
  {
    id: 1002,
    type: 'BOLETA',
    assignedFolio: '1002',
    externalFolio: null,
    state: ['ACCEPTED', 'Aceptado'],
    date: new Date().toISOString().split('T')[0],
    client: {
      id: 2,
      rut: '12345678-9',
      name: 'Juan Pérez González'
    },
    total: 450000,
    validation: 'OK'
  }
];

// Store recently created invoices for the session (used in web environment)
const recentlyCreatedInvoices = new Map();

// Mock response for ticket creation in web environment
const mockTicketResponse = {
  id: 12345,
  assignedFolio: "12345",
  externalFolio: null,
  date: new Date().toISOString().split('T')[0],
  client: {
    code: "55555555-5",
    name: "Cliente Final"
  },
  total: 119000,
  details: [
    {
      id: 1,
      product: {
        code: "PROD1",
        description: "Producto de Prueba",
        unit: "UN",
        price: 100000
      },
      service: null,
      quantity: 1
    }
  ],
  references: [],
  discounts: [],
  validation: "OK"
};

// Interfaces
export interface Product {
  id: number;
  code: string;
  name: string;
  price: number;
  unit: {
    id: number;
    code: string;
    name: string;
  };
  category: {
    id: number;
    code: string;
    name: string;
    otherTax: {
      id: number;
      code: string;
      name: string;
      percent: number;
    } | null;
  };
}

export interface Client {
  id: number;
  code: string;
  name: string;
  line?: string;
  email?: string;
  address?: string;
  municipality?: {
    id: number;
    code: string;
    name: string;
  };
  activity?: {
    id: number;
    code: string;
    name: string;
  };
}

export interface Document {
  id: number;
  type: string;
  assignedFolio: string;
  externalFolio: string | null;
  state: string[];
  date: string;
  client: {
    id: number;
    rut: string;
    name: string;
    email?: string;
  };
  total: number;
  validation: string;
  details?: any[];
}

// Interfaces para creación de factura
export interface InvoiceProductDetail {
  position: number;
  product: {
    code: string;
    name: string;
    unit?: {
      code: string;
    };
    price: number;
    category?: {
      id: number;
      code: string;
      name: string;
      otherTax?: {
        id: number;
        code: string;
        name: string;
        percent: number;
      };
    };
  };
  quantity: number;
  description?: string;
}

interface InvoiceReference {
  position: string;
  documentType: {
    code: string;
  };
  referencedFolio: string;
  date: string;
  description: string;
}

interface InvoicePayment {
  position: number;
  date: string;
  amount: number;
  description: string;
}

interface InvoiceClient {
  municipality?: string;
  code: string;
  name: string;
  line?: string;
  address?: string;
}

export interface InvoiceRequest {
  currency: string;
  hasTaxes: boolean;
  client: InvoiceClient;
  externalFolio?: string;
  date: string;
  details: InvoiceProductDetail[];
  references?: InvoiceReference[];
  payments?: InvoicePayment[];
  // New fields for header information
  paymentMethod?: string; // 'Contado' or 'Crédito'
  paymentCondition?: string; // 'Efectivo' or 'Tarjeta'
  cardReference?: string;
  dueDate?: string;
}

// Interfaces para creación de boleta
interface TicketProductDetail {
  position: number;
  product: {
    code: string;
    name: string;
    unit?: {
      code: string;
    };
    price: number;
    category?: {
      id: number;
      code: string;
      name: string;
      otherTax?: {
        id: number;
        code: string;
        name: string;
        percent: number;
      };
    };
  };
  quantity: number;
  description?: string;
}

interface TicketPayment {
  position: number;
  date: string;
  amount: number;
  description: string;
}

interface TicketClient {
  code: string;
  name: string;
  address?: string;
  municipality?: string;
}

export interface TicketRequest {
  netAmounts: boolean;
  hasTaxes: boolean;
  ticketType: {
    code: string;
  };
  externalFolio?: string;
  date: string;
  details: TicketProductDetail[];
  payments?: TicketPayment[];
  client?: TicketClient;
  // New fields for header information
  paymentMethod?: string; // 'Contado' or 'Crédito'
  paymentCondition?: string; // 'Efectivo' or 'Tarjeta'
  cardReference?: string;
  dueDate?: string;
}

// Interfaces para respuesta de boleta
interface TicketResponse {
  id: number;
  assignedFolio: string;
  externalFolio: string | null;
  date: string;
  client: {
    code: string;
    name: string;
  };
  total: number;
  details: {
    id: number;
    product: {
      code: string;
      description: string;
      unit: string;
      price: number;
    };
    service: null;
    quantity: number;
  }[];
  references: any[];
  discounts: any[];
  validation: string;
}

// Auth interfaces
interface AuthUser {
  id: number;
  email: string;
  token: string;
  companies: any[];
}

class API {
  private axiosInstance = axios.create({
    baseURL: API_BASE,
    headers: {
      'Content-Type': 'application/json'
    },
    timeout: 15000
  });

  private isWebEnvironment = Platform.OS === 'web';
  private authToken: string | null = null;
  
  constructor() {
    this.initializeAuthHeader();
    
    // Add request interceptor to inject token on each request
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        // If we don't have a token in memory, try to get it from storage
        if (!this.authToken) {
          await this.initializeAuthHeader();
        }
        
        // If we have a token, add it to the request header
        if (this.authToken) {
          config.headers['FACMOV_T'] = this.authToken;
        } else if (API_TOKEN) {
          // Fallback to the environment token if no auth token
          config.headers['FACMOV_T'] = API_TOKEN;
        }
        
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }
  
  // Initialize the auth token from storage
  private async initializeAuthHeader() {
    // Skip if in server/Node.js environment where window is not defined
    if (typeof window === 'undefined' || !this.isClientSide()) {
      return;
    }
    
    try {
      const userJson = await AsyncStorage.getItem(AUTH_USER_KEY);
      if (userJson) {
        const userData: AuthUser = JSON.parse(userJson);
        if (userData && userData.token) {
          this.authToken = userData.token;
        }
      }
    } catch (error) {
      console.error('Error initializing auth header:', error);
    }
  }
  
  // Helper to check if code is running on client side
  private isClientSide(): boolean {
    return typeof window !== 'undefined' && Platform.OS === 'web';
  }

  // Authentication method
  async authenticate(login: string, password: string): Promise<AuthUser> {
    try {
      // Create the authentication payload
      const payload = JSON.stringify({ login, password });
      
      // Convert to Base64
      let base64Payload: string;
      if (typeof window !== 'undefined' && typeof btoa === 'function') {
        base64Payload = btoa(payload);
      } else {
        // For React Native or Node.js environment, use a proper Base64 encoding
        base64Payload = this.toBase64(payload);
      }
      
      // Make the authentication request
      const response = await fetch(`${API_BASE}/services/common/user/${base64Payload}`);
      const data = await response.json();
      
      if (!response.ok || data.success === false) {
        throw new Error(data.details || 'Authentication failed');
      }
      
      // Store the token for future requests
      this.authToken = data.token;
      
      return data;
    } catch (error) {
      console.error('Authentication error:', error);
      throw error;
    }
  }
  
  // Simple Base64 encoding for React Native
  private toBase64(input: string): string {
    // This is a simple implementation; consider using a library for production
    const base64code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    let output = "";
    
    // Convert to UTF-8 array
    const utf8 = [];
    for (let i = 0; i < input.length; i++) {
      let charcode = input.charCodeAt(i);
      if (charcode < 0x80) utf8.push(charcode);
      else if (charcode < 0x800) {
        utf8.push(0xc0 | (charcode >> 6), 
                  0x80 | (charcode & 0x3f));
      }
      else if (charcode < 0xd800 || charcode >= 0xe000) {
        utf8.push(0xe0 | (charcode >> 12), 
                  0x80 | ((charcode>>6) & 0x3f), 
                  0x80 | (charcode & 0x3f));
      }
      else {
        i++;
        charcode = ((charcode & 0x3ff)<<10) | (input.charCodeAt(i) & 0x3ff);
        utf8.push(0xf0 | (charcode >>18), 
                  0x80 | ((charcode>>12) & 0x3f), 
                  0x80 | ((charcode>>6) & 0x3f), 
                  0x80 | (charcode & 0x3f));
      }
    }
    
    // Convert UTF-8 array to base64
    let i = 0;
    const end = utf8.length;
    
    while (i < end) {
      const triplet = (utf8[i++] << 16) | 
                     (i < end ? utf8[i++] << 8 : 0) | 
                     (i < end ? utf8[i++] : 0);
      
      output += base64code.charAt((triplet >> 18) & 0x3F) + 
                base64code.charAt((triplet >> 12) & 0x3F) + 
                (i > end + 2 ? '=' : base64code.charAt((triplet >> 6) & 0x3F)) + 
                (i > end + 1 ? '=' : base64code.charAt(triplet & 0x3F));
    }
    
    return output;
  }

  // Cache management
  private async getCache<T>(key: string): Promise<T | null> {
    // Skip if in server environment where window is not defined
    if (typeof window === 'undefined' || !this.isClientSide()) {
      return null;
    }
    
    try {
      const cached = await AsyncStorage.getItem(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Error reading from cache:', error);
      return null;
    }
  }

  private async setCache<T>(key: string, data: T): Promise<void> {
    // Skip if in server environment where window is not defined
    if (typeof window === 'undefined' || !this.isClientSide()) {
      return;
    }
    
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Error writing to cache:', error);
    }
  }

  // Helper method to generate SHA-1 hash
  private generateSHA1(value: string): string {
    return crypto.SHA1(value).toString();
  }

  // Retry function with exponential backoff
  private async retryOperation<T>(
    operation: () => Promise<T>,
    retries = 3,
    delay = 1000,
    backoffFactor = 2
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (retries <= 0) {
        throw error;
      }
      
      console.log(`Retrying operation, ${retries} attempts left. Waiting ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      return this.retryOperation(
        operation,
        retries - 1,
        delay * backoffFactor,
        backoffFactor
      );
    }
  }

  // API methods
  async getProducts(forceRefresh = false): Promise<Product[]> {
    try {
      // For web environment, use mock data to avoid CORS issues
      if (this.isWebEnvironment) {
        console.log('Using mock products data for web environment');
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        return mockProducts;
      }

      // Check cache first
      if (!forceRefresh) {
        const cached = await this.getCache<Product[]>(CACHE_KEYS.PRODUCTS);
        if (cached) return cached;
      }

      // Fetch from API
      const response = await this.axiosInstance.get('/services/common/product');
      const products = response.data?.products || [];

      // Update cache
      await this.setCache(CACHE_KEYS.PRODUCTS, products);
      
      return products;
    } catch (error) {
      console.error('Error fetching products:', error);
      
      // Return cached data if available
      const cached = await this.getCache<Product[]>(CACHE_KEYS.PRODUCTS);
      if (cached) return cached;
      
      // If on web and no cache, return mock data as fallback
      if (this.isWebEnvironment) {
        console.log('Falling back to mock products data');
        return mockProducts;
      }
      
      throw error;
    }
  }

  // Search products by term
  async searchProducts(searchTerm: string): Promise<Product[]> {
    try {
      // For web environment, use mock data to avoid CORS issues
      if (this.isWebEnvironment) {
        console.log('Using mock products search for web environment');
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        return mockProducts.filter(product => 
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.code.includes(searchTerm) ||
          product.category.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Use retry mechanism with exponential backoff for the API call
      return await this.retryOperation(async () => {
        try {
          // Fetch from API with search term
          const response = await this.axiosInstance.get(`/services/common/product/${searchTerm}`);
          return response.data?.products || [];
        } catch (error) {
          // Check for specific error status
          if (axios.isAxiosError(error) && error.response?.status === 500) {
            console.error('Server error (500) when searching products. Falling back to cache.');
            
            // Try to filter from cached products as fallback
            const cached = await this.getCache<Product[]>(CACHE_KEYS.PRODUCTS);
            if (cached) {
              return cached.filter(product => 
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.code.includes(searchTerm) ||
                product.category.name.toLowerCase().includes(searchTerm.toLowerCase())
              );
            }
            
            // If no cache available, throw a more user-friendly error
            throw new Error('Servicio de búsqueda no disponible temporalmente. Intente nuevamente más tarde.');
          }
          // Rethrow other errors to be handled by the retry mechanism
          throw error;
        }
      });
    } catch (error) {
      console.error('Error searching products:', error);
      
      // Already tried with retry, now try cached products as a last resort
      const cached = await this.getCache<Product[]>(CACHE_KEYS.PRODUCTS);
      if (cached) {
        return cached.filter(product => 
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.code.includes(searchTerm) ||
          product.category.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      // If on web and no cache, use filtered mock data
      if (this.isWebEnvironment) {
        console.log('Falling back to filtered mock products');
        return mockProducts.filter(product => 
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.code.includes(searchTerm) ||
          product.category.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      // Return empty array instead of throwing error for a smoother user experience
      console.error('No fallback available, returning empty results');
      return [];
    }
  }

  async getClients(forceRefresh = false, searchTerm = ''): Promise<Client[]> {
    try {
      // For web environment, use mock data to avoid CORS issues
      if (this.isWebEnvironment) {
        console.log('Using mock clients data for web environment');
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (searchTerm) {
          return mockClients.filter(client => 
            client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.code.includes(searchTerm)
          );
        }
        
        return mockClients;
      }

      // If there's a search term, always fetch from API (don't use cache)
      if (!forceRefresh && !searchTerm) {
        const cached = await this.getCache<Client[]>(CACHE_KEYS.CLIENTS);
        if (cached) return cached;
      }

      // Construct API endpoint with search term if provided
      let endpoint = '/services/common/client';
      if (searchTerm) {
        endpoint = `/services/common/client/${searchTerm}`;
      }

      // Fetch from API
      const response = await this.axiosInstance.get(endpoint);
      const clients = response.data?.clients || [];

      // Only update cache if this is a full refresh without search
      if (!searchTerm) {
        await this.setCache(CACHE_KEYS.CLIENTS, clients);
      }
      
      return clients;
    } catch (error) {
      console.error('Error fetching clients:', error);
      
      // Only use cache for non-search or if search fails
      if (!searchTerm) {
        const cached = await this.getCache<Client[]>(CACHE_KEYS.CLIENTS);
        if (cached) return cached;
      }
      
      // If on web and no cache, return mock data as fallback
      if (this.isWebEnvironment) {
        console.log('Falling back to mock clients data');
        if (searchTerm) {
          return mockClients.filter(client => 
            client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.code.includes(searchTerm)
          );
        }
        return mockClients;
      }
      
      throw error;
    }
  }

  async getSales(forceRefresh = false): Promise<Document[]> {
    try {
      // For web environment, use mock data to avoid CORS issues
      if (this.isWebEnvironment) {
        console.log('Using mock sales data for web environment');
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Combine mock sales with any recently created invoices
        const recentInvoices = Array.from(recentlyCreatedInvoices.values());
        return [...mockSales, ...recentInvoices];
      }
      
      // Check cache first
      if (!forceRefresh) {
        const cached = await this.getCache<Document[]>(CACHE_KEYS.SALES);
        if (cached) return cached;
      }

      // Get active company from storage
      const activeCompanyJson = await AsyncStorage.getItem(ACTIVE_COMPANY_KEY);
      const activeCompany = activeCompanyJson ? JSON.parse(activeCompanyJson) : null;
      const companyId = activeCompany?.id || COMPANY_ID;

      // Fetch from API
      const response = await this.axiosInstance.get(
        `/services/common/company/${companyId}/lastsales/`
      );
      const documents = response.data?.documents || [];

      // Update cache
      await this.setCache(CACHE_KEYS.SALES, documents);
      
      return documents;
    } catch (error) {
      console.error('Error fetching sales:', error);
      
      // Return cached data if available
      const cached = await this.getCache<Document[]>(CACHE_KEYS.SALES);
      if (cached) return cached;
      
      // If on web and no cache, return mock data as fallback
      if (this.isWebEnvironment) {
        console.log('Falling back to mock sales data');
        const recentInvoices = Array.from(recentlyCreatedInvoices.values());
        return [...mockSales, ...recentInvoices];
      }
      
      throw error;
    }
  }

  // IMPROVED: Enhanced getInvoiceDetail method with multiple fallbacks
  async getInvoiceDetail(invoiceId: number): Promise<Document> {
    console.log(`Fetching invoice details for ID: ${invoiceId}`);
    
    try {
      // Check if we have the invoice in recently created invoices (for web environment)
      if (this.isWebEnvironment && recentlyCreatedInvoices.has(invoiceId)) {
        console.log(`Found invoice ${invoiceId} in recently created invoices`);
        return recentlyCreatedInvoices.get(invoiceId);
      }
      
      // Try to get from cache first
      const cacheKey = `${CACHE_KEYS.INVOICE_DETAILS}_${invoiceId}`;
      const cached = await this.getCache<Document>(cacheKey);
      
      if (cached) {
        console.log(`Found invoice ${invoiceId} in cache`);
        return cached;
      }
      
      // If on web, check mock sales for the invoice
      if (this.isWebEnvironment) {
        console.log(`Checking mock sales for invoice ${invoiceId}`);
        const mockInvoice = mockSales.find(doc => doc.id === invoiceId);
        
        if (mockInvoice) {
          console.log(`Found invoice ${invoiceId} in mock sales`);
          await this.setCache(cacheKey, mockInvoice);
          return mockInvoice;
        }
        
        // If not in mock sales, generate a mock invoice for the requested ID
        console.log(`Generating mock invoice for ${invoiceId}`);
        const generatedInvoice = {
          id: invoiceId,
          type: 'FACTURA',
          assignedFolio: invoiceId.toString(),
          externalFolio: null,
          state: ['ACCEPTED', 'Aceptado'],
          date: new Date().toISOString().split('T')[0],
          client: {
            id: 1,
            rut: '76543210-1',
            name: 'Comercial XYZ S.A.',
            email: 'contacto@xyz.cl'
          },
          total: 1000000,
          validation: 'OK',
          details: []
        };
        
        // Cache the generated invoice
        await this.setCache(cacheKey, generatedInvoice);
        // Also add to recently created invoices for future reference
        recentlyCreatedInvoices.set(invoiceId, generatedInvoice);
        
        return generatedInvoice;
      }
      
      // Get active company from storage
      const activeCompanyJson = await AsyncStorage.getItem(ACTIVE_COMPANY_KEY);
      const activeCompany = activeCompanyJson ? JSON.parse(activeCompanyJson) : null;
      const companyId = activeCompany?.id || COMPANY_ID;
      
      // Not in cache, try to get from sales list with retries
      console.log(`Fetching invoice ${invoiceId} from sales list`);
      return await this.retryOperation(async () => {
        // Fetch fresh sales data
        const sales = await this.getSales(true);
        const invoice = sales.find(doc => doc.id === invoiceId);
        
        if (invoice) {
          console.log(`Found invoice ${invoiceId} in sales list`);
          await this.setCache(cacheKey, invoice);
          return invoice;
        }
        
        // If not found in sales, try direct API call
        console.log(`Invoice ${invoiceId} not found in sales, trying direct API call`);
        try {
          const response = await this.axiosInstance.get(
            `/services/common/company/${companyId}/document/${invoiceId}`
          );
          
          if (response.data) {
            console.log(`Retrieved invoice ${invoiceId} via direct API call`);
            const invoiceData = response.data;
            await this.setCache(cacheKey, invoiceData);
            return invoiceData;
          }
        } catch (apiError) {
          console.error(`Direct API call failed for invoice ${invoiceId}:`, apiError);
        }
        
        throw new Error(`Invoice not found: ${invoiceId}`);
      }, 2, 1000); // Retry twice with 1 second initial delay
      
    } catch (error) {
      console.error(`Error getting invoice details for ID ${invoiceId}:`, error);
      
      // Last resort - try local cache once more
      const cacheKey = `${CACHE_KEYS.INVOICE_DETAILS}_${invoiceId}`;
      const cached = await this.getCache<Document>(cacheKey);
      
      if (cached) {
        console.log(`Last resort: Using cached invoice ${invoiceId}`);
        return cached;
      }
      
      // If on web, return a placeholder invoice as absolute fallback
      if (this.isWebEnvironment) {
        console.log(`Creating placeholder invoice for ${invoiceId} as last resort`);
        return {
          id: invoiceId,
          type: 'FACTURA',
          assignedFolio: invoiceId.toString(),
          externalFolio: null,
          state: ['PENDING', 'Pendiente'],
          date: new Date().toISOString().split('T')[0],
          client: {
            id: 1,
            rut: '76543210-1',
            name: 'Cliente Genérico'
          },
          total: 0,
          validation: 'FALLBACK',
          details: []
        };
      }
      
      throw error;
    }
  }

  async getInvoicePdf(invoiceId: number, folio: string): Promise<string> {
    try {
      // For web environment, return a web-friendly PDF URL or placeholder
      if (this.isWebEnvironment) {
        console.log('Using web-compatible PDF approach for web environment');
        // For web, we could return a PDF hosted on a CDN or a public URL
        // This is just a placeholder - in a real app, provide a genuine PDF URL
        return 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
      }
      
      // Get active company from storage
      const activeCompanyJson = await AsyncStorage.getItem(ACTIVE_COMPANY_KEY);
      const activeCompany = activeCompanyJson ? JSON.parse(activeCompanyJson) : null;
      const companyId = activeCompany?.id || COMPANY_ID;
      
      // Generate the verification value: SHA-1 hash of "<id>_<companyId>_<assignedFolio>"
      const valueToHash = `${invoiceId}_${companyId}_${folio}`;
      const verificationHash = this.generateSHA1(valueToHash);
      
      // Generate the URL for PDF
      const pdfUrl = `${API_BASE}/document/toPdf/${invoiceId}?v=${verificationHash}`;
      
      // For demonstration purposes, we'll just return the URL
      // In a real implementation, you might want to download the PDF to a file
      return pdfUrl;
    } catch (error) {
      console.error('Error generating PDF URL:', error);
      throw error;
    }
  }

  async createInvoice(invoice: InvoiceRequest): Promise<any> {
    try {
      // For web environment, simulate a successful response
      if (this.isWebEnvironment) {
        console.log('Simulating invoice creation for web environment');
        console.log('Sending invoice data:', JSON.stringify(invoice, null, 2));
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Generate a random ID for the invoice
        const invoiceId = Math.floor(Math.random() * 10000);
        const assignedFolio = Math.floor(Math.random() * 100000).toString();
        
        // Calculate total with tax
        const total = invoice.details.reduce((sum, item) => 
          sum + (item.product.price * item.quantity), 0) * 1.19;
        
        // Create a mock response
        const mockResponse = {
          id: invoiceId,
          assignedFolio: assignedFolio,
          externalFolio: null,
          date: invoice.date,
          client: {
            id: 1,
            rut: invoice.client.code,
            name: invoice.client.name,
            email: 'cliente@ejemplo.cl'
          },
          total: total,
          validation: 'OK',
          state: ['ACCEPTED', 'Aceptado'],
          type: 'FACTURA',
          details: invoice.details.map((item, index) => ({
            id: index + 1,
            product: {
              code: item.product.code,
              description: item.product.name,
              unit: item.product.unit?.code || 'UN',
              price: item.product.price
            },
            service: null,
            quantity: item.quantity
          }))
        };
        
        // Store the mock invoice in recently created invoices
        recentlyCreatedInvoices.set(invoiceId, mockResponse);
        
        // Store in cache too for better persistence
        const cacheKey = `${CACHE_KEYS.INVOICE_DETAILS}_${invoiceId}`;
        await this.setCache(cacheKey, mockResponse);
        
        // Clear sales cache to force reload with new invoice
        await this.clearSalesCache();
        
        console.log('Mock invoice created:', mockResponse);
        return mockResponse;
      }

      // Get active company from storage
      const activeCompanyJson = await AsyncStorage.getItem(ACTIVE_COMPANY_KEY);
      const activeCompany = activeCompanyJson ? JSON.parse(activeCompanyJson) : null;
      const companyId = activeCompany?.id || COMPANY_ID;

      // Add a log to see what we're sending
      console.log('Sending invoice data:', JSON.stringify(invoice, null, 2));

      // Llamada a la API para crear factura
      const response = await this.axiosInstance.post(
        `/services/raw/company/${companyId}/invoice`,
        invoice
      );
      
      console.log('Invoice API response:', response.data);
      
      // Store invoice in cache
      if (response.data && response.data.id) {
        const cacheKey = `${CACHE_KEYS.INVOICE_DETAILS}_${response.data.id}`;
        await this.setCache(cacheKey, response.data);
        
        // Clear sales cache to force reload with new invoice
        await this.clearSalesCache();
      }
      
      // La respuesta debería incluir información sobre la factura creada
      return response.data;
    } catch (error) {
      console.error('Error creating invoice:', error);
      
      // Enhanced error logging
      if (axios.isAxiosError(error)) {
        console.error('Axios error details:', {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          headers: error.response?.headers,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            headers: error.config?.headers,
            data: error.config?.data
          }
        });
      }
      
      throw error;
    }
  }

  async createTicket(ticket: TicketRequest): Promise<TicketResponse> {
    try {
      console.log('Beginning createTicket function in API');
      console.log('Environment:', this.isWebEnvironment ? 'Web' : 'Native');
      
      // For web environment, simulate a successful response
      if (this.isWebEnvironment) {
        console.log('Simulating ticket creation for web environment');
        console.log('Ticket request data:', JSON.stringify(ticket, null, 2));
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Calculate the total
        const subtotal = ticket.details.reduce((sum, item) => 
          sum + (item.product.price * item.quantity), 0);
        const total = subtotal * 1.19; // 19% IVA
        
        // Generate a random ID for the ticket
        const ticketId = Math.floor(Math.random() * 10000);
        const assignedFolio = Math.floor(Math.random() * 100000).toString();
        
        console.log('Ticket simulation - calculated total:', total);
        
        // Create a mock response
        const mockResponse = {
          id: ticketId,
          assignedFolio: assignedFolio,
          externalFolio: null,
          date: ticket.date,
          client: {
            code: ticket.client?.code || '55555555-5',
            name: ticket.client?.name || 'Cliente Final'
          },
          total: total,
          details: ticket.details.map((item, index) => ({
            id: index + 1,
            product: {
              code: item.product.code,
              description: item.product.name,
              unit: item.product.unit?.code || 'UN',
              price: item.product.price
            },
            service: null,
            quantity: item.quantity
          })),
          references: [],
          discounts: [],
          validation: 'OK',
          state: ['ACCEPTED', 'Aceptado'],
          type: 'BOLETA'
        };
        
        // Store the mock ticket in recently created invoices
        recentlyCreatedInvoices.set(ticketId, mockResponse);
        
        // Store in cache too for better persistence
        const cacheKey = `${CACHE_KEYS.INVOICE_DETAILS}_${ticketId}`;
        await this.setCache(cacheKey, mockResponse);
        
        // Clear sales cache to force reload with new ticket
        await this.clearSalesCache();
        
        console.log('Returning mock ticket response:', JSON.stringify(mockResponse, null, 2));
        return mockResponse;
      }
      
      // Get active company from storage
      const activeCompanyJson = await AsyncStorage.getItem(ACTIVE_COMPANY_KEY);
      const activeCompany = activeCompanyJson ? JSON.parse(activeCompanyJson) : null;
      const companyId = activeCompany?.id || COMPANY_ID;
      
      console.log('API request - Ticket data being sent to API:', JSON.stringify(ticket, null, 2));
      
      // The URL for the electronic ticket endpoint
      const ticketEndpoint = `/services/raw/company/${companyId}/ticket`;
      console.log('API endpoint:', API_BASE + ticketEndpoint);
      
      // Log headers being sent
      console.log('Request headers:', {
        'FACMOV_T': this.authToken || API_TOKEN,
        'Content-Type': 'application/json'
      });
      
      try {
        const response = await this.axiosInstance.post(ticketEndpoint, ticket);
        
        console.log('API response status:', response.status);
        console.log('API response headers:', response.headers);
        console.log('API response data:', JSON.stringify(response.data, null, 2));
        
        // Verify if response has data
        if (!response.data) {
          const errorMessage = 'No data received from server';
          console.error(errorMessage);
          throw new Error(errorMessage);
        }
        
        // Store ticket in cache
        if (response.data && response.data.id) {
          const cacheKey = `${CACHE_KEYS.INVOICE_DETAILS}_${response.data.id}`;
          await this.setCache(cacheKey, response.data);
          
          // Clear sales cache to force reload with new ticket
          await this.clearSalesCache();
        }
        
        return response.data;
      } catch (axiosError) {
        // Enhanced error logging for Axios errors
        if (axios.isAxiosError(axiosError)) {
          console.error('Axios error details:', {
            message: axiosError.message,
            status: axiosError.response?.status,
            statusText: axiosError.response?.statusText,
            data: axiosError.response?.data,
            headers: axiosError.response?.headers,
            config: {
              url: axiosError.config?.url,
              method: axiosError.config?.method,
              headers: axiosError.config?.headers,
              data: axiosError.config?.data
            }
          });
          
          throw new Error(`API Error: ${axiosError.message} - Status: ${axiosError.response?.status} - ${JSON.stringify(axiosError.response?.data)}`);
        } else {
          throw axiosError;
        }
      }
    } catch (error) {
      console.error('Error in createTicket:', error);
      
      // Rethrow with more details for better debugging
      if (error instanceof Error) {
        throw new Error(`Failed to create ticket: ${error.message}`);
      } else {
        throw new Error(`Failed to create ticket: Unknown error - ${JSON.stringify(error)}`);
      }
    }
  }

  async getProductsDetailed(): Promise<Product[]> {
    try {
      // For web environment, use mock data
      if (this.isWebEnvironment) {
        return mockProducts;
      }
      
      const response = await this.axiosInstance.get(
        `/common/product`
      );
      return response.data?.products || [];
    } catch (error) {
      console.error('Error fetching detailed products:', error);
      throw error;
    }
  }

  // Clear only sales cache
  async clearSalesCache(): Promise<void> {
    // Skip if in server environment where window is not defined
    if (typeof window === 'undefined' || !this.isClientSide()) {
      return;
    }
    
    try {
      await AsyncStorage.removeItem(CACHE_KEYS.SALES);
      console.log('Sales cache cleared successfully');
    } catch (error) {
      console.error('Error clearing sales cache:', error);
    }
  }

  // Clear all caches
  async clearCache(): Promise<void> {
    // Skip if in server environment where window is not defined
    if (typeof window === 'undefined' || !this.isClientSide()) {
      return;
    }
    
    try {
      await AsyncStorage.multiRemove([
        CACHE_KEYS.PRODUCTS,
        CACHE_KEYS.CLIENTS,
        CACHE_KEYS.SALES
      ]);
      console.log('All caches cleared successfully');
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  // Add a newly created invoice to the tracking system
  trackNewInvoice(invoice: Document): void {
    if (invoice && invoice.id) {
      console.log(`Tracking new invoice with ID: ${invoice.id}`);
      recentlyCreatedInvoices.set(invoice.id, invoice);
      
      // Also store in cache for persistence
      const cacheKey = `${CACHE_KEYS.INVOICE_DETAILS}_${invoice.id}`;
      this.setCache(cacheKey, invoice).catch(err => {
        console.error(`Failed to cache new invoice ${invoice.id}:`, err);
      });
    }
  }
}

export const api = new API();