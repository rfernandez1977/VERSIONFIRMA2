import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, TextInput, Switch, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Bot, Key, Info, ChevronRight, Check, Globe, FileSliders as Sliders, Zap } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';

const AI_PROVIDERS = [
  {
    id: 'gemini',
    name: 'Google Gemini',
    description: 'Modelo de lenguaje de última generación de Google',
    color: '#34A853',
    models: ['gemini-pro', 'gemini-pro-vision'],
    requiresOrg: false,
    supportsEndpoint: false,
  },
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'GPT-4 y otros modelos avanzados de OpenAI',
    color: '#00A67E',
    models: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    requiresOrg: true,
    supportsEndpoint: false,
  },
  {
    id: 'anthropic',
    name: 'Anthropic Claude',
    description: 'Claude 2 y Claude Instant para tareas complejas',
    color: '#5436DA',
    models: ['claude-2', 'claude-instant'],
    requiresOrg: false,
    supportsEndpoint: false,
  },
  {
    id: 'cohere',
    name: 'Cohere',
    description: 'Modelos especializados en procesamiento de texto',
    color: '#FF6B6B',
    models: ['command', 'command-light', 'command-nightly'],
    requiresOrg: false,
    supportsEndpoint: false,
  },
  {
    id: 'mistral',
    name: 'Mistral AI',
    description: 'Modelos eficientes y de alto rendimiento',
    color: '#7C3AED',
    models: ['mistral-small', 'mistral-medium', 'mistral-large'],
    requiresOrg: false,
    supportsEndpoint: false,
  },
  {
    id: 'llama',
    name: 'Meta Llama',
    description: 'Modelos open source de Meta',
    color: '#0066CC',
    models: ['llama-2-7b', 'llama-2-13b', 'llama-2-70b'],
    requiresOrg: false,
    supportsEndpoint: true,
  },
  {
    id: 'palm',
    name: 'Google PaLM',
    description: 'Modelo de lenguaje PaLM de Google',
    color: '#EA4335',
    models: ['text-bison', 'chat-bison'],
    requiresOrg: false,
    supportsEndpoint: false,
  },
  {
    id: 'azure',
    name: 'Azure OpenAI',
    description: 'Modelos de OpenAI en Azure',
    color: '#0078D4',
    models: ['gpt-4', 'gpt-35-turbo'],
    requiresOrg: false,
    supportsEndpoint: true,
  }
];

export default function AIConfigScreen() {
  const router = useRouter();
  const { aiConfig, setAIConfig, aiEnabled, setAIEnabled } = useTheme();
  
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [showModelModal, setShowModelModal] = useState(false);
  const [showAdvancedModal, setShowAdvancedModal] = useState(false);
  
  const [config, setConfig] = useState({
    ...aiConfig,
    temperature: aiConfig.temperature || 0.7,
    maxTokens: aiConfig.maxTokens || 1000
  });

  const selectedProvider = AI_PROVIDERS.find(p => p.id === config.provider);

  const handleSave = () => {
    if (aiEnabled && config.provider === 'none') {
      Alert.alert('Error', 'Por favor seleccione un proveedor de IA');
      return;
    }

    if (aiEnabled && !config.apiKey) {
      Alert.alert('Error', 'Por favor ingrese una API Key válida');
      return;
    }

    if (aiEnabled && selectedProvider?.requiresOrg && !config.organizationId) {
      Alert.alert('Error', 'Por favor ingrese el ID de organización');
      return;
    }

    setAIConfig(config);
    setAIEnabled(aiEnabled);
    
    Alert.alert(
      'Configuración Guardada',
      'La configuración del asistente IA ha sido guardada correctamente',
      [{ text: 'OK', onPress: () => router.back() }]
    );
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
        <Text style={styles.headerTitle}>Configuración IA</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <View style={styles.enableContainer}>
            <Text style={styles.enableText}>Habilitar Asistente IA</Text>
            <Switch
              value={aiEnabled}
              onValueChange={setAIEnabled}
              trackColor={{ false: '#ddd', true: '#0066CC' }}
              thumbColor={Platform.OS === 'ios' ? '#fff' : aiEnabled ? '#fff' : '#f4f3f4'}
            />
          </View>
          
          {aiEnabled && (
            <Text style={styles.enableDescription}>
              Al habilitar el asistente IA, podrá utilizar las capacidades de procesamiento de lenguaje natural en su aplicación.
            </Text>
          )}
        </View>
        
        {aiEnabled && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Proveedor de IA</Text>
              
              <TouchableOpacity
                style={styles.providerSelector}
                onPress={() => setShowProviderModal(true)}
              >
                {selectedProvider ? (
                  <View style={styles.selectedProvider}>
                    <Bot size={24} color={selectedProvider.color} />
                    <View style={styles.providerInfo}>
                      <Text style={styles.providerName}>{selectedProvider.name}</Text>
                      <Text style={styles.providerDescription}>{selectedProvider.description}</Text>
                    </View>
                  </View>
                ) : (
                  <Text style={styles.providerPlaceholder}>Seleccione un proveedor</Text>
                )}
                <ChevronRight size={20} color="#999" />
              </TouchableOpacity>
            </View>

            {selectedProvider && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Configuración</Text>
                
                <View style={styles.inputContainer}>
                  <View style={styles.inputLabel}>
                    <Key size={16} color="#666" style={styles.inputIcon} />
                    <Text style={styles.inputLabelText}>API Key *</Text>
                  </View>
                  <TextInput
                    style={styles.input}
                    value={config.apiKey}
                    onChangeText={(text) => setConfig({...config, apiKey: text})}
                    placeholder="Ingrese su API Key"
                    secureTextEntry
                  />
                </View>

                {selectedProvider.requiresOrg && (
                  <View style={styles.inputContainer}>
                    <View style={styles.inputLabel}>
                      <Globe size={16} color="#666" style={styles.inputIcon} />
                      <Text style={styles.inputLabelText}>ID de Organización *</Text>
                    </View>
                    <TextInput
                      style={styles.input}
                      value={config.organizationId}
                      onChangeText={(text) => setConfig({...config, organizationId: text})}
                      placeholder="Ingrese el ID de su organización"
                    />
                  </View>
                )}

                {selectedProvider.supportsEndpoint && (
                  <View style={styles.inputContainer}>
                    <View style={styles.inputLabel}>
                      <Globe size={16} color="#666" style={styles.inputIcon} />
                      <Text style={styles.inputLabelText}>Endpoint Personalizado</Text>
                    </View>
                    <TextInput
                      style={styles.input}
                      value={config.endpoint}
                      onChangeText={(text) => setConfig({...config, endpoint: text})}
                      placeholder="https://api.ejemplo.com/v1"
                    />
                  </View>
                )}

                <TouchableOpacity
                  style={styles.modelSelector}
                  onPress={() => setShowModelModal(true)}
                >
                  <View style={styles.modelInfo}>
                    <Text style={styles.modelLabel}>Modelo</Text>
                    <Text style={styles.modelValue}>
                      {config.model || 'Seleccione un modelo'}
                    </Text>
                  </View>
                  <ChevronRight size={20} color="#999" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.advancedButton}
                  onPress={() => setShowAdvancedModal(true)}
                >
                  <Sliders size={16} color="#0066CC" />
                  <Text style={styles.advancedButtonText}>Configuración Avanzada</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.section}>
              <View style={styles.infoHeader}>
                <Info size={20} color="#0066CC" />
                <Text style={styles.infoTitle}>Información del Proveedor</Text>
              </View>
              
              {selectedProvider ? (
                <>
                  <View style={styles.infoCard}>
                    <Text style={styles.infoSubtitle}>Capacidades</Text>
                    <Text style={styles.infoText}>• Procesamiento de lenguaje natural</Text>
                    <Text style={styles.infoText}>• Generación de texto</Text>
                    <Text style={styles.infoText}>• Análisis de sentimientos</Text>
                    <Text style={styles.infoText}>• Clasificación de texto</Text>
                  </View>
                  
                  <View style={styles.infoCard}>
                    <Text style={styles.infoSubtitle}>Modelos Disponibles</Text>
                    {selectedProvider.models.map((model, index) => (
                      <Text key={index} style={styles.infoText}>• {model}</Text>
                    ))}
                  </View>
                  
                  <View style={styles.infoCard}>
                    <Text style={styles.infoSubtitle}>Documentación</Text>
                    <Text style={styles.infoText}>
                      Visite la documentación oficial para más información sobre la integración y uso de los modelos.
                    </Text>
                  </View>
                </>
              ) : (
                <View style={styles.infoCard}>
                  <Text style={styles.infoText}>
                    Seleccione un proveedor para ver información detallada sobre sus capacidades y modelos disponibles.
                  </Text>
                </View>
              )}
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

      {/* Provider Selection Modal */}
      {showProviderModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar Proveedor</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowProviderModal(false)}
              >
                <ArrowLeft size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent}>
              {AI_PROVIDERS.map((provider) => (
                <TouchableOpacity
                  key={provider.id}
                  style={[
                    styles.providerOption,
                    config.provider === provider.id && styles.providerOptionSelected
                  ]}
                  onPress={() => {
                    setConfig({
                      ...config,
                      provider: provider.id,
                      model: provider.models[0]
                    });
                    setShowProviderModal(false);
                  }}
                >
                  <View style={styles.providerOptionContent}>
                    <Bot size={24} color={provider.color} />
                    <View style={styles.providerOptionInfo}>
                      <Text style={styles.providerOptionName}>{provider.name}</Text>
                      <Text style={styles.providerOptionDescription}>{provider.description}</Text>
                    </View>
                  </View>
                  {config.provider === provider.id && (
                    <Check size={20} color="#0066CC" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}

      {/* Model Selection Modal */}
      {showModelModal && selectedProvider && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar Modelo</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowModelModal(false)}
              >
                <ArrowLeft size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent}>
              {selectedProvider.models.map((model) => (
                <TouchableOpacity
                  key={model}
                  style={[
                    styles.modelOption,
                    config.model === model && styles.modelOptionSelected
                  ]}
                  onPress={() => {
                    setConfig({...config, model});
                    setShowModelModal(false);
                  }}
                >
                  <Text style={styles.modelOptionName}>{model}</Text>
                  {config.model === model && (
                    <Check size={20} color="#0066CC" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}

      {/* Advanced Settings Modal */}
      {showAdvancedModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Configuración Avanzada</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowAdvancedModal(false)}
              >
                <ArrowLeft size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent}>
              <View style={styles.advancedSection}>
                <Text style={styles.advancedSectionTitle}>Parámetros del Modelo</Text>
                
                <View style={styles.advancedInputContainer}>
                  <Text style={styles.advancedInputLabel}>Temperature</Text>
                  <Text style={styles.advancedInputDescription}>
                    Controla la aleatoriedad de las respuestas (0.0 - 1.0)
                  </Text>
                  <TextInput
                    style={styles.advancedInput}
                    value={config.temperature?.toString()}
                    onChangeText={(text) => {
                      const value = parseFloat(text);
                      if (!isNaN(value) && value >= 0 && value <= 1) {
                        setConfig({...config, temperature: value});
                      }
                    }}
                    keyboardType="decimal-pad"
                    placeholder="0.7"
                  />
                </View>
                
                <View style={styles.advancedInputContainer}>
                  <Text style={styles.advancedInputLabel}>Max Tokens</Text>
                  <Text style={styles.advancedInputDescription}>
                    Límite máximo de tokens en la respuesta
                  </Text>
                  <TextInput
                    style={styles.advancedInput}
                    value={config.maxTokens?.toString()}
                    onChangeText={(text) => {
                      const value = parseInt(text);
                      if (!isNaN(value) && value > 0) {
                        setConfig({...config, maxTokens: value});
                      }
                    }}
                    keyboardType="number-pad"
                    placeholder="1000"
                  />
                </View>
              </View>
              
              <TouchableOpacity
                style={styles.advancedSaveButton}
                onPress={() => setShowAdvancedModal(false)}
              >
                <Text style={styles.advancedSaveButtonText}>Aplicar Cambios</Text>
              </TouchableOpacity>
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
    marginBottom: 15,
  },
  providerSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 15,
  },
  selectedProvider: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  providerInfo: {
    marginLeft: 15,
    flex: 1,
  },
  providerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  providerDescription: {
    fontSize: 12,
    color: '#666',
  },
  providerPlaceholder: {
    fontSize: 16,
    color: '#999',
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
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
  },
  modelSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  modelInfo: {
    flex: 1,
  },
  modelLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  modelValue: {
    fontSize: 16,
    color: '#333',
  },
  advancedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    padding: 12,
  },
  advancedButtonText: {
    fontSize: 14,
    color: '#0066CC',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  infoCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  infoSubtitle: {
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
  providerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#f5f5f5',
  },
  providerOptionSelected: {
    backgroundColor: '#E3F2FD',
  },
  providerOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  providerOptionInfo: {
    marginLeft: 15,
    flex: 1,
  },
  providerOptionName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  providerOptionDescription: {
    fontSize: 12,
    color: '#666',
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
  modelOptionName: {
    fontSize: 16,
    color: '#333',
  },
  advancedSection: {
    marginBottom: 20,
  },
  advancedSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  advancedInputContainer: {
    marginBottom: 20,
  },
  advancedInputLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  advancedInputDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
  },
  advancedInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
  },
  advancedSaveButton: {
    backgroundColor: '#0066CC',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  advancedSaveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bol d',
  },
});