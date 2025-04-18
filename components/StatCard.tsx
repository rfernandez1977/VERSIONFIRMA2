import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StatCardProps {
  title: string;
  value: string;
  trend?: number;
  icon: React.ReactNode;
}

export default function StatCard({ title, value, trend, icon }: StatCardProps) {
  // Determine colors based on trend
  const trendColor = trend && trend > 0 ? '#4CAF50' : trend && trend < 0 ? '#FF3B30' : '#999';
  const formattedTrend = trend ? (trend > 0 ? `+${trend}` : trend) + '%' : null;
  
  return (
    <View style={styles.card}>
      <View style={styles.iconContainer}>
        {icon}
      </View>
      <Text style={styles.value}>{value}</Text>
      {trend !== undefined && (
        <View style={styles.trendContainer}>
          <Text style={[styles.trendText, { color: trendColor }]}>
            {formattedTrend}
          </Text>
        </View>
      )}
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    marginBottom: 8,
  },
  value: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  trendContainer: {
    marginBottom: 4,
  },
  trendText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});