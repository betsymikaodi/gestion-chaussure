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
import { ShoppingBag } from 'lucide-react-native';
import { CartItemCard } from '@/components/CartItemCard';
import { Button } from '@/components/ui/Button';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/contexts/AuthContext';

export default function CartScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { cartItems, isLoading, total, updateQuantity, removeItem } = useCart();

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <ShoppingBag size={64} color="#C7C7CC" />
          <Text style={styles.emptyTitle}>Sign In Required</Text>
          <Text style={styles.emptyText}>
            Please sign in to view your cart
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

  if (!cartItems || cartItems.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>My Cart</Text>
        </View>
        <View style={styles.emptyContainer}>
          <ShoppingBag size={64} color="#C7C7CC" />
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptyText}>
            Start adding some shoes to your cart
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
        <Text style={styles.title}>My Cart</Text>
        <Text style={styles.itemCount}>
          {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
        </Text>
      </View>

      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CartItemCard
            item={item}
            onUpdateQuantity={updateQuantity}
            onRemove={removeItem}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.footer}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>${total.toFixed(2)}</Text>
        </View>
        <Button
          title="Proceed to Checkout"
          onPress={() => router.push('/checkout')}
          style={styles.checkoutButton}
        />
      </View>
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
  itemCount: {
    fontSize: 16,
    color: '#8E8E93',
  },
  listContent: {
    padding: 20,
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
  footer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  totalAmount: {
    fontSize: 28,
    fontWeight: '700',
    color: '#007AFF',
  },
  checkoutButton: {
    width: '100%',
  },
});
