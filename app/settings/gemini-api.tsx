import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  ScrollView, 
  Platform,
  Switch,
  Slider
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Bot, ChevronDown, Check, Info, MessagesSquare } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';

export default function GeminiApiScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  
  const [apiKey, setApiKey] = useState('AIzaSyBA05yNc7Ua7LkmT4qbUzLkTKin2bXMtjM');
  const [isApiKeyVisible, setIsApiKeyVisible] = useState(false);
  const [projectNumber, setProjectNumber] = useState('1069124584649');
  const [modelVersion, setModelVersion] = useState('gemini-pro');
  const [tempValue, setTempValue] = useState(0.7);
  const [maxOutputTokens, setMaxOutputTokens] = useState(1000);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [useSafety, setUseSafety] = useState(true);
  
  const modelOptions = [
    { id: 'gemini-pro', name: 'Gemini Pro' },
    { id: 'gemini-pro-vision', name: 'Gemini Pro Vision' },
    { id: 'gemini-ultra', name: 'Gemini Ultra (Requiere cuota especial)' },
  ];
  
  const handleSelectModel = (id) => {
    setModelVersion(id);
    setShowModelDropdown(false);
  };
  
  const toggleApiKeyVisibility = () => {
    setIsApiKeyVisible(!isApiKeyVisible);
  };

  return (
    <View style={[styles.container, isDark && styles.darkContainer]}>
      <View style={[styles.header, isDark && styles.darkHeader]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={isDark ? '#fff' : '#333'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isDark && styles.darkText]}>API de Google Gemini</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView style={styles.content}>
        <View style={[styles.infoCard, isDark && styles.darkInfoCard]}>
          <View style={styles.infoIconContainer}>
            <Bot size={24} color="#4285F4" />
          </View>
          <View style={styles.infoContent}>
            <Text style={[styles.infoTitle, isDark && styles.darkText]}>API de Google Gemini</Text>
            <Text style={[styles.infoText, isDark && styles.darkSubtext]}>
              Modelo de lenguaje multimodal avanzado de Google. Permite a VozPos entender comandos complejos y 
              procesar instrucciones de manera natural.
            </Text>
          </View>
        </View>
        
        <View style={[styles.section, isDark && styles.darkSection]}>
          <Text style={[styles.sectionTitle, isDark && styles.darkText]}>Credenciales de API</Text>
          
          <View style={styles.formGroup}>
            <Text style={[styles.formLabel, isDark && styles.darkLabel]}>API Key</Text>
            <View style={[styles.apiKeyContainer, isDark && styles.darkInput]}>
              <TextInput
                style={[styles.apiKeyInput, isDark && styles.darkText]}
                value={isApiKeyVisible ? apiKey : '••••••••••••••••••••••••'}
                onChangeText={setApiKey}
                secureTextEntry={!isApiKeyVisible}
                placeholderTextColor={isDark ? '#666' : '#999'}
              />
              <TouchableOpacity 
                style={styles.visibilityButton}
                onPress={toggleApiKeyVisibility}
              >
                <Text style={[styles.visibilityText, isDark && styles.darkButtonText]}>
                  {isApiKeyVisible ? 'Ocultar' : 'Mostrar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.formGroup}>
            <Text style={[styles.formLabel, isDark && styles.darkLabel]}>Número de Proyecto</Text>
            <TextInput
              style={[styles.input, isDark && styles.darkInput, isDark && styles.darkText]}
              value={projectNumber}
              onChangeText={setProjectNumber}
              placeholder="Número del proyecto"
              placeholderTextColor={isDark ? '#666' : '#999'}
              keyboardType="numeric"
            />
          </View>
        </View>
        
        <View style={[styles.section, isDark && styles.darkSection]}>
          <Text style={[styles.sectionTitle, isDark && styles.darkText]}>Configuración del Modelo</Text>
          
          <View style={styles.formGroup}>
            <Text style={[styles.formLabel, isDark && styles.darkLabel]}>Versión del Modelo</Text>
            <TouchableOpacity 
              style={[styles.dropdown, isDark && styles.darkInput]}
              onPress={() => setShowModelDropdown(!showModelDropdown)}
            >
              <Text style={[styles.dropdownText, isDark && styles.darkText]}>
                {modelOptions.find(model => model.id === modelVersion)?.name || modelVersion}
              </Text>
              <ChevronDown size={20} color={isDark ? '#fff' : '#666'} />
            </TouchableOpacity>
            
            {showModelDropdown && (
              <View style={[styles.dropdownMenu, isDark && styles.darkDropdownMenu]}>
                {modelOptions.map((model) => (
                  <TouchableOpacity
                    key={model.id}
                    style={[
                      styles.dropdownItem,
                      model.id === modelVersion && styles.selectedDropdownItem,
                      model.id === modelVersion && isDark && styles.darkSelectedDropdownItem,
                      isDark && styles.darkDropdownItem
                    ]}
                    onPress={() => handleSelectModel(model.id)}
                  >
                    <Text style={[
                      styles.dropdownItemText,
                      model.id === modelVersion && styles.selectedDropdownItemText,
                      isDark && styles.darkText
                    ]}>
                      {model.name}
                    </Text>
                    {model.id === modelVersion && (
                      <Check size={18} color={isDark ? '#fff' : '#4285F4'} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
          
          <View style={styles.formGroup}>
            <View style={styles.sliderLabelContainer}>
              <Text style={[styles.formLabel, isDark && styles.darkLabel]}>Temperatura</Text>
              <Text style={[styles.sliderValue, isDark && styles.darkLabel]}>{tempValue.toFixed(1)}</Text>
            </View>
            <Text style={[styles.formDescription, isDark && styles.darkSubtext]}>
              Controla la creatividad y aleatoriedad (menor = más determinista)
            </Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={1}
              step={0.1}
              value={tempValue}
              onValueChange={setTempValue}
              minimumTrackTintColor="#4285F4"
              maximumTrackTintColor={isDark ? '#555' : '#ddd'}
              thumbTintColor="#4285F4"
            />
            <View style={styles.sliderLabels}>
              <Text style={[styles.sliderLabelText, isDark && styles.darkSubtext]}>Preciso</Text>
              <Text style={[styles.sliderLabelText, isDark && styles.darkSubtext]}>Creativo</Text>
            </View>
          </View>
          
          <View style={styles.formGroup}>
            <View style={styles.sliderLabelContainer}>
              <Text style={[styles.formLabel, isDark && styles.darkLabel]}>Máximo de Tokens de Salida</Text>
              <Text style={[styles.sliderValue, isDark && styles.darkLabel]}>{maxOutputTokens}</Text>
            </View>
            <Text style={[styles.formDescription, isDark && styles.darkSubtext]}>
              Cantidad máxima de tokens (palabras) que puede generar el modelo
            </Text>
            <Slider
              style={styles.slider}
              minimumValue={100}
              maximumValue={2000}
              step={100}
              value={maxOutputTokens}
              onValueChange={setMaxOutputTokens}
              minimumTrackTintColor="#4285F4"
              maximumTrackTintColor={isDark ? '#555' : '#ddd'}
              thumbTintColor="#4285F4"
            />
            <View style={styles.sliderLabels}>
              <Text style={[styles.sliderLabelText, isDark && styles.darkSubtext]}>Corto</Text>
              <Text style={[styles.sliderLabelText, isDark && styles.darkSubtext]}>Largo</Text>
            </View>
          </View>
          
          <View style={styles.switchFormGroup}>
            <View style={styles.switchLabel}>
              <Text style={[styles.formLabel, isDark && styles.darkLabel]}>Filtros de seguridad</Text>
              <Text style={[styles.formDescription, isDark && styles.darkSubtext]}>
                Activar filtros de seguridad para evitar contenido inapropiado
              </Text>
            </View>
            <Switch
              value={useSafety}
              onValueChange={setUseSafety}
              trackColor={{ false: '#ddd', true: '#4285F4' }}
              thumbColor={Platform.OS === 'ios' ? '#fff' : useSafety ? '#fff' : '#f4f3f4'}
            />
          </View>
        </View>
        
        <View style={[styles.section, isDark && styles.darkSection]}>
          <Text style={[styles.sectionTitle, isDark && styles.darkText]}>Prueba del Modelo</Text>
          
          <TouchableOpacity style={styles.testButton}>
            <MessagesSquare size={22} color="#fff" style={styles.testButtonIcon} />
            <Text style={styles.testButtonText}>Probar Conexión con Gemini</Text>
          </TouchableOpacity>
          
          <View style={[styles.testResultContainer, isDark && styles.darkTestResultContainer]}>
            <Text style={[styles.testResultLabel, isDark && styles.darkLabel]}>Estado de la Conexión:</Text>
            <Text style={[styles.testResultText, isDark && styles.darkText]}>
              Presiona el botón para probar la conexión con Gemini.
            </Text>
          </View>
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.saveButton, isDark && styles.darkSaveButton]}
            onPress={() => router.back()}
          >
            <Text style={styles.saveButtonText}>Guardar Configuración</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  darkContainer: {
    backgroundColor: '#121212',
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
  darkHeader: {
    backgroundColor: '#1a1a1a',
    borderBottomColor: '#333',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  darkText: {
    color: '#fff',
  },
  darkSubtext: {
    color: '#aaa',
  },
  darkLabel: {
    color: '#eee',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#E8F0FE',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  darkInfoCard: {
    backgroundColor: '#1A3A70',
  },
  infoIconContainer: {
    marginRight: 15,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  darkSection: {
    backgroundColor: '#1a1a1a',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  formGroup: {
    marginBottom: 15,
  },
  formLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  darkInput: {
    backgroundColor: '#2a2a2a',
    color: '#fff',
  },
  apiKeyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  apiKeyInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
  },
  visibilityButton: {
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  visibilityText: {
    color: '#4285F4',
    fontWeight: '500',
  },
  darkButtonText: {
    color: '#8AB4F8',
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dropdownText: {
    fontSize: 16,
    color: '#333',
  },
  dropdownMenu: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginTop: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10,
  },
  darkDropdownMenu: {
    backgroundColor: '#2a2a2a',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  darkDropdownItem: {
    borderBottomColor: '#333',
  },
  selectedDropdownItem: {
    backgroundColor: '#E8F0FE',
  },
  darkSelectedDropdownItem: {
    backgroundColor: '#1A3A70',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
  },
  selectedDropdownItemText: {
    color: '#4285F4',
    fontWeight: '500',
  },
  sliderLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sliderValue: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  formDescription: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -4,
  },
  sliderLabelText: {
    fontSize: 12,
    color: '#999',
  },
  switchFormGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  switchLabel: {
    flex: 1,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4285F4',
    borderRadius: 8,
    paddingVertical: 12,
    marginBottom: 15,
  },
  testButtonIcon: {
    marginRight: 8,
  },
  testButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  testResultContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
  },
  darkTestResultContainer: {
    backgroundColor: '#2a2a2a',
  },
  testResultLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 5,
  },
  testResultText: {
    fontSize: 14,
    color: '#333',
    fontStyle: 'italic',
  },
  buttonContainer: {
    marginTop: 10,
    marginBottom: 30,
  },
  saveButton: {
    backgroundColor: '#4285F4',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  darkSaveButton: {
    backgroundColor: '#1A73E8',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});