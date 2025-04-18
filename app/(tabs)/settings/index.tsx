import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Switch, 
  Platform 
} from 'react-native';
import { useRouter } from 'expo-router';
import { 
  Moon, 
  Bell, 
  Globe, 
  Shield, 
  CircleHelp as HelpCircle, 
  LogOut, 
  ChevronRight, 
  Printer, 
  CreditCard,
  Bot,
  FileText,
  Building2,
  User,
  Wifi,
  WifiOff,
  Mic,
  MessageSquareText,
  VolumeX,
  Volume2
} from 'lucide-react-native';
import { useTheme } from '../../../context/ThemeContext';

export default function SettingsScreen() {
  const router = useRouter();
  const { 
    theme, 
    isDark, 
    setTheme,
    offlineMode,
    setOfflineMode
  } = useTheme();
  
  const [notifications, setNotifications] = useState(true);

  return (
    <View style={[styles.container, isDark && styles.darkContainer]}>
      <View style={[styles.header, isDark && styles.darkSection]}>
        <Text style={[styles.headerTitle, isDark && styles.darkText]}>Ajustes</Text>
      </View>
      
      <ScrollView style={styles.content}>
        {/* Profile Section */}
        <View style={[styles.profileSection, isDark && styles.darkSection]}>
          <View style={styles.profileInfo}>
            <View style={[styles.profileImagePlaceholder, isDark && styles.darkProfileImage]}>
              <Building2 size={24} color="#fff" />
            </View>
            <View style={styles.profileText}>
              <Text style={[styles.profileName, isDark && styles.darkText]}>Empresa ABC S.A.C.</Text>
              <Text style={[styles.profileRut, isDark && styles.darkSubtext]}>RUT: 20.123.456-7</Text>
              <Text style={[styles.profileUser, isDark && styles.darkSubtext]}>
                <User size={14} color={isDark ? '#999' : '#666'} /> Juan Pérez
              </Text>
            </View>
          </View>
          <TouchableOpacity 
            style={[styles.editButton, isDark && styles.darkEditButton]}
          >
            <Text style={[styles.editButtonText, isDark && styles.darkButtonText]}>Editar</Text>
          </TouchableOpacity>
        </View>
        
        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.darkText]}>Preferencias</Text>
          
          {/* Offline Mode */}
          <TouchableOpacity 
            style={[styles.settingItem, isDark && styles.darkSettingItem]}
            onPress={() => setOfflineMode(!offlineMode)}
          >
            <View style={styles.settingLeft}>
              {offlineMode ? (
                <WifiOff size={22} color={isDark ? '#fff' : '#333'} style={styles.settingIcon} />
              ) : (
                <Wifi size={22} color={isDark ? '#fff' : '#333'} style={styles.settingIcon} />
              )}
              <Text style={[styles.settingText, isDark && styles.darkText]}>Emisión Offline</Text>
            </View>
            <Switch
              value={offlineMode}
              onValueChange={setOfflineMode}
              trackColor={{ false: '#ddd', true: '#0066CC' }}
              thumbColor={Platform.OS === 'ios' ? '#fff' : offlineMode ? '#fff' : '#f4f3f4'}
            />
          </TouchableOpacity>
          
          {/* Dark Mode */}
          <TouchableOpacity 
            style={[styles.settingItem, isDark && styles.darkSettingItem]}
            onPress={() => setTheme(isDark ? 'light' : 'dark')}
          >
            <View style={styles.settingLeft}>
              <Moon size={22} color={isDark ? '#fff' : '#333'} style={styles.settingIcon} />
              <Text style={[styles.settingText, isDark && styles.darkText]}>Modo Oscuro</Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={(value) => setTheme(value ? 'dark' : 'light')}
              trackColor={{ false: '#ddd', true: '#0066CC' }}
              thumbColor={Platform.OS === 'ios' ? '#fff' : isDark ? '#fff' : '#f4f3f4'}
            />
          </TouchableOpacity>
          
          {/* Notifications */}
          <TouchableOpacity 
            style={[styles.settingItem, isDark && styles.darkSettingItem]}
            onPress={() => setNotifications(!notifications)}
          >
            <View style={styles.settingLeft}>
              <Bell size={22} color={isDark ? '#fff' : '#333'} style={styles.settingIcon} />
              <Text style={[styles.settingText, isDark && styles.darkText]}>Notificaciones</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: '#ddd', true: '#0066CC' }}
              thumbColor={Platform.OS === 'ios' ? '#fff' : notifications ? '#fff' : '#f4f3f4'}
            />
          </TouchableOpacity>
          
          {/* Language */}
          <TouchableOpacity 
            style={[styles.settingItem, isDark && styles.darkSettingItem]}
            onPress={() => router.push('/settings/language')}
          >
            <View style={styles.settingLeft}>
              <Globe size={22} color={isDark ? '#fff' : '#333'} style={styles.settingIcon} />
              <Text style={[styles.settingText, isDark && styles.darkText]}>Idioma</Text>
            </View>
            <View style={styles.settingRight}>
              <Text style={[styles.settingValue, isDark && styles.darkSubtext]}>Español</Text>
              <ChevronRight size={20} color={isDark ? '#666' : '#999'} />
            </View>
          </TouchableOpacity>
          
          {/* CAF Upload */}
          <TouchableOpacity 
            style={[styles.settingItem, isDark && styles.darkSettingItem]}
            onPress={() => router.push('/settings/caf')}
          >
            <View style={styles.settingLeft}>
              <FileText size={22} color={isDark ? '#fff' : '#333'} style={styles.settingIcon} />
              <Text style={[styles.settingText, isDark && styles.darkText]}>Cargar CAF</Text>
            </View>
            <View style={styles.settingRight}>
              <Text style={[styles.settingValue, isDark && styles.darkSubtext]}>Sin CAF</Text>
              <ChevronRight size={20} color={isDark ? '#666' : '#999'} />
            </View>
          </TouchableOpacity>
          
          {/* Print Configuration */}
          <TouchableOpacity 
            style={[styles.settingItem, isDark && styles.darkSettingItem]}
            onPress={() => router.push('/settings/print-config')}
          >
            <View style={styles.settingLeft}>
              <Printer size={22} color={isDark ? '#fff' : '#333'} style={styles.settingIcon} />
              <Text style={[styles.settingText, isDark && styles.darkText]}>Configuración de Impresión</Text>
            </View>
            <View style={styles.settingRight}>
              <Text style={[styles.settingValue, isDark && styles.darkSubtext]}>Carta / Genérica</Text>
              <ChevronRight size={20} color={isDark ? '#666' : '#999'} />
            </View>
          </TouchableOpacity>
          
          {/* Payment Gateway */}
          <TouchableOpacity 
            style={[styles.settingItem, isDark && styles.darkSettingItem]}
            onPress={() => router.push('/settings/payment-gateway')}
          >
            <View style={styles.settingLeft}>
              <CreditCard size={22} color={isDark ? '#fff' : '#333'} style={styles.settingIcon} />
              <Text style={[styles.settingText, isDark && styles.darkText]}>Pasarela de Pago</Text>
            </View>
            <View style={styles.settingRight}>
              <Text style={[styles.settingValue, isDark && styles.darkSubtext]}>No configurado</Text>
              <ChevronRight size={20} color={isDark ? '#666' : '#999'} />
            </View>
          </TouchableOpacity>
          
          {/* AI Assistant */}
          <TouchableOpacity 
            style={[styles.settingItem, isDark && styles.darkSettingItem]}
            onPress={() => router.push('/settings/ai-config')}
          >
            <View style={styles.settingLeft}>
              <Bot size={22} color={isDark ? '#fff' : '#333'} style={styles.settingIcon} />
              <Text style={[styles.settingText, isDark && styles.darkText]}>Asistente IA</Text>
            </View>
            <View style={styles.settingRight}>
              <Text style={[styles.settingValue, isDark && styles.darkSubtext]}>No configurado</Text>
              <ChevronRight size={20} color={isDark ? '#666' : '#999'} />
            </View>
          </TouchableOpacity>
        </View>

        {/* VozPos Configuration Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.darkText]}>Configuración de VozPos</Text>
          
          {/* Speech-to-Text API */}
          <TouchableOpacity 
            style={[styles.settingItem, isDark && styles.darkSettingItem]}
            onPress={() => router.push('/settings/speech-to-text')}
          >
            <View style={styles.settingLeft}>
              <Mic size={22} color={isDark ? '#fff' : '#333'} style={styles.settingIcon} />
              <Text style={[styles.settingText, isDark && styles.darkText]}>API de Speech-to-Text</Text>
            </View>
            <View style={styles.settingRight}>
              <Text style={[styles.settingValue, isDark && styles.darkSubtext]}>Google Cloud</Text>
              <ChevronRight size={20} color={isDark ? '#666' : '#999'} />
            </View>
          </TouchableOpacity>
          
          {/* Google Gemini API */}
          <TouchableOpacity 
            style={[styles.settingItem, isDark && styles.darkSettingItem]}
            onPress={() => router.push('/settings/gemini-api')}
          >
            <View style={styles.settingLeft}>
              <MessageSquareText size={22} color={isDark ? '#fff' : '#333'} style={styles.settingIcon} />
              <Text style={[styles.settingText, isDark && styles.darkText]}>API de Google Gemini</Text>
            </View>
            <View style={styles.settingRight}>
              <Text style={[styles.settingValue, isDark && styles.darkSubtext]}>Pro 1.0</Text>
              <ChevronRight size={20} color={isDark ? '#666' : '#999'} />
            </View>
          </TouchableOpacity>
          
          {/* Text-to-Speech API */}
          <TouchableOpacity 
            style={[styles.settingItem, isDark && styles.darkSettingItem]}
            onPress={() => router.push('/settings/text-to-speech')}
          >
            <View style={styles.settingLeft}>
              <Volume2 size={22} color={isDark ? '#fff' : '#333'} style={styles.settingIcon} />
              <Text style={[styles.settingText, isDark && styles.darkText]}>API de Text-to-Speech</Text>
            </View>
            <View style={styles.settingRight}>
              <Text style={[styles.settingValue, isDark && styles.darkSubtext]}>Google Cloud</Text>
              <ChevronRight size={20} color={isDark ? '#666' : '#999'} />
            </View>
          </TouchableOpacity>
        </View>
        
        {/* Security Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.darkText]}>Seguridad</Text>
          
          <TouchableOpacity 
            style={[styles.settingItem, isDark && styles.darkSettingItem]}
            onPress={() => router.push('/settings/security')}
          >
            <View style={styles.settingLeft}>
              <Shield size={22} color={isDark ? '#fff' : '#333'} style={styles.settingIcon} />
              <Text style={[styles.settingText, isDark && styles.darkText]}>Seguridad y Privacidad</Text>
            </View>
            <ChevronRight size={20} color={isDark ? '#666' : '#999'} />
          </TouchableOpacity>
        </View>
        
        {/* Support Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.darkText]}>Soporte</Text>
          
          <TouchableOpacity 
            style={[styles.settingItem, isDark && styles.darkSettingItem]}
            onPress={() => router.push('/settings/help')}
          >
            <View style={styles.settingLeft}>
              <HelpCircle size={22} color={isDark ? '#fff' : '#333'} style={styles.settingIcon} />
              <Text style={[styles.settingText, isDark && styles.darkText]}>Ayuda y Soporte</Text>
            </View>
            <ChevronRight size={20} color={isDark ? '#666' : '#999'} />
          </TouchableOpacity>
        </View>
        
        {/* Logout Button */}
        <TouchableOpacity 
          style={[styles.logoutButton, isDark && styles.darkLogoutButton]}
          onPress={() => router.replace('/(auth)/login')}
        >
          <LogOut size={20} color={isDark ? '#fff' : '#FF3B30'} style={styles.logoutIcon} />
          <Text style={[styles.logoutText, isDark && styles.darkLogoutText]}>Cerrar Sesión</Text>
        </TouchableOpacity>
        
        <Text style={[styles.versionText, isDark && styles.darkSubtext]}>Versión 1.0.0</Text>
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
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  darkSection: {
    backgroundColor: '#1a1a1a',
    borderColor: '#333',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  darkText: {
    color: '#fff',
  },
  darkSubtext: {
    color: '#999',
  },
  content: {
    flex: 1,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 20,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileImagePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#0066CC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  darkProfileImage: {
    backgroundColor: '#0055AA',
  },
  profileText: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  profileRut: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  profileUser: {
    fontSize: 14,
    color: '#666',
  },
  editButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
  },
  darkEditButton: {
    backgroundColor: '#333',
  },
  editButtonText: {
    fontSize: 13,
    color: '#0066CC',
    fontWeight: 'bold',
  },
  darkButtonText: {
    color: '#4d9fff',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  darkSettingItem: {
    borderBottomColor: '#333',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    marginRight: 15,
  },
  settingText: {
    fontSize: 16,
    color: '#333',
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValue: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginVertical: 20,
    paddingVertical: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  darkLogoutButton: {
    backgroundColor: '#1a1a1a',
    borderColor: '#FF3B30',
  },
  logoutIcon: {
    marginRight: 10,
  },
  logoutText: {
    fontSize: 16,
    color: '#FF3B30',
    fontWeight: 'bold',
  },
  darkLogoutText: {
    color: '#FF3B30',
  },
  versionText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#999',
    marginBottom: 30,
  }
});