import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Package, ShoppingBag, DollarSign, TrendingUp } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useAllOrders } from '@/hooks/useOrders';
import { useProducts } from '@/hooks/useProducts';
import { Button } from '@/components/ui/Button';

export default function AdminDashboardScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  const { data: orders, isLoading: ordersLoading } = useAllOrders();
  const { data: products, isLoading: productsLoading } = useProducts();

  if (!profile?.is_admin) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Access Denied</Text>
          <Text style={styles.errorSubtext}>Admin access required</Text>
          <Button
            title="Go Back"
            onPress={() => router.back()}
            style={styles.backButtonAlt}
          />
        </View>
      </View>
    );
  }

  if (ordersLoading || productsLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  const totalRevenue = orders?.reduce((sum, order) => sum + order.total_amount, 0) || 0;
  const pendingOrders = orders?.filter(order => order.status === 'pending').length || 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.title}>Admin Dashboard</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#E5F2FF' }]}>
              <ShoppingBag size={24} color="#007AFF" />
            </View>
            <Text style={styles.statValue}>{orders?.length || 0}</Text>
            <Text style={styles.statLabel}>Total Orders</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#FFF4E5' }]}>
              <Package size={24} color="#FF9500" />
            </View>
            <Text style={styles.statValue}>{pendingOrders}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#E5FFE5' }]}>
              <DollarSign size={24} color="#34C759" />
            </View>
            <Text style={styles.statValue}>${totalRevenue.toFixed(0)}</Text>
            <Text style={styles.statLabel}>Revenue</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#F2E5FF' }]}>
              <TrendingUp size={24} color="#5856D6" />
            </View>
            <Text style={styles.statValue}>{products?.length || 0}</Text>
            <Text style={styles.statLabel}>Products</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/admin/products')}
          >
            <View style={styles.actionIcon}>
              <Package size={20} color="#007AFF" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Manage Products</Text>
              <Text style={styles.actionSubtitle}>Add, edit, or remove products</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/admin/orders')}
          >
            <View style={styles.actionIcon}>
              <ShoppingBag size={20} color="#007AFF" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Manage Orders</Text>
              <Text style={styles.actionSubtitle}>View and update order status</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Orders</Text>
          {orders?.slice(0, 5).map((order) => (
            <TouchableOpacity
              key={order.id}
              style={styles.orderItem}
              onPress={() => router.push(`/order/${order.id}`)}
            >
              <View>
                <Text style={styles.orderNumber}>{order.order_number}</Text>
                <Text style={styles.orderDate}>
                  {new Date(order.created_at).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.orderRight}>
                <Text style={styles.orderAmount}>
                  ${order.total_amount.toFixed(2)}
                </Text>
                <View style={[styles.orderStatus, getStatusStyle(order.status)]}>
                  <Text style={styles.orderStatusText}>{order.status}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function getStatusStyle(status: string) {
  const styles = {
    pending: { backgroundColor: '#FFF4E5' },
    confirmed: { backgroundColor: '#E5F2FF' },
    shipped: { backgroundColor: '#F2E5FF' },
    delivered: { backgroundColor: '#E5FFE5' },
    cancelled: { backgroundColor: '#FFE5E5' },
  };
  return styles[status as keyof typeof styles] || styles.pending;
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
    padding: 40,
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 12,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    width: '47%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
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
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    marginBottom: 12,
  },
  actionIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#E5F2FF',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 13,
    color: '#8E8E93',
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  orderNumber: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 13,
    color: '#8E8E93',
  },
  orderRight: {
    alignItems: 'flex-end',
  },
  orderAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#007AFF',
    marginBottom: 6,
  },
  orderStatus: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  orderStatusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#000000',
    textTransform: 'capitalize',
  },
  errorText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FF3B30',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 32,
  },
  backButtonAlt: {
    paddingHorizontal: 40,
  },
});
