import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
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

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data as Order;
    },
  });

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Order not found</Text>
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
        <Text style={styles.title}>Order Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.statusSection}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusColors[order.status] },
            ]}
          >
            <Text style={styles.statusText}>{statusLabels[order.status]}</Text>
          </View>
          <Text style={styles.orderNumber}>{order.order_number}</Text>
          <Text style={styles.orderDate}>
            Placed on {new Date(order.created_at).toLocaleString()}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items</Text>
          {order.items.map((item, index) => (
            <View key={index} style={styles.itemCard}>
              <Image source={{ uri: item.image }} style={styles.itemImage} />
              <View style={styles.itemInfo}>
                <Text style={styles.itemBrand}>{item.brand}</Text>
                <Text style={styles.itemName} numberOfLines={2}>
                  {item.product_name}
                </Text>
                <Text style={styles.itemDetails}>
                  Size: {item.size} | Color: {item.color}
                </Text>
                <View style={styles.itemFooter}>
                  <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
                  <Text style={styles.itemPrice}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shipping Address</Text>
          <View style={styles.addressBox}>
            <Text style={styles.addressText}>
              {order.shipping_address.street}
            </Text>
            <Text style={styles.addressText}>
              {order.shipping_address.city},{' '}
              {order.shipping_address.postal_code}
            </Text>
            <Text style={styles.addressText}>
              {order.shipping_address.country}
            </Text>
          </View>
        </View>

        <View style={styles.totalSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>
              ${order.total_amount.toFixed(2)}
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Shipping</Text>
            <Text style={styles.totalValue}>$0.00</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.grandTotalLabel}>Total</Text>
            <Text style={styles.grandTotalValue}>
              ${order.total_amount.toFixed(2)}
            </Text>
          </View>
        </View>
      </ScrollView>
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
  content: {
    flex: 1,
  },
  statusSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    alignItems: 'center',
    marginTop: 12,
  },
  statusBadge: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 16,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  orderNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
    color: '#8E8E93',
  },
  section: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 16,
  },
  itemCard: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#F2F2F7',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemBrand: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8E8E93',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 6,
  },
  itemDetails: {
    fontSize: 13,
    color: '#8E8E93',
    marginBottom: 8,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemQuantity: {
    fontSize: 13,
    color: '#8E8E93',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#007AFF',
  },
  addressBox: {
    backgroundColor: '#F2F2F7',
    padding: 16,
    borderRadius: 12,
  },
  addressText: {
    fontSize: 15,
    color: '#000000',
    marginBottom: 4,
  },
  totalSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginTop: 12,
    marginBottom: 20,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 16,
    color: '#000000',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5EA',
    marginVertical: 12,
  },
  grandTotalLabel: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
  },
  grandTotalValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#007AFF',
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
  },
});
