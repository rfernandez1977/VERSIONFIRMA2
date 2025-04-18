import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  Platform,
  StatusBar,
  FlatList,
  Modal,
  TextInput,
  Alert,
  Animated,
  Vibration,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { Zap, ArrowLeft, Download, Upload, ShoppingBag, ChartLine as LineChart, TrendingUp, Package, Globe, Instagram, Smartphone, Mail, Building2, CreditCard, Clock, Minus, Plus, TriangleAlert as AlertTriangle, Trash2, X, Check, Search, User, ChevronRight, MapPin, Briefcase, ChevronDown, RefreshCcw, DollarSign, Calendar, FileText, Receipt, Mic } from 'lucide-react-native';
import { api, Client, Product } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import { generateInvoice, generateTicket, formatInvoiceData, formatTicketData } from '../../services/invoiceService';

// Array of 100 colorful product images from Unsplash
const productImages = [
  "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&q=80", // Colorful pizza
  "https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=200&q=80", // Yellow headphones
  "https://images.unsplash.com/photo-1501127122-f385ca6ddd9d?w=200&q=80", // Colorful smoothie
  "https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=200&q=80", // Blue product
  "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=200&q=80", // Colorful sneakers
  "https://images.unsplash.com/photo-1519735777905-ec97162fd79e?w=200&q=80", // Green avocado
  "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=200&q=80", // Red headphones
  "https://images.unsplash.com/photo-1559563458-527698bf5295?w=200&q=80", // Colorful popsicles
  "https://images.unsplash.com/photo-1625772452859-1c03d5bf1137?w=200&q=80", // Blue sneakers
  "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=200&q=80", // Red lipstick
  "https://images.unsplash.com/photo-1625591341337-13156a59aae7?w=200&q=80", // Purple book
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&q=80", // Red Nike
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80", // Gold watch
  "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=200&q=80", // Polaroid camera
  "https://images.unsplash.com/photo-1507764923504-cd90bf7da772?w=200&q=80", // Blue headphones
  "https://images.unsplash.com/photo-1617005082133-548c4dd27f2f?w=200&q=80", // Green plant
  "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=200&q=80", // Red apples
  "https://images.unsplash.com/photo-1618354691792-d1d42acfd860?w=200&q=80", // Blue bag
  "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=200&q=80", // Yellow bananas
  "https://images.unsplash.com/photo-1611930022073-84f3bb4e3a3f?w=200&q=80", // Pink soap
  "https://images.unsplash.com/photo-1541643600914-78b084683601?w=200&q=80", // Red umbrella
  "https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?w=200&q=80", // Blue shoes
  "https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?w=200&q=80", // Purple pencils
  "https://images.unsplash.com/photo-1549298916-b21f9d9e80c2?w=200&q=80", // Red shoes
  "https://images.unsplash.com/photo-1608042314453-ae338d80c427?w=200&q=80", // Orange fruit
  "https://images.unsplash.com/photo-1587304883512-1e7e96e35321?w=200&q=80", // Blue phone
  "https://images.unsplash.com/photo-1503602642458-232111445657?w=200&q=80", // White mug
  "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=200&q=80", // Colorful products
  "https://images.unsplash.com/photo-1578022761797-b8636ac1773c?w=200&q=80", // Blue speaker
  "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=200&q=80", // Sunglasses
  "https://images.unsplash.com/photo-1517705008128-361805f42e86?w=200&q=80", // Pink hairdryer
  "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=200&q=80", // Pink bag
  "https://images.unsplash.com/photo-1547949003-9792a18a2601?w=200&q=80", // Red boots
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=200&q=80", // Green backpack
  "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=200&q=80", // Red and blue cleats
  "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=200&q=80", // Red headphones
  "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=200&q=80", // Laptop
  "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=200&q=80", // Colorful socks
  "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=200&q=80", // Camera
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&q=80", // Yellow headphones
  "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=200&q=80", // Watch
  "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=200&q=80", // Blue smartwatch
  "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=200&q=80", // Green shoe
  "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=200&q=80", // Colorful backpack
  "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=200&q=80", // Colorful shoes
  "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=200&q=80", // Purple shoes
  "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=200&q=80", // White shoes
  "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=200&q=80", // Pink products
  "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=200&q=80", // Colorful socks
  "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=200&q=80", // Red headphones
  "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=200&q=80", // Colorful camera
  "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200&q=80", // Colorful glasses
  "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=200&q=80", // Colorful shoes
  "https://images.unsplash.com/photo-1592945403244-b3faa7b3a4e1?w=200&q=80", // Perfume bottles
  "https://images.unsplash.com/photo-1591375770716-8cc7c8344ab0?w=200&q=80", // Rubik's cube
  "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=200&q=80", // Colorful shoes
  "https://images.unsplash.com/photo-1519415943484-9fa1873496d4?w=200&q=80", // Green tea
  "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=200&q=80", // Modern chair
  "https://images.unsplash.com/photo-1593998066526-65fcab3021a2?w=200&q=80", // Yellow raincoat
  "https://images.unsplash.com/photo-1535891793050-f3e2e6ed9cc1?w=200&q=80", // Pink toy car
  "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=200&q=80", // Yellow sneakers
  "https://images.unsplash.com/photo-1522273400909-fd1a8f77637e?w=200&q=80", // Colorful fruit smoothie
  "https://images.unsplash.com/photo-1560343787-b95e8c17280f?w=200&q=80", // Blue sofa
  "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=200&q=80", // Pink cushion
  "https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?w=200&q=80", // Orange juice
  "https://images.unsplash.com/photo-1611930022073-84f3bb4e3a3f?w=200&q=80", // Colorful soap
  "https://images.unsplash.com/photo-1589782182703-2aaa69037b5b?w=200&q=80", // Red tulips
  "https://images.unsplash.com/photo-1556228852-6d35a585d566?w=200&q=80", // Yellow phone
  "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=200&q=80", // Black headphones
  "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=200&q=80", // Coffee machine
  "https://images.unsplash.com/photo-1567721913486-6585f069b332?w=200&q=80", // Blue headphones
  "https://images.unsplash.com/photo-1606318175482-f297ba4115b6?w=200&q=80", // Blue tie
  "https://images.unsplash.com/photo-1541336318489-1b9c3a792884?w=200&q=80", // Pink book
  "https://images.unsplash.com/photo-1601387180412-c891e6008ec2?w=200&q=80", // Modern chair
  "https://images.unsplash.com/photo-1599360889420-da1afaba9edc?w=200&q=80", // Yellow flowers
  "https://images.unsplash.com/photo-1608042314453-ae338d80c427?w=200&q=80", // Orange fruit
  "https://images.unsplash.com/photo-1612199693772-71b3842badb4?w=200&q=80", // Red berries
  "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=200&q=80", // Modern chair
  "https://images.unsplash.com/photo-1600080971543-1d0174996cc0?w=200&q=80", // Red cocktail
  "https://images.unsplash.com/photo-1621232333723-222b502e79d0?w=200&q=80", // Green plants
  "https://images.unsplash.com/photo-1591539786479-0a55662e99b2?w=200&q=80", // Red strawberries
  "https://images.unsplash.com/photo-1604719435729-1fc04f38ec6f?w=200&q=80", // Orange pumpkin
  "https://images.unsplash.com/photo-1587411768638-ec71f8e33b78?w=200&q=80", // Blue denim
  "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=200&q=80", // Laptop
  "https://images.unsplash.com/photo-1588964895597-cfccd6e2dbf9?w=200&q=80", // Colorful shoes
  "https://images.unsplash.com/photo-1608541737042-87a36c096a0f?w=200&q=80", // Yellow cap
  "https://images.unsplash.com/photo-1589623156689-67852a214647?w=200&q=80", // Yellow lemons
  "https://images.unsplash.com/photo-1602848597941-0d3c1cc4cd14?w=200&q=80", // Piano keys
  "https://images.unsplash.com/photo-1610423722584-6532d184d3b3?w=200&q=80", // Blue tape
  "https://images.unsplash.com/photo-1601445638532-3c6f6c3d3a9e?w=200&q=80", // Red mug
  "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=200&q=80", // Blue gloves
  "https://images.unsplash.com/photo-1589365278144-c9e705f843ba?w=200&q=80", // Colorful shoes
  "https://images.unsplash.com/photo-1562240020-ce31ccb0fa7d?w=200&q=80", // Yellow headphones
  "https://images.unsplash.com/photo-1591189863430-ab87e120f312?w=200&q=80", // Green plants
  "https://images.unsplash.com/photo-1613482184972-f9c1d656234a?w=200&q=80", // Colorful fabric
  "https://images.unsplash.com/photo-1555864484-22feb608f41b?w=200&q=80", // Pink watch band
  "https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&q=80", // Red headphones
  "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=200&q=80", // Red pencils
  "https://images.unsplash.com/photo-1609428279533-a9289a14e82d?w=200&q=80"  // Yellow chair
];

// Initial products data
const initialProducts = [
  {
    id: '1',
    code: null,
    name: 'Bolso de mano',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=200&q=80',
    price: 79.99,
    quantity: 3,
    additionalTax: null
  },
  {
    id: '2',
    code: null,
    name: 'Zapatillas deportivas',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&q=80',
    price: 120.00,
    quantity: 1,
    additionalTax: null
  },
  {
    id: '3',
    code: null,
    name: 'Cafetera',
    image: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=200&q=80',
    price: 85.50,
    quantity: 2.5,   // Decimal quantity for Cafetera
    additionalTax: {
      name: 'Imp. Lujo',
      rate: 0.15,    // 15% additional tax
    }
  },
  {
    id: '4',
    code: null,
    name: 'Audífonos',
    image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=200&q=80',
    price: 149.99,
    quantity: 4,
    additionalTax: null
  },
  {
    id: '5',
    code: null,
    name: 'Lentes de sol',
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=200&q=80',
    price: 65.00,
    quantity: 2.3,   // Decimal quantity
    additionalTax: {
      name: 'Imp. Verde',
      rate: 0.05,    // 5% additional tax
    }
  },
  {
    id: '6',
    code: null,
    name: 'Smartwatch',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80',
    price: 199.99,
    quantity: 1,
    additionalTax: null
  },
  {
    id: '7',
    code: null,
    name: 'Reloj de lujo',
    image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=200&q=80',
    price: 350.00,
    quantity: 1.2,   // Decimal quantity
    additionalTax: {
      name: 'Imp. Lujo',
      rate: 0.20,    // 20% additional tax
    }
  },
  {
    id: '8',
    code: null,
    name: 'Perfume premium',
    image: 'https://images.unsplash.com/photo-1592945403244-b3faa7b3a4e1?w=200&q=80',
    price: 89.50,
    quantity: 3,
    additionalTax: {
      name: 'Imp. Cosmético',
      rate: 0.08,    // 8% additional tax
    }
  },
  {
    id: '9',
    code: null,
    name: 'Laptop ultrabook',
    image: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=200&q=80',
    price: 899.99,
    quantity: 1,
    additionalTax: null
  },
  {
    id: '10',
    code: null,
    name: 'Cámara digital',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=200&q=80',
    price: 499.95,
    quantity: 1.8,   // Decimal quantity
    additionalTax: {
      name: 'Imp. Importación',
      rate: 0.12,    // 12% additional tax
    }
  }
];

// Most purchased products
const topProducts = [
  { id: '1', name: 'Zapatillas deportivas', percent: 35 },
  { id: '2', name: 'Bolso de mano', percent: 25 },
  { id: '3', name: 'Audífonos', percent: 15 }
];

// Monthly sales data
const monthlySales = [
  { month: 'ENE', amount: 1200 },
  { month: 'FEB', amount: 1800 },
  { month: 'MAR', amount: 1500 },
  { month: 'ABR', amount: 2200 },
  { month: 'MAY', amount: 1900 },
  { month: 'JUN', amount: 2500 }
];
// Company Information
interface  CompanyInfo {
  id: number;
  code: string;
  name: string;
  line: string;
  email: string;
  website:string;
  instagram:string;
  phone: string;
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

// Company social media and contact info
const companyInfo: CompanyInfo = {
  id: 3,
  code: '87654321-0',
  name: 'Distribuidora Nacional Ltda.',
  line: 'Empresa',
  email: "contacto@techsolutions.cl",
  website: "www.techsolutions.cl",
  instagram: "@techsolutions_cl",
  phone: "+56 2 2345 6789",
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
  }
};

// Default product images by category
const categoryImages = {
  "Tecnología": "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=200&q=80",
  "Alcoholes": "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=200&q=80",
  "Servicios": "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=200&q=80",
  "default": "https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=200&q=80"
};

// Define document types for better type checking
interface DocumentResponse {
  id: number;
  assignedFolio: string;
  externalFolio?: string | null;
  date: string;
  client: {
    code: string;
    name: string;
  };
  total: number;
  details: any[];
  validation?: string;
}

export default function QuickScreen() {
  const router = useRouter();
  const { offlineMode } = useTheme();
  const [products, setProducts] = useState(initialProducts);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [newQuantity, setNewQuantity] = useState('');
  const [longPressedProduct, setLongPressedProduct] = useState(null);
  const [scaleAnim] = useState(new Animated.Value(1));
  
  // Document type selection
  const [documentType, setDocumentType] = useState('boleta'); // 'boleta' or 'factura'
  
  // Payment options
  const [paymentCondition, setPaymentCondition] = useState('contado'); // 'contado' or 'credito'
  const [paymentMethod, setPaymentMethod] = useState('efectivo'); // 'efectivo' or 'tarjeta'
  const [showPaymentOptions, setShowPaymentOptions] = useState(false); // To toggle payment options visibility
  
  // Date selection state
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false); // To toggle date picker visibility
  
  // Client search states
  const [showClientSearchModal, setShowClientSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [clients, setClients] = useState<Client[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // Address selection states
  const [showAddressSelectionModal, setShowAddressSelectionModal] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<any | null>(null);
  
  // Product search states
  const [showProductSearchModal, setShowProductSearchModal] = useState(false);
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [debouncedProductSearchTerm, setDebouncedProductSearchTerm] = useState('');
  const [searchedProducts, setSearchedProducts] = useState<Product[]>([]);
  const [isSearchingProduct, setIsSearchingProduct] = useState(false);
  const [productSearchPerformed, setProductSearchPerformed] = useState(false);
  const [productError, setProductError] = useState<string | null>(null);
  const [newProductQuantity, setNewProductQuantity] = useState('1');
  const [addingProduct, setAddingProduct] = useState(false);
  const [selectedApiProduct, setSelectedApiProduct] = useState<Product | null>(null);

  // Success feedback states
  const [showSuccessFeedback, setShowSuccessFeedback] = useState(false);
  const [addedProductName, setAddedProductName] = useState('');
  const [showResetFeedback, setShowResetFeedback] = useState(false);

  // Submit document states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createButtonActive, setCreateButtonActive] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedDocumentId, setSubmittedDocumentId] = useState<string | null>(null);
  const [showSubmitFeedback, setShowSubmitFeedback] = useState(false);
  
  // New states for enhanced invoice creation
  const [submittedDocument, setSubmittedDocument] = useState<DocumentResponse | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Debounce client search term
  useEffect(() => {
    const timerId = setTimeout(() => {
      if (searchQuery.length >= 3) {
        setDebouncedSearchTerm(searchQuery);
        setSearchPerformed(true);
      } else if (searchQuery === '') {
        setClients([]);
        setSearchPerformed(false);
        setDebouncedSearchTerm('');
      }
    }, 500);

    return () => clearTimeout(timerId);
  }, [searchQuery]);

  // Debounce product search term
  useEffect(() => {
    const timerId = setTimeout(() => {
      if (productSearchQuery.length >= 3) {
        setDebouncedProductSearchTerm(productSearchQuery);
        setProductSearchPerformed(true);
      } else if (productSearchQuery === '') {
        setSearchedProducts([]);
        setProductSearchPerformed(false);
        setDebouncedProductSearchTerm('');
      }
    }, 500);

    return () => clearTimeout(timerId);
  }, [productSearchQuery]);

  // Auto-hide success feedback after 2 seconds
  useEffect(() => {
    if (showSuccessFeedback) {
      const timer = setTimeout(() => {
        setShowSuccessFeedback(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [showSuccessFeedback]);
  
  // Auto-hide reset feedback after 2 seconds
  useEffect(() => {
    if (showResetFeedback) {
      const timer = setTimeout(() => {
        setShowResetFeedback(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [showResetFeedback]);

  // Auto-hide submit feedback after 3 seconds
  useEffect(() => {
    if (showSubmitFeedback) {
      const timer = setTimeout(() => {
        setShowSubmitFeedback(false);
        if (submitSuccess) {
          // Optionally navigate to document details or reset screen after successful submission
          resetSaleData();
        }
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [showSubmitFeedback]);

  // Check if the create button should be active
  useEffect(() => {
    // The button is active if:
    // 1. There are products in the list
    // 2. (For Factura) There is a client selected
    const hasProducts = products.length > 0;
    const hasValidClient = documentType === 'boleta' || (documentType === 'factura' && selectedClient !== null);
    
    setCreateButtonActive(hasProducts && hasValidClient);
  }, [products, selectedClient, documentType]);

  // Search clients when debounced search term changes
  useEffect(() => {
    const searchClients = async () => {
      if (debouncedSearchTerm) {
        setIsSearching(true);
        try {
          const data = await api.getClients(true, debouncedSearchTerm);
          setClients(data);
          setError(null);
        } catch (err) {
          setError('Error al buscar clientes. Por favor intente nuevamente.');
          // If search fails, try to use the cached clients and filter them locally
          try {
            const cachedClients = await api.getClients(false);
            const filteredClients = cachedClients.filter(client => 
              client.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
              client.code.includes(debouncedSearchTerm) ||
              client.email?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
              client.municipality?.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
              client.activity?.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
            );
            setClients(filteredClients);
          } catch (cacheErr) {
            // If we can't even get cached clients, show an error
            Alert.alert(
              'Error',
              'No se pudieron buscar los clientes. ' + (offlineMode ? 'Trabajando en modo offline.' : 'Verifique su conexión.')
            );
          }
        } finally {
          setIsSearching(false);
        }
      }
    };

    if (debouncedSearchTerm) {
      searchClients();
    }
  }, [debouncedSearchTerm, offlineMode]);
  
  // Search products when debounced product search term changes
  useEffect(() => {
    const searchProducts = async () => {
      if (debouncedProductSearchTerm) {
        setIsSearchingProduct(true);
        try {
          const data = await api.searchProducts(debouncedProductSearchTerm);
          setSearchedProducts(data);
          setProductError(null);
        } catch (err) {
          setProductError('Error al buscar productos. Por favor intente nuevamente.');
          // If search fails, try to use cached products
          try {
            const cachedProducts = await api.getProducts(false);
            const filteredProducts = cachedProducts.filter(product => 
              product.name.toLowerCase().includes(debouncedProductSearchTerm.toLowerCase()) ||
              product.code.includes(debouncedProductSearchTerm) ||
              product.category?.name.toLowerCase().includes(debouncedProductSearchTerm.toLowerCase())
            );
            setSearchedProducts(filteredProducts);
          } catch (cacheErr) {
            // If we can't even get cached products, show an error
            Alert.alert(
              'Error',
              'No se pudieron buscar los productos. ' + (offlineMode ? 'Trabajando en modo offline.' : 'Verifique su conexión.')
            );
          }
        } finally {
          setIsSearchingProduct(false);
        }
      }
    };

    if (debouncedProductSearchTerm) {
      searchProducts();
    }
  }, [debouncedProductSearchTerm, offlineMode]);

  // Format date function
  const formatDate = (date) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('es-ES', options);
  };

  // Helper function to calculate product total with additional tax
  const calculateProductTotal = (product) => {
    const subtotal = product.price * product.quantity;
    if (product.additionalTax) {
      const additionalTaxAmount = subtotal * product.additionalTax.rate;
      return subtotal + additionalTaxAmount;
    }
    return subtotal;
  };

  // Format number as whole integer (without decimal places)
  const formatAsInteger = (value) => {
    return Math.round(value).toLocaleString('es-CL');
  };

  // Format money with currency symbol
  const formatMoney = (value) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Handle product press - open quantity edit modal
  const handleProductPress = (product) => {
    setSelectedProduct(product);
    setNewQuantity(product.quantity.toString());
    setEditModalVisible(true);
  };

  // Handle product long press - show delete confirmation
  const handleProductLongPress = (product) => {
    // Provide haptic feedback if available (not on web)
    if (Platform.OS !== 'web') {
      Vibration.vibrate(100);
    }
    
    setLongPressedProduct(product);
    
    // Animate the card scale
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true
      })
    ]).start();
    
    setDeleteModalVisible(true);
  };

  // Save edited quantity
  const saveQuantity = () => {
    if (!newQuantity.trim()) {
      Alert.alert('Error', 'La cantidad no puede estar vacía');
      return;
    }

    // Replace comma with period for decimal handling
    const sanitizedValue = newQuantity.replace(',', '.');
    const quantity = parseFloat(sanitizedValue);

    if (isNaN(quantity) || quantity <= 0) {
      Alert.alert('Error', 'Ingrese una cantidad válida mayor a 0');
      return;
    }

    // Update the product's quantity
    const updatedProducts = products.map(product => 
      product.id === selectedProduct.id 
        ? { ...product, quantity: quantity } 
        : product
    );
    
    setProducts(updatedProducts);
    setEditModalVisible(false);
    setSelectedProduct(null);
  };

  // Delete selected product
  const deleteProduct = () => {
    if (!longPressedProduct) return;
    
    const updatedProducts = products.filter(
      product => product.id !== longPressedProduct.id
    );
    
    setProducts(updatedProducts);
    setDeleteModalVisible(false);
    setLongPressedProduct(null);
  };

  // Calculate subtotal, additional taxes, IVA, and total
  const calculateTotals = () => {
    let subtotal = 0;
    let additionalTaxesTotal = 0;
    
    products.forEach(product => {
      const productSubtotal = product.price * product.quantity;
      subtotal += productSubtotal;
      
      if (product.additionalTax) {
        additionalTaxesTotal += productSubtotal * product.additionalTax.rate;
      }
    });
    
    const iva = subtotal * 0.19; // 19% IVA
    const total = subtotal + iva + additionalTaxesTotal;
    
    return { subtotal, additionalTaxesTotal, iva, total };
  };
  
  const { subtotal, additionalTaxesTotal, iva, total } = calculateTotals();

  // Reset function to clear products and client data
  const resetSaleData = () => {
    // Reset products to empty array
    setProducts([]);
    
    // Reset client data
    setSelectedClient(null);
    setSelectedAddress(null);
    
    // Reset payment options to defaults
    setPaymentCondition('contado');
    setPaymentMethod('efectivo');
    setShowPaymentOptions(false);
    
    // Reset date to today
    setSelectedDate(new Date());
    setShowDatePicker(false);
    
    // Show feedback
    setShowResetFeedback(true);
    
    // Close any open modals
    setEditModalVisible(false);
    setDeleteModalVisible(false);
    setShowClientSearchModal(false);
    setShowProductSearchModal(false);
    setAddingProduct(false);
    setShowAddressSelectionModal(false);
    setShowSuccessModal(false);
    
    // Reset document states
    setSubmittedDocument(null);
    setSubmittedDocumentId(null);
    setSubmitSuccess(false);
    setSubmitError(null);
    
    // Enable create button as it's now in reset state
    setCreateButtonActive(true);
  };

  // Get random image for product
  const getRandomProductImage = () => {
    const randomIndex = Math.floor(Math.random() * productImages.length);
    return productImages[randomIndex];
  };

  const renderProductItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.productCard}
      onPress={() => handleProductPress(item)}
      onLongPress={() => handleProductLongPress(item)}
      delayLongPress={3000} // 3 seconds long press to delete
    >
      <View style={styles.productImageContainer}>
        <Image source={{ uri: item.image }} style={styles.productImage} />
      </View>
      <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
      
      <View style={styles.productDetails}>
        <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
        <View style={styles.quantityContainer}>
          <Text style={styles.quantityLabel}>Cant:</Text>
          <Text style={styles.quantityValue}>
            {item.quantity.toFixed(item.quantity % 1 === 0 ? 0 : 1)}
          </Text>
        </View>
      </View>
      
      {/* Showing additional tax if available */}
      {item.additionalTax && (
        <View style={styles.additionalTaxContainer}>
          <AlertTriangle size={10} color="#F6AD55" style={styles.taxIcon} />
          <Text style={styles.additionalTaxText}>
            {item.additionalTax.name}: {(item.additionalTax.rate * 100).toFixed(0)}%
          </Text>
        </View>
      )}
      
      <View style={styles.productTotal}>
        <Text style={styles.productTotalText}>
          Total: ${formatAsInteger(calculateProductTotal(item))}
        </Text>
      </View>
    </TouchableOpacity>
  );

  // Clear client search
  const clearSearch = () => {
    setSearchQuery('');
    setClients([]);
    setSearchPerformed(false);
  };
  
  // Clear product search
  const clearProductSearch = () => {
    setProductSearchQuery('');
    setSearchedProducts([]);
    setProductSearchPerformed(false);
  };

  // Select client
  const selectClient = (client: Client) => {
    setSelectedClient(client);
    
    // Initialize with the main address if available
    if (client.municipality && client.address) {
      setSelectedAddress({
        id: 0, // Main address ID
        address: client.address,
        municipality: client.municipality
      });
    } else if (client.additionalAddress && client.additionalAddress.length > 0) {
      // If no main address but has additional addresses, select the first one
      setSelectedAddress(client.additionalAddress[0]);
    }
    
    setSearchQuery('');
    setClients([]);
    setSearchPerformed(false);
    setShowClientSearchModal(false);
  };
  
  // Select a product from search results and directly add it to the cart
  const selectProduct = (apiProduct: Product) => {
    // Directly add with quantity 1 for faster operation
    const quantity = 1;
    
    // Create a formatted product object
    const formattedProduct = {
      id: apiProduct.id?.toString() || Math.random().toString(),
      code: apiProduct.code || null,  // Include code from API product
      name: apiProduct.name || 'Producto sin nombre',
      image: getRandomProductImage(),
      price: apiProduct.price || 0,
      quantity: quantity,
      additionalTax: apiProduct.category?.otherTax ? {
        name: apiProduct.category.otherTax.name || 'Impuesto',
        rate: (apiProduct.category.otherTax.percent || 0) / 100
      } : null,
      // Store reference to original API product for better data when creating invoice
      apiProductReference: apiProduct
    };
    
    // Check if product is already in the list
    const existingProductIndex = products.findIndex(p => 
      p.id === formattedProduct.id
    );
    
    let updatedProducts = [...products];
    
    if (existingProductIndex !== -1) {
      // Update quantity if product already exists
      updatedProducts[existingProductIndex] = {
        ...updatedProducts[existingProductIndex],
        quantity: updatedProducts[existingProductIndex].quantity + quantity
      };
    } else {
      // Add new product to the list
      updatedProducts.push(formattedProduct);
    }
    
    // Update products state
    setProducts(updatedProducts);
    
    // Show success feedback
    setAddedProductName(formattedProduct.name);
    setShowSuccessFeedback(true);
    
    // Close search modal
    setShowProductSearchModal(false);
    
    // Reset search states
    setProductSearchQuery('');
    setSearchedProducts([]);
    setProductSearchPerformed(false);
    setSelectedApiProduct(null);
  };
  
  // For more detailed product addition (with quantity selection)
  const openProductDetailsModal = (apiProduct: Product) => {
    setSelectedApiProduct(apiProduct);
    setNewProductQuantity('1');
    setAddingProduct(true);
  };
  
  // Get appropriate image for product based on category
  const getProductImage = (apiProduct: Product) => {
    if (apiProduct.category?.name && categoryImages[apiProduct.category.name]) {
      return categoryImages[apiProduct.category.name];
    }
    return categoryImages.default;
  };
  
  // Add the selected product to the list with custom quantity
  const addProductToList = () => {
    if (!selectedApiProduct) return;
    
    if (!newProductQuantity.trim()) {
      Alert.alert('Error', 'La cantidad no puede estar vacía');
      return;
    }

    // Replace comma with period for decimal handling
    const sanitizedValue = newProductQuantity.replace(',', '.');
    const quantity = parseFloat(sanitizedValue);

    if (isNaN(quantity) || quantity <= 0) {
      Alert.alert('Error', 'Ingrese una cantidad válida mayor a 0');
      return;
    }
    
    // Create a formatted product object similar to initialProducts format
    const formattedProduct = {
      id: selectedApiProduct.id?.toString() || Math.random().toString(),
      code: selectedApiProduct.code || null,  // Include code from API product
      name: selectedApiProduct.name || 'Producto sin nombre',
      image: getProductImage(selectedApiProduct),
      price: selectedApiProduct.price || 0,
      quantity: quantity,
      additionalTax: selectedApiProduct.category?.otherTax ? {
        name: selectedApiProduct.category.otherTax.name || 'Impuesto',
        rate: (selectedApiProduct.category.otherTax.percent || 0) / 100
      } : null,
      // Store reference to original API product for better data when creating invoice
      apiProductReference: selectedApiProduct
    };
    
    // Check if product is already in the list
    const existingProductIndex = products.findIndex(p => 
      p.id === formattedProduct.id
    );
    
    const updatedProducts = [...products];
    
    if (existingProductIndex !== -1) {
      // Update quantity if product already exists
      updatedProducts[existingProductIndex] = {
        ...updatedProducts[existingProductIndex],
        quantity: updatedProducts[existingProductIndex].quantity + quantity
      };
    } else {
      // Add new product to the list
      updatedProducts.push(formattedProduct);
    }
    
    // Update all states in one block to prevent UI freezes
    setProducts(updatedProducts);
    setAddingProduct(false);
    setSelectedApiProduct(null);
    setAddedProductName(formattedProduct.name);
    setShowSuccessFeedback(true);
    
    // Close modals and reset search
    setShowProductSearchModal(false);
    setProductSearchQuery('');
    setSearchedProducts([]);
    setProductSearchPerformed(false);
  };

  // Enhanced validation before document creation
  const validateDocumentData = () => {
    // Check if there are products in the list
    if (products.length === 0) {
      Alert.alert('Error', 'Debe agregar al menos un producto');
      return false;
    }
    
    // Validate client for factura
    if (documentType === 'factura' && !selectedClient) {
      Alert.alert('Error', 'Debe seleccionar un cliente para emitir una factura');
      return false;
    }
    
    // Check for invalid product quantities
    const invalidProducts = products.filter(p => p.quantity <= 0);
    if (invalidProducts.length > 0) {
      Alert.alert(
        'Error', 
        `Los siguientes productos tienen cantidades inválidas: ${invalidProducts.map(p => p.name).join(', ')}`
      );
      return false;
    }

    // Check for products with missing codes when using real API data
    const productsWithoutCode = products.filter(p => !p.code && !p.apiProductReference);
    if (productsWithoutCode.length > 0 && !offlineMode) {
      Alert.alert(
        'Advertencia', 
        `Los siguientes productos no tienen códigos asignados: ${productsWithoutCode.map(p => p.name).join(', ')}. Esto podría causar problemas al generar el documento.`,
        [
          {
            text: 'Cancelar',
            style: 'cancel',
          },
          {
            text: 'Continuar de todos modos',
            onPress: () => createDocumentRequest(),
          }
        ]
      );
      return false;
    }
    
    return true;
  };

  // Create document - Enhanced implementation with better error handling and response processing
  const createDocument = async () => {
    if (!createButtonActive || isSubmitting) return;
    
    if (!validateDocumentData()) {
      return;
    }
    
    createDocumentRequest();
  };
  
  // Separate function for making the API request (after validation)
  const createDocumentRequest = async () => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);
      
      // Format date for API request: YYYY-MM-DD
      const formattedDate = selectedDate.toISOString().split('T')[0];
      
      if (documentType === 'boleta') {
        // Prepare ticket data using the formatter function
        const ticketData = formatTicketData(
          selectedClient, 
          products.map(p => ({
            ...p,
            // If we have an API reference, use its details for better data quality
            ...(p.apiProductReference ? {
              code: p.apiProductReference.code,
              unit: p.apiProductReference.unit,
              category: p.apiProductReference.category,
            } : {})
          })),
          {
            date: formattedDate,
            ticketTypeCode: '3', // Default boleta code
            paymentMethod: paymentCondition === 'contado' ? 'CONTADO' : 'CREDITO',
            paymentCondition: paymentMethod === 'efectivo' ? 'EFECTIVO' : 'TARJETA'
          }
        );
        
        console.log('Sending Boleta data:', JSON.stringify(ticketData, null, 2));
        
        // Use the service to generate the ticket
        const response = await generateTicket(ticketData);
        
        if (!response) {
          throw new Error('No se recibió respuesta del servidor');
        }
        
        // Store complete response for detailed view
        setSubmittedDocument(response);
        
        // Log the API response
        console.log('Boleta response:', JSON.stringify(response, null, 2));
        
        // Handle success
        setSubmitSuccess(true);
        
        // Set document ID for display
        setSubmittedDocumentId(response.assignedFolio || 'N/A');
        
        // Show detailed success modal instead of just feedback
        setShowSuccessModal(true);
        
      } else {
        // Factura - Validate client is selected
        if (!selectedClient) {
          throw new Error('Cliente requerido para factura');
        }
        
        // Prepare invoice data using the formatter function
        const invoiceData = formatInvoiceData(
          selectedClient, 
          products.map(p => ({
            ...p,
            // If we have an API reference, use its details for better data quality
            ...(p.apiProductReference ? {
              code: p.apiProductReference.code,
              unit: p.apiProductReference.unit,
              category: p.apiProductReference.category,
            } : {})
          })),
          {
            date: formattedDate,
            paymentMethod: paymentCondition === 'contado' ? 'CONTADO' : 'CREDITO',
            paymentCondition: paymentMethod === 'efectivo' ? 'EFECTIVO' : 'TARJETA'
          }
        );
        
        console.log('Sending Factura data:', JSON.stringify(invoiceData, null, 2));
        
        // Use the service to generate the invoice
        const response = await generateInvoice(invoiceData);
        
        if (!response) {
          throw new Error('No se recibió respuesta del servidor');
        }
        
        // Store complete response for detailed view
        setSubmittedDocument(response);
        
        // Log the API response
        console.log('Factura response:', JSON.stringify(response, null, 2));
        
        // Handle success
        setSubmitSuccess(true);
        
        // Set document ID for display
        setSubmittedDocumentId(response.assignedFolio || 'N/A');
        
        // Show detailed success modal instead of just feedback
        setShowSuccessModal(true);
      }
      
    } catch (error) {
      console.error('Error creating document:', error);
      
      // Enhanced error handling with more specific error messages
      let errorMessage = 'Error al crear el documento';
      
      if (error.message) {
        // Extract specific error message
        errorMessage += ': ' + error.message;
      }
      
      if (error.response) {
        // Extract API error response
        if (error.response.status === 400) {
          errorMessage = 'Datos inválidos: ' + (error.response.data?.message || 'Verifique la información ingresada');
        } else if (error.response.status === 401) {
          errorMessage = 'No autorizado: Verifique sus credenciales API';
        } else if (error.response.status === 503) {
          errorMessage = 'Servicio no disponible. Por favor intente más tarde';
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      }
      
      setSubmitSuccess(false);
      setSubmitError(errorMessage);
      setShowSubmitFeedback(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // New function to view the created document
  const viewCreatedDocument = () => {
    // Hide the success modal
    setShowSuccessModal(false);
    
    // If we have a document ID, navigate to the invoice details page
    if (submittedDocumentId) {
      router.push({
        pathname: documentType === 'boleta' 
          ? '/sales/boleta-electronica'
          : '/sales/invoice-details',
        params: { id: submittedDocument?.id || '0' }
      });
    }
  };

  const renderClientItem = ({ item }: { item: Client }) => (
    <TouchableOpacity 
      style={styles.clientItem}
      onPress={() => selectClient(item)}
    >
      <View style={[
        styles.clientIconContainer, 
        { backgroundColor: item.line?.toLowerCase().includes('empresa') ? '#E3F2FD' : '#F3E5F5' }
      ]}>
        {item.line?.toLowerCase().includes('empresa') ? (
          <Building2 size={20} color="#0066CC" />
        ) : (
          <User size={20} color="#9C27B0" />
        )}
      </View>
      
      <View style={styles.clientInfo}>
        <Text style={styles.clientName}>{item.name}</Text>
        <Text style={styles.clientRut}>RUT: {item.code}</Text>
      </View>
      
      <ChevronRight size={16} color="#999" />
    </TouchableOpacity>
  );
  
  // Render product item in search results
  const renderProductSearchItem = ({ item }: { item: Product }) => (
    <TouchableOpacity 
      style={styles.productSearchItem}
      onPress={() => selectProduct(item)}
      onLongPress={() => openProductDetailsModal(item)}
    >
      <View style={styles.productSearchIconContainer}>
        <Package size={20} color="#0066CC" />
      </View>
      
      <View style={styles.productSearchInfo}>
        <Text style={styles.productSearchName}>{item.name}</Text>
        <Text style={styles.productSearchCode}>Código: {item.code || 'Sin código'}</Text>
        {item.category && (
          <Text style={styles.productSearchCategory}>{item.category.name}</Text>
        )}
      </View>
      
      <View style={styles.productSearchPriceContainer}>
        <Text style={styles.productSearchPrice}>${item.price.toFixed(0)}</Text>
        <ChevronRight size={16} color="#999" />
      </View>
    </TouchableOpacity>
  );
  
  const openAddressSelectionModal = () => {
    if (selectedClient && 
        ((selectedClient.additionalAddress && selectedClient.additionalAddress.length > 0) || 
         (selectedClient.address && selectedClient.municipality))) {
      setShowAddressSelectionModal(true);
    } else {
      Alert.alert('Información', 'Este cliente no tiene direcciones adicionales registradas.');
    }
  };
  
  const selectAddress = (address) => {
    setSelectedAddress(address);
    setShowAddressSelectionModal(false);
  };

  const renderAddressItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.addressItem,
        selectedAddress && selectedAddress.id === item.id ? styles.selectedAddressItem : null
      ]}
      onPress={() => selectAddress(item)}
    >
      <View style={styles.addressIcon}>
        <MapPin size={18} color="#0066CC" />
      </View>
      <View style={styles.addressInfo}>
        <Text style={styles.addressText}>{item.address}</Text>
        {item.municipality && (
          <Text style={styles.municipalityText}>{item.municipality.name}</Text>
        )}
      </View>
      {selectedAddress && selectedAddress.id === item.id && (
        <Check size={18} color="#4CAF50" />
      )}
    </TouchableOpacity>
  );

  // Toggle the payment options visibility
  const togglePaymentOptions = () => {
    setShowPaymentOptions(!showPaymentOptions);
  };

  // Toggle date picker visibility
  const toggleDatePicker = () => {
    setShowDatePicker(!showDatePicker);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header Section */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={22} color="#fff" />
        </TouchableOpacity>
        
        {/* Reset Button */}
        <TouchableOpacity 
          style={styles.resetButton}
          onPress={resetSaleData}
        >
          <RefreshCcw size={20} color="#fff" />
        </TouchableOpacity>
      </View>
      
      {/* Lightning Logo and Action Buttons */}
      <View style={styles.microphoneSection}>
        <View style={styles.sideButtonContainer}>
          <TouchableOpacity style={styles.sideButton}>
            <Download size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        
        {/* Create Document Button (previously the microphone logo) */}
        <TouchableOpacity 
          style={[
            styles.microphoneContainer, 
            createButtonActive && styles.createButtonContainerActive
          ]}
          onPress={createDocument}
          disabled={!createButtonActive || isSubmitting}
        >
          <View style={[
            styles.micIconContainer, 
            createButtonActive && (documentType === 'boleta' 
              ? styles.createButtonActiveBoleta 
              : styles.createButtonActiveFactura),
            isSubmitting && styles.submittingButton
          ]}>
            {isSubmitting ? (
              <ActivityIndicator size="large" color="#fff" />
            ) : (
              documentType === 'boleta' ? (
                <Receipt size={40} color="#fff" />
              ) : (
                <FileText size={40} color="#fff" />
              )
            )}
          </View>
        </TouchableOpacity>
        
        <View style={styles.sideButtonContainer}>
          <TouchableOpacity style={styles.sideButton}>
            <Upload size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
      
      <Text style={styles.voiceposText}>Quick</Text>
      
      {/* Products Grid */}
      <View style={styles.productsSection}>
        {/* Products header with search icon */}
        <View style={styles.productsSectionHeader}>
          <View style={styles.titleWithMicContainer}>
            <Text style={styles.productsSectionTitle}>Productos</Text>
            <TouchableOpacity style={styles.microphoneButton}>
              <Mic size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity 
            style={styles.productSearchButton}
            onPress={() => setShowProductSearchModal(true)}
          >
            <Search size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        
        {products.length > 0 ? (
          <FlatList
            data={products}
            renderItem={renderProductItem}
            keyExtractor={item => item.id}
            numColumns={3}
            columnWrapperStyle={styles.productRow}
            contentContainerStyle={styles.productsList}
          />
        ) : (
          <View style={styles.emptyProductsContainer}>
            <Text style={styles.emptyProductsText}>No hay productos agregados</Text>
            <TouchableOpacity 
              style={styles.addFirstProductButton}
              onPress={() => setShowProductSearchModal(true)}
            >
              <Plus size={16} color="#fff" style={styles.addFirstProductIcon} />
              <Text style={styles.addFirstProductText}>Agregar Producto</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {/* Summary Section - with additional taxes */}
        <View style={styles.summarySection}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>Resumen:</Text>
            <View style={styles.summaryContent}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>${formatAsInteger(subtotal)}</Text>
              </View>
              
              {additionalTaxesTotal > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Imp. Adicionales</Text>
                  <Text style={[styles.summaryValue, styles.additionalTaxValue]}>
                    ${formatAsInteger(additionalTaxesTotal)}
                  </Text>
                </View>
              )}
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>IVA 19%</Text>
                <Text style={styles.summaryValue}>${formatAsInteger(iva)}</Text>
              </View>
              
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>${formatAsInteger(total)}</Text>
              </View>
            </View>
          </View>
        </View>
        
        {/* Payment Options Section - Now minimalist and collapsible */}
        <View style={styles.paymentOptionsContainer}>
          {/* Payment Condition Toggle */}
          <TouchableOpacity 
            style={styles.paymentToggleButton}
            onPress={togglePaymentOptions}
          >
            <View style={styles.paymentToggleContent}>
              <Text style={styles.paymentToggleText}>
                Condición de Pago: <Text style={styles.paymentHighlight}>{paymentCondition === 'contado' ? 'Contado' : 'Crédito'}</Text>
              </Text>
              <ChevronDown 
                size={16} 
                color="#E2E8F0" 
                style={[
                  styles.paymentToggleIcon,
                  showPaymentOptions && styles.paymentToggleIconRotated
                ]} 
              />
            </View>
          </TouchableOpacity>
          
          {/* Expanded Payment Options */}
          {showPaymentOptions && (
            <View style={styles.expandedPaymentOptions}>
              <View style={styles.paymentOptionsRow}>
                <TouchableOpacity 
                  style={[
                    styles.paymentOption, 
                    paymentCondition === 'contado' && styles.paymentOptionSelected
                  ]}
                  onPress={() => setPaymentCondition('contado')}
                >
                  <Text style={[
                    styles.paymentOptionText,
                    paymentCondition === 'contado' && styles.paymentOptionTextSelected
                  ]}>Contado</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.paymentOption, 
                    paymentCondition === 'credito' && styles.paymentOptionSelected
                  ]}
                  onPress={() => setPaymentCondition('credito')}
                >
                  <Text style={[
                    styles.paymentOptionText,
                    paymentCondition === 'credito' && styles.paymentOptionTextSelected
                  ]}>Crédito</Text>
                </TouchableOpacity>
              </View>
              
              {/* Payment Method - Only show if "Contado" is selected */}
              {paymentCondition === 'contado' && (
                <View style={styles.paymentMethodContainer}>
                  <Text style={styles.paymentSectionTitle}>Forma de Pago</Text>
                  <View style={styles.paymentOptions}>
                    <TouchableOpacity 
                      style={[
                        styles.paymentOption, 
                        paymentMethod === 'efectivo' && styles.paymentOptionSelected
                      ]}
                      onPress={() => setPaymentMethod('efectivo')}
                    >
                      <DollarSign 
                        size={16} 
                        color={paymentMethod === 'efectivo' ? '#0066CC' : '#666'} 
                        style={styles.paymentOptionIcon} 
                      />
                      <Text style={[
                        styles.paymentOptionText,
                        paymentMethod === 'efectivo' && styles.paymentOptionTextSelected
                      ]}>Efectivo</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[
                        styles.paymentOption, 
                        paymentMethod === 'tarjeta' && styles.paymentOptionSelected
                      ]}
                      onPress={() => setPaymentMethod('tarjeta')}
                    >
                      <CreditCard 
                        size={16} 
                        color={paymentMethod === 'tarjeta' ? '#0066CC' : '#666'} 
                        style={styles.paymentOptionIcon} 
                      />
                      <Text style={[
                        styles.paymentOptionText,
                        paymentMethod === 'tarjeta' && styles.paymentOptionTextSelected
                      ]}>Tarjeta</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          )}
          
          {/* Date Section */}
          <TouchableOpacity 
            style={styles.dateToggleButton}
            onPress={toggleDatePicker}
          >
            <View style={styles.dateToggleContent}>
              <Calendar size={16} color="#E2E8F0" style={styles.dateIcon} />
              <Text style={styles.dateToggleText}>
                Fecha: <Text style={styles.dateHighlight}>{formatDate(selectedDate)}</Text>
              </Text>
              <ChevronDown 
                size={16} 
                color="#E2E8F0" 
                style={[
                  styles.dateToggleIcon,
                  showDatePicker && styles.dateToggleIconRotated
                ]} 
              />
            </View>
          </TouchableOpacity>
          
          {/* Date Picker Options */}
          {showDatePicker && (
            <View style={styles.datePickerContainer}>
              <TouchableOpacity 
                style={[styles.dateOption, styles.dateOptionSelected]}
                onPress={() => {
                  setSelectedDate(new Date());
                  setShowDatePicker(false);
                }}
              >
                <Text style={styles.dateOptionText}>Hoy</Text>
                <Check size={16} color="#0066CC" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.dateOption}
                onPress={() => {
                  const tomorrow = new Date();
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  setSelectedDate(tomorrow);
                  setShowDatePicker(false);
                }}
              >
                <Text style={styles.dateOptionText}>Mañana</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.dateOption}
                onPress={() => {
                  const nextWeek = new Date();
                  nextWeek.setDate(nextWeek.getDate() + 7);
                  setSelectedDate(nextWeek);
                  setShowDatePicker(false);
                }}
              >
                <Text style={styles.dateOptionText}>En 1 semana</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.dateOption}
                onPress={() => {
                  const nextMonth = new Date();
                  nextMonth.setMonth(nextMonth.getMonth() + 1);
                  setSelectedDate(nextMonth);
                  setShowDatePicker(false);
                }}
              >
                <Text style={styles.dateOptionText}>En 1 mes</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
      
      {/* Client Section - Increased by 20% */}
      <View style={styles.clientSection}>
        <View style={styles.clientImageContainer}>
          {selectedClient ? (
            // Show selected client information
            <View style={styles.selectedClientContainer}>
              <View style={[
                styles.selectedClientIcon, 
                { backgroundColor: selectedClient.line?.toLowerCase().includes('empresa') ? '#E3F2FD' : '#F3E5F5' }
              ]}>
                {selectedClient.line?.toLowerCase().includes('empresa') ? (
                  <Building2 size={40} color="#0066CC" />
                ) : (
                  <User size={40} color="#9C27B0" />
                )}
              </View>
              <Text style={styles.selectedClientName} numberOfLines={2}>{selectedClient.name}</Text>
              <Text style={styles.selectedClientRut}>RUT: {selectedClient.code}</Text>
              
              <View style={styles.clientActionButtonsContainer}>
                <TouchableOpacity 
                  style={styles.clientSearchButton}
                  onPress={() => setShowClientSearchModal(true)}
                >
                  <Search size={24} color="#fff" />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.clientMicButton}
                >
                  <Mic size={24} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            // Company logo instead of personal photo
            <View style={styles.companyLogoContainer}>
              <Building2 size={80} color="#fff" />
              <Text style={styles.companyLogoText}>TECH</Text>
              <Text style={styles.companyLogoTextSmall}>SOLUTIONS</Text>
              
              <View style={styles.clientActionButtonsContainer}>
                <TouchableOpacity 
                  style={styles.clientSearchButton}
                  onPress={() => setShowClientSearchModal(true)}
                >
                  <Search size={24} color="#fff" />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.clientMicButton}
                >
                  <Mic size={24} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
        
        <View style={styles.clientInfoContainer}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Company/Client Name */}
            <Text style={styles.clientName} numberOfLines={2}>{selectedClient ? selectedClient.name : companyInfo.name}</Text>
            
            {/* Client Details (shown when a client is selected) */}
            {selectedClient ? (
              <View style={styles.clientDetailsContainer}>
                {/* Always show RUT */}
                <View style={styles.clientDetailItem}>
                  <User size={16} color="#9C27B0" style={styles.detailIcon} />
                  <Text style={styles.detailText}>
                    <Text style={styles.detailLabel}>RUT: </Text>
                    {selectedClient.code}
                  </Text>
                </View>
                
                {/* Address - Now shown first */}
                {selectedAddress && (
                  <View style={styles.clientDetailItem}>
                    <MapPin size={16} color="#48BB78" style={styles.detailIcon} />
                    <View style={styles.addressContainer}>
                      <Text style={styles.detailText}>
                        <Text style={styles.detailLabel}>Dirección: </Text>
                        {selectedAddress.address}
                        {selectedAddress.municipality ? `, ${selectedAddress.municipality.name}` : ''}
                      </Text>
                      
                      {/* Button to show address selection if client has multiple addresses */}
                      {(selectedClient.additionalAddress && selectedClient.additionalAddress.length > 0) || 
                       (selectedClient.address && selectedClient.municipality) ? (
                        <TouchableOpacity 
                          style={styles.addressSelectButton}
                          onPress={openAddressSelectionModal}
                        >
                          <Text style={styles.addressSelectText}>Cambiar</Text>
                          <ChevronDown size={14} color="#0066CC" />
                        </TouchableOpacity>
                      ) : null}
                    </View>
                  </View>
                )}
                
                {/* Business Activity (Giro) - Moved after address */}
                {selectedClient.line && (
                  <View style={styles.clientDetailItem}>
                    <Briefcase size={16} color="#4299E1" style={styles.detailIcon} />
                    <Text style={styles.detailText}>
                      <Text style={styles.detailLabel}>Giro: </Text>
                      {selectedClient.line}
                    </Text>
                  </View>
                )}
                
                {/* Activity details if available */}
                {selectedClient.activity && (
                  <View style={styles.clientDetailItem}>
                    <Briefcase size={16} color="#4299E1" style={styles.detailIcon} />
                    <Text style={styles.detailText}>
                      <Text style={styles.detailLabel}>Actividad: </Text>
                      {selectedClient.activity.name}
                    </Text>
                  </View>
                )}
                
                {/* Email */}
                {selectedClient.email && (
                  <View style={styles.clientDetailItem}>
                    <Mail size={16} color="#F6AD55" style={styles.detailIcon} />
                    <Text style={styles.detailText}>
                      <Text style={styles.detailLabel}>Email: </Text>
                      {selectedClient.email}
                    </Text>
                  </View>
                )}
              </View>
            ) : (
              // Default company information when no client is selected
              <View style={styles.clientContactInfo}>
                <View style={styles.contactItem}>
                  <Globe size={16} color="#4299E1" style={styles.contactIcon} />
                  <Text style={styles.contactText}>{companyInfo.website}</Text>
                </View>
                
                <View style={styles.contactItem}>
                  <Instagram size={16} color="#E1306C" style={styles.contactIcon} />
                  <Text style={styles.contactText}>{companyInfo.instagram}</Text>
                </View>
                
                <View style={styles.contactItem}>
                  <Smartphone size={16} color="#48BB78" style={styles.contactIcon} />
                  <Text style={styles.contactText}>{companyInfo.phone}</Text>
                </View>
                
                <View style={styles.contactItem}>
                  <Mail size={16} color="#F6AD55" style={styles.contactIcon} />
                  <Text style={styles.contactText}>{companyInfo.email}</Text>
                </View>
              </View>
            )}

            <View style={styles.clientStatsRow}>
              <View style={styles.clientStatItem}>
                <ShoppingBag size={18} color="#666" />
                <Text style={styles.clientStatLabel}>Total Ventas</Text>
                <Text style={styles.clientStatValue}>${formatAsInteger(12450)}</Text>
              </View>
              
              <View style={styles.clientStatItem}>
                <TrendingUp size={18} color="#666" />
                <Text style={styles.clientStatLabel}>Crecimiento</Text>
                <Text style={styles.clientStatValue}>+8.5%</Text>
              </View>
            </View>
            
            {/* Monthly Sales Chart */}
            <View style={styles.chartContainer}>
              <Text style={styles.chartTitle}>Ventas Mensuales</Text>
              <View style={styles.chart}>
                {monthlySales.map((item, index) => (
                  <View key={index} style={styles.chartColumn}>
                    <View 
                      style={[
                        styles.chartBar, 
                        { height: (item.amount / 2500) * 60 }
                      ]} 
                    />
                    <Text style={styles.chartLabel}>{item.month}</Text>
                  </View>
                ))}
              </View>
            </View>
            
            {/* Top Products */}
            <View style={styles.topProductsContainer}>
              <Text style={styles.topProductsTitle}>Productos más vendidos</Text>
              {topProducts.map((product, index) => (
                <View key={index} style={styles.topProductItem}>
                  <Package size={18} color="#666" />
                  <Text style={styles.topProductName}>{product.name}</Text>
                  <Text style={styles.topProductPercent}>{product.percent}%</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
      
      {/* Bottom Action Bar with Boleta and Factura options */}
      <View style={styles.bottomBar}>
        <TouchableOpacity 
          style={[
            styles.documentTypeButton,
            documentType === 'boleta' && styles.documentTypeButtonSelected
          ]}
          onPress={() => setDocumentType('boleta')}
        >
          <Receipt 
            size={20} 
            color={documentType === 'boleta' ? '#fff' : '#A0AEC0'} 
            style={styles.documentTypeIcon} 
          />
          <Text style={[
            styles.documentTypeText,
            documentType === 'boleta' && styles.documentTypeTextSelected
          ]}>Boleta</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.documentTypeButton,
            documentType === 'factura' && styles.documentTypeButtonSelected
          ]}
          onPress={() => setDocumentType('factura')}
        >
          <FileText 
            size={20} 
            color={documentType === 'factura' ? '#fff' : '#A0AEC0'} 
            style={styles.documentTypeIcon} 
          />
          <Text style={[
            styles.documentTypeText,
            documentType === 'factura' && styles.documentTypeTextSelected
          ]}>Factura</Text>
        </TouchableOpacity>
      </View>

      {/* Edit Quantity Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Editar Cantidad</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setEditModalVisible(false)}
              >
                <X size={22} color="#fff" />
              </TouchableOpacity>
            </View>
            
            {selectedProduct && (
              <View style={styles.modalContent}>
                <Text style={styles.selectedProductName}>{selectedProduct.name}</Text>
                <Text style={styles.selectedProductPrice}>
                  Precio: ${selectedProduct.price.toFixed(2)}
                </Text>
                
                <View style={styles.quantityInputContainer}>
                  <Text style={styles.quantityInputLabel}>Cantidad:</Text>
                  <View style={styles.quantityInputWrapper}>
                    <TouchableOpacity 
                      style={styles.quantityButton}
                      onPress={() => {
                        const current = parseFloat(newQuantity) || 0;
                        if (current > 0.1) { // Prevent going below 0.1
                          setNewQuantity((current - 0.1).toFixed(1));
                        }
                      }}
                    >
                      <Minus size={16} color="#fff" />
                    </TouchableOpacity>
                    
                    <TextInput
                      style={styles.quantityInput}
                      value={newQuantity}
                      onChangeText={(text) => setNewQuantity(text.replace(',', '.'))}
                      keyboardType="decimal-pad"
                      selectTextOnFocus={true}
                      autoFocus={true}
                    />
                    
                    <TouchableOpacity 
                      style={styles.quantityButton}
                      onPress={() => {
                        const current = parseFloat(newQuantity) || 0;
                        setNewQuantity((current + 0.1).toFixed(1));
                      }}
                    >
                      <Plus size={16} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </View>
                
                <TouchableOpacity 
                  style={styles.saveButton}
                  onPress={saveQuantity}
                >
                  <Check size={18} color="#fff" />
                  <Text style={styles.saveButtonText}>Guardar</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={deleteModalVisible}
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.deleteModalContainer}>
            <View style={styles.deleteModalContent}>
              <View style={styles.deleteIconContainer}>
                <Trash2 size={34} color="#FF5252" />
              </View>
              
              <Text style={styles.deleteTitle}>Eliminar Producto</Text>
              
              {longPressedProduct && (
                <Text style={styles.deleteMessage}>
                  ¿Está seguro que desea eliminar "{longPressedProduct.name}" de la lista?
                </Text>
              )}
              
              <View style={styles.deleteButtons}>
                <TouchableOpacity 
                  style={[styles.deleteButton, styles.cancelButton]}
                  onPress={() => setDeleteModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.deleteButton, styles.confirmButton]}
                  onPress={deleteProduct}
                >
                  <Text style={styles.confirmButtonText}>Eliminar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Client Search Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showClientSearchModal}
        onRequestClose={() => setShowClientSearchModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.clientSearchModalContainer}>
            <View style={styles.clientSearchModalHeader}>
              <Text style={styles.clientSearchModalTitle}>Buscar Cliente</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowClientSearchModal(false)}
              >
                <X size={22} color="#fff" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.clientSearchModalContent}>
              <View style={styles.searchContainer}>
                <Search size={20} color="#999" style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Buscar cliente por nombre o RUT"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoFocus={true}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
                    <X size={18} color="#999" />
                  </TouchableOpacity>
                )}
              </View>
              
              {isSearching ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#0066CC" />
                  <Text style={styles.loadingText}>Buscando clientes...</Text>
                </View>
              ) : searchPerformed && clients.length === 0 ? (
                <View style={styles.emptyResultContainer}>
                  <Text style={styles.emptyResultText}>No se encontraron clientes que coincidan con "{debouncedSearchTerm}"</Text>
                  <TouchableOpacity 
                    style={styles.createClientButton}
                    onPress={() => {
                      setShowClientSearchModal(false);
                      router.push('/clients/new');
                    }}
                  >
                    <Plus size={16} color="#fff" style={styles.createClientIcon} />
                    <Text style={styles.createClientText}>Crear Nuevo Cliente</Text>
                  </TouchableOpacity>
                </View>
              ) : clients.length > 0 ? (
                <FlatList
                  data={clients}
                  renderItem={renderClientItem}
                  keyExtractor={item => item.id.toString()}
                  style={styles.clientsList}
                  keyboardShouldPersistTaps="handled"
                />
              ) : (
                <View style={styles.placeholderContainer}>
                  <Text style={styles.placeholderText}>
                    Ingrese al menos 3 caracteres para buscar un cliente por su nombre o RUT
                  </Text>
                  <TouchableOpacity 
                    style={styles.createClientButton}
                    onPress={() => {
                      setShowClientSearchModal(false);
                      router.push('/clients/new');
                    }}
                  >
                    <Plus size={16} color="#fff" style={styles.createClientIcon} />
                    <Text style={styles.createClientText}>Crear Nuevo Cliente</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Product Search Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showProductSearchModal}
        onRequestClose={() => {
          setShowProductSearchModal(false);
          // Reset product search state when closing modal
          setProductSearchQuery('');
          setSearchedProducts([]);
          setProductSearchPerformed(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.productSearchModalContainer}>
            <View style={styles.productSearchModalHeader}>
              <Text style={styles.productSearchModalTitle}>Buscar Producto</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => {
                  setShowProductSearchModal(false);
                  // Reset product search state when closing modal
                  setProductSearchQuery('');
                  setSearchedProducts([]);
                  setProductSearchPerformed(false);
                }}
              >
                <X size={22} color="#fff" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.productSearchModalContent}>
              <View style={styles.searchContainer}>
                <Search size={20} color="#999" style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Buscar producto por nombre o código"
                  value={productSearchQuery}
                  onChangeText={setProductSearchQuery}
                  autoFocus={true}
                />
                {productSearchQuery.length > 0 && (
                  <TouchableOpacity onPress={clearProductSearch} style={styles.clearButton}>
                    <X size={18} color="#999" />
                  </TouchableOpacity>
                )}
              </View>
              
              {isSearchingProduct ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#0066CC" />
                  <Text style={styles.loadingText}>Buscando productos...</Text>
                </View>
              ) : productSearchPerformed && searchedProducts.length === 0 ? (
                <View style={styles.emptyResultContainer}>
                  <Text style={styles.emptyResultText}>No se encontraron productos que coincidan con "{debouncedProductSearchTerm}"</Text>
                  <TouchableOpacity 
                    style={styles.refreshButton}
                    onPress={() => {
                      setProductSearchQuery('');
                      setDebouncedProductSearchTerm('');
                    }}
                  >
                    <RefreshCcw size={16} color="#fff" style={styles.refreshIcon} />
                    <Text style={styles.refreshButtonText}>Intentar otra búsqueda</Text>
                  </TouchableOpacity>
                </View>
              ) : searchedProducts.length > 0 ? (
                <FlatList
                  data={searchedProducts}
                  renderItem={renderProductSearchItem}
                  keyExtractor={item => item.id.toString()}
                  style={styles.productsList}
                  keyboardShouldPersistTaps="handled"
                />
              ) : (
                <View style={styles.placeholderContainer}>
                  <Text style={styles.placeholderText}>
                    Ingrese al menos 3 caracteres para buscar un producto por su nombre o código
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Add Product Quantity Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={addingProduct}
        onRequestClose={() => setAddingProduct(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Agregar Producto</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setAddingProduct(false)}
              >
                <X size={22} color="#fff" />
              </TouchableOpacity>
            </View>
            
            {selectedApiProduct && (
              <View style={styles.modalContent}>
                <Text style={styles.selectedProductName}>{selectedApiProduct.name}</Text>
                <Text style={styles.selectedProductCode}>Código: {selectedApiProduct.code}</Text>
                <Text style={styles.selectedProductPrice}>
                  Precio: ${selectedApiProduct.price.toFixed(2)}
                </Text>
                
                {selectedApiProduct.category && (
                  <Text style={styles.selectedProductCategory}>
                    Categoría: {selectedApiProduct.category.name}
                  </Text>
                )}
                
                {selectedApiProduct.category && selectedApiProduct.category.otherTax && (
                  <Text style={styles.selectedProductTax}>
                    Impuesto: {selectedApiProduct.category.otherTax.name} ({selectedApiProduct.category.otherTax.percent}%)
                  </Text>
                )}
                
                <View style={styles.quantityInputContainer}>
                  <Text style={styles.quantityInputLabel}>Cantidad:</Text>
                  <View style={styles.quantityInputWrapper}>
                    <TouchableOpacity 
                      style={styles.quantityButton}
                      onPress={() => {
                        const current = parseFloat(newProductQuantity) || 0;
                        if (current > 0.1) { // Prevent going below 0.1
                          setNewProductQuantity((current - 0.1).toFixed(1));
                        }
                      }}
                    >
                      <Minus size={16} color="#fff" />
                    </TouchableOpacity>
                    
                    <TextInput
                      style={styles.quantityInput}
                      value={newProductQuantity}
                      onChangeText={(text) => setNewProductQuantity(text.replace(',', '.'))}
                      keyboardType="decimal-pad"
                      selectTextOnFocus={true}
                      autoFocus={true}
                    />
                    
                    <TouchableOpacity 
                      style={styles.quantityButton}
                      onPress={() => {
                        const current = parseFloat(newProductQuantity) || 0;
                        setNewProductQuantity((current + 0.1).toFixed(1));
                      }}
                    >
                      <Plus size={16} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </View>
                
                <TouchableOpacity 
                  style={styles.addButton}
                  onPress={addProductToList}
                >
                  <Plus size={18} color="#fff" />
                  <Text style={styles.addButtonText}>Agregar a la venta</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
      
      {/* Address Selection Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showAddressSelectionModal}
        onRequestClose={() => setShowAddressSelectionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.addressModalContainer}>
            <View style={styles.addressModalHeader}>
              <Text style={styles.addressModalTitle}>Seleccionar Dirección</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowAddressSelectionModal(false)}
              >
                <X size={22} color="#fff" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.addressModalContent}>
              <Text style={styles.addressModalSubtitle}>Dirección principal</Text>
              
              {selectedClient && selectedClient.address && selectedClient.municipality && (
                <TouchableOpacity
                  style={[
                    styles.addressItem,
                    selectedAddress && selectedAddress.id === 0 ? styles.selectedAddressItem : null
                  ]}
                  onPress={() => selectAddress({
                    id: 0, // Main address ID
                    address: selectedClient.address,
                    municipality: selectedClient.municipality
                  })}
                >
                  <View style={styles.addressIcon}>
                    <MapPin size={18} color="#0066CC" />
                  </View>
                  <View style={styles.addressInfo}>
                    <Text style={styles.addressText}>{selectedClient.address}</Text>
                    {selectedClient.municipality && (
                      <Text style={styles.municipalityText}>{selectedClient.municipality.name}</Text>
                    )}
                  </View>
                  {selectedAddress && selectedAddress.id === 0 && (
                    <Check size={18} color="#4CAF50" />
                  )}
                </TouchableOpacity>
              )}
              
              {selectedClient && selectedClient.additionalAddress && selectedClient.additionalAddress.length > 0 && (
                <>
                  <Text style={styles.addressModalSubtitle}>Direcciones adicionales</Text>
                  <FlatList
                    data={selectedClient.additionalAddress}
                    renderItem={renderAddressItem}
                    keyExtractor={item => item.id.toString()}
                    style={styles.addressList}
                  />
                </>
              )}
              
              <TouchableOpacity 
                style={styles.confirmAddressButton}
                onPress={() => setShowAddressSelectionModal(false)}
              >
                <Text style={styles.confirmAddressText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Success Modal - New enhanced version */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showSuccessModal}
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.successModalContainer}>
            <View style={styles.successModalHeader}>
              <Text style={styles.successModalTitle}>
                {documentType === 'boleta' ? 'Boleta Emitida' : 'Factura Emitida'}
              </Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowSuccessModal(false)}
              >
                <X size={22} color="#fff" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.successModalContent}>
              <View style={styles.successIconContainer}>
                <Check size={40} color="#4CAF50" />
              </View>
              
              <Text style={styles.successTitle}>
                {documentType === 'boleta' ? 'Boleta Electrónica' : 'Factura Electrónica'}
              </Text>
              
              <Text style={styles.successFolio}>N° {submittedDocumentId}</Text>
              
              <View style={styles.successDetailsContainer}>
                <View style={styles.successDetailRow}>
                  <Text style={styles.successDetailLabel}>Cliente:</Text>
                  <Text style={styles.successDetailValue}>
                    {submittedDocument?.client?.name || (selectedClient ? selectedClient.name : 'Cliente Final')}
                  </Text>
                </View>
                
                <View style={styles.successDetailRow}>
                  <Text style={styles.successDetailLabel}>RUT:</Text>
                  <Text style={styles.successDetailValue}>
                    {submittedDocument?.client?.code || (selectedClient ? selectedClient.code : '66666666-6')}
                  </Text>
                </View>
                
                <View style={styles.successDetailRow}>
                  <Text style={styles.successDetailLabel}>Fecha:</Text>
                  <Text style={styles.successDetailValue}>{formatDate(selectedDate)}</Text>
                </View>
                
                <View style={styles.successDetailRow}>
                  <Text style={styles.successDetailLabel}>Total:</Text>
                  <Text style={styles.successDetailValue}>{formatMoney(total)}</Text>
                </View>
                
                <View style={styles.successDetailRow}>
                  <Text style={styles.successDetailLabel}>Forma de Pago:</Text>
                  <Text style={styles.successDetailValue}>
                    {paymentCondition === 'contado' ? 'Contado' : 'Crédito'}
                    {paymentCondition === 'contado' && ` - ${paymentMethod === 'efectivo' ? 'Efectivo' : 'Tarjeta'}`}
                  </Text>
                </View>
              </View>
              
              <View style={styles.successButtonsContainer}>
                <TouchableOpacity 
                  style={styles.successButton}
                  onPress={viewCreatedDocument}
                >
                  <FileText size={18} color="#fff" style={styles.successButtonIcon} />
                  <Text style={styles.successButtonText}>Ver Documento</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.successButton, styles.newSaleButton]}
                  onPress={() => {
                    setShowSuccessModal(false);
                    resetSaleData();
                  }}
                >
                  <Plus size={18} color="#fff" style={styles.successButtonIcon} />
                  <Text style={styles.successButtonText}>Nueva Venta</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Success Feedback */}
      {showSuccessFeedback && (
        <View style={styles.successFeedback}>
          <Check size={24} color="#fff" />
          <Text style={styles.successFeedbackText}>
            "{addedProductName}" agregado correctamente
          </Text>
        </View>
      )}
      
      {/* Reset Feedback */}
      {showResetFeedback && (
        <View style={styles.resetFeedback}>
          <RefreshCcw size={24} color="#fff" />
          <Text style={styles.resetFeedbackText}>
            Venta limpiada correctamente
          </Text>
        </View>
      )}
      
      {/* Submit Document Feedback */}
      {showSubmitFeedback && (
        <View style={[
          styles.submitFeedback,
          submitSuccess ? styles.successSubmitFeedback : styles.errorSubmitFeedback
        ]}>
          {submitSuccess ? (
            <Check size={24} color="#fff" />
          ) : (
            <AlertTriangle size={24} color="#fff" />
          )}
          <Text style={styles.submitFeedbackText}>
            {submitSuccess 
              ? `${documentType === 'boleta' ? 'Boleta' : 'Factura'} N° ${submittedDocumentId} emitida correctamente` 
              : submitError}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2D3748',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  // Reset button style
  resetButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  microphoneSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  sideButtonContainer: {
    width: 60,
    alignItems: 'center',
  },
  sideButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  microphoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  // Style for active create button container
  createButtonContainerActive: {
    opacity: 1,
  },
  micWaveLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  micWaveRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  micWave: {
    width: 3,
    backgroundColor: '#fff',
    borderRadius: 1.5,
    marginHorizontal: 2,
  },
  micWave1: {
    height: 15,
  },
  micWave2: {
    height: 20,
  },
  micWave3: {
    height: 10,
  },
  micIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Styles for document-specific create buttons
  createButtonActiveBoleta: {
    backgroundColor: '#F472B6', // Pink color for boleta (same as selected tab)
    shadowColor: '#F472B6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  createButtonActiveFactura: {
    backgroundColor: '#3182CE', // Blue color for factura
    shadowColor: '#3182CE',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  // Style for submitting state
  submittingButton: {
    backgroundColor: '#4A5568', // Darker color when submitting
  },
  voiceposText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  productsSection: {
    backgroundColor: '#1A202C',
    borderRadius: 20,
    marginHorizontal: 15,
    padding: 15,
    maxHeight: 380, // Slightly increased height to accommodate new buttons
  },
  productsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  // New container for title with microphone
  titleWithMicContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productsSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E2E8F0',
    marginRight: 10,
  },
  // New microphone button style
  microphoneButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(171, 71, 188, 0.5)', // Purple color for mic
    justifyContent: 'center',
    alignItems: 'center',
  },
  productSearchButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 102, 204, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productsList: {
    paddingBottom: 10,
  },
  productRow: {
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  productCard: {
    width: '30%',
    backgroundColor: '#2D3748',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  productImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  productName: {
    fontSize: 12,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#E2E8F0',
  },
  // Styles for quantity display
  productDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: 4,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityLabel: {
    fontSize: 10,
    color: '#A0AEC0',
    marginRight: 3,
  },
  quantityValue: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#48BB78', // Green color for quantity
  },
  // Styles for additional tax display
  additionalTaxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(246, 173, 85, 0.1)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
    width: '100%',
  },
  taxIcon: {
    marginRight: 3,
  },
  additionalTaxText: {
    fontSize: 9,
    color: '#F6AD55',
    fontWeight: '500',
  },
  additionalTaxValue: {
    color: '#F6AD55',
  },
  productTotal: {
    marginTop: 6,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(160, 174, 192, 0.3)',
    width: '100%',
  },
  productTotalText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#4299E1', // Blue color for total
    textAlign: 'center',
  },
  // Empty products state
  emptyProductsContainer: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyProductsText: {
    fontSize: 16,
    color: '#A0AEC0',
    marginBottom: 15,
    textAlign: 'center',
  },
  addFirstProductButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0066CC',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  addFirstProductIcon: {
    marginRight: 5,
  },
  addFirstProductText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  summarySection: {
    backgroundColor: '#2D3748',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginTop: 5,
    marginBottom: 5,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#E2E8F0',
    marginRight: 8,
  },
  summaryContent: {
    flex: 1,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  summaryLabel: {
    fontSize: 11,
    color: '#A0AEC0',
  },
  summaryValue: {
    fontSize: 11,
    color: '#E2E8F0',
    fontWeight: '500',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
    paddingTop: 2,
    borderTopWidth: 1,
    borderTopColor: 'rgba(160, 174, 192, 0.3)',
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#E2E8F0',
  },
  totalValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4299E1',
  },
  // Payment options container - Updated for collapsible design
  paymentOptionsContainer: {
    marginTop: 10,
  },
  // Toggle button for payment options
  paymentToggleButton: {
    backgroundColor: '#2D3748',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  paymentToggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  paymentToggleText: {
    fontSize: 14,
    color: '#E2E8F0',
  },
  paymentHighlight: {
    color: '#4299E1',
    fontWeight: 'bold',
  },
  paymentToggleIcon: {
    marginLeft: 8,
    transform: [{ rotate: '0deg' }]
  },
  paymentToggleIconRotated: {
    transform: [{ rotate: '180deg' }]
  },
  // Expanded payment options
  expandedPaymentOptions: {
    backgroundColor: 'rgba(45, 55, 72, 0.7)',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  paymentOptionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  paymentSection: {
    marginBottom: 10,
  },
  paymentSectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#E2E8F0',
    marginBottom: 8,
  },
  paymentMethodContainer: {
    marginTop: 8,
  },
  paymentOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  paymentOption: {
    flex: 1,
    backgroundColor: '#1A202C',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: 'rgba(160, 174, 192, 0.3)',
  },
  paymentOptionSelected: {
    backgroundColor: 'rgba(0, 102, 204, 0.2)',
    borderColor: '#0066CC',
  },
  paymentOptionIcon: {
    marginRight: 8,
  },
  paymentOptionText: {
    color: '#E2E8F0',
    fontSize: 14,
    fontWeight: '500',
  },
  paymentOptionTextSelected: {
    color: '#0066CC',
    fontWeight: 'bold',
  },
  // Date toggle button
  dateToggleButton: {
    backgroundColor: '#2D3748',
    borderRadius: 8,
    padding: 10,
  },
  dateToggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateIcon: {
    marginRight: 8,
  },
  dateToggleText: {
    fontSize: 14,
    color: '#E2E8F0',
    flex: 1,
  },
  dateHighlight: {
    color: '#4299E1',
    fontWeight: 'bold',
  },
  dateToggleIcon: {
    transform: [{ rotate: '0deg' }]
  },
  dateToggleIconRotated: {
    transform: [{ rotate: '180deg' }]
  },
  // Date picker container
  datePickerContainer: {
    backgroundColor: 'rgba(45, 55, 72, 0.7)',
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
  },
  dateOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(160, 174, 192, 0.2)',
  },
  dateOptionSelected: {
    backgroundColor: 'rgba(0, 102, 204, 0.1)',
  },
  dateOptionText: {
    fontSize: 14,
    color: '#E2E8F0',
  },
  // Client section styles
  clientSection: {
    flexDirection: 'row',
    backgroundColor: '#1A202C',
    marginHorizontal: 15,
    marginTop: 15,
    borderRadius: 20,
    overflow: 'hidden',
    flex: 1.2, // Increased by 20%
  },
  clientImageContainer: {
    width: 150,
    backgroundColor: '#2D3748',
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  selectedClientContainer: {
    alignItems: 'center',
    width: '100%',
  },
  selectedClientIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  selectedClientName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 5,
  },
  selectedClientRut: {
    fontSize: 12,
    color: '#CBD5E0',
    textAlign: 'center',
  },
  companyLogoContainer: {
    alignItems: 'center',
    width: '100%',
  },
  companyLogoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 5,
  },
  companyLogoTextSmall: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#A0AEC0',
  },
  // Container for client action buttons
  clientActionButtonsContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    flexDirection: 'row',
  },
  clientSearchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 102, 204, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // New microphone button style for client section
  clientMicButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(171, 71, 188, 0.5)', // Purple color for mic
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 5,
  },
  clientInfoContainer: {
    flex: 1,
    padding: 15,
  },
  clientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E2E8F0',
    marginBottom: 10,
  },
  clientDetailsContainer: {
    marginBottom: 10,
  },
  clientDetailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  detailIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  detailText: {
    fontSize: 13,
    color: '#E2E8F0',
    flex: 1,
  },
  detailLabel: {
    fontWeight: 'bold',
    color: '#718096',
  },
  // Address container styles
  addressContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  addressSelectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 102, 204, 0.1)',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    marginLeft: 5,
  },
  addressSelectText: {
    fontSize: 11,
    color: '#0066CC',
    marginRight: 2,
  },
  // Client contact info styles - for when no client is selected
  clientContactInfo: {
    marginBottom: 15,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactIcon: {
    marginRight: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#E2E8F0',
  },
  clientStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  clientStatItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 10,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  clientStatLabel: {
    fontSize: 12,
    color: '#A0AEC0',
    marginTop: 5,
    marginBottom: 2,
  },
  clientStatValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#E2E8F0',
  },
  chartContainer: {
    marginBottom: 15,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#E2E8F0',
    marginBottom: 10,
  },
  chart: {
    height: 80,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  chartColumn: {
    alignItems: 'center',
    flex: 1,
  },
  chartBar: {
    width: 12,
    backgroundColor: '#4299E1',
    borderRadius: 6,
    marginBottom: 5,
  },
  chartLabel: {
    fontSize: 10,
    color: '#A0AEC0',
  },
  topProductsContainer: {
    marginBottom: 15,
  },
  topProductsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#E2E8F0',
    marginBottom: 10,
  },
  topProductItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  topProductName: {
    flex: 1,
    fontSize: 13,
    color: '#E2E8F0',
    marginLeft: 10,
  },
  topProductPercent: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#48BB78',
  },
  // Bottom bar with document type options
  bottomBar: {
    flexDirection: 'row',
    backgroundColor: '#1A202C',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  documentTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  documentTypeButtonSelected: {
    backgroundColor: '#2D3748',
  },
  documentTypeIcon: {
    marginRight: 8,
  },
  documentTypeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#A0AEC0',
  },
  documentTypeTextSelected: {
    color: '#fff',
  },
  // Tab indicators
  boleta: {
    backgroundColor: '#F472B6', // Pink for Boleta
  },
  factura: {
    backgroundColor: '#3182CE', // Blue for Factura
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#2D3748',
    borderRadius: 10,
    overflow: 'hidden',
    maxHeight: '80%',
  },
  modalHeader: {
    backgroundColor: '#1A202C',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E2E8F0',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    padding: 20,
  },
  selectedProductName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E2E8F0',
    marginBottom: 5,
  },
  selectedProductPrice: {
    fontSize: 16,
    color: '#A0AEC0',
    marginBottom: 20,
  },
  quantityInputContainer: {
    marginBottom: 20,
  },
  quantityInputLabel: {
    fontSize: 16,
    color: '#E2E8F0',
    marginBottom: 10,
  },
  quantityInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1A202C',
    borderRadius: 8,
    padding: 5,
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0066CC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityInput: {
    flex: 1,
    height: 50,
    backgroundColor: '#2D3748',
    borderRadius: 8,
    padding: 10,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E2E8F0',
    textAlign: 'center',
    marginHorizontal: 10,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#48BB78',
    padding: 15,
    borderRadius: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 10,
  },
  // Delete modal styles
  deleteModalContainer: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#2D3748',
    borderRadius: 10,
    overflow: 'hidden',
  },
  deleteModalContent: {
    padding: 20,
    alignItems: 'center',
  },
  deleteIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 82, 82, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  deleteTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E2E8F0',
    marginBottom: 10,
  },
  deleteMessage: {
    fontSize: 14,
    color: '#A0AEC0',
    textAlign: 'center',
    marginBottom: 20,
  },
  deleteButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  deleteButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    margin: 5,
  },
  cancelButton: {
    backgroundColor: '#4A5568',
  },
  confirmButton: {
    backgroundColor: '#FF5252',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E2E8F0',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  // Client search modal styles
  clientSearchModalContainer: {
    width: '90%',
    maxWidth: 600,
    height: '80%',
    backgroundColor: '#2D3748',
    borderRadius: 10,
    overflow: 'hidden',
  },
  clientSearchModalHeader: {
    backgroundColor: '#1A202C',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  clientSearchModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E2E8F0',
  },
  clientSearchModalContent: {
    flex: 1,
    padding: 15,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A202C',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
    color: '#E2E8F0',
    fontSize: 16,
  },
  clearButton: {
    padding: 8,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#A0AEC0',
    marginTop: 10,
  },
  emptyResultContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyResultText: {
    fontSize: 14,
    color: '#A0AEC0',
    textAlign: 'center',
    marginBottom: 15,
  },
  createClientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0066CC',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  createClientIcon: {
    marginRight: 8,
  },
  createClientText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0066CC',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  refreshIcon: {
    marginRight: 8,
  },
  refreshButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  clientsList: {
    flex: 1,
  },
  clientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#1A202C',
    borderRadius: 8,
    marginBottom: 8,
  },
  clientIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#E2E8F0',
    marginBottom: 4,
  },
  clientRut: {
    fontSize: 12,
    color: '#A0AEC0',
  },
  placeholderContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  placeholderText: {
    fontSize: 14,
    color: '#A0AEC0',
    textAlign: 'center',
    marginBottom: 15,
  },
  // Product search modal styles
  productSearchModalContainer: {
    width: '90%',
    maxWidth: 600,
    height: '80%',
    backgroundColor: '#2D3748',
    borderRadius: 10,
    overflow: 'hidden',
  },
  productSearchModalHeader: {
    backgroundColor: '#1A202C',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  productSearchModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E2E8F0',
  },
  productSearchModalContent: {
    flex: 1,
    padding: 15,
  },
  productSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#1A202C',
    borderRadius: 8,
    marginBottom: 8,
  },
  productSearchIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  productSearchInfo: {
    flex: 1,
  },
  productSearchName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#E2E8F0',
    marginBottom: 2,
  },
  productSearchCode: {
    fontSize: 12,
    color: '#A0AEC0',
    marginBottom: 2,
  },
  productSearchCategory: {
    fontSize: 12,
    color: '#4299E1',
  },
  productSearchPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productSearchPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#48BB78',
    marginRight: 10,
  },
  selectedProductCode: {
    fontSize: 14,
    color: '#A0AEC0',
    marginBottom: 10,
  },
  selectedProductCategory: {
    fontSize: 14,
    color: '#4299E1',
    marginBottom: 5,
  },
  selectedProductTax: {
    fontSize: 14,
    color: '#F6AD55',
    marginBottom: 20,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0066CC',
    padding: 15,
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 10,
  },
  // Address selection modal styles
  addressModalContainer: {
    width: '90%',
    maxWidth: 600,
    maxHeight: '80%',
    backgroundColor: '#2D3748',
    borderRadius: 10,
    overflow: 'hidden',
  },
  addressModalHeader: {
    backgroundColor: '#1A202C',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  addressModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E2E8F0',
  },
  addressModalContent: {
    padding: 15,
  },
  addressModalSubtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E2E8F0',
    marginTop: 10,
    marginBottom: 10,
  },
  addressList: {
    maxHeight: 200,
  },
  addressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#1A202C',
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedAddressItem: {
    backgroundColor: 'rgba(0, 102, 204, 0.2)',
    borderWidth: 1,
    borderColor: '#0066CC',
  },
  addressIcon: {
    marginRight: 10,
  },
  addressInfo: {
    flex: 1,
  },
  addressText: {
    fontSize: 14,
    color: '#E2E8F0',
    marginBottom: 2,
  },
  municipalityText: {
    fontSize: 12,
    color: '#A0AEC0',
  },
  confirmAddressButton: {
    backgroundColor: '#0066CC',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  confirmAddressText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  // Success modal styles
  successModalContainer: {
    width: '90%',
    maxWidth: 500,
    backgroundColor: '#2D3748',
    borderRadius: 10,
    overflow: 'hidden',
  },
  successModalHeader: {
    backgroundColor: '#1A202C',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  successModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E2E8F0',
  },
  successModalContent: {
    padding: 20,
    alignItems: 'center',
  },
  successIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#E2E8F0',
    marginBottom: 5,
  },
  successFolio: {
    fontSize: 20,
    color: '#4CAF50',
    marginBottom: 20,
  },
  successDetailsContainer: {
    width: '100%',
    backgroundColor: 'rgba(26, 32, 44, 0.5)',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  successDetailRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(160, 174, 192, 0.2)',
  },
  successDetailLabel: {
    width: 100,
    fontSize: 14,
    color: '#A0AEC0',
  },
  successDetailValue: {
    flex: 1,
    fontSize: 14,
    color: '#E2E8F0',
    fontWeight: '500',
  },
  successButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  successButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0066CC',
    padding: 12,
    borderRadius: 8,
    margin: 5,
  },
  newSaleButton: {
    backgroundColor: '#48BB78',
  },
  successButtonIcon: {
    marginRight: 8,
  },
  successButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  // Success feedback styles
  successFeedback: {
    position: 'absolute',
    bottom: 90,
    left: 20,
    right: 20,
    backgroundColor: '#48BB78',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  successFeedbackText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  // Reset feedback styles
  resetFeedback: {
    position: 'absolute',
    bottom: 90,
    left: 20,
    right: 20,
    backgroundColor: '#4299E1',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  resetFeedbackText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  // Submit document feedback styles
  submitFeedback: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  successSubmitFeedback: {
    backgroundColor: '#48BB78',
  },
  errorSubmitFeedback: {
    backgroundColor: '#F56565',
  },
  submitFeedbackText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});