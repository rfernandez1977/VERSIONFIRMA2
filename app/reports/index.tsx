import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Dimensions, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, ChartBar as BarChart3, ChartPie as PieChart, ChartLine as LineChart, TrendingUp, Download, Calendar, Filter, RefreshCw } from 'lucide-react-native';
import { LineChart as RNLineChart } from 'react-native-chart-kit';

// Get screen width for responsive chart
const screenWidth = Dimensions.get('window').width - 40;

// Generate random sales data for the last 7 days
const generateDailySalesData = () => {
  const data = [];
  const labels = [];
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    
    // Format date as day/month
    const day = date.getDate();
    const month = date.getMonth() + 1;
    labels.push(`${day}/${month}`);
    
    // Generate random sales amount between 500 and 3000
    const salesAmount = Math.floor(Math.random() * 2500) + 500;
    data.push(salesAmount);
  }
  
  return { data, labels };
};

export default function ReportsScreen() {
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [isLoading, setIsLoading] = useState(true);
  const [salesData, setSalesData] = useState({ data: [], labels: [] });
  
  // Load sales data on mount
  useEffect(() => {
    loadSalesData();
  }, []);
  
  // Load sales data based on selected period
  const loadSalesData = () => {
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const newData = generateDailySalesData();
      setSalesData(newData);
      setIsLoading(false);
    }, 1000);
  };
  
  // Refresh data
  const handleRefresh = () => {
    loadSalesData();
  };
  
  // Calculate total sales
  const calculateTotalSales = () => {
    return salesData.data.reduce((sum, value) => sum + value, 0);
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
        <Text style={styles.headerTitle}>Reportes</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={20} color="#666" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.periodSelector}>
        <TouchableOpacity 
          style={[styles.periodOption, selectedPeriod === 'day' && styles.periodSelected]}
          onPress={() => setSelectedPeriod('day')}
        >
          <Text style={[styles.periodText, selectedPeriod === 'day' && styles.periodTextSelected]}>Día</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.periodOption, selectedPeriod === 'week' && styles.periodSelected]}
          onPress={() => setSelectedPeriod('week')}
        >
          <Text style={[styles.periodText, selectedPeriod === 'week' && styles.periodTextSelected]}>Semana</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.periodOption, selectedPeriod === 'month' && styles.periodSelected]}
          onPress={() => setSelectedPeriod('month')}
        >
          <Text style={[styles.periodText, selectedPeriod === 'month' && styles.periodTextSelected]}>Mes</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.periodOption, selectedPeriod === 'year' && styles.periodSelected]}
          onPress={() => setSelectedPeriod('year')}
        >
          <Text style={[styles.periodText, selectedPeriod === 'year' && styles.periodTextSelected]}>Año</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.periodOption, selectedPeriod === 'custom' && styles.periodSelected]}
          onPress={() => setSelectedPeriod('custom')}
        >
          <Calendar size={16} color={selectedPeriod === 'custom' ? "#0066CC" : "#666"} />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.summaryContainer}>
          <Text style={styles.sectionTitle}>Resumen de Ventas</Text>
          <View style={styles.summaryCards}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryValue}>S/ {calculateTotalSales().toLocaleString()}</Text>
              <Text style={styles.summaryLabel}>Ventas Totales</Text>
              <View style={styles.trendContainer}>
                <TrendingUp size={14} color="#4CAF50" />
                <Text style={styles.trendText}>+15%</Text>
              </View>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryValue}>87</Text>
              <Text style={styles.summaryLabel}>Documentos</Text>
              <View style={styles.trendContainer}>
                <TrendingUp size={14} color="#4CAF50" />
                <Text style={styles.trendText}>+8%</Text>
              </View>
            </View>
          </View>
        </View>
        
        <View style={styles.chartContainer}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Ventas por Día</Text>
            <View style={styles.chartActions}>
              <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
                <RefreshCw size={16} color="#0066CC" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.downloadButton}>
                <Download size={16} color="#0066CC" />
              </TouchableOpacity>
            </View>
          </View>
          
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0066CC" />
              <Text style={styles.loadingText}>Cargando datos...</Text>
            </View>
          ) : (
            <View style={styles.chartWrapper}>
              <RNLineChart
                data={{
                  labels: salesData.labels,
                  datasets: [
                    {
                      data: salesData.data,
                      color: (opacity = 1) => `rgba(0, 102, 204, ${opacity})`,
                      strokeWidth: 2
                    }
                  ],
                  legend: ["Ventas diarias"]
                }}
                width={screenWidth}
                height={220}
                chartConfig={{
                  backgroundColor: "#fff",
                  backgroundGradientFrom: "#fff",
                  backgroundGradientTo: "#fff",
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(0, 102, 204, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(102, 102, 102, ${opacity})`,
                  style: {
                    borderRadius: 16
                  },
                  propsForDots: {
                    r: "6",
                    strokeWidth: "2",
                    stroke: "#0066CC"
                  }
                }}
                bezier
                style={{
                  marginVertical: 8,
                  borderRadius: 16
                }}
                fromZero
                yAxisSuffix=" S/"
                yAxisInterval={1}
                formatYLabel={(value) => {
                  const num = parseInt(value);
                  if (num >= 1000) {
                    return (num / 1000).toFixed(0) + 'k';
                  }
                  return value;
                }}
              />
              
              <View style={styles.chartLegend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: '#0066CC' }]} />
                  <Text style={styles.legendText}>Ventas diarias</Text>
                </View>
              </View>
              
              <View style={styles.chartStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Promedio</Text>
                  <Text style={styles.statValue}>
                    S/ {(calculateTotalSales() / salesData.data.length).toFixed(2)}
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Máximo</Text>
                  <Text style={styles.statValue}>
                    S/ {Math.max(...salesData.data).toLocaleString()}
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Mínimo</Text>
                  <Text style={styles.statValue}>
                    S/ {Math.min(...salesData.data).toLocaleString()}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>
        
        <View style={styles.chartContainer}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Ventas por Categoría</Text>
            <TouchableOpacity style={styles.downloadButton}>
              <Download size={16} color="#0066CC" />
            </TouchableOpacity>
          </View>
          <View style={styles.chartPlaceholder}>
            <PieChart size={40} color="#ccc" />
            <Text style={styles.chartPlaceholderText}>Gráfico de ventas por categoría</Text>
          </View>
        </View>
        
        <View style={styles.chartContainer}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Productos Más Vendidos</Text>
            <TouchableOpacity style={styles.downloadButton}>
              <Download size={16} color="#0066CC" />
            </TouchableOpacity>
          </View>
          <View style={styles.chartPlaceholder}>
            <BarChart3 size={40} color="#ccc" />
            <Text style={styles.chartPlaceholderText}>Gráfico de productos más vendidos</Text>
          </View>
        </View>
        
        <View style={styles.reportsList}>
          <Text style={styles.sectionTitle}>Informes Disponibles</Text>
          
          <TouchableOpacity style={styles.reportItem}>
            <View style={styles.reportIconContainer}>
              <BarChart3 size={24} color="#0066CC" />
            </View>
            <View style={styles.reportInfo}>
              <Text style={styles.reportTitle}>Ventas por Cliente</Text>
              <Text style={styles.reportDescription}>Análisis detallado de ventas por cliente</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.reportItem}>
            <View style={styles.reportIconContainer}>
              <PieChart size={24} color="#4CAF50" />
            </View>
            <View style={styles.reportInfo}>
              <Text style={styles.reportTitle}>Ventas por Producto</Text>
              <Text style={styles.reportDescription}>Análisis de productos más vendidos</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.reportItem}>
            <View style={styles.reportIconContainer}>
              <LineChart size={24} color="#FF9800" />
            </View>
            <View style={styles.reportInfo}>
              <Text style={styles.reportTitle}>Tendencias de Ventas</Text>
              <Text style={styles.reportDescription}>Análisis de tendencias por período</Text>
            </View>
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  filterButton: {
    padding: 5,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  periodOption: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
  },
  periodSelected: {
    backgroundColor: '#E3F2FD',
  },
  periodText: {
    fontSize: 14,
    color: '#666',
  },
  periodTextSelected: {
    color: '#0066CC',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  summaryContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  summaryCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendText: {
    fontSize: 12,
    color: '#4CAF50',
    marginLeft: 4,
    fontWeight: 'bold',
  },
  chartContainer: {
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
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  chartActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  refreshButton: {
    padding: 5,
    marginRight: 10,
  },
  downloadButton: {
    padding: 5,
  },
  chartPlaceholder: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  chartPlaceholderText: {
    marginTop: 10,
    fontSize: 14,
    color: '#999',
  },
  loadingContainer: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  chartWrapper: {
    alignItems: 'center',
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 5,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  chartStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  reportsList: {
    marginBottom: 20,
  },
  reportItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  reportIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  reportInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  reportDescription: {
    fontSize: 14,
    color: '#666',
  },
});