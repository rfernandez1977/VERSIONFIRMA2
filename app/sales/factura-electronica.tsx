import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  TextInput,
  Platform,
  Modal,
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Alert
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Calendar, CreditCard, User, MapPin, Plus, X, CircleMinus as MinusCircle, Search, Check } from 'lucide-react-native';
import { api, Client, Product, InvoiceRequest, InvoiceProductDetail, InvoiceClient } from '../../services/api';
import { generateInvoice } from '../../services/invoiceService';

// Interfaces
interface ProductDetail {
  id: number;
  code: string;
  name: string;
  price: number;
  quantity: number;
  unit?: {
    id: number;
    code: string;
    name: string;
  };
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
  total: number;
}

interface Address {
  id: number;
  address: string;
  municipality?: {
    id: number;
    code: string;
    name: string;
  };
}

interface SelectedClient {
  id: number;
  code: string;
  name: string;
  address?: string;
  additionalAddress?: Address[];
  email?: string;
  selectedAddressId?: number;
  line?: string;
}

export default function FacturaElectronicaScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const invoiceId = params.id as string;
  
  // Estado de la cabecera
  const [emissionDate, setEmissionDate] = useState(new Date());
  const [expirationDate, setExpirationDate] = useState<Date | null>(null);
  const [paymentForm, setPaymentForm] = useState<'contado' | 'credito'>('contado');
  const [paymentCondition, setPaymentCondition] = useState<'efectivo' | 'tarjeta'>('efectivo');
  
  // Estado del cliente
  const [client, setClient] = useState<SelectedClient | null>(null);
  
  // Estado de productos
  const [products, setProducts] = useState<ProductDetail[]>([]);
  
  // Modales
  const [showClientModal, setShowClientModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  
  // Carga de datos
  const [loadingClients, setLoadingClients] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [clientsList, setClientsList] = useState<Client[]>([]);
  const [productsList, setProductsList] = useState<Product[]>([]);
  
  // Búsqueda
  const [clientSearch, setClientSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [isSearchingClient, setIsSearchingClient] = useState(false);
  const [debouncedClientSearch, setDebouncedClientSearch] = useState('');
  
  // Para calendario
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState<'emission' | 'expiration'>('emission');
  
  // Para producto seleccionado
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productQuantity, setProductQuantity] = useState('1');
  
  // Cálculos de totales
  const [netTotal, setNetTotal] = useState(0);
  const [ivaAmount, setIvaAmount] = useState(0);
  const [otherTaxesAmount, setOtherTaxesAmount] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);
  
  // Estado para controlar cuando se está generando la factura
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);

  // Debounce client search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedClientSearch(clientSearch);
    }, 500);

    return () => clearTimeout(timer);
  }, [clientSearch]);

  // Search clients when debounced search term changes
  useEffect(() => {
    const searchClients = async () => {
      if (!showClientModal) return;
      
      if (debouncedClientSearch) {
        setIsSearchingClient(true);
        try {
          const data = await api.getClients(true, debouncedClientSearch);
          setClientsList(data);
        } catch (error) {
          console.error('Error searching clients:', error);
          // If API search fails, try local filtering
          try {
            const allClients = await api.getClients(false);
            const filteredClients = allClients.filter(client => 
              client.name.toLowerCase().includes(debouncedClientSearch.toLowerCase()) ||
              client.code.toLowerCase().includes(debouncedClientSearch.toLowerCase()) ||
              (client.email && client.email.toLowerCase().includes(debouncedClientSearch.toLowerCase()))
            );
            setClientsList(filteredClients);
          } catch (err) {
            Alert.alert('Error', 'No se pudieron buscar los clientes');
          }
        } finally {
          setIsSearchingClient(false);
        }
      } else if (showClientModal) {
        // If search is cleared, load all clients
        loadClients();
      }
    };

    searchClients();
  }, [debouncedClientSearch, showClientModal]);
  
  // Cargar clientes
  const loadClients = async () => {
    setLoadingClients(true);
    try {
      const clientsData = await api.getClients(true);
      setClientsList(clientsData);
    } catch (error) {
      console.error('Error loading clients:', error);
      Alert.alert('Error', 'No se pudieron cargar los clientes');
    } finally {
      setLoadingClients(false);
    }
  };
  
  // Cargar productos
  const loadProducts = async () => {
    setLoadingProducts(true);
    try {
      const productsData = await api.getProducts(true);
      setProductsList(productsData);
    } catch (error) {
      console.error('Error loading products:', error);
      Alert.alert('Error', 'No se pudieron cargar los productos');
    } finally {
      setLoadingProducts(false);
    }
  };
  
  // Filtrar productos por búsqueda
  const filteredProducts = productsList.filter(
    product => product.name.toLowerCase().includes(productSearch.toLowerCase()) || 
               (product.code && product.code.toLowerCase().includes(productSearch.toLowerCase()))
  );
  
  // Seleccionar cliente
  const selectClient = (client: Client) => {
    // Create a normalized client object with proper address handling
    const newClient: SelectedClient = {
      id: client.id,
      code: client.code,
      name: client.name,
      address: client.address || '',
      line: client.line,
      email: client.email,
      // Initialize additionalAddress array properly
      additionalAddress: []
    };

    // Add primary address if it exists
    if (client.address) {
      newClient.additionalAddress.push({
        id: 0,
        address: client.address,
        municipality: client.municipality
      });
    }

    // Add additional addresses if they exist
    if (client.additionalAddress && Array.isArray(client.additionalAddress)) {
      // Combine addresses, ensuring no duplicates by ID
      const existingIds = newClient.additionalAddress.map(addr => addr.id);
      const additionalAddresses = client.additionalAddress.filter(addr => !existingIds.includes(addr.id));
      
      newClient.additionalAddress = [
        ...newClient.additionalAddress,
        ...additionalAddresses
      ];
    }

    // Set the first address as selected by default
    if (newClient.additionalAddress.length > 0) {
      newClient.selectedAddressId = newClient.additionalAddress[0].id;
    }

    setClient(newClient);
    setShowClientModal(false);
  };
  
  // Seleccionar dirección
  const selectAddress = (addressId: number) => {
    if (client) {
      setClient({
        ...client,
        selectedAddressId: addressId
      });
    }
    setShowAddressModal(false);
  };
  
  // Preparar producto para agregar
  const prepareAddProduct = (product: Product) => {
    setSelectedProduct(product);
    setProductQuantity('1');
    setShowProductModal(false);
  };
  
  // Agregar producto
  const addProduct = () => {
    if (!selectedProduct) return;
    
    // Parse quantity as float to support decimals
    const quantity = parseFloat(productQuantity) || 1;
    const price = selectedProduct.price;
    const total = quantity * price;
    
    const newProduct: ProductDetail = {
      id: selectedProduct.id,
      code: selectedProduct.code,
      name: selectedProduct.name,
      price: selectedProduct.price,
      quantity: quantity,
      unit: selectedProduct.unit,
      category: selectedProduct.category,
      total: total
    };
    
    setProducts([...products, newProduct]);
    setSelectedProduct(null);
    calculateTotals([...products, newProduct]);
  };
  
  // Remover producto
  const removeProduct = (index: number) => {
    const updatedProducts = [...products];
    updatedProducts.splice(index, 1);
    setProducts(updatedProducts);
    calculateTotals(updatedProducts);
  };
  
  // Calcular totales
  const calculateTotals = (productList: ProductDetail[]) => {
    let net = 0;
    let otherTaxes = 0;
    
    productList.forEach(product => {
      net += product.total;
      
      // Calcular impuestos adicionales si existen
      if (product.category?.otherTax) {
        const taxPercent = product.category.otherTax.percent / 100;
        otherTaxes += product.total * taxPercent;
      }
    });
    
    const iva = net * 0.19; // 19% IVA
    const total = net + iva + otherTaxes;
    
    setNetTotal(net);
    setIvaAmount(iva);
    setOtherTaxesAmount(otherTaxes);
    setGrandTotal(total);
  };

  // Formatear fecha
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };
  
  // Formatear fecha para API (YYYY-MM-DD)
  const formatDateForAPI = (date: Date) => {
    return date.toISOString().split('T')[0];
  };
  
  // Formatear montos enteros (sin decimales)
  const formatInteger = (amount: number) => {
    return Math.round(amount).toLocaleString('es-CL');
  };
  
  // Preparar los datos para la API
  const prepareInvoiceData = (): InvoiceRequest => {
    if (!client) {
      throw new Error('Debe seleccionar un cliente');
    }
    
    if (products.length === 0) {
      throw new Error('Debe agregar al menos un producto');
    }
    
    // Preparar información del cliente
    const clientData: InvoiceClient = {
      code: client.code,
      name: client.name,
    };
    
    // Agregar línea si existe
    if (client.line) {
      clientData.line = client.line;
    }
    
    // Agregar dirección y municipalidad basado en la dirección seleccionada
    if (client.additionalAddress && client.additionalAddress.length > 0) {
      const selectedAddress = client.selectedAddressId !== undefined
        ? client.additionalAddress.find(addr => addr.id === client.selectedAddressId)
        : client.additionalAddress[0];
        
      if (selectedAddress) {
        clientData.address = selectedAddress.address;
        
        if (selectedAddress.municipality) {
          clientData.municipality = selectedAddress.municipality.name;
        }
      }
    } else if (client.address) {
      // Usar dirección principal si no hay direcciones adicionales
      clientData.address = client.address;
    }
    
    // Preparar detalles de productos
    const details: InvoiceProductDetail[] = products.map((product, index) => {
      const detail: InvoiceProductDetail = {
        position: index + 1,
        product: {
          code: product.code,
          name: product.name,
          price: product.price
        },
        quantity: product.quantity
      };
      
      // Agregar unidad si existe
      if (product.unit) {
        detail.product.unit = {
          code: product.unit.code
        };
      }
      
      return detail;
    });
    
    // Crear objeto de factura
    const invoiceData: InvoiceRequest = {
      currency: "CLP",
      hasTaxes: true,
      client: clientData,
      date: formatDateForAPI(emissionDate),
      details: details,
      paymentMethod: paymentForm === 'contado' ? 'CONTADO' : 'CREDITO',
      paymentCondition: paymentCondition === 'efectivo' ? 'EFECTIVO' : 'TARJETA'
    };
    
    // Agregar folio externo si estamos editando una factura existente
    if (invoiceId) {
      invoiceData.externalFolio = invoiceId;
    }
    
    return invoiceData;
  };
  
  // Generar factura - Updated to use the extracted service function
  const handleGenerateInvoice = async () => {
    // Validar datos
    if (!client) {
      Alert.alert('Error', 'Debe seleccionar un cliente');
      return;
    }
    
    if (products.length === 0) {
      Alert.alert('Error', 'Debe agregar al menos un producto');
      return;
    }
    
    setIsGeneratingInvoice(true);
    
    try {
      // Preparar datos para la API
      const invoiceData = prepareInvoiceData();
      
      // Usar el servicio centralizado para generar la factura
      const response = await generateInvoice(invoiceData);
      
      // Si hubo un error, la función generateInvoice ya muestra un alerta y devuelve null
      if (!response) {
        setIsGeneratingInvoice(false);
        return;
      }
      
      // Mostrar mensaje de éxito
      Alert.alert(
        'Factura Generada',
        `La factura electrónica se ha generado correctamente con el folio ${response.assignedFolio || 'asignado'}`,
        [
          { 
            text: 'Ver Detalle', 
            onPress: () => {
              if (response.id) {
                router.push(`/sales/invoice-details?id=${response.id}`);
              } else {
                router.replace('/sales');
              }
            } 
          },
          {
            text: 'Volver', 
            onPress: () => router.replace('/sales')
          }
        ]
      );
      
    } catch (error) {
      console.error('Error generating invoice:', error);
      Alert.alert(
        'Error',
        'No se pudo generar la factura. Por favor, intente nuevamente.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsGeneratingInvoice(false);
    }
  };
  
  // Cargar datos al inicio
  useEffect(() => {
    loadClients();
    loadProducts();
  }, []);

  // Handle client modal open
  useEffect(() => {
    if (showClientModal) {
      // Reset search when modal opens
      setClientSearch('');
      setDebouncedClientSearch('');
    }
  }, [showClientModal]);
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Factura Electrónica</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView style={styles.content}>
        {/* Mostrar el ID de Factura si existe */}
        {invoiceId && (
          <View style={styles.invoiceIdContainer}>
            <Text style={styles.invoiceIdLabel}>ID de Factura:</Text>
            <Text style={styles.invoiceIdValue}>{invoiceId}</Text>
          </View>
        )}
        
        {/* Cabecera */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cabecera</Text>
          
          <View style={styles.formRow}>
            <View style={styles.formCol}>
              <Text style={styles.inputLabel}>Fecha de Emisión *</Text>
              <TouchableOpacity 
                style={styles.datePickerButton}
                onPress={() => {
                  setDatePickerMode('emission');
                  setShowDatePicker(true);
                }}
              >
                <Text style={styles.dateText}>{formatDate(emissionDate)}</Text>
                <Calendar size={18} color="#666" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.formCol}>
              <Text style={styles.inputLabel}>Fecha de Vencimiento</Text>
              <TouchableOpacity 
                style={styles.datePickerButton}
                onPress={() => {
                  setDatePickerMode('expiration');
                  setShowDatePicker(true);
                }}
              >
                <Text style={styles.dateText}>
                  {expirationDate ? formatDate(expirationDate) : 'No aplica'}
                </Text>
                <Calendar size={18} color="#666" />
              </TouchableOpacity>
            </View>
          </View>
          
          <Text style={styles.inputLabel}>Forma de Pago *</Text>
          <View style={styles.paymentOptions}>
            <TouchableOpacity
              style={[
                styles.paymentOption,
                paymentForm === 'contado' && styles.paymentOptionSelected
              ]}
              onPress={() => setPaymentForm('contado')}
            >
              <Text style={[
                styles.paymentOptionText,
                paymentForm === 'contado' && styles.paymentOptionTextSelected
              ]}>Contado</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.paymentOption,
                paymentForm === 'credito' && styles.paymentOptionSelected
              ]}
              onPress={() => setPaymentForm('credito')}
            >
              <Text style={[
                styles.paymentOptionText,
                paymentForm === 'credito' && styles.paymentOptionTextSelected
              ]}>Crédito</Text>
            </TouchableOpacity>
          </View>
          
          {paymentForm === 'contado' && (
            <>
              <Text style={styles.inputLabel}>Condición de Pago</Text>
              <View style={styles.paymentOptions}>
                <TouchableOpacity
                  style={[
                    styles.paymentOption,
                    paymentCondition === 'efectivo' && styles.paymentOptionSelected
                  ]}
                  onPress={() => setPaymentCondition('efectivo')}
                >
                  <Text style={[
                    styles.paymentOptionText,
                    paymentCondition === 'efectivo' && styles.paymentOptionTextSelected
                  ]}>Efectivo</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.paymentOption,
                    paymentCondition === 'tarjeta' && styles.paymentOptionSelected
                  ]}
                  onPress={() => setPaymentCondition('tarjeta')}
                >
                  <Text style={[
                    styles.paymentOptionText,
                    paymentCondition === 'tarjeta' && styles.paymentOptionTextSelected
                  ]}>Tarjeta</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
        
        {/* Cliente */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Cliente</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => setShowClientModal(true)}
            >
              <Search size={18} color="#fff" />
            </TouchableOpacity>
          </View>
          
          {client ? (
            <View style={styles.clientCard}>
              <View style={styles.clientHeader}>
                <View style={styles.clientIcon}>
                  <User size={24} color="#0066CC" />
                </View>
                <View style={styles.clientInfo}>
                  <Text style={styles.clientName} numberOfLines={1} ellipsizeMode="tail">{client.name}</Text>
                  <Text style={styles.clientRut}>RUT: {client.code}</Text>
                </View>
              </View>
              
              <TouchableOpacity 
                style={styles.addressButton}
                onPress={() => {
                  if (client.additionalAddress && client.additionalAddress.length > 0) {
                    setShowAddressModal(true);
                  }
                }}
                disabled={!client.additionalAddress || client.additionalAddress.length === 0}
              >
                <MapPin size={18} color="#666" style={{ marginRight: 8 }} />
                <View style={styles.addressTextContainer}>
                  <Text style={styles.addressText} numberOfLines={1} ellipsizeMode="tail">
                    {client.selectedAddressId !== undefined && client.additionalAddress && client.additionalAddress.length > 0 ? 
                      (client.additionalAddress.find(a => a.id === client.selectedAddressId)?.address || 
                       client.additionalAddress[0]?.address || 'Sin dirección')
                      : 
                      client.address || 'Sin dirección'
                    }
                  </Text>
                  {client.additionalAddress && client.additionalAddress.length > 0 && 
                   client.selectedAddressId !== undefined && 
                   client.additionalAddress.find(a => a.id === client.selectedAddressId)?.municipality && (
                    <Text style={styles.municipalityText} numberOfLines={1} ellipsizeMode="tail">
                      {client.additionalAddress.find(a => a.id === client.selectedAddressId)?.municipality?.name}
                    </Text>
                  )}
                </View>
                {client.additionalAddress && client.additionalAddress.length > 1 && (
                  <View style={styles.multipleAddressBadge}>
                    <Text style={styles.multipleAddressText}>{client.additionalAddress.length}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.emptyClientCard}
              onPress={() => setShowClientModal(true)}
            >
              <User size={32} color="#999" />
              <Text style={styles.emptyClientText}>Seleccionar Cliente</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {/* Productos */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Productos</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => setShowProductModal(true)}
            >
              <Plus size={18} color="#fff" />
            </TouchableOpacity>
          </View>
          
          {selectedProduct && (
            <View style={styles.selectedProductCard}>
              <View style={styles.selectedProductHeader}>
                <Text style={styles.selectedProductTitle} numberOfLines={1} ellipsizeMode="tail">{selectedProduct.name}</Text>
                <TouchableOpacity
                  onPress={() => setSelectedProduct(null)}
                >
                  <X size={20} color="#FF3B30" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.selectedProductDetails}>
                <View style={styles.selectedProductInfo}>
                  <Text style={styles.selectedProductLabel} numberOfLines={1} ellipsizeMode="tail">Código: {selectedProduct.code}</Text>
                  <Text style={styles.selectedProductLabel}>
                    Precio: ${selectedProduct.price.toFixed(2)}
                  </Text>
                  {selectedProduct.category?.otherTax && (
                    <Text style={styles.selectedProductTax} numberOfLines={1} ellipsizeMode="tail">
                      Impuesto: {selectedProduct.category.otherTax.name} ({selectedProduct.category.otherTax.percent}%)
                    </Text>
                  )}
                </View>
                
                <View style={styles.quantityContainer}>
                  <Text style={styles.quantityLabel}>Cantidad:</Text>
                  <TextInput
                    style={styles.quantityInput}
                    value={productQuantity}
                    onChangeText={setProductQuantity}
                    keyboardType="decimal-pad" // Changed to decimal-pad to support decimals
                  />
                </View>
              </View>
              
              <TouchableOpacity
                style={styles.addProductButton}
                onPress={addProduct}
              >
                <Text style={styles.addProductButtonText}>Agregar</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {products.length > 0 ? (
            <View style={styles.productsList}>
              <View style={styles.productsListHeader}>
                <Text style={[styles.productCol, { flex: 2 }]}>Producto</Text>
                <Text style={[styles.productCol, { flex: 1, textAlign: 'right' }]}>Precio</Text>
                <Text style={[styles.productCol, { flex: 1, textAlign: 'right' }]}>Total</Text>
                <View style={{ width: 24 }} />
              </View>
              
              {products.map((product, index) => (
                <View key={index} style={styles.productItem}>
                  <View style={styles.productItemMainContent}>
                    <View style={styles.productNameContainer}>
                      <Text style={styles.productName} numberOfLines={1} ellipsizeMode="tail">
                        {product.name}
                      </Text>
                      <Text style={styles.productCode} numberOfLines={1} ellipsizeMode="tail">{product.code}</Text>
                      
                      {/* Quantity shown below product name */}
                      <View style={styles.productQuantityRow}>
                        <Text style={styles.productQuantityLabel}>Cant.: </Text>
                        <Text style={styles.productQuantityValue}>
                          {product.quantity % 1 === 0 ? product.quantity.toFixed(0) : product.quantity.toFixed(2)}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.productPriceContainer}>
                      <Text style={styles.productPrice}>
                        ${product.price.toLocaleString('es-CL')}
                      </Text>
                    </View>
                    
                    <View style={styles.productTotalContainer}>
                      <Text style={styles.productTotal}>
                        ${formatInteger(product.total)}
                      </Text>
                    </View>
                    
                    <TouchableOpacity
                      onPress={() => removeProduct(index)}
                      style={styles.removeProductButton}
                    >
                      <MinusCircle size={18} color="#FF3B30" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.emptyProductsList}
              onPress={() => setShowProductModal(true)}
            >
              <Plus size={32} color="#999" />
              <Text style={styles.emptyProductsText}>Agregar Productos</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {/* Totales */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Totales</Text>
          
          <View style={styles.totalsContainer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Monto Neto</Text>
              <Text style={styles.totalValue}>${formatInteger(netTotal)}</Text>
            </View>
            
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>IVA (19%)</Text>
              <Text style={styles.totalValue}>${formatInteger(ivaAmount)}</Text>
            </View>
            
            {otherTaxesAmount > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Otros Impuestos</Text>
                <Text style={styles.totalValue}>${formatInteger(otherTaxesAmount)}</Text>
              </View>
            )}
            
            <View style={[styles.totalRow, styles.grandTotalRow]}>
              <Text style={styles.grandTotalLabel}>Total</Text>
              <Text style={styles.grandTotalValue}>${formatInteger(grandTotal)}</Text>
            </View>
          </View>
        </View>
        
        {/* Botón de Guardar */}
        <TouchableOpacity 
          style={[styles.saveButton, isGeneratingInvoice && styles.saveButtonDisabled]}
          onPress={handleGenerateInvoice}
          disabled={isGeneratingInvoice}
        >
          {isGeneratingInvoice ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.saveButtonText}>Generar Factura</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
      
      {/* Modal para búsqueda de cliente */}
      <Modal
        visible={showClientModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Buscar Cliente</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowClientModal(false)}
              >
                <X size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                value={clientSearch}
                onChangeText={setClientSearch}
                placeholder="Buscar por nombre o RUT"
              />
              <View style={styles.searchIconContainer}>
                {isSearchingClient ? (
                  <ActivityIndicator size="small" color="#0066CC" />
                ) : (
                  <Search size={18} color="#666" />
                )}
              </View>
            </View>
            
            {loadingClients ? (
              <ActivityIndicator size="large" color="#0066CC" style={{ marginTop: 20 }} />
            ) : (
              <FlatList
                data={clientsList}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.clientListItem}
                    onPress={() => selectClient(item)}
                  >
                    <View style={styles.clientListIcon}>
                      <User size={20} color="#0066CC" />
                    </View>
                    <View style={styles.clientListInfo}>
                      <Text style={styles.clientListName} numberOfLines={1} ellipsizeMode="tail">{item.name}</Text>
                      <Text style={styles.clientListRut}>RUT: {item.code}</Text>
                    </View>
                  </TouchableOpacity>
                )}
                style={styles.modalList}
                ListEmptyComponent={
                  <Text style={styles.emptyListText}>
                    No se encontraron clientes
                  </Text>
                }
              />
            )}
          </View>
        </View>
      </Modal>
      
      {/* Modal para búsqueda de producto */}
      <Modal
        visible={showProductModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Buscar Producto</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowProductModal(false)}
              >
                <X size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                value={productSearch}
                onChangeText={setProductSearch}
                placeholder="Buscar por nombre o código"
              />
              <View style={styles.searchIconContainer}>
                <Search size={18} color="#666" />
              </View>
            </View>
            
            {loadingProducts ? (
              <ActivityIndicator size="large" color="#0066CC" style={{ marginTop: 20 }} />
            ) : (
              <FlatList
                data={filteredProducts}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.productListItem}
                    onPress={() => prepareAddProduct(item)}
                  >
                    <View style={styles.productListInfo}>
                      <Text style={styles.productListName} numberOfLines={1} ellipsizeMode="tail">{item.name}</Text>
                      <View style={styles.productListDetails}>
                        <Text style={styles.productListCode} numberOfLines={1} ellipsizeMode="tail">Código: {item.code}</Text>
                        <Text style={styles.productListPrice}>
                          ${item.price.toLocaleString('es-CL')}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                )}
                style={styles.modalList}
                ListEmptyComponent={
                  <Text style={styles.emptyListText}>
                    No se encontraron productos
                  </Text>
                }
              />
            )}
          </View>
        </View>
      </Modal>
      
      {/* Modal para selección de dirección */}
      <Modal
        visible={showAddressModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar Dirección</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowAddressModal(false)}
              >
                <X size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            {client && client.additionalAddress && (
              <FlatList
                data={client.additionalAddress}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.addressListItem,
                      client.selectedAddressId === item.id && styles.addressListItemSelected
                    ]}
                    onPress={() => selectAddress(item.id)}
                  >
                    <View style={styles.addressListIcon}>
                      <MapPin size={20} color="#0066CC" />
                    </View>
                    <View style={styles.addressListInfo}>
                      <Text style={styles.addressListText} numberOfLines={1} ellipsizeMode="tail">{item.address}</Text>
                      {item.municipality && (
                        <Text style={styles.addressListMunicipality} numberOfLines={1} ellipsizeMode="tail">
                          {item.municipality.name}
                        </Text>
                      )}
                    </View>
                    {client.selectedAddressId === item.id && (
                      <View style={styles.addressSelectedIcon}>
                        <Check size={18} color="#fff" />
                      </View>
                    )}
                  </TouchableOpacity>
                )}
                style={styles.modalList}
              />
            )}
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  invoiceIdContainer: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#0066CC',
  },
  invoiceIdLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0066CC',
    marginRight: 8,
  },
  invoiceIdValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  formRow: {
    flexDirection: 'row',
    marginBottom: 15,
    gap: 10,
  },
  formCol: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  paymentOptions: {
    flexDirection: 'row',
    marginBottom: 15,
    gap: 10,
  },
  paymentOption: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
    alignItems: 'center',
  },
  paymentOptionSelected: {
    backgroundColor: '#E3F2FD',
    borderColor: '#0066CC',
    borderWidth: 1,
  },
  paymentOptionText: {
    fontSize: 16,
    color: '#666',
  },
  paymentOptionTextSelected: {
    color: '#0066CC',
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#0066CC',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clientCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 15,
  },
  clientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  clientIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  clientInfo: {
    flex: 1,
    flexWrap: 'nowrap',
    overflow: 'hidden',
  },
  clientName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  clientRut: {
    fontSize: 14,
    color: '#666',
  },
  addressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f1f1',
    borderRadius: 5,
    padding: 10,
    flexWrap: 'nowrap',
  },
  addressTextContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  addressText: {
    fontSize: 14,
    color: '#555',
    overflow: 'hidden',
  },
  municipalityText: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  multipleAddressBadge: {
    backgroundColor: '#0066CC',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 5,
    flexShrink: 0,
  },
  multipleAddressText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  emptyClientCard: {
    height: 120,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  emptyClientText: {
    marginTop: 10,
    fontSize: 16,
    color: '#999',
  },
  selectedProductCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  selectedProductHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  selectedProductTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  selectedProductDetails: {
    flexDirection: 'row',
    marginBottom: 15,
    flexWrap: 'nowrap',
  },
  selectedProductInfo: {
    flex: 2,
    overflow: 'hidden',
  },
  selectedProductLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  selectedProductTax: {
    fontSize: 14,
    color: '#FF9800',
    fontWeight: '500',
  },
  quantityContainer: {
    flex: 1,
    marginLeft: 10,
  },
  quantityLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  quantityInput: {
    backgroundColor: '#f1f1f1',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 16,
  },
  addProductButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 5,
    paddingVertical: 10,
    alignItems: 'center',
  },
  addProductButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  productsList: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    overflow: 'hidden',
  },
  productsListHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f1f1',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    alignItems: 'center',
  },
  productCol: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
  },
  productItem: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  productItemMainContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  productNameContainer: {
    flex: 2,
    paddingRight: 5,
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  productCode: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  productQuantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  productQuantityLabel: {
    fontSize: 12,
    color: '#666',
  },
  productQuantityValue: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
  },
  productPriceContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  productPrice: {
    fontSize: 14,
    color: '#555',
  },
  productTotalContainer: {
    flex: 1,
    alignItems: 'flex-end',
    paddingRight: 5,
  },
  productTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  removeProductButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 5,
    flexShrink: 0,
  },
  emptyProductsList: {
    height: 120,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  emptyProductsText: {
    marginTop: 10,
    fontSize: 16,
    color: '#999',
  },
  totalsContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 15,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    flexWrap: 'nowrap',
  },
  totalLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  totalValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    textAlign: 'right',
    minWidth: 80,
  },
  grandTotalRow: {
    marginTop: 5,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  grandTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  grandTotalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0066CC',
    textAlign: 'right',
    minWidth: 100,
  },
  saveButton: {
    backgroundColor: '#0066CC',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 30,
  },
  saveButtonDisabled: {
    backgroundColor: '#99CCFF',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f9f9f9',
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  searchIconContainer: {
    position: 'absolute',
    right: 25,
  },
  modalList: {
    flex: 1,
  },
  clientListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  clientListIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  clientListInfo: {
    flex: 1,
    overflow: 'hidden',
  },
  clientListName: {
    fontSize: 16,
    color: '#333',
    marginBottom: 2,
  },
  clientListRut: {
    fontSize: 14,
    color: '#888',
  },
  productListItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  productListInfo: {
    flex: 1,
  },
  productListName: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  productListDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'nowrap',
  },
  productListCode: {
    fontSize: 14,
    color: '#888',
    flex: 1,
  },
  productListPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0066CC',
    textAlign: 'right',
    minWidth: 80,
  },
  emptyListText: {
    textAlign: 'center',
    padding: 20,
    color: '#999',
    fontStyle: 'italic',
  },
  addressListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    flexWrap: 'nowrap',
  },
  addressListItemSelected: {
    backgroundColor: '#E3F2FD',
  },
  addressListIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  addressListInfo: {
    flex: 1,
    overflow: 'hidden',
  },
  addressListText: {
    fontSize: 14,
    color: '#333',
  },
  addressListMunicipality: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  addressSelectedIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#0066CC',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
});