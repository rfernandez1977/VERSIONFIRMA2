import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Search, Plus, Minus, Calendar } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { generateTicket, formatTicketData } from '../../services/invoiceService';
import { api, Client, Product } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';

interface ProductItem extends Product {
  quantity: number;
}

export default function BoletaElectronicaScreen() {
  const router = useRouter();
  const { isDark, offlineMode } = useTheme();
  
  // State for header information
  const [emissionDate, setEmissionDate] = useState(new Date());
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'Contado' | 'Crédito'>('Contado');
  
  // State for date pickers
  const [showEmissionDatePicker, setShowEmissionDatePicker] = useState(false);
  const [showDueDatePicker, setShowDueDatePicker] = useState(false);
  
  // State for client
  const [client, setClient] = useState<Client | null>(null);
  const [showClientSearch, setShowClientSearch] = useState(false);
  const [clientSearchText, setClientSearchText] = useState('');
  const [clientSearchResults, setClientSearchResults] = useState<Client[]>([]);
  const [searchingClients, setSearchingClients] = useState(false);
  
  // State for products
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [showProductSearch, setShowProductSearch] = useState(false);
  const [productSearchText, setProductSearchText] = useState('');
  const [productSearchResults, setProductSearchResults] = useState<Product[]>([]);
  const [searchingProducts, setSearchingProducts] = useState(false);
  
  // State for loading
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Calculate totals
  const netTotal = products.reduce((sum, product) => sum + (product.price * product.quantity), 0);
  const iva = netTotal * 0.19; // 19% IVA (tax) in Chile
  const otherTaxes = products.reduce((sum, product) => {
    if (product.category?.otherTax) {
      return sum + (product.price * product.quantity * (product.category.otherTax.percent / 100));
    }
    return sum;
  }, 0);
  const grandTotal = netTotal + iva + otherTaxes;
  
  // Search clients when text changes
  useEffect(() => {
    const searchClients = async () => {
      if (!clientSearchText || clientSearchText.length < 3) {
        setClientSearchResults([]);
        return;
      }
      
      setSearchingClients(true);
      try {
        const results = await api.getClients(true, clientSearchText);
        setClientSearchResults(results);
      } catch (error) {
        console.error('Error searching clients:', error);
        Alert.alert('Error', 'No se pudieron buscar clientes. Por favor intente nuevamente.');
      } finally {
        setSearchingClients(false);
      }
    };
    
    const timer = setTimeout(searchClients, 500);
    return () => clearTimeout(timer);
  }, [clientSearchText]);
  
  // Search products when text changes
  useEffect(() => {
    const searchProducts = async () => {
      if (!productSearchText || productSearchText.length < 3) {
        setProductSearchResults([]);
        return;
      }
      
      setSearchingProducts(true);
      try {
        const results = await api.searchProducts(productSearchText);
        setProductSearchResults(results);
      } catch (error) {
        console.error('Error searching products:', error);
        Alert.alert('Error', 'No se pudieron buscar productos. Por favor intente nuevamente.');
      } finally {
        setSearchingProducts(false);
      }
    };
    
    const timer = setTimeout(searchProducts, 500);
    return () => clearTimeout(timer);
  }, [productSearchText]);
  
  // Handle date picker changes
  const onEmissionDateChange = (event: any, selectedDate?: Date) => {
    setShowEmissionDatePicker(false);
    if (selectedDate) {
      setEmissionDate(selectedDate);
    }
  };
  
  const onDueDateChange = (event: any, selectedDate?: Date) => {
    setShowDueDatePicker(false);
    if (selectedDate) {
      setDueDate(selectedDate);
    }
  };
  
  // Add product to list
  const addProduct = (product: Product) => {
    // Check if product already exists in the list
    const existingProductIndex = products.findIndex(p => p.id === product.id);
    
    if (existingProductIndex >= 0) {
      // Update quantity if product already exists
      const updatedProducts = [...products];
      updatedProducts[existingProductIndex].quantity += 1;
      setProducts(updatedProducts);
    } else {
      // Add new product with quantity 1
      setProducts([...products, { ...product, quantity: 1 }]);
    }
    
    setShowProductSearch(false);
    setProductSearchText('');
  };
  
  // Remove product from list
  const removeProduct = (productId: number) => {
    setProducts(products.filter(p => p.id !== productId));
  };
  
  // Update product quantity
  const updateProductQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      // Remove product if quantity is 0 or negative
      removeProduct(productId);
      return;
    }
    
    const updatedProducts = products.map(product => 
      product.id === productId ? { ...product, quantity } : product
    );
    
    setProducts(updatedProducts);
  };
  
  // Format date for display
  const formatDate = (date: Date | null) => {
    if (!date) return 'No aplica';
    
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };
  
  // Submit boleta
  const submitBoleta = async () => {
    // Validate data
    if (products.length === 0) {
      Alert.alert('Error', 'Debe agregar al menos un producto a la boleta');
      return;
    }
    
    setIsSubmitting(true);
    
    // Prepare ticket data
    const ticketData = formatTicketData(
      client,
      products,
      {
        date: emissionDate.toISOString().split('T')[0],
        paymentMethod,
        ticketTypeCode: '3', // Code for Boleta Electrónica
        netAmounts: false,
        hasTaxes: true
      }
    );
    
    try {
      // Generate ticket
      const response = await generateTicket(ticketData);
      
      if (response) {
        Alert.alert(
          'Boleta Generada',
          `La boleta N° ${response.assignedFolio} ha sido generada exitosamente.`,
          [
            { 
              text: 'Ver Detalles', 
              onPress: () => router.push(`/sales/invoice-details?id=${response.id}`) 
            },
            {
              text: 'Volver al Inicio',
              onPress: () => router.back(),
              style: 'cancel'
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error submitting boleta:', error);
      Alert.alert('Error', 'Ocurrió un error al generar la boleta. Por favor intente nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={isDark ? '#fff' : '#333'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isDark && styles.darkText]}>
          Boleta Electrónica
        </Text>
        <View style={{ width: 24 }}></View>
      </View>
      
      <ScrollView style={styles.content}>
        {/* Header Information */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.darkText]}>Cabecera</Text>
          
          {/* Date Fields Row */}
          <View style={styles.dateRow}>
            {/* Emission Date */}
            <View style={styles.dateField}>
              <Text style={[styles.dateLabel, isDark && styles.darkText]}>
                Fecha de Emisión *
              </Text>
              <TouchableOpacity 
                style={styles.dateInput}
                onPress={() => setShowEmissionDatePicker(true)}
              >
                <Text style={styles.dateText}>
                  {formatDate(emissionDate)}
                </Text>
                <Calendar size={20} color="#666" />
              </TouchableOpacity>
              
              {showEmissionDatePicker && (
                <DateTimePicker
                  value={emissionDate}
                  mode="date"
                  display="default"
                  onChange={onEmissionDateChange}
                />
              )}
            </View>
            
            {/* Due Date */}
            <View style={styles.dateField}>
              <Text style={[styles.dateLabel, isDark && styles.darkText]}>
                Fecha de Vencimiento
              </Text>
              <TouchableOpacity 
                style={styles.dateInput}
                onPress={() => paymentMethod === 'Crédito' ? setShowDueDatePicker(true) : null}
                disabled={paymentMethod !== 'Crédito'}
              >
                <Text style={[
                  styles.dateText,
                  paymentMethod !== 'Crédito' && styles.disabledText
                ]}>
                  {paymentMethod === 'Crédito' ? formatDate(dueDate) : 'No aplica'}
                </Text>
                {paymentMethod === 'Crédito' && (
                  <Calendar size={20} color="#666" />
                )}
              </TouchableOpacity>
              
              {showDueDatePicker && (
                <DateTimePicker
                  value={dueDate || new Date()}
                  mode="date"
                  display="default"
                  onChange={onDueDateChange}
                  minimumDate={new Date()}
                />
              )}
            </View>
          </View>
          
          {/* Payment Method */}
          <View style={styles.paymentField}>
            <Text style={[styles.dateLabel, isDark && styles.darkText]}>
              Forma de Pago *
            </Text>
            <View style={styles.paymentOptions}>
              <TouchableOpacity 
                style={[
                  styles.paymentOption,
                  paymentMethod === 'Contado' && styles.paymentOptionSelected
                ]}
                onPress={() => setPaymentMethod('Contado')}
              >
                <Text style={[
                  styles.paymentOptionText,
                  paymentMethod === 'Contado' && styles.paymentOptionTextSelected
                ]}>
                  Contado
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.paymentOption,
                  paymentMethod === 'Crédito' && styles.paymentOptionSelected
                ]}
                onPress={() => setPaymentMethod('Crédito')}
              >
                <Text style={[
                  styles.paymentOptionText,
                  paymentMethod === 'Crédito' && styles.paymentOptionTextSelected
                ]}>
                  Crédito
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        {/* Client Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, isDark && styles.darkText]}>Cliente</Text>
            <TouchableOpacity 
              style={styles.searchButton}
              onPress={() => setShowClientSearch(true)}
            >
              <Search size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          
          {client ? (
            <View style={styles.clientCard}>
              <Text style={styles.clientName}>{client.name}</Text>
              <Text style={styles.clientRut}>RUT: {client.code}</Text>
              {client.address && (
                <Text style={styles.clientAddress}>{client.address}</Text>
              )}
              {client.municipality && (
                <Text style={styles.clientAddress}>
                  {client.municipality.name}
                </Text>
              )}
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.clientSelector}
              onPress={() => setShowClientSearch(true)}
            >
              <View style={styles.clientIcon}>
                <Text style={styles.clientIconText}>👤</Text>
              </View>
              <Text style={styles.clientSelectorText}>Seleccionar Cliente</Text>
            </TouchableOpacity>
          )}
          
          {/* Client Search Modal */}
          {showClientSearch && (
            <View style={styles.searchModal}>
              <View style={styles.searchHeader}>
                <TouchableOpacity 
                  onPress={() => {
                    setShowClientSearch(false);
                    setClientSearchText('');
                  }}
                >
                  <ArrowLeft size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.searchTitle}>Buscar Cliente</Text>
                <View style={{ width: 24 }}></View>
              </View>
              
              <View style={styles.searchInputContainer}>
                <Search size={20} color="#999" style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Buscar por nombre o RUT"
                  value={clientSearchText}
                  onChangeText={setClientSearchText}
                />
              </View>
              
              {searchingClients ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#0066CC" />
                  <Text style={styles.loadingText}>Buscando clientes...</Text>
                </View>
              ) : (
                <ScrollView style={styles.searchResults}>
                  {clientSearchResults.map(client => (
                    <TouchableOpacity 
                      key={client.id}
                      style={styles.searchResultItem}
                      onPress={() => {
                        setClient(client);
                        setShowClientSearch(false);
                        setClientSearchText('');
                      }}
                    >
                      <Text style={styles.searchResultName}>{client.name}</Text>
                      <Text style={styles.searchResultDetail}>RUT: {client.code}</Text>
                    </TouchableOpacity>
                  ))}
                  
                  {clientSearchText.length >= 3 && clientSearchResults.length === 0 && (
                    <Text style={styles.noResultsText}>
                      No se encontraron clientes con ese criterio de búsqueda
                    </Text>
                  )}
                  
                  {clientSearchText.length < 3 && (
                    <Text style={styles.searchHintText}>
                      Ingrese al menos 3 caracteres para buscar
                    </Text>
                  )}
                </ScrollView>
              )}
            </View>
          )}
        </View>
        
        {/* Products Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, isDark && styles.darkText]}>Productos</Text>
            <TouchableOpacity 
              style={styles.searchButton}
              onPress={() => setShowProductSearch(true)}
            >
              <Plus size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.productsTable}>
            <View style={styles.productsHeader}>
              <Text style={[styles.productHeaderCell, styles.productNameHeader]}>Producto</Text>
              <Text style={[styles.productHeaderCell, styles.productPriceHeader]}>Precio</Text>
              <Text style={[styles.productHeaderCell, styles.productTotalHeader]}>Total</Text>
            </View>
            
            {products.length > 0 ? (
              products.map(product => (
                <View key={product.id} style={styles.productRow}>
                  <View style={styles.productNameCell}>
                    <Text style={styles.productName}>{product.name}</Text>
                    <View style={styles.quantityContainer}>
                      <Text style={styles.quantityLabel}>Cant.:</Text>
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => updateProductQuantity(product.id, product.quantity - 1)}
                      >
                        <Minus size={16} color="#0066CC" />
                      </TouchableOpacity>
                      <Text style={styles.quantityText}>{product.quantity}</Text>
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => updateProductQuantity(product.id, product.quantity + 1)}
                      >
                        <Plus size={16} color="#0066CC" />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <Text style={styles.productPriceCell}>
                    ${product.price.toLocaleString('es-CL')}
                  </Text>
                  <View style={styles.productTotalCell}>
                    <Text style={styles.productTotalText}>
                      ${(product.price * product.quantity).toLocaleString('es-CL')}
                    </Text>
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => removeProduct(product.id)}
                    >
                      <Minus size={16} color="#FF3B30" style={styles.removeIcon} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyProducts}>
                <Text style={styles.emptyProductsText}>
                  No hay productos agregados
                </Text>
                <TouchableOpacity
                  style={styles.addProductButton}
                  onPress={() => setShowProductSearch(true)}
                >
                  <Text style={styles.addProductText}>Agregar Producto</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
          
          {/* Product Search Modal */}
          {showProductSearch && (
            <View style={styles.searchModal}>
              <View style={styles.searchHeader}>
                <TouchableOpacity 
                  onPress={() => {
                    setShowProductSearch(false);
                    setProductSearchText('');
                  }}
                >
                  <ArrowLeft size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.searchTitle}>Buscar Producto</Text>
                <View style={{ width: 24 }}></View>
              </View>
              
              <View style={styles.searchInputContainer}>
                <Search size={20} color="#999" style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Buscar por nombre o código"
                  value={productSearchText}
                  onChangeText={setProductSearchText}
                />
              </View>
              
              {searchingProducts ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#0066CC" />
                  <Text style={styles.loadingText}>Buscando productos...</Text>
                </View>
              ) : (
                <ScrollView style={styles.searchResults}>
                  {productSearchResults.map(product => (
                    <TouchableOpacity 
                      key={product.id}
                      style={styles.searchResultItem}
                      onPress={() => addProduct(product)}
                    >
                      <Text style={styles.searchResultName}>{product.name}</Text>
                      <View style={styles.searchResultDetails}>
                        <Text style={styles.searchResultDetail}>Código: {product.code}</Text>
                        <Text style={styles.searchResultPrice}>
                          ${product.price.toLocaleString('es-CL')}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                  
                  {productSearchText.length >= 3 && productSearchResults.length === 0 && (
                    <Text style={styles.noResultsText}>
                      No se encontraron productos con ese criterio de búsqueda
                    </Text>
                  )}
                  
                  {productSearchText.length < 3 && (
                    <Text style={styles.searchHintText}>
                      Ingrese al menos 3 caracteres para buscar
                    </Text>
                  )}
                </ScrollView>
              )}
            </View>
          )}
        </View>
        
        {/* Totals Section */}
        {products.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, isDark && styles.darkText]}>Totales</Text>
            
            <View style={styles.totalsTable}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Monto Neto</Text>
                <Text style={styles.totalValue}>
                  ${netTotal.toLocaleString('es-CL')}
                </Text>
              </View>
              
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>IVA (19%)</Text>
                <Text style={styles.totalValue}>
                  ${iva.toLocaleString('es-CL')}
                </Text>
              </View>
              
              {otherTaxes > 0 && (
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Otros Impuestos</Text>
                  <Text style={styles.totalValue}>
                    ${otherTaxes.toLocaleString('es-CL')}
                  </Text>
                </View>
              )}
              
              <View style={styles.grandTotalRow}>
                <Text style={styles.grandTotalLabel}>Total</Text>
                <Text style={styles.grandTotalValue}>
                  ${grandTotal.toLocaleString('es-CL')}
                </Text>
              </View>
            </View>
          </View>
        )}
        
        {/* Submit Button */}
        <TouchableOpacity
          style={styles.submitButton}
          onPress={submitBoleta}
          disabled={isSubmitting || products.length === 0}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Generar Boleta</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
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
  darkText: {
    color: '#fff',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 20,
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
    marginBottom: 15,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  dateField: {
    flex: 1,
    marginRight: 10,
  },
  dateLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  dateInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  disabledText: {
    color: '#999',
  },
  paymentField: {
    marginBottom: 10,
  },
  paymentOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  paymentOption: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
    paddingVertical: 12,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  paymentOptionSelected: {
    backgroundColor: '#E3F2FD',
  },
  paymentOptionText: {
    fontSize: 16,
    color: '#666',
  },
  paymentOptionTextSelected: {
    color: '#0066CC',
    fontWeight: 'bold',
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0066CC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clientSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    padding: 20,
  },
  clientIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  clientIconText: {
    fontSize: 20,
  },
  clientSelectorText: {
    fontSize: 16,
    color: '#666',
  },
  clientCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 15,
  },
  clientName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  clientRut: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  clientAddress: {
    fontSize: 14,
    color: '#666',
  },
  productsTable: {
    marginBottom: 10,
  },
  productsHeader: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  productHeaderCell: {
    fontWeight: 'bold',
    color: '#666',
    fontSize: 14,
  },
  productNameHeader: {
    flex: 2,
  },
  productPriceHeader: {
    flex: 1,
    textAlign: 'right',
  },
  productTotalHeader: {
    flex: 1,
    textAlign: 'right',
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  productNameCell: {
    flex: 2,
  },
  productName: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityLabel: {
    fontSize: 12,
    color: '#666',
    marginRight: 5,
  },
  quantityButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    marginHorizontal: 5,
  },
  quantityText: {
    fontSize: 14,
    color: '#333',
    minWidth: 20,
    textAlign: 'center',
  },
  productPriceCell: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    textAlign: 'right',
  },
  productTotalCell: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  productTotalText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 10,
  },
  removeButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
  },
  removeIcon: {
    
  },
  emptyProducts: {
    padding: 20,
    alignItems: 'center',
  },
  emptyProductsText: {
    fontSize: 16,
    color: '#999',
    marginBottom: 15,
  },
  addProductButton: {
    backgroundColor: '#E3F2FD',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  addProductText: {
    color: '#0066CC',
    fontWeight: 'bold',
  },
  totalsTable: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 15,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  totalLabel: {
    fontSize: 14,
    color: '#666',
  },
  totalValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  grandTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  grandTotalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0066CC',
  },
  submitButton: {
    backgroundColor: '#0066CC',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 30,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  searchModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    zIndex: 10,
    padding: 20,
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  searchTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  searchResults: {
    flex: 1,
  },
  searchResultItem: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  searchResultName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  searchResultDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  searchResultDetail: {
    fontSize: 14,
    color: '#666',
  },
  searchResultPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0066CC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  noResultsText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
  },
  searchHintText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
});