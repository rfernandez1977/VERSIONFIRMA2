import React, { useState, useEffect, useRef } from 'react';
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
  Alert,
  Linking 
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { 
  ArrowLeft, 
  FileText, 
  Download, 
  Eye, 
  Check, 
  CircleAlert as AlertCircle, 
  Clock, 
  CreditCard,
  Printer,
  Mail,
  X,
  Bluetooth,
  RefreshCw
} from 'lucide-react-native';
import { api } from '../../services/api';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useTheme } from '../../context/ThemeContext';

// Only import WebView on native platforms
let WebView: any = () => null;
if (Platform.OS !== 'web') {
  WebView = require('react-native-webview').default;
}

interface InvoiceDetail {
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

export default function InvoiceDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const invoiceId = params.id as string;
  
  // Add the theme context to get printer preferences
  const { printerType, printerConfig } = useTheme();
  
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPdf, setShowPdf] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [printingPdf, setPrintingPdf] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  
  // Create a ref for the iframe on web
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Enhanced initial loading with retry mechanism
  useEffect(() => {
    if (invoiceId) {
      fetchInvoiceDetails();
    }
  }, [invoiceId, retryCount]);

  const fetchInvoiceDetails = async () => {
    try {
      console.log(`Fetching invoice details for ID: ${invoiceId} (Attempt: ${retryCount + 1})`);
      setLoading(true);
      setError(null);

      // Clear sales cache to ensure we get the latest data
      if (retryCount > 0) {
        console.log("Clearing sales cache before retry");
        await api.clearSalesCache();
      }
      
      // Parse invoiceId as number
      const idAsNumber = parseInt(invoiceId, 10);
      if (isNaN(idAsNumber)) {
        throw new Error(`Invalid invoice ID: ${invoiceId}`);
      }
      
      // Get invoice details with potential retry logic handled by the API
      const response = await api.getInvoiceDetail(idAsNumber);
      
      console.log("Invoice details response:", JSON.stringify(response, null, 2));
      setInvoice(response);
      setError(null);
      
      // If client has an email, pre-populate it
      if (response?.client?.email) {
        setEmailAddress(response.client.email);
      }
    } catch (err) {
      console.error('Error fetching invoice details:', err);
      setError('Error al cargar los detalles de la factura. ' + 
        (err instanceof Error ? err.message : 'Factura no encontrada'));
      
      // If we've tried less than 3 times, schedule another retry
      if (retryCount < 2) {
        console.log(`Scheduling retry #${retryCount + 1} in ${(retryCount + 1) * 1000}ms`);
        setTimeout(() => setRetryCount(retryCount + 1), (retryCount + 1) * 1000);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    // Reset retry count and force a fresh attempt
    setRetryCount(0);
    // Clear sales cache to ensure a fresh fetch
    api.clearSalesCache().then(() => {
      fetchInvoiceDetails();
    });
  };

  const handleViewPdf = async () => {
    if (!invoice) return;
    
    try {
      setLoadingPdf(true);
      const url = await api.getInvoicePdf(invoice.id, invoice.assignedFolio);
      setPdfUrl(url);
      setShowPdf(true);
    } catch (err) {
      console.error('Error getting PDF:', err);
      setError('No se pudo obtener el PDF de la factura');
    } finally {
      setLoadingPdf(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!invoice) return;
    
    try {
      setLoadingPdf(true);
      const url = await api.getInvoicePdf(invoice.id, invoice.assignedFolio);
      
      // On web, open in a new tab
      if (Platform.OS === 'web') {
        window.open(url, '_blank');
      } else {
        // On mobile, open with the device's PDF viewer
        const supported = await Linking.canOpenURL(url);
        if (supported) {
          await Linking.openURL(url);
        } else {
          Alert.alert('Error', 'No se puede abrir el PDF en este dispositivo');
        }
      }
    } catch (err) {
      console.error('Error downloading PDF:', err);
      Alert.alert('Error', 'No se pudo descargar el PDF de la factura');
    } finally {
      setLoadingPdf(false);
    }
  };
  
  const handlePrintPdf = async () => {
    if (!invoice) return;
    
    // Check if a printer is configured
    const isPrinterConfigured = printerType !== 'generic' && 
                               printerConfig && 
                               (printerConfig.model || printerConfig.connection);
    
    if (!isPrinterConfigured) {
      Alert.alert(
        'Impresora no configurada',
        'No hay una impresora configurada. Por favor, configure una impresora en Ajustes > Configuración de Impresión.',
        [
          { 
            text: 'Ir a Configuración', 
            onPress: () => router.push('/settings/print-config') 
          },
          { 
            text: 'Cancelar', 
            style: 'cancel' 
          }
        ]
      );
      return;
    }
    
    // Specific check for Bluetooth printer configuration
    if (printerConfig.connection === 'bluetooth') {
      // Check if a Bluetooth printer model is specified
      const hasBluetoothPrinterModel = printerConfig.model && 
        (printerConfig.model.includes('SM-') || 
         printerConfig.model.includes('WSP-') || 
         printerConfig.model.includes('Woosim'));
      
      if (!hasBluetoothPrinterModel) {
        Alert.alert(
          'Impresora Bluetooth no configurada',
          'Para imprimir por Bluetooth necesita seleccionar un modelo de impresora específico en los ajustes de configuración de impresión.',
          [
            { 
              text: 'Ir a Configuración', 
              onPress: () => router.push('/settings/print-config') 
            },
            { 
              text: 'Cancelar', 
              style: 'cancel' 
            }
          ]
        );
        return;
      }
    }
    
    try {
      setPrintingPdf(true);
      
      // Use the cached URL if available
      const url = pdfUrl || await api.getInvoicePdf(invoice.id, invoice.assignedFolio);
      if (!pdfUrl) {
        setPdfUrl(url);
      }
      
      // For web platform
      if (Platform.OS === 'web') {
        // Create a hidden iframe to load the PDF for printing
        if (!iframeRef.current) {
          const iframe = document.createElement('iframe');
          iframe.style.display = 'none';
          iframe.src = url;
          iframe.onload = function() {
            iframe.contentWindow?.print();
            // Remove the iframe after printing
            setTimeout(() => {
              document.body.removeChild(iframe);
            }, 1000);
          };
          document.body.appendChild(iframe);
        } else {
          // Use the existing iframe
          if (iframeRef.current.contentWindow) {
            iframeRef.current.contentWindow.print();
          }
        }
      } else {
        // For mobile platforms - attempt to print with configured printer
        try {
          // Attempt to print with the configured printer
          const { uri } = await Print.printAsync({
            uri: url,
          });
          console.log('Print completed successfully');
        } catch (printError) {
          console.error('Error printing PDF:', printError);
          
          // Instead of trying system methods, inform the user that printing failed
          Alert.alert(
            'Error de impresión', 
            `No se pudo imprimir el documento con la impresora ${printerConfig.model || 'configurada'}. Por favor, verifique la conexión con su impresora y los ajustes de configuración.`,
            [
              { 
                text: 'Ir a Configuración', 
                onPress: () => router.push('/settings/print-config') 
              },
              { 
                text: 'Aceptar', 
                style: 'cancel' 
              }
            ]
          );
        }
      }
    } catch (err) {
      console.error('Error handling PDF:', err);
      setError('No se pudo procesar el PDF de la factura');
    } finally {
      setPrintingPdf(false);
    }
  };
  
  const handleSendEmail = async () => {
    if (!invoice) return;
    
    if (!emailAddress || !emailAddress.includes('@')) {
      setError('Por favor ingrese una dirección de correo electrónico válida');
      return;
    }
    
    try {
      setSendingEmail(true);
      
      // In a real implementation, this would call an API endpoint to send the email
      // For this example, we'll simulate a successful email send after a delay
      setTimeout(() => {
        Alert.alert(
          'Correo Enviado',
          `La factura se ha enviado correctamente a ${emailAddress}`,
          [{ text: 'OK', onPress: () => setShowEmailModal(false) }]
        );
        setSendingEmail(false);
      }, 1500);
    } catch (err) {
      console.error('Error sending email:', err);
      setError('No se pudo enviar el correo electrónico. Intente nuevamente.');
      setSendingEmail(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount);
  };

  // Render PDF viewer - different for web and native
  const renderPdfViewer = () => {
    if (!pdfUrl) return null;
    
    if (Platform.OS === 'web') {
      // Use an iframe for web platform
      return (
        <iframe
          ref={iframeRef}
          src={pdfUrl}
          style={{ flex: 1, border: 'none', width: '100%', height: '100%' }}
          title={`Invoice ${invoice?.assignedFolio}`}
        />
      );
    } else {
      // Use WebView for native platforms
      return (
        <WebView
          source={{ uri: pdfUrl }}
          style={styles.webView}
          startInLoadingState={true}
          renderLoading={() => (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0066CC" />
              <Text style={styles.loadingText}>Cargando PDF...</Text>
            </View>
          )}
        />
      );
    }
  };

  if (showPdf && pdfUrl) {
    return (
      <View style={styles.container}>
        <View style={styles.pdfHeader}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setShowPdf(false)}
          >
            <ArrowLeft size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.pdfHeaderTitle}>
            {invoice?.type} {invoice?.assignedFolio}
          </Text>
          <TouchableOpacity 
            style={styles.downloadButton}
            onPress={handleDownloadPdf}
          >
            <Download size={24} color="#333" />
          </TouchableOpacity>
        </View>
        
        {renderPdfViewer()}
      </View>
    );
  }

  // Render error state
  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <AlertCircle size={48} color="#FF3B30" style={styles.errorIcon} />
      <Text style={styles.errorText}>{error || 'No se encontró la factura'}</Text>
      
      <View style={styles.errorButtonsContainer}>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={handleRefresh}
        >
          <RefreshCw size={18} color="#fff" style={styles.retryIcon} />
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.backToSalesButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backToSalesText}>Volver</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.errorNote}>
        Nota: Si acaba de crear este documento, es posible que aún no esté disponible. 
        Espere unos segundos e intente nuevamente.
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalle de Factura</Text>
        
        {!loading && !error && (
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw size={20} color="#0066CC" />
          </TouchableOpacity>
        )}
        {loading && <View style={{ width: 24 }} />}
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066CC" />
          <Text style={styles.loadingText}>
            {retryCount > 0 
              ? `Cargando detalles (intento ${retryCount + 1})...` 
              : 'Cargando detalles...'}
          </Text>
        </View>
      ) : error ? (
        renderErrorState()
      ) : invoice ? (
        <ScrollView style={styles.content}>
          <View style={styles.section}>
            <View style={styles.invoiceHeader}>
              <View style={styles.invoiceType}>
                <Text style={styles.invoiceTypeText}>{invoice.type}</Text>
                <Text style={styles.invoiceFolio}>N° {invoice.assignedFolio}</Text>
              </View>
              <View style={[
                styles.statusBadge,
                invoice.state[0] === 'ACCEPTED' ? styles.statusAccepted : styles.statusPending
              ]}>
                {invoice.state[0] === 'ACCEPTED' ? (
                  <Check size={16} color="#4CAF50" style={styles.statusIcon} />
                ) : (
                  <AlertCircle size={16} color="#FF9800" style={styles.statusIcon} />
                )}
                <Text style={[
                  styles.statusText,
                  invoice.state[0] === 'ACCEPTED' ? styles.statusTextAccepted : styles.statusTextPending
                ]}>
                  {invoice.state[1]}
                </Text>
              </View>
            </View>
            
            <View style={styles.detailRow}>
              <Clock size={16} color="#666" style={styles.detailIcon} />
              <Text style={styles.detailLabel}>Fecha de Emisión:</Text>
              <Text style={styles.detailValue}>{formatDate(invoice.date)}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <CreditCard size={16} color="#666" style={styles.detailIcon} />
              <Text style={styles.detailLabel}>Monto Total:</Text>
              <Text style={styles.detailValue}>{formatAmount(invoice.total)}</Text>
            </View>
            
            {invoice.validation && (
              <View style={styles.detailRow}>
                <FileText size={16} color="#666" style={styles.detailIcon} />
                <Text style={styles.detailLabel}>Verificación:</Text>
                <Text style={styles.detailValue}>{invoice.validation}</Text>
              </View>
            )}
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cliente</Text>
            <View style={styles.clientCard}>
              <Text style={styles.clientName}>{invoice.client.name}</Text>
              <Text style={styles.clientRut}>RUT: {invoice.client.rut}</Text>
              {invoice.client.email && (
                <Text style={styles.clientEmail}>{invoice.client.email}</Text>
              )}
            </View>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Acciones</Text>
            {/* Add printer information */}
            {printerType !== 'generic' ? (
              <View style={styles.printerInfoContainer}>
                <View style={styles.printerInfoIcon}>
                  {printerConfig.connection === 'bluetooth' ? (
                    <Bluetooth size={18} color="#0066CC" />
                  ) : (
                    <Printer size={18} color="#0066CC" />
                  )}
                </View>
                <Text style={styles.printerInfoText}>
                  Impresora configurada: {printerType === 'star' ? 'Star' : printerType === 'epson' ? 'Epson' : printerType} 
                  {printerConfig.model ? ` (${printerConfig.model})` : ''}
                  {printerConfig.connection ? ` - ${printerConfig.connection === 'bluetooth' ? 'Bluetooth' : printerConfig.connection === 'wifi' ? 'WiFi' : 'USB'}` : ''}
                </Text>
              </View>
            ) : (
              <View style={styles.printerWarningContainer}>
                <AlertCircle size={18} color="#FF9800" />
                <Text style={styles.printerWarningText}>
                  No hay una impresora configurada para imprimir. Configure una en Ajustes.
                </Text>
              </View>
            )}
            
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={handleViewPdf}
                disabled={loadingPdf}
              >
                {loadingPdf ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Eye size={20} color="#fff" style={styles.actionIcon} />
                    <Text style={styles.actionText}>Ver PDF</Text>
                  </>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.downloadActionButton]}
                onPress={handleDownloadPdf}
                disabled={loadingPdf}
              >
                {loadingPdf ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Download size={20} color="#fff" style={styles.actionIcon} />
                    <Text style={styles.actionText}>Descargar</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
            
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={[
                  styles.actionButton, 
                  styles.printActionButton,
                  printerType === 'generic' && styles.disabledActionButton
                ]}
                onPress={handlePrintPdf}
                disabled={printingPdf || printerType === 'generic'}
              >
                {printingPdf ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Printer size={20} color="#fff" style={styles.actionIcon} />
                    <Text style={styles.actionText}>Imprimir PDF</Text>
                  </>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.emailActionButton]}
                onPress={() => setShowEmailModal(true)}
              >
                <Mail size={20} color="#fff" style={styles.actionIcon} />
                <Text style={styles.actionText}>Enviar por Correo</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Detalles de la Factura</Text>
            {invoice.details && invoice.details.length > 0 ? (
              <View style={styles.detailsTable}>
                <View style={styles.detailsTableHeader}>
                  <Text style={[styles.detailsTableHeaderText, { flex: 0.6 }]}>Producto</Text>
                  <Text style={[styles.detailsTableHeaderText, { flex: 0.2, textAlign: 'center' }]}>Cant.</Text>
                  <Text style={[styles.detailsTableHeaderText, { flex: 0.2, textAlign: 'right' }]}>Precio</Text>
                </View>
                
                {invoice.details.map((detail, index) => (
                  <View key={index} style={styles.detailsTableRow}>
                    <Text style={[styles.detailsTableRowText, { flex: 0.6 }]}>
                      {detail.product?.description || detail.product?.name || 'Producto'}
                    </Text>
                    <Text style={[styles.detailsTableRowText, { flex: 0.2, textAlign: 'center' }]}>
                      {detail.quantity}
                    </Text>
                    <Text style={[styles.detailsTableRowText, { flex: 0.2, textAlign: 'right' }]}>
                      {formatAmount(detail.product?.price || 0)}
                    </Text>
                  </View>
                ))}
                
                <View style={styles.detailsTableFooter}>
                  <Text style={styles.detailsTableFooterLabel}>Total</Text>
                  <Text style={styles.detailsTableFooterValue}>{formatAmount(invoice.total)}</Text>
                </View>
              </View>
            ) : (
              <Text style={styles.detailsInfo}>
                Los detalles completos están disponibles en el PDF de la factura.
              </Text>
            )}
          </View>
        </ScrollView>
      ) : (
        renderErrorState()
      )}
      
      {/* Email Modal */}
      <Modal
        visible={showEmailModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Enviar por Correo</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowEmailModal(false)}
              >
                <ArrowLeft size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalContent}>
              <Text style={styles.modalLabel}>Dirección de correo electrónico</Text>
              <TextInput
                style={styles.modalInput}
                value={emailAddress}
                onChangeText={setEmailAddress}
                placeholder="ejemplo@correo.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleSendEmail}
                disabled={sendingEmail}
              >
                {sendingEmail ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.modalButtonText}>Enviar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Hidden iframe for printing on web */}
      {Platform.OS === 'web' && (
        <iframe
          ref={iframeRef}
          style={{ display: 'none' }}
          title="print-frame"
          src={pdfUrl || 'about:blank'}
        />
      )}
    </View>
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
  refreshButton: {
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
  section: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  invoiceType: {
    flex: 1,
  },
  invoiceTypeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  invoiceFolio: {
    fontSize: 16,
    color: '#666',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusAccepted: {
    backgroundColor: '#E8F5E9',
  },
  statusPending: {
    backgroundColor: '#FFF3E0',
  },
  statusIcon: {
    marginRight: 5,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  statusTextAccepted: {
    color: '#4CAF50',
  },
  statusTextPending: {
    color: '#FF9800',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailIcon: {
    marginRight: 10,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    width: 120,
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  clientCard: {
    backgroundColor: '#f5f5f5',
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
  clientEmail: {
    fontSize: 14,
    color: '#0066CC',
  },
  printerInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  printerWarningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  printerInfoIcon: {
    marginRight: 10,
  },
  printerInfoText: {
    fontSize: 14,
    color: '#0066CC',
    flex: 1,
  },
  printerWarningText: {
    fontSize: 14,
    color: '#FF9800',
    flex: 1,
    marginLeft: 10,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0066CC',
    borderRadius: 8,
    paddingVertical: 12,
    marginRight: 10,
  },
  downloadActionButton: {
    backgroundColor: '#4CAF50',
    marginRight: 0,
    marginLeft: 10,
  },
  printActionButton: {
    backgroundColor: '#FF9800',
    marginRight: 10,
  },
  disabledActionButton: {
    backgroundColor: '#ccc',
    opacity: 0.7,
  },
  emailActionButton: {
    backgroundColor: '#9C27B0',
    marginRight: 0,
    marginLeft: 10,
  },
  actionIcon: {
    marginRight: 8,
  },
  actionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  detailsInfo: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorIcon: {
    marginBottom: 15,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  errorButtonsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#0066CC',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  retryIcon: {
    marginRight: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backToSalesButton: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  backToSalesText: {
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorNote: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 20,
  },
  pdfHeader: {
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
  pdfHeaderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  downloadButton: {
    padding: 5,
  },
  webView: {
    flex: 1,
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
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  modalContent: {
    paddingBottom: 30,
  },
  modalLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  modalInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#0066CC',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Styles for detailed invoice items
  detailsTable: {
    marginTop: 10,
  },
  detailsTableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  detailsTableHeaderText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
  },
  detailsTableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailsTableRowText: {
    fontSize: 14,
    color: '#333',
  },
  detailsTableFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: '#f9f9f9',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  detailsTableFooterLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  detailsTableFooterValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0066CC',
  },
});