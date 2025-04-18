import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  ScrollView, 
  Platform,
  Switch
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Mic, ChevronDown, Check, Info } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';

export default function SpeechToTextScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  
  const [apiKey, setApiKey] = useState('API_KEY_HERE');
  const [isApiKeyVisible, setIsApiKeyVisible] = useState(false);
  const [projectId, setProjectId] = useState('vozpos-project-2025');
  const [languageCode, setLanguageCode] = useState('es-CL');
  const [enhancedModel, setEnhancedModel] = useState(true);
  const [automaticPunctuation, setAutomaticPunctuation] = useState(true);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  
  const languageOptions = [
    { code: 'es-CL', name: 'Español (Chile)' },
    { code: 'es-ES', name: 'Español (España)' },
    { code: 'es-MX', name: 'Español (México)' },
    { code: 'es-AR', name: 'Español (Argentina)' },
    { code: 'en-US', name: 'Inglés (Estados Unidos)' },
    { code: 'pt-BR', name: 'Portugués (Brasil)' }
  ];
  
  const handleSelectLanguage = (code) => {
    setLanguageCode(code);
    setShowLanguageDropdown(false);
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
        <Text style={[styles.headerTitle, isDark && styles.darkText]}>Speech-to-Text API</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView style={styles.content}>
        <View style={[styles.infoCard, isDark && styles.darkInfoCard]}>
          <View style={styles.infoIconContainer}>
            <Info size={24} color="#0066CC" />
          </View>
          <View style={styles.infoContent}>
            <Text style={[styles.infoTitle, isDark && styles.darkText]}>API de Speech-to-Text de Google Cloud</Text>
            <Text style={[styles.infoText, isDark && styles.darkSubtext]}>
              Esta API convierte audio en texto utilizando tecnología avanzada de reconocimiento de voz.
              Se usa para la función VozPos para recibir comandos de voz.
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
            <Text style={[styles.formLabel, isDark && styles.darkLabel]}>ID del Proyecto</Text>
            <TextInput
              style={[styles.input, isDark && styles.darkInput, isDark && styles.darkText]}
              value={projectId}
              onChangeText={setProjectId}
              placeholder="ID del proyecto de Google Cloud"
              placeholderTextColor={isDark ? '#666' : '#999'}
            />
          </View>
        </View>
        
        <View style={[styles.section, isDark && styles.darkSection]}>
          <Text style={[styles.sectionTitle, isDark && styles.darkText]}>Configuración de Reconocimiento</Text>
          
          <View style={styles.formGroup}>
            <Text style={[styles.formLabel, isDark && styles.darkLabel]}>Idioma principal</Text>
            <TouchableOpacity 
              style={[styles.dropdown, isDark && styles.darkInput]}
              onPress={() => setShowLanguageDropdown(!showLanguageDropdown)}
            >
              <Text style={[styles.dropdownText, isDark && styles.darkText]}>
                {languageOptions.find(lang => lang.code === languageCode)?.name || languageCode}
              </Text>
              <ChevronDown size={20} color={isDark ? '#fff' : '#666'} />
            </TouchableOpacity>
            
            {showLanguageDropdown && (
              <View style={[styles.dropdownMenu, isDark && styles.darkDropdownMenu]}>
                {languageOptions.map((lang) => (
                  <TouchableOpacity
                    key={lang.code}
                    style={[
                      styles.dropdownItem,
                      lang.code === languageCode && styles.selectedDropdownItem,
                      lang.code === languageCode && isDark && styles.darkSelectedDropdownItem
                    ]}
                    onPress={() => handleSelectLanguage(lang.code)}
                  >
                    <Text style={[
                      styles.dropdownItemText,
                      lang.code === languageCode && styles.selectedDropdownItemText,
                      isDark && styles.darkText
                    ]}>
                      {lang.name}
                    </Text>
                    {lang.code === languageCode && (
                      <Check size={18} color={isDark ? '#fff' : '#0066CC'} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
          
          <View style={styles.switchFormGroup}>
            <View style={styles.switchLabel}>
              <Text style={[styles.formLabel, isDark && styles.darkLabel]}>Usar modelo mejorado</Text>
              <Text style={[styles.formDescription, isDark && styles.darkSubtext]}>
                Proporciona mayor precisión pero aumenta el costo
              </Text>
            </View>
            <Switch
              value={enhancedModel}
              onValueChange={setEnhancedModel}
              trackColor={{ false: '#ddd', true: '#0066CC' }}
              thumbColor={Platform.OS === 'ios' ? '#fff' : enhancedModel ? '#fff' : '#f4f3f4'}
            />
          </View>
          
          <View style={styles.switchFormGroup}>
            <View style={styles.switchLabel}>
              <Text style={[styles.formLabel, isDark && styles.darkLabel]}>Puntuación automática</Text>
              <Text style={[styles.formDescription, isDark && styles.darkSubtext]}>
                Agrega puntuación automáticamente al texto reconocido
              </Text>
            </View>
            <Switch
              value={automaticPunctuation}
              onValueChange={setAutomaticPunctuation}
              trackColor={{ false: '#ddd', true: '#0066CC' }}
              thumbColor={Platform.OS === 'ios' ? '#fff' : automaticPunctuation ? '#fff' : '#f4f3f4'}
            />
          </View>
        </View>
        
        <View style={[styles.section, isDark && styles.darkSection]}>
          <Text style={[styles.sectionTitle, isDark && styles.darkText]}>Prueba de Reconocimiento</Text>
          
          <TouchableOpacity style={[styles.testButton, isDark && styles.darkTestButton]}>
            <Mic size={22} color="#fff" style={styles.testButtonIcon} />
            <Text style={styles.testButtonText}>Probar Reconocimiento</Text>
          </TouchableOpacity>
          
          <View style={[styles.testResultContainer, isDark && styles.darkTestResultContainer]}>
            <Text style={[styles.testResultLabel, isDark && styles.darkLabel]}>Resultado:</Text>
            <Text style={[styles.testResultText, isDark && styles.darkText]}>
              Presiona el botón para probar el reconocimiento de voz.
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
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  darkInfoCard: {
    backgroundColor: '#162B40',
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
    color: '#0066CC',
    fontWeight: '500',
  },
  darkButtonText: {
    color: '#4d9fff',
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
    backgroundColor: '#E3F2FD',
  },
  darkSelectedDropdownItem: {
    backgroundColor: '#162B40',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
  },
  selectedDropdownItemText: {
    color: '#0066CC',
    fontWeight: '500',
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
  formDescription: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0066CC',
    borderRadius: 8,
    paddingVertical: 12,
    marginBottom: 15,
  },
  darkTestButton: {
    backgroundColor: '#0055aa',
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
    backgroundColor: '#0066CC',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  darkSaveButton: {
    backgroundColor: '#0055aa',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});