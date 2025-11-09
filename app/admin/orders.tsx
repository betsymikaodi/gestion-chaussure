import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useAllOrders, useUpdateOrderStatus } from '@/hooks/useOrders';

const statusColors = {
  pending: '#FF9500',
  confirmed: '#007AFF',
  shipped: '#5856D6',
  delivered: '#34C759',
  cancelled: '#FF3B30',
};

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function AdminOrdersScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  const { data: orders, isLoading } = useAllOrders();
  const updateStatus = useUpdateOrderStatus();

  const handleStatusChange = (orderId: string, currentStatus: string) => {
    Alert.alert(
      'Update Order Status',
      'Select new status',
      statusOptions.map((option) => ({
        text: option.label,
        onPress: () => {
          if (option.value !== currentStatus) {
            updateStatus.mutate(
              { orderId, status: option.value as any },
              {
                onSuccess: () => {
                  Alert.alert('Success', 'Order status updated');
                },
              }
            );
          }
        },
      })).concat([{ text: 'Cancel', style: 'cancel' }])
    );
  };

  if (!profile?.is_admin) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Access Denied</Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.title}>Manage Orders</Text>
        <View style={styles.placeholder} />
      </View>

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.orderCard}>
            <TouchableOpacity
              onPress={() => router.push(`/order/${item.id}`)}
              style={styles.orderInfo}
            >
              <View>
                <Text style={styles.orderNumber}>{item.order_number}</Text>
                <Text style={styles.orderDate}>
                  {new Date(item.created_at).toLocaleString()}
                </Text>
                <Text style={styles.customerEmail}>
                  {(item as any).profiles?.email || 'N/A'}
                </Text>
              </View>
              <View style={styles.orderRight}>
                <Text style={styles.orderAmount}>
                  ${item.total_amount.toFixed(2)}
                </Text>
                <Text style={styles.itemCount}>
                  {item.items.length} items
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.statusButton,
                { backgroundColor: statusColors[item.status] },
              ]}
              onPress={() => handleStatusChange(item.id, item.status)}
            >
              <Text style={styles.statusText}>{item.status}</Text>
            </TouchableOpacity>
          </View>
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    width: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
  },
  placeholder: {
    width: 40,
  },
  listContent: {
    padding: 20,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  orderInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 13,
    color: '#8E8E93',
    marginBottom: 2,
  },
  customerEmail: {
    fontSize: 13,
    color: '#8E8E93',
  },
  orderRight: {
    alignItems: 'flex-end',
  },
  orderAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#007AFF',
    marginBottom: 4,
  },
  itemCount: {
    fontSize: 13,
    color: '#8E8E93',
  },
  statusButton: {
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
  },
});
