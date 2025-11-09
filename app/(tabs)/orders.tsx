import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Package } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { useOrders } from '@/hooks/useOrders';
import { useAuth } from '@/contexts/AuthContext';
import { Order } from '@/types/database.types';

const statusColors = {
  pending: '#FF9500',
  confirmed: '#007AFF',
  shipped: '#5856D6',
  delivered: '#34C759',
  cancelled: '#FF3B30',
};

const statusLabels = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

function OrderCard({ order }: { order: Order }) {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => router.push(`/order/${order.id}`)}
    >
      <View style={styles.orderHeader}>
        <View>
          <Text style={styles.orderNumber}>{order.order_number}</Text>
          <Text style={styles.orderDate}>
            {new Date(order.created_at).toLocaleDateString()}
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: statusColors[order.status] },
          ]}
        >
          <Text style={styles.statusText}>{statusLabels[order.status]}</Text>
        </View>
      </View>
      <View style={styles.orderDetails}>
        <Text style={styles.itemCount}>
          {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
        </Text>
        <Text style={styles.orderTotal}>${order.total_amount.toFixed(2)}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function OrdersScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: orders, isLoading } = useOrders();

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Package size={64} color="#C7C7CC" />
          <Text style={styles.emptyTitle}>Sign In Required</Text>
          <Text style={styles.emptyText}>
            Please sign in to view your orders
          </Text>
          <Button
            title="Sign In"
            onPress={() => router.push('/(auth)/login')}
            style={styles.emptyButton}
          />
        </View>
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

  if (!orders || orders.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>My Orders</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Package size={64} color="#C7C7CC" />
          <Text style={styles.emptyTitle}>No orders yet</Text>
          <Text style={styles.emptyText}>
            Start shopping and your orders will appear here
          </Text>
          <Button
            title="Browse Products"
            onPress={() => router.push('/(tabs)')}
            style={styles.emptyButton}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Orders</Text>
        <Text style={styles.subtitle}>
          {orders.length} {orders.length === 1 ? 'order' : 'orders'}
        </Text>
      </View>

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <OrderCard order={item} />}
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
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
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
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
    color: '#8E8E93',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemCount: {
    fontSize: 14,
    color: '#8E8E93',
  },
  orderTotal: {
    fontSize: 20,
    fontWeight: '700',
    color: '#007AFF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginTop: 24,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 32,
  },
  emptyButton: {
    paddingHorizontal: 40,
  },
});
