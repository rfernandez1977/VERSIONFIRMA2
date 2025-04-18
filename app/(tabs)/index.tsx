import React, { lazy, Suspense } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { FileText, Camera, TrendingUp, Package, Users, Settings, CreditCard, Mic, Zap } from 'lucide-react-native';

// Lazy load the StatCard component
const StatCard = lazy(() => import('../../components/StatCard'));

// Placeholder component while StatCard is loading
const StatCardFallback = ({ title }) => (
  <View style={styles.statCardPlaceholder}>
    <ActivityIndicator size="small" color="#0066CC" />
    <Text style={styles.statCardPlaceholderText}>{title}</Text>
  </View>
);

export default function HomeScreen() {
  const router = useRouter();

  // Sample invoice data for Recent Documents
  const recentInvoices = [
    { id: '001', number: 'F001-000001', client: 'Empresa ABC S.A.C.', amount: 1580.00 },
    { id: '002', number: 'F001-000002', client: 'Comercial XYZ Ltda.', amount: 2340.50 },
    { id: '003', number: 'F001-000003', client: 'Distribuidora 123 S.A.', amount: 960.75 },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>¡Buen día!</Text>
          <Text style={styles.date}>
            {new Date().toLocaleDateString('es-ES', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </Text>
        </View>
        <Image
          source={{ 
            uri: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100&auto=format&fit=crop' 
          }}
          style={styles.avatar}
          width={50} 
          height={50}
        />
      </View>

      {/* Stats Section */}
      <View style={styles.statsContainer}>
        <Suspense fallback={<StatCardFallback title="Ventas del Día" />}>
          <StatCard
            title="Ventas del Día"
            value="S/ 2,580.00"
            trend={+12.5}
            icon={<TrendingUp size={24} color="#0066CC" />}
          />
        </Suspense>
        <Suspense fallback={<StatCardFallback title="Productos" />}>
          <StatCard
            title="Productos"
            value="145"
            trend={-2.3}
            icon={<Package size={24} color="#4CAF50" />}
          />
        </Suspense>
        <Suspense fallback={<StatCardFallback title="Clientes" />}>
          <StatCard
            title="Clientes"
            value="48"
            trend={+5.7}
            icon={<Users size={24} color="#9C27B0" />}
          />
        </Suspense>
      </View>

      {/* Quick Actions Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => router.push('/sales/vozpos')}
          >
            <View style={[styles.iconContainer, { backgroundColor: '#2D3748' }]}>
              <Mic size={32} color="#FFFFFF" />
            </View>
            <Text style={styles.actionTitle}>VozPos</Text>
            <Text style={styles.actionDescription}>Emitir documentos por voz</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => router.push('/quick')}
          >
            <View style={[styles.iconContainer, { backgroundColor: '#1E40AF' }]}>
              <Zap size={32} color="#FFFFFF" />
            </View>
            <Text style={styles.actionTitle}>Quick</Text>
            <Text style={styles.actionDescription}>Procesamiento rápido de ventas</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => router.push('/sales/new-vision')}
          >
            <View style={[styles.iconContainer, { backgroundColor: '#E8F5E9' }]}>
              <Camera size={32} color="#4CAF50" />
            </View>
            <Text style={styles.actionTitle}>VisionPos</Text>
            <Text style={styles.actionDescription}>Escanear documentos físicos</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => router.push('/sales/touchpos')}
          >
            <View style={[styles.iconContainer, { backgroundColor: '#FFF3E0' }]}>
              <CreditCard size={32} color="#FF9800" />
            </View>
            <Text style={styles.actionTitle}>TouchPos</Text>
            <Text style={styles.actionDescription}>Documentos electrónicos</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Documents Section - Lazy loaded */}
      <RecentDocumentsSection invoices={recentInvoices} router={router} />
    </ScrollView>
  );
}

// Separate component for Recent Documents to improve code organization and enable lazy loading
const RecentDocumentsSection = ({ invoices, router }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>Documentos Recientes</Text>
    <View style={styles.documentsList}>
      {invoices.map((invoice, index) => (
        <TouchableOpacity 
          key={index}
          style={styles.documentItem}
          onPress={() => router.push({
            pathname: '/sales/factura-electronica',
            params: { id: invoice.id }
          })}
        >
          <View style={styles.documentIcon}>
            <FileText size={24} color="#0066CC" />
          </View>
          <View style={styles.documentInfo}>
            <Text style={styles.documentTitle}>{invoice.number}</Text>
            <Text style={styles.documentMeta}>{invoice.client}</Text>
          </View>
          <Text style={styles.documentAmount}>S/ {invoice.amount.toFixed(2)}</Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  date: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 10,
  },
  statCardPlaceholder: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 12,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statCardPlaceholderText: {
    marginTop: 8,
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  documentsList: {
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  documentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  documentInfo: {
    flex: 1,
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  documentMeta: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  documentAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0066CC',
  },
});