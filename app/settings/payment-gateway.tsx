import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, ScrollView, Switch, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Check, CreditCard, Key, Globe, User, Lock } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';

export default function PaymentGatewayScreen() {
  const router = useRouter();
  const { 
    paymentGateway, 
    setPaymentGateway, 
    paymentGatewayEnabled, 
    setPaymentGatewayEnabled 
  } = useTheme();
  
  const [selectedGateway, setSelectedGateway] = useState<string>(paymentGateway);
  const [enabled, setEnabled] = useState<boolean>(paymentGatewayEnabled);
  const [apiKey, setApiKey] = useState<string>('');
  const [merchantId, setMerchantId] = useState<string>('');
  const [secretKey, setSecretKey] = useState<string>('');

  const handleSave = () => {
    if (enabled && selectedGateway === 'none') {
      Alert.alert('Error', 'Por favor seleccione una pasarela de pago');
      return;
    }

    if (enabled && (!apiKey || !merchantId)) {
      Alert.alert('Error', 'Por favor complete todos los campos requeridos');
      return;
    }

    setPaymentGateway(selectedGateway as any);
    setPaymentGatewayEnabled(enabled);
    
    Alert.alert(
      'Configuración Guardada',
      'La configuración de la pasarela de pago ha sido guardada correctamente',
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  const getGatewayDetails = (gateway: string) => {
    switch(gateway) {
      case 'mercadopago':
        return {
          name: 'Mercado Pago',
          logo: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=150&auto=format&fit=crop',
          color: '#009EE3',
          description: 'Integración con Mercado Pago para procesar pagos con tarjetas, transferencias y otros métodos de pago.'
        };
      case 'getnet':
        return {
          name: 'GetNet',
          logo: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=150&auto=format&fit=crop',
          color: '#E31937',
          description: 'Solución de pagos de Santander que permite aceptar múltiples medios de pago.'
        };
      case 'bcipagos':
        return {
          name: 'BCI Pagos',
          logo: 'https://images.unsplash.com/photo-1559589689-577aabd1db4f?q=80&w=150&auto=format&fit=crop',
          color: '#00529B',
          description: 'Plataforma de pagos del Banco BCI para comercios y empresas.'
        };
      case 'sumup':
        return {
          name: 'SumUp Chile',
          logo: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=150&auto=format&fit=crop',
          color: '#0070BA',
          description: 'Solución de pagos móviles con lectores de tarjetas y pagos online.'
        };
      case 'compraqui':
        return {
          name: 'ComprAquí',
          logo: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=150&auto=format&fit=crop',
          color: '#FF6B00',
          description: 'Plataforma de pagos chilena para comercios físicos y digitales.'
        };
      case 'tuu':
        return {
          name: 'Tuu',
          logo: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=150&auto=format&fit=crop',
          color: '#7B68EE',
          description: 'Solución de pagos digitales para negocios en Chile.'
        };
      case 'halmer':
        return {
          name: 'Halmer',
          logo: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=150&auto=format&fit=crop',
          color: '#4CAF50',
          description: 'Plataforma de pagos y facturación electrónica para empresas.'
        };
      case 'haulmer':
        return {
          name: 'Haulmer',
          logo: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=150&auto=format&fit=crop',
          color: '#2196F3',
          description: 'Solución integral de pagos y facturación electrónica para empresas chilenas.'
        };
      case 'transbank':
        return {
          name: 'Transbank',
          logo: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=150&auto=format&fit=crop',
          color: '#005CA9',
          description: 'Principal procesador de pagos en Chile, aceptando tarjetas de crédito y débito.'
        };
      case 'klap':
        return {
          name: 'Klap',
          logo: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=150&auto=format&fit=crop',
          color: '#FF4081',
          description: 'Plataforma de pagos digitales para comercios y empresas en Chile.'
        };
      default:
        return {
          name: 'No seleccionado',
          logo: '',
          color: '#999',
          description: 'Seleccione una pasarela de pago para procesar pagos en su aplicación.'
        };
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
        <Text style={styles.headerTitle}>Pasarela de Pago</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <View style={styles.enableContainer}>
            <Text style={styles.enableText}>Habilitar Pasarela de Pago</Text>
            <Switch
              value={enabled}
              onValueChange={setEnabled}
              trackColor={{ false: '#ddd', true: '#0066CC' }}
              thumbColor={Platform.OS === 'ios' ? '#fff' : enabled ? '#fff' : '#f4f3f4'}
            />
          </View>
          
          {enabled && (
            <Text style={styles.enableDescription}>
              Al habilitar una pasarela de pago, podrá aceptar pagos con tarjetas de crédito, débito y otros métodos de pago directamente desde su aplicación.
            </Text>
          )}
        </View>
        
        {enabled && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Seleccione su Pasarela de Pago</Text>
              <Text style={styles.sectionDescription}>
                Elija el proveedor de pagos que desea utilizar para procesar las transacciones.
              </Text>
              
              <TouchableOpacity 
                style={[
                  styles.gatewayOption,
                  selectedGateway === 'mercadopago' && styles.selectedGateway
                ]}
                onPress={() => setSelectedGateway('mercadopago')}
              >
                <View style={styles.gatewayContent}>
                  <View style={[styles.gatewayIconContainer, { backgroundColor: '#E3F2FD' }]}>
                    <CreditCard size={24} color="#009EE3" />
                  </View>
                  <View style={styles.gatewayInfo}>
                    <Text style={styles.gatewayName}>Mercado Pago</Text>
                    <Text style={styles.gatewayDescription}>
                      Integración con Mercado Pago para procesar pagos con tarjetas, transferencias y otros métodos de pago.
                    </Text>
                  </View>
                </View>
                {selectedGateway === 'mercadopago' && (
                  <View style={styles.checkContainer}>
                    <Check size={20} color="#0066CC" />
                  </View>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.gatewayOption,
                  selectedGateway === 'getnet' && styles.selectedGateway
                ]}
                onPress={() => setSelectedGateway('getnet')}
              >
                <View style={styles.gatewayContent}>
                  <View style={[styles.gatewayIconContainer, { backgroundColor: '#FFEBEE' }]}>
                    <CreditCard size={24} color="#E31937" />
                  </View>
                  <View style={styles.gatewayInfo}>
                    <Text style={styles.gatewayName}>GetNet</Text>
                    <Text style={styles.gatewayDescription}>
                      Solución de pagos de Santander que permite aceptar múltiples medios de pago.
                    </Text>
                  </View>
                </View>
                {selectedGateway === 'getnet' && (
                  <View style={styles.checkContainer}>
                    <Check size={20} color="#0066CC" />
                  </View>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.gatewayOption,
                  selectedGateway === 'bcipagos' && styles.selectedGateway
                ]}
                onPress={() => setSelectedGateway('bcipagos')}
              >
                <View style={styles.gatewayContent}>
                  <View style={[styles.gatewayIconContainer, { backgroundColor: '#E8EAF6' }]}>
                    <CreditCard size={24} color="#00529B" />
                  </View>
                  <View style={styles.gatewayInfo}>
                    <Text style={styles.gatewayName}>BCI Pagos</Text>
                    <Text style={styles.gatewayDescription}>
                      Plataforma de pagos del Banco BCI para comercios y empresas.
                    </Text>
                  </View>
                </View>
                {selectedGateway === 'bcipagos' && (
                  <View style={styles.checkContainer}>
                    <Check size={20} color="#0066CC" />
                  </View>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.gatewayOption,
                  selectedGateway === 'sumup' && styles.selectedGateway
                ]}
                onPress={() => setSelectedGateway('sumup')}
              >
                <View style={styles.gatewayContent}>
                  <View style={[styles.gatewayIconContainer, { backgroundColor: '#E1F5FE' }]}>
                    <CreditCard size={24} color="#0070BA" />
                  </View>
                  <View style={styles.gatewayInfo}>
                    <Text style={styles.gatewayName}>SumUp Chile</Text>
                    <Text style={styles.gatewayDescription}>
                      Solución de pagos móviles con lectores de tarjetas y pagos online.
                    </Text>
                  </View>
                </View>
                {selectedGateway === 'sumup' && (
                  <View style={styles.checkContainer}>
                    <Check size={20} color="#0066CC" />
                  </View>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.gatewayOption,
                  selectedGateway === 'compraqui' && styles.selectedGateway
                ]}
                onPress={() => setSelectedGateway('compraqui')}
              >
                <View style={styles.gatewayContent}>
                  <View style={[styles.gatewayIconContainer, { backgroundColor: '#FFF3E0' }]}>
                    <CreditCard size={24} color="#FF6B00" />
                  </View>
                  <View style={styles.gatewayInfo}>
                    <Text style={styles.gatewayName}>ComprAquí</Text>
                    <Text style={styles.gatewayDescription}>
                      Plataforma de pagos chilena para comercios físicos y digitales.
                    </Text>
                  </View>
                </View>
                {selectedGateway === 'compraqui' && (
                  <View style={styles.checkContainer}>
                    <Check size={20} color="#0066CC" />
                  </View>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.gatewayOption,
                  selectedGateway === 'tuu' && styles.selectedGateway
                ]}
                onPress={() => setSelectedGateway('tuu')}
              >
                <View style={styles.gatewayContent}>
                  <View style={[styles.gatewayIconContainer, { backgroundColor: '#EDE7F6' }]}>
                    <CreditCard size={24} color="#7B68EE" />
                  </View>
                  <View style={styles.gatewayInfo}>
                    <Text style={styles.gatewayName}>Tuu</Text>
                    <Text style={styles.gatewayDescription}>
                      Solución de pagos digitales para negocios en Chile.
                    </Text>
                  </View>
                </View>
                {selectedGateway === 'tuu' && (
                  <View style={styles.checkContainer}>
                    <Check size={20} color="#0066CC" />
                  </View>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.gatewayOption,
                  selectedGateway === 'halmer' && styles.selectedGateway
                ]}
                onPress={() => setSelectedGateway('halmer')}
              >
                <View style={styles.gatewayContent}>
                  <View style={[styles.gatewayIconContainer, { backgroundColor: '#E8F5E9' }]}>
                    <CreditCard size={24} color="#4CAF50" />
                  </View>
                  <View style={styles.gatewayInfo}>
                    <Text style={styles.gatewayName}>Halmer</Text>
                    <Text style={styles.gatewayDescription}>
                      Plataforma de pagos y facturación electrónica para empresas.
                    </Text>
                  </View>
                </View>
                {selectedGateway === 'halmer' && (
                  <View style={styles.checkContainer}>
                    <Check size={20} color="#0066CC" />
                  </View>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.gatewayOption,
                  selectedGateway === 'haulmer' && styles.selectedGateway
                ]}
                onPress={() => setSelectedGateway('haulmer')}
              >
                <View style={styles.gatewayContent}>
                  <View style={[styles.gatewayIconContainer, { backgroundColor: '#E3F2FD' }]}>
                    <CreditCard size={24} color="#2196F3" />
                  </View>
                  <View style={styles.gatewayInfo}>
                    <Text style={styles.gatewayName}>Haulmer</Text>
                    <Text style={styles.gatewayDescription}>
                      Solución integral de pagos y facturación electrónica para empresas chilenas.
                    </Text>
                  </View>
                </View>
                {selectedGateway === 'haulmer' && (
                  <View style={styles.checkContainer}>
                    <Check size={20} color="#0066CC" />
                  </View>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.gatewayOption,
                  selectedGateway === 'transbank' && styles.selectedGateway
                ]}
                onPress={() => setSelectedGateway('transbank')}
              >
                <View style={styles.gatewayContent}>
                  <View style={[styles.gatewayIconContainer, { backgroundColor: '#E3F2FD' }]}>
                    <CreditCard size={24} color="#005CA9" />
                  </View>
                  <View style={styles.gatewayInfo}>
                    <Text style={styles.gatewayName}>Transbank</Text>
                    <Text style={styles.gatewayDescription}>
                      Principal procesador de pagos en Chile, aceptando tarjetas de crédito y débito.
                    </Text>
                  </View>
                </View>
                {selectedGateway === 'transbank' && (
                  <View style={styles.checkContainer}>
                    <Check size={20} color="#0066CC" />
                  </View>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.gatewayOption,
                  selectedGateway === 'klap' && styles.selectedGateway
                ]}
                onPress={() => setSelectedGateway('klap')}
              >
                <View style={styles.gatewayContent}>
                  <View style={[styles.gatewayIconContainer, { backgroundColor: '#FCE4EC' }]}>
                    <CreditCard size={24} color="#FF4081" />
                  </View>
                  <View style={styles.gatewayInfo}>
                    <Text style={styles.gatewayName}>Klap</Text>
                    <Text style={styles.gatewayDescription}>
                      Plataforma de pagos digitales para comercios y empresas en Chile.
                    </Text>
                  </View>
                </View>
                {selectedGateway === 'klap' && (
                  <View style={styles.checkContainer}>
                    <Check size={20} color="#0066CC" />
                  </View>
                )}
              </TouchableOpacity>
            </View>
            
            {selectedGateway !== 'none' && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Configuración de {getGatewayDetails(selectedGateway).name}</Text>
                <Text style={styles.sectionDescription}>
                  Ingrese las credenciales proporcionadas por {getGatewayDetails(selectedGateway).name} para conectar su cuenta.
                </Text>
                
                <View style={styles.inputContainer}>
                  <View style={styles.inputLabel}>
                    <Key size={16} color="#666" style={styles.inputIcon} />
                    <Text style={styles.inputLabelText}>API Key *</Text>
                  </View>
                  <TextInput
                    style={styles.input}
                    value={apiKey}
                    onChangeText={setApiKey}
                    placeholder="Ingrese su API Key"
                    secureTextEntry
                  />
                </View>
                
                <View style={styles.inputContainer}>
                  <View style={styles.inputLabel}>
                    <User size={16} color="#666" style={styles.inputIcon} />
                    <Text style={styles.inputLabelText}>Merchant ID *</Text>
                  </View>
                  <TextInput
                    style={styles.input}
                    value={merchantId}
                    onChangeText={setMerchantId}
                    placeholder="Ingrese su Merchant ID"
                  />
                </View>
                
                <View style={styles.inputContainer}>
                  <View style={styles.inputLabel}>
                    <Lock size={16} color="#666" style={styles.inputIcon} />
                    <Text style={styles.inputLabelText}>Secret Key</Text>
                  </View>
                  <TextInput
                    style={styles.input}
                    value={secretKey}
                    onChangeText={setSecretKey}
                    placeholder="Ingrese su Secret Key (opcional)"
                    secureTextEntry
                  />
                </View>
                
                <View style={styles.inputContainer}>
                  <View style={styles.inputLabel}>
                    <Globe size={16} color="#666" style={styles.inputIcon} />
                    <Text style={styles.inputLabelText}>Ambiente</Text>
                  </View>
                  <View style={styles.radioGroup}>
                    <TouchableOpacity style={styles.radioOption}>
                      <View style={styles.radioButton}>
                        <View style={styles.radioButtonInner} />
                      </View>
                      <Text style={styles.radioLabel}>Producción</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.radioOption}>
                      <View style={[styles.radioButton, styles.radioButtonSelected]}>
                        <View style={styles.radioButtonInner} />
                      </View>
                      <Text style={styles.radioLabel}>Sandbox (Pruebas)</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
            
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Información Adicional</Text>
              
              <View style={styles.infoCard}>
                <Text style={styles.infoTitle}>Requisitos para Integración</Text>
                <Text style={styles.infoText}>
                  • Cuenta activa con el proveedor de pagos seleccionado
                </Text>
                <Text style={styles.infoText}>
                  • Credenciales de API proporcionadas por el proveedor
                </Text>
                <Text style={styles.infoText}>
                  • Cumplimiento de requisitos legales y fiscales
                </Text>
              </View>
              
              <View style={styles.infoCard}>
                <Text style={styles.infoTitle}>Comisiones y Tarifas</Text>
                <Text style={styles.infoText}>
                  Las comisiones varían según el proveedor y el volumen de transacciones. Consulte directamente con el proveedor para obtener información actualizada sobre tarifas.
                </Text>
              </View>
              
              <View style={styles.infoCard}>
                <Text style={styles.infoTitle}>Soporte Técnico</Text>
                <Text style={styles.infoText}>
                  Para obtener ayuda con la integración, contacte al soporte técnico del proveedor de pagos seleccionado o a nuestro equipo de soporte.
                </Text>
              </View>
            </View>
          </>
        )}
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
  enableContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  enableText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  enableDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
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
    lineHeight: 20,
  },
  gatewayOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  selectedGateway: {
    borderColor: '#0066CC',
    backgroundColor: '#F5FAFF',
  },
  gatewayContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  gatewayIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  gatewayInfo: {
    flex: 1,
  },
  gatewayName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  gatewayDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
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
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  inputIcon: {
    marginRight: 5,
  },
  inputLabelText: {
    fontSize: 14,
    color: '#666',
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 12,
    fontSize: 16,
  },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  radioButtonSelected: {
    borderColor: '#0066CC',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0066CC',
  },
  radioLabel: {
    fontSize: 14,
    color: '#333',
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
    fontWeight: 'bold', color: '#fff',
  },
});