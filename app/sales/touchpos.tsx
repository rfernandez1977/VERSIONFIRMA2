import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, FileText, ChartBar as FileBarChart, Package, Receipt } from 'lucide-react-native';

export default function TouchPosScreen() {
  const router = useRouter();

  const documentTypes = [
    {
      id: 'factura',
      title: 'Factura Electrónica',
      description: 'Documento tributario para operaciones con empresas',
      icon: <FileText size={32} color="#0066CC" />,
      color: '#E3F2FD',
      active: true,
      route: '/sales/factura-electronica'
    },
    {
      id: 'boleta',
      title: 'Boleta Electrónica',
      description: 'Documento para operaciones con consumidores finales',
      icon: <Receipt size={32} color="#4CAF50" />,
      color: '#E8F5E9',
      active: true,
      route: '/sales/boleta-electronica'
    },
    {
      id: 'guia',
      title: 'Guía de Despacho Electrónica',
      description: 'Documento para el traslado de mercaderías',
      icon: <Package size={32} color="#FF9800" />,
      color: '#FFF3E0',
      active: false,
      route: '/sales/guia-despacho'
    },
    {
      id: 'nota',
      title: 'Nota de Venta',
      description: 'Documento interno no tributario',
      icon: <FileBarChart size={32} color="#9C27B0" />,
      color: '#F3E5F5',
      active: false,
      route: '/sales/nota-venta'
    }
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>TouchPos</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Documentos Electrónicos</Text>
        <Text style={styles.sectionDescription}>
          Seleccione el tipo de documento que desea emitir
        </Text>

        <View style={styles.documentsList}>
          {documentTypes.map((document) => (
            <TouchableOpacity
              key={document.id}
              style={[
                styles.documentCard,
                !document.active && styles.documentCardDisabled
              ]}
              onPress={() => document.active ? router.push(document.route) : null}
              disabled={!document.active}
            >
              <View style={[styles.documentIconContainer, { backgroundColor: document.color }]}>
                {document.icon}
              </View>
              <View style={styles.documentInfo}>
                <Text style={styles.documentTitle}>{document.title}</Text>
                <Text style={styles.documentDescription}>{document.description}</Text>
              </View>
              {!document.active && (
                <View style={styles.comingSoonTag}>
                  <Text style={styles.comingSoonText}>Próximamente</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
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
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  documentsList: {
    gap: 16,
    marginBottom: 30,
  },
  documentCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    alignItems: 'center',
  },
  documentCardDisabled: {
    opacity: 0.7,
  },
  documentIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  documentInfo: {
    flex: 1,
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  documentDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  comingSoonTag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 10,
  },
  comingSoonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  }
});