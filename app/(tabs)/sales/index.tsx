import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator, 
  RefreshControl,
  TouchableOpacity,
  Platform,
  ScrollView,
  Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { Check, CircleAlert as AlertCircle, ChevronRight, FileText, Download, Zap, Mic, Camera, CreditCard, CirclePlus as PlusCircle } from 'lucide-react-native';
import { api, Document } from '../../../services/api';

export default function LastSalesScreen() {
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSales = async () => {
    try {
      const response = await api.getSales(true);
      setDocuments(response);
      setError(null);
    } catch (err) {
      setError('Error al cargar las ventas. Por favor intente nuevamente.');
      console.error('Error fetching sales:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSales();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
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

  const handleDocumentPress = (document: Document) => {
    router.push(`/sales/invoice-details?id=${document.id}`);
  };

  const salesOptions = [
    {
      title: "Quick",
      icon: <Zap size={32} color="#FFFFFF" />,
      bgColor: "#1E40AF",
      route: "/sales/quick"
    },
    {
      title: "VozPos",
      icon: <Mic size={32} color="#FFFFFF" />,
      bgColor: "#2D3748",
      route: "/sales/vozpos"
    },
    {
      title: "VisionPos",
      icon: <Camera size={32} color="#FFFFFF" />,
      bgColor: "#4CAF50",
      route: "/sales/new-vision"
    },
    {
      title: "TouchPos",
      icon: <CreditCard size={32} color="#FFFFFF" />,
      bgColor: "#FF9800",
      route: "/sales/touchpos"
    }
  ];

  const renderItem = ({ item }: { item: Document }) => (
    <TouchableOpacity 
      style={styles.documentCard} 
      onPress={() => handleDocumentPress(item)}
    >
      <View style={styles.documentHeader}>
        <View style={styles.documentType}>
          <Text style={styles.documentTypeText}>{item.type}</Text>
          <Text style={styles.documentFolio}>N° {item.assignedFolio}</Text>
        </View>
        <View style={[
          styles.statusBadge,
          item.state[0] === 'ACCEPTED' ? styles.statusAccepted : styles.statusPending
        ]}>
          {item.state[0] === 'ACCEPTED' ? (
            <Check size={16} color="#4CAF50" style={styles.statusIcon} />
          ) : (
            <AlertCircle size={16} color="#FF9800" style={styles.statusIcon} />
          )}
          <Text style={[
            styles.statusText,
            item.state[0] === 'ACCEPTED' ? styles.statusTextAccepted : styles.statusTextPending
          ]}>
            {item.state[1]}
          </Text>
        </View>
      </View>

      <View style={styles.clientInfo}>
        <Text style={styles.clientName}>{item.client.name}</Text>
        <Text style={styles.clientRut}>RUT: {item.client.rut}</Text>
      </View>

      <View style={styles.documentFooter}>
        <Text style={styles.documentDate}>{formatDate(item.date)}</Text>
        <View style={styles.actionsContainer}>
          <Text style={styles.amountText}>{formatAmount(item.total)}</Text>
          <View style={styles.actionButtons}>
            <FileText size={18} color="#0066CC" style={styles.actionIcon} />
            <ChevronRight size={20} color="#999" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ventas</Text>
        <TouchableOpacity 
          style={styles.newSaleButton}
          onPress={() => router.push('/sales/new')}
        >
          <PlusCircle size={22} color="#0066CC" />
        </TouchableOpacity>
      </View>
      
      {/* Sales Options Grid */}
      <View style={styles.salesOptionsContainer}>
        <ScrollView 
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.salesOptionsContent}
        >
          {salesOptions.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={styles.optionCard}
              onPress={() => router.push(option.route)}
            >
              <View style={[styles.optionIconContainer, { backgroundColor: option.bgColor }]}>
                {option.icon}
              </View>
              <Text style={styles.optionTitle}>{option.title}</Text>
              <Text style={styles.optionDescription}>
                {option.title === "Quick" ? "Procesamiento rápido" :
                 option.title === "VozPos" ? "Ventas por voz" :
                 option.title === "VisionPos" ? "Escaneo de documentos" :
                 "Documentos electrónicos"}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      {/* Recent Sales Section */}
      <View style={styles.recentSalesContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Últimas Ventas</Text>
          <TouchableOpacity onPress={() => router.push('/sales/history')}>
            <Text style={styles.viewAllText}>Ver todas</Text>
          </TouchableOpacity>
        </View>

        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0066CC" />
            <Text style={styles.loadingText}>Cargando ventas...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <AlertCircle size={48} color="#FF3B30" style={styles.errorIcon} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={fetchSales}
            >
              <Text style={styles.retryButtonText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={documents}
            renderItem={renderItem}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#0066CC']}
                tintColor="#0066CC"
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No hay ventas registradas</Text>
              </View>
            }
          />
        )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingBottom: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  newSaleButton: {
    padding: 8,
  },
  salesOptionsContainer: {
    backgroundColor: '#fff',
    paddingTop: 15,
    paddingBottom: 20,
    marginBottom: 10,
  },
  salesOptionsContent: {
    paddingHorizontal: 15,
  },
  optionCard: {
    width: 150,
    marginRight: 15,
    borderRadius: 12,
    backgroundColor: '#fff',
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  optionIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  recentSalesContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  viewAllText: {
    fontSize: 14,
    color: '#0066CC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  listContainer: {
    padding: 20,
  },
  documentCard: {
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
  documentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  documentType: {
    flex: 1,
    marginRight: 10,
  },
  documentTypeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  documentFolio: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusAccepted: {
    backgroundColor: '#E8F5E9',
  },
  statusPending: {
    backgroundColor: '#FFF3E0',
  },
  statusIcon: {
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  statusTextAccepted: {
    color: '#4CAF50',
  },
  statusTextPending: {
    color: '#FF9800',
  },
  clientInfo: {
    marginBottom: 12,
  },
  clientName: {
    fontSize: 15,
    color: '#333',
    marginBottom: 2,
  },
  clientRut: {
    fontSize: 13,
    color: '#666',
  },
  documentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  documentDate: {
    fontSize: 13,
    color: '#666',
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amountText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0066CC',
    marginRight: 10,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    marginRight: 5,
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
  retryButton: {
    backgroundColor: '#0066CC',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});