import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { 
  View, 
  Text, 
  StyleSheet,
  FlatList, 
  TouchableOpacity, 
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { Search, Filter, Plus, Building2, User, Phone, MapPin, ChevronRight } from 'lucide-react-native';
import Header from '../../../components/Header';
import { api, Client } from '../../../services/api';
import { useTheme } from '../../../context/ThemeContext';

// Lazy load ClientCard component
const ClientCard = lazy(() => import('../../../components/ClientCard'));

// Placeholder component while ClientCard is loading
const ClientCardPlaceholder = () => (
  <View style={styles.clientCardPlaceholder}>
    <ActivityIndicator size="small" color="#0066CC" />
  </View>
);

export default function ClientsScreen() {
  const router = useRouter();
  const { offlineMode } = useTheme();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Debounce search term to avoid making too many API calls
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchQuery);
    }, 500);

    return () => clearTimeout(timerId);
  }, [searchQuery]);

  // Initial load of clients
  const loadClients = useCallback(async (forceRefresh = false) => {
    try {
      setError(null);
      const data = await api.getClients(forceRefresh);
      setClients(data);
    } catch (err) {
      setError('Error al cargar los clientes. Por favor intente nuevamente.');
      Alert.alert(
        'Error',
        'No se pudieron cargar los clientes. ' + (offlineMode ? 'Trabajando en modo offline.' : 'Verifique su conexión.')
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [offlineMode]);

  // Load initial clients
  useEffect(() => {
    loadClients();
  }, [loadClients]);

  // Search clients when debounced search term changes
  useEffect(() => {
    const searchClients = async () => {
      if (debouncedSearchTerm) {
        setIsSearching(true);
        try {
          const data = await api.getClients(true, debouncedSearchTerm);
          setClients(data);
          setError(null);
        } catch (err) {
          setError('Error al buscar clientes. Por favor intente nuevamente.');
          // If search fails, try to use the cached clients and filter them locally
          try {
            const cachedClients = await api.getClients(false);
            const filteredClients = cachedClients.filter(client => 
              client.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
              client.code.includes(debouncedSearchTerm) ||
              client.email?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
              client.municipality?.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
              client.activity?.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
            );
            setClients(filteredClients);
          } catch (cacheErr) {
            // If we can't even get cached clients, show an error
            Alert.alert(
              'Error',
              'No se pudieron buscar los clientes. ' + (offlineMode ? 'Trabajando en modo offline.' : 'Verifique su conexión.')
            );
          }
        } finally {
          setIsSearching(false);
        }
      } else {
        loadClients(false);
      }
    };

    searchClients();
  }, [debouncedSearchTerm, loadClients, offlineMode]);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadClients(true);
  }, [loadClients]);

  const renderItem = ({ item }: { item: Client }) => (
    <Suspense fallback={<ClientCardPlaceholder />}>
      <ClientCard item={item} onPress={() => router.push(`/clients/${item.id}`)} />
    </Suspense>
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Header title="Clientes" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066CC" />
          <Text style={styles.loadingText}>Cargando clientes...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Clientes" />
      
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nombre, RUT o actividad"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {isSearching && (
            <ActivityIndicator size="small" color="#0066CC" style={styles.searchingIndicator} />
          )}
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={20} color="#0066CC" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={styles.createButton}
          onPress={() => router.push('/clients/new')}
        >
          <Plus size={18} color="#fff" style={styles.createButtonIcon} />
          <Text style={styles.createButtonText}>Crear Cliente</Text>
        </TouchableOpacity>
      </View>
      
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => loadClients(true)}
          >
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={clients}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          initialNumToRender={8}
          maxToRenderPerBatch={5}
          windowSize={5}
          refreshControl={
            <RefreshControl 
              refreshing={isRefreshing} 
              onRefresh={onRefresh}
              colors={['#0066CC']}
              tintColor="#0066CC"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {searchQuery 
                  ? 'No se encontraron clientes que coincidan con la búsqueda'
                  : 'No hay clientes registrados'}
              </Text>
            </View>
          }
        />
      )}
      
      <TouchableOpacity 
        style={styles.fabButton}
        onPress={() => router.push('/clients/new')}
      >
        <Plus size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  searchingIndicator: {
    marginLeft: 10
  },
  filterButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  actionsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0066CC',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  createButtonIcon: {
    marginRight: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 20,
  },
  clientCardPlaceholder: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0066CC',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#0066CC',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
});