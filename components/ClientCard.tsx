import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Building2, User, Phone, MapPin, ChevronRight } from 'lucide-react-native';
import { Client } from '../services/api';

interface ClientCardProps {
  item: Client;
  onPress: () => void;
}

export default function ClientCard({ item, onPress }: ClientCardProps) {
  return (
    <TouchableOpacity 
      style={styles.clientCard}
      onPress={onPress}
    >
      <View style={[
        styles.clientIconContainer, 
        { backgroundColor: item.line?.toLowerCase().includes('empresa') ? '#E3F2FD' : '#F3E5F5' }
      ]}>
        {item.line?.toLowerCase().includes('empresa') ? (
          <Building2 size={24} color="#0066CC" />
        ) : (
          <User size={24} color="#9C27B0" />
        )}
      </View>
      
      <View style={styles.clientInfo}>
        <Text style={styles.clientName}>{item.name}</Text>
        <Text style={styles.clientId}>RUT: {item.code}</Text>
        
        {item.activity && (
          <Text style={styles.clientActivity} numberOfLines={1}>
            {item.activity.name}
          </Text>
        )}
        
        <View style={styles.clientDetails}>
          {item.email && (
            <View style={styles.detailItem}>
              <Phone size={14} color="#666" />
              <Text style={styles.detailText}>{item.email}</Text>
            </View>
          )}
          
          {(item.address || item.municipality) && (
            <View style={styles.detailItem}>
              <MapPin size={14} color="#666" />
              <Text style={styles.detailText} numberOfLines={1}>
                {item.address}
                {item.municipality && `, ${item.municipality.name}`}
              </Text>
            </View>
          )}
        </View>
      </View>
      
      <ChevronRight size={20} color="#999" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  clientCard: {
    flexDirection: 'row',
    alignItems: 'center',
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
  clientIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  clientId: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  clientActivity: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  clientDetails: {
    gap: 5,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
  },
});