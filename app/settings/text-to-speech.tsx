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
import { ArrowLeft, ChevronDown, Check, Info, Volume2, Play } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';

export default function TextToSpeechScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  
  const [apiKey, setApiKey] = useState('API_KEY_HERE');
  const [isApiKeyVisible, setIsApiKeyVisible] = useState(false);
  const [projectId, setProjectId] = useState('vozpos-project-2025');
  const [voice, setVoice] = useState('es-ES-Standard-A');
  const [rate, setRate] = useState(1.0);
  const [pitch, setPitch] = useState(0);
  const [showVoiceDropdown, setShowVoiceDropdown] = useState(false);
  const [enableSSML, setEnableSSML] = useState(true);
  
  const voiceOptions = [
    { id: 'es-ES-Standard-A', name: 'Español (España) - Mujer' },
    { id: 'es-ES-Standard-B', name: 'Español (España) - Hombre' },
    { id: 'es-ES-Standard-C', name: 'Español (España) - Mujer 2' },
    { id: 'es-ES-Wavenet-B', name: 'Español (España) - Hombre (WaveNet)' },
    { id: 'es-ES-Wavenet-C', name: 'Español (España) - Mujer (WaveNet)' },
    { id: 'es-US-Standard-A', name: 'Español (EEUU) - Mujer' },
    { id: 'es-US-Standard-B', name: 'Español (EEUU) - Hombre' },
    { id: 'es-US-Wavenet-A', name: 'Español (EEUU) - Mujer (WaveNet)' },
  ];
  
  const handleSelectVoice = (id) => {
    setVoice(id);
    setShowVoiceDropdown(false);
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
        <Text style={[styles.headerTitle, isDark && styles.darkText]}>Text-to-Speech API</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView style={styles.content}>
        <View style={[styles.infoCard, isDark && styles.darkInfoCard]}>
          <View style={styles.infoIconContainer}>
            <Volume2 size={24} color="#34A853" />
          </View>
          <View style={styles.infoContent}>
            <Text style={[styles.infoTitle, isDark && styles.darkText]}>API de Text-to-Speech de Google Cloud</Text>
            <Text style={[styles.infoText, isDark && styles.darkSubtext]}>
              Esta API convierte texto en voz natural utilizando modelos avanzados de síntesis.
              Se usa en VozPos para responder y confirmar acciones al usuario.
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
          <Text style={[styles.sectionTitle, isDark && styles.darkText]}>Configuración de Voz</Text>
          
          <View style={styles.formGroup}>
            <Text style={[styles.formLabel, isDark && styles.darkLabel]}>Voz</Text>
            <TouchableOpacity 
              style={[styles.dropdown, isDark && styles.darkInput]}
              onPress={() => setShowVoiceDropdown(!showVoiceDropdown)}
            >
              <Text style={[styles.dropdownText, isDark && styles.darkText]}>
                {voiceOptions.find(v => v.id === voice)?.name || voice}
              </Text>
              <ChevronDown size={20} color={isDark ? '#fff' : '#666'} />
            </TouchableOpacity>
            
            {showVoiceDropdown && (
              <View style={[styles.dropdownMenu, isDark && styles.darkDropdownMenu]}>
                {voiceOptions.map((voiceOption) => (
                  <TouchableOpacity
                    key={voiceOption.id}
                    style={[
                      styles.dropdownItem,
                      voiceOption.id === voice && styles.selectedDropdownItem,
                      voiceOption.id === voice && isDark && styles.darkSelectedDropdownItem,
                      isDark && styles.darkDropdownItem
                    ]}
                    onPress={() => handleSelectVoice(voiceOption.id)}
                  >
                    <Text style={[
                      styles.dropdownItemText,
                      voiceOption.id === voice && styles.selectedDropdownItemText,
                      isDark && styles.darkText
                    ]}>
                      {voiceOption.name}
                    </Text>
                    {voiceOption.id === voice && (
                      <Check size={18} color={isDark ? '#fff' : '#34A853'} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
          
          <View style={styles.formGroup}>
            <View style={styles.sliderLabelContainer}>
              <Text style={[styles.formLabel, isDark && styles.darkLabel]}>Velocidad de habla</Text>
              <Text style={[styles.sliderValue, isDark && styles.darkLabel]}>x{rate.toFixed(1)}</Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={0.5}
              maximumValue={2.0}
              step={0.1}
              value={rate}
              onValueChange={setRate}
              minimumTrackTintColor="#34A853"
              maximumTrackTintColor={isDark ? '#555' : '#ddd'}
              thumbTintColor="#34A853"
            />
            <View style={styles.sliderLabels}>
              <Text style={[styles.sliderLabelText, isDark && styles.darkSubtext]}>Lento</Text>
              <Text style={[styles.sliderLabelText, isDark && styles.darkSubtext]}>Rápido</Text>
            </View>
          </View>
          
          <View style={styles.formGroup}>
            <View style={styles.sliderLabelContainer}>
              <Text style={[styles.formLabel, isDark && styles.darkLabel]}>Tono de voz</Text>
              <Text style={[styles.sliderValue, isDark && styles.darkLabel]}>{pitch > 0 ? '+' : ''}{pitch.toFixed(1)}</Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={-10.0}
              maximumValue={10.0}
              step={0.5}
              value={pitch}
              onValueChange={setPitch}
              minimumTrackTintColor="#34A853"
              maximumTrackTintColor={isDark ? '#555' : '#ddd'}
              thumbTintColor="#34A853"
            />
            <View style={styles.sliderLabels}>
              <Text style={[styles.sliderLabelText, isDark && styles.darkSubtext]}>Grave</Text>
              <Text style={[styles.sliderLabelText, isDark && styles.darkSubtext]}>Agudo</Text>
            </View>
          </View>
          
          <View style={styles.switchFormGroup}>
            <View style={styles.switchLabel}>
              <Text style={[styles.formLabel, isDark && styles.darkLabel]}>Usar SSML</Text>
              <Text style={[styles.formDescription, isDark && styles.darkSubtext]}>
                Permite controlar la entonación, pausas y énfasis mediante etiquetas
              </Text>
            </View>
            <Switch
              value={enableSSML}
              onValueChange={setEnableSSML}
              trackColor={{ false: '#ddd', true: '#34A853' }}
              thumbColor={Platform.OS === 'ios' ? '#fff' : enableSSML ? '#fff' : '#f4f3f4'}
            />
          </View>
        </View>
        
        <View style={[styles.section, isDark && styles.darkSection]}>
          <Text style={[styles.sectionTitle, isDark && styles.darkText]}>Prueba de Síntesis</Text>
          
          <View style={styles.formGroup}>
            <Text style={[styles.formLabel, isDark && styles.darkLabel]}>Texto de prueba</Text>
            <TextInput
              style={[styles.textArea, isDark && styles.darkInput, isDark && styles.darkText]}
              multiline
              numberOfLines={4}
              placeholder="Escribe aquí el texto que deseas convertir a voz..."
              placeholderTextColor={isDark ? '#666' : '#999'}
              textAlignVertical="top"
              defaultValue="Hola, soy VozPos. Tu asistente de ventas por voz."
            />
          </View>
          
          <TouchableOpacity style={styles.testButton}>
            <Play size={22} color="#fff" style={styles.testButtonIcon} />
            <Text style={styles.testButtonText}>Reproducir audio</Text>
          </TouchableOpacity>
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
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  darkInfoCard: {
    backgroundColor: '#1A3B2A',
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
  textArea: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    height: 100,
    textAlignVertical: 'top',
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
    color: '#34A853',
    fontWeight: '500',
  },
  darkButtonText: {
    color: '#81C995',
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
    maxHeight: 300,
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
    backgroundColor: '#E8F5E9',
  },
  darkSelectedDropdownItem: {
    backgroundColor: '#1A3B2A',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
  },
  selectedDropdownItemText: {
    color: '#34A853',
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
    backgroundColor: '#34A853',
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
  buttonContainer: {
    marginTop: 10,
    marginBottom: 30,
  },
  saveButton: {
    backgroundColor: '#34A853',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  darkSaveButton: {
    backgroundColor: '#1E8E3E',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});