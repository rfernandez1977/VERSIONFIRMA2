import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Printer, Check, Smartphone, Wifi, Bluetooth, Usb } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import BluetoothPrinterService from '../../utils/BluetoothPrinterService';

// Star printer models
const STAR_MODELS = {
  mobile: [
    { id: 'sm-s230i', name: 'SM-S230i', type: 'bluetooth' },
    { id: 'sm-s210i', name: 'SM-S210i', type: 'bluetooth' },
    { id: 'sm-t300i', name: 'SM-T300i', type: 'bluetooth' },
    { id: 'sm-t400i', name: 'SM-T400i', type: 'bluetooth' },
    { id: 'sm-l200', name: 'SM-L200', type: 'bluetooth' },
    { id: 'sm-l300', name: 'SM-L300', type: 'bluetooth' },
    { id: 'wsp-i450', name: 'WSP-i450', type: 'bluetooth' }
  ],
  desktop: [
    { id: 'tsp100', name: 'TSP100', type: 'lan' },
    { id: 'tsp650ii', name: 'TSP650II', type: 'lan' },
    { id: 'tsp700ii', name: 'TSP700II', type: 'lan' },
    { id: 'tsp800ii', name: 'TSP800II', type: 'lan' }
  ]
};

// Connection types
const CONNECTION_TYPES = [
  { id: 'bluetooth', name: 'Bluetooth', icon: Bluetooth },
  { id: 'lan', name: 'LAN/WiFi', icon: Wifi },
  { id: 'usb', name: 'USB', icon: Usb }
];

export default function PrintConfigScreen() {
  const router = useRouter();
  const { printSize, setPrintSize, printerType, setPrinterType } = useTheme();
  const [selectedSize, setSelectedSize] = useState<'letter' | 'ticket'>(printSize);
  const [selectedPrinter, setSelectedPrinter] = useState<'epson' | 'zebra' | 'generic' | 'star'>(printerType);
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedConnection, setSelectedConnection] = useState('');
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [showConnectionSelector, setShowConnectionSelector] = useState(false);
  const [woosimConnecting, setWoosimConnecting] = useState(false);

  // Star SDK initialization
  useEffect(() => {
    if (Platform.OS !== 'web' && selectedPrinter === 'star') {
      initializeStarSDK();
    }
  }, [selectedPrinter]);

  const initializeStarSDK = async () => {
    if (Platform.OS === 'ios') {
      // iOS StarXpand SDK initialization would go here
      // This is just a placeholder for the actual implementation
      console.log('Initializing StarXpand SDK for iOS');
    } else if (Platform.OS === 'android') {
      // Android Star SDK initialization would go here
      console.log('Initializing Star SDK for Android');
    }
  };

  const handleSave = () => {
    setPrintSize(selectedSize);
    setPrinterType(selectedPrinter);
    router.back();
  };

  const getConnectionIcon = (type: string) => {
    const connection = CONNECTION_TYPES.find(c => c.id === type);
    if (!connection) return null;
    
    const Icon = connection.icon;
    return <Icon size={24} color="#0066CC" />;
  };

  const handleConnectWoosim = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('No disponible', 'La impresión mediante Bluetooth no está disponible en la versión web.');
      return;
    }
    
    try {
      setWoosimConnecting(true);
      
      // Attempt to connect to the Woosim printer
      const connected = await BluetoothPrinterService.connectToWoosimPrinter();
      
      if (connected) {
        // Set selected model to WSP-i450
        setSelectedModel('WSP-i450');
        setSelectedConnection('bluetooth');
        setSelectedPrinter('star');
        
        // Print a test page
        await BluetoothPrinterService.printTestPage();
        
        Alert.alert(
          'Conexión Exitosa',
          'Se ha conectado correctamente a la impresora Woosim WSP-i450'
        );
      } else {
        Alert.alert(
          'Error de Conexión',
          'No se pudo conectar a la impresora Woosim WSP-i450. Asegúrese de que la impresora esté encendida y dentro del rango de Bluetooth.'
        );
      }
    } catch (error) {
      console.error('Error connecting to Woosim printer:', error);
      Alert.alert(
        'Error',
        'Ocurrió un error al intentar conectarse a la impresora. Por favor, inténtelo de nuevo.'
      );
    } finally {
      setWoosimConnecting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configuración de Impresión</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tamaño de Impresión</Text>
          <Text style={styles.sectionDescription}>
            Seleccione el formato de impresión predeterminado para sus documentos.
          </Text>
          
          <TouchableOpacity 
            style={[
              styles.optionCard,
              selectedSize === 'letter' && styles.selectedOption
            ]}
            onPress={() => setSelectedSize('letter')}
          >
            <View style={styles.optionContent}>
              <View style={styles.optionIconContainer}>
                <Printer size={24} color="#0066CC" />
              </View>
              <View style={styles.optionInfo}>
                <Text style={styles.optionTitle}>Tamaño Carta</Text>
                <Text style={styles.optionDescription}>
                  Formato estándar para impresoras láser o de inyección de tinta. Ideal para documentos formales.
                </Text>
              </View>
            </View>
            {selectedSize === 'letter' && (
              <View style={styles.checkContainer}>
                <Check size={20} color="#0066CC" />
              </View>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.optionCard,
              selectedSize === 'ticket' && styles.selectedOption
            ]}
            onPress={() => setSelectedSize('ticket')}
          >
            <View style={styles.optionContent}>
              <View style={styles.optionIconContainer}>
                <Printer size={24} color="#4CAF50" />
              </View>
              <View style={styles.optionInfo}>
                <Text style={styles.optionTitle}>Tamaño Ticket</Text>
                <Text style={styles.optionDescription}>
                  Formato compacto para impresoras térmicas. Ideal para puntos de venta y recibos.
                </Text>
              </View>
            </View>
            {selectedSize === 'ticket' && (
              <View style={styles.checkContainer}>
                <Check size={20} color="#0066CC" />
              </View>
            )}
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tipo de Impresora</Text>
          <Text style={styles.sectionDescription}>
            Seleccione el tipo de impresora que utilizará para determinar el SDK adecuado.
          </Text>
          
          <TouchableOpacity 
            style={[
              styles.optionCard,
              selectedPrinter === 'star' && styles.selectedOption
            ]}
            onPress={() => {
              setSelectedPrinter('star');
              setShowModelSelector(true);
            }}
          >
            <View style={styles.optionContent}>
              <View style={styles.optionIconContainer}>
                <Smartphone size={24} color="#0066CC" />
              </View>
              <View style={styles.optionInfo}>
                <Text style={styles.optionTitle}>Star Micronics</Text>
                <Text style={styles.optionDescription}>
                  Compatible con impresoras móviles y de escritorio Star. Utiliza el SDK StarXpand para una mejor integración.
                </Text>
                {selectedModel && (
                  <Text style={styles.selectedModelText}>
                    Modelo: {selectedModel}
                  </Text>
                )}
              </View>
            </View>
            {selectedPrinter === 'star' && (
              <View style={styles.checkContainer}>
                <Check size={20} color="#0066CC" />
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.optionCard,
              selectedPrinter === 'epson' && styles.selectedOption
            ]}
            onPress={() => setSelectedPrinter('epson')}
          >
            <View style={styles.optionContent}>
              <View style={styles.optionIconContainer}>
                <Printer size={24} color="#0066CC" />
              </View>
              <View style={styles.optionInfo}>
                <Text style={styles.optionTitle}>Epson</Text>
                <Text style={styles.optionDescription}>
                  Compatible con impresoras térmicas Epson. Utiliza el SDK oficial de Epson para una mejor compatibilidad.
                </Text>
              </View>
            </View>
            {selectedPrinter === 'epson' && (
              <View style={styles.checkContainer}>
                <Check size={20} color="#0066CC" />
              </View>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.optionCard,
              selectedPrinter === 'zebra' && styles.selectedOption
            ]}
            onPress={() => setSelectedPrinter('zebra')}
          >
            <View style={styles.optionContent}>
              <View style={styles.optionIconContainer}>
                <Printer size={24} color="#FF9800" />
              </View>
              <View style={styles.optionInfo}>
                <Text style={styles.optionTitle}>Zebra</Text>
                <Text style={styles.optionDescription}>
                  Compatible con impresoras Zebra. Optimizado para etiquetas y códigos de barras con el SDK de Zebra.
                </Text>
              </View>
            </View>
            {selectedPrinter === 'zebra' && (
              <View style={styles.checkContainer}>
                <Check size={20} color="#0066CC" />
              </View>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.optionCard,
              selectedPrinter === 'generic' && styles.selectedOption
            ]}
            onPress={() => setSelectedPrinter('generic')}
          >
            <View style={styles.optionContent}>
              <View style={styles.optionIconContainer}>
                <Printer size={24} color="#9C27B0" />
              </View>
              <View style={styles.optionInfo}>
                <Text style={styles.optionTitle}>Genérica</Text>
                <Text style={styles.optionDescription}>
                  Compatible con la mayoría de impresoras. Utiliza comandos estándar ESC/POS para impresión.
                </Text>
              </View>
            </View>
            {selectedPrinter === 'generic' && (
              <View style={styles.checkContainer}>
                <Check size={20} color="#0066CC" />
              </View>
            )}
          </TouchableOpacity>
          
          {/* Botón específico para Woosim WSP-i450 */}
          <TouchableOpacity
            style={styles.woosimButton}
            onPress={handleConnectWoosim}
            disabled={woosimConnecting}
          >
            {woosimConnecting ? (
              <Text style={styles.woosimButtonText}>Conectando...</Text>
            ) : (
              <>
                <Bluetooth size={20} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.woosimButtonText}>Conectar Woosim WSP-i450</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {selectedPrinter === 'star' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Configuración Star</Text>
            
            <View style={styles.starConfig}>
              <TouchableOpacity
                style={styles.configButton}
                onPress={() => setShowModelSelector(true)}
              >
                <Text style={styles.configButtonLabel}>Modelo de Impresora</Text>
                <Text style={styles.configButtonValue}>
                  {selectedModel || 'Seleccionar modelo'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.configButton}
                onPress={() => setShowConnectionSelector(true)}
              >
                <Text style={styles.configButtonLabel}>Tipo de Conexión</Text>
                <View style={styles.connectionValue}>
                  {selectedConnection && getConnectionIcon(selectedConnection)}
                  <Text style={styles.configButtonValue}>
                    {CONNECTION_TYPES.find(c => c.id === selectedConnection)?.name || 'Seleccionar conexión'}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        )}
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información Adicional</Text>
          
          {selectedPrinter === 'star' ? (
            <>
              <View style={styles.infoCard}>
                <Text style={styles.infoTitle}>Impresoras Star Móviles</Text>
                <Text style={styles.infoText}>
                  • Compatible con SM-S230i, SM-T300i, SM-T400i, WSP-i450
                </Text>
                <Text style={styles.infoText}>
                  • Conexión Bluetooth y WiFi
                </Text>
                <Text style={styles.infoText}>
                  • Impresión de tickets de 2" y 3"
                </Text>
              </View>
              
              <View style={styles.infoCard}>
                <Text style={styles.infoTitle}>Impresora Woosim WSP-i450</Text>
                <Text style={styles.infoText}>
                  • Impresora térmica portátil de 4 pulgadas (112mm)
                </Text>
                <Text style={styles.infoText}>
                  • Velocidad de impresión de hasta 90mm/seg
                </Text>
                <Text style={styles.infoText}>
                  • Conectividad Bluetooth
                </Text>
                <Text style={styles.infoText}>
                  • Batería recargable de larga duración
                </Text>
                <Text style={styles.infoText}>
                  • Compatible con ESC/POS y comandos CPCL
                </Text>
              </View>
              
              <View style={styles.infoCard}>
                <Text style={styles.infoTitle}>SDK StarXpand</Text>
                <Text style={styles.infoText}>
                  • Soporte para iOS y Android
                </Text>
                <Text style={styles.infoText}>
                  • Emulación StarPRNT y ESC/POS
                </Text>
                <Text style={styles.infoText}>
                  • Gestión avanzada de impresión
                </Text>
              </View>
            </>
          ) : (
            <>
              <View style={styles.infoCard}>
                <Text style={styles.infoTitle}>Tamaño Carta</Text>
                <Text style={styles.infoText}>
                  • Dimensiones: 21.6 x 27.9 cm (8.5 x 11 pulgadas)
                </Text>
                <Text style={styles.infoText}>
                  • Recomendado para: Facturas, boletas, guías de despacho y documentos oficiales
                </Text>
                <Text style={styles.infoText}>
                  • Tipo de impresora: Láser o inyección de tinta
                </Text>
              </View>
              
              <View style={styles.infoCard}>
                <Text style={styles.infoTitle}>Tamaño Ticket</Text>
                <Text style={styles.infoText}>
                  • Dimensiones: 8 x 20 cm (ancho variable)
                </Text>
                <Text style={styles.infoText}>
                  • Recomendado para: Recibos, comprobantes rápidos y puntos de venta
                </Text>
                <Text style={styles.infoText}>
                  • Tipo de impresora: Térmica
                </Text>
              </View>
              
              <View style={styles.infoCard}>
                <Text style={styles.infoTitle}>Compatibilidad de Impresoras</Text>
                <Text style={styles.infoText}>
                  • Epson: TM-T20, TM-T88, TM-P20, TM-P60, TM-P80 y otras impresoras térmicas Epson
                </Text>
                <Text style={styles.infoText}>
                  • Zebra: ZQ510, ZQ520, ZQ610, ZQ620, ZQ630 y otras impresoras móviles Zebra
                </Text>
                <Text style={styles.infoText}>
                  • Genérica: Compatible con la mayoría de impresoras que soportan comandos ESC/POS
                </Text>
              </View>
            </>
          )}
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.cancelButton}
          onPress={() => router.back()}
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>Guardar</Text>
        </TouchableOpacity>
      </View>

      {/* Model Selector Modal */}
      {showModelSelector && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar Modelo</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowModelSelector(false)}
              >
                <ArrowLeft size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent}>
              <Text style={styles.modalSectionTitle}>Impresoras Móviles</Text>
              {STAR_MODELS.mobile.map((model) => (
                <TouchableOpacity
                  key={model.id}
                  style={[
                    styles.modelOption,
                    selectedModel === model.name && styles.modelOptionSelected,
                    model.id === 'wsp-i450' && styles.woosimModelOption  // Destacar la impresora Woosim
                  ]}
                  onPress={() => {
                    setSelectedModel(model.name);
                    setSelectedConnection(model.type);
                    setShowModelSelector(false);
                  }}
                >
                  <View style={styles.modelOptionContent}>
                    {model.id === 'wsp-i450' ? (
                      <Bluetooth size={20} color="#0066CC" />
                    ) : (
                      <Smartphone size={20} color="#0066CC" />
                    )}
                    <Text style={[
                      styles.modelOptionName,
                      model.id === 'wsp-i450' && styles.woosimModelText  // Texto destacado para Woosim
                    ]}>
                      {model.name}
                      {model.id === 'wsp-i450' && " (Woosim)"}
                    </Text>
                  </View>
                  {selectedModel === model.name && (
                    <Check size={20} color="#0066CC" />
                  )}
                </TouchableOpacity>
              ))}

              <Text style={styles.modalSectionTitle}>Impresoras de Escritorio</Text>
              {STAR_MODELS.desktop.map((model) => (
                <TouchableOpacity
                  key={model.id}
                  style={[
                    styles.modelOption,
                    selectedModel === model.name && styles.modelOptionSelected
                  ]}
                  onPress={() => {
                    setSelectedModel(model.name);
                    setSelectedConnection(model.type);
                    setShowModelSelector(false);
                  }}
                >
                  <View style={styles.modelOptionContent}>
                    <Printer size={20} color="#0066CC" />
                    <Text style={styles.modelOptionName}>{model.name}</Text>
                  </View>
                  {selectedModel === model.name && (
                    <Check size={20} color="#0066CC" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}

      {/* Connection Selector Modal */}
      {showConnectionSelector && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Tipo de Conexión</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowConnectionSelector(false)}
              >
                <ArrowLeft size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent}>
              {CONNECTION_TYPES.map((connection) => {
                const Icon = connection.icon;
                return (
                  <TouchableOpacity
                    key={connection.id}
                    style={[
                      styles.connectionOption,
                      selectedConnection === connection.id && styles.connectionOptionSelected
                    ]}
                    onPress={() => {
                      setSelectedConnection(connection.id);
                      setShowConnectionSelector(false);
                    }}
                  >
                    <View style={styles.connectionOptionContent}>
                      <Icon size={24} color="#0066CC" />
                      <Text style={styles.connectionOptionName}>{connection.name}</Text>
                    </View>
                    {selectedConnection === connection.id && (
                      <Check size={20} color="#0066CC" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  selectedOption: {
    backgroundColor: '#E3F2FD',
    borderColor: '#0066CC',
    borderWidth: 1,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  optionInfo: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  selectedModelText: {
    fontSize: 12,
    color: '#0066CC',
    marginTop: 5,
    fontWeight: 'bold',
  },
  checkContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  starConfig: {
    marginTop: 10,
  },
  configButton: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  configButtonLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  configButtonValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
  connectionValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  woosimButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: 15,
    marginTop: 10,
  },
  woosimButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 5,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#0066CC',
    paddingVertical: 12,
    marginLeft: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
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
  modalContent: {
    padding: 20,
  },
  modalSectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 10,
    marginTop: 15,
  },
  modelOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#f5f5f5',
  },
  modelOptionSelected: {
    backgroundColor: '#E3F2FD',
  },
  woosimModelOption: {
    backgroundColor: '#E3F2FD',
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  modelOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  modelOptionName: {
    fontSize: 16,
    color: '#333',
  },
  woosimModelText: {
    fontWeight: 'bold',
    color: '#2196F3',
  },
  connectionOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#f5f5f5',
  },
  connectionOptionSelected: {
    backgroundColor: '#E3F2FD',
  },
  connectionOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  connectionOptionName: {
    fontSize: 16,
    color: '#333',
  },
});