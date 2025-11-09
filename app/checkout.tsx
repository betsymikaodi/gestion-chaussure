import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export default function CheckoutScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { cartItems, total, clearCart } = useCart();
  const [loading, setLoading] = useState(false);

  const handlePlaceOrder = async () => {
    if (!user || !cartItems.length) return;

    try {
      setLoading(true);

      const orderNumber = `ORD-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)
        .toUpperCase()}`;

      const orderItems = cartItems.map((item) => ({
        product_id: item.product_id,
        product_name: item.product.name,
        brand: item.product.brand,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        price: item.product.price,
        image: item.product.images[0],
      }));

      const shippingAddress = {
        street: '123 Main St',
        city: 'Sample City',
        postal_code: '12345',
        country: 'US',
      };

      const { error } = await supabase.from('orders').insert({
        user_id: user.id,
        order_number: orderNumber,
        status: 'pending',
        items: orderItems,
        total_amount: total,
        shipping_address: shippingAddress,
      });

      if (error) throw error;

      await clearCart();

      Alert.alert(
        'Order Placed!',
        `Your order ${orderNumber} has been placed successfully.`,
        [{ text: 'View Orders', onPress: () => router.replace('/(tabs)/orders') }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.title}>Checkout</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          {cartItems.map((item) => (
            <View key={item.id} style={styles.orderItem}>
              <Text style={styles.itemName}>
                {item.product.brand} - {item.product.name}
              </Text>
              <Text style={styles.itemDetails}>
                Size: {item.size} | Color: {item.color} | Qty: {item.quantity}
              </Text>
              <Text style={styles.itemPrice}>
                ${(item.product.price * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shipping Address</Text>
          <View style={styles.addressBox}>
            <Text style={styles.addressText}>123 Main St</Text>
            <Text style={styles.addressText}>Sample City, 12345</Text>
            <Text style={styles.addressText}>United States</Text>
          </View>
          <Text style={styles.note}>
            Note: Address management will be available in your profile
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.paymentBox}>
            <Text style={styles.paymentText}>Cash on Delivery</Text>
          </View>
          <Text style={styles.note}>
            Stripe integration instructions available in documentation
          </Text>
        </View>

        <View style={styles.totalSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Shipping</Text>
            <Text style={styles.totalValue}>$0.00</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.grandTotalLabel}>Total</Text>
            <Text style={styles.grandTotalValue}>${total.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Place Order"
          onPress={handlePlaceOrder}
          loading={loading}
          style={styles.placeOrderButton}
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
  orderItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  itemDetails: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
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
    marginBottom: 8,
  },
  addressText: {
    fontSize: 15,
    color: '#000000',
    marginBottom: 4,
  },
  paymentBox: {
    backgroundColor: '#F2F2F7',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  paymentText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
  },
  note: {
    fontSize: 13,
    color: '#8E8E93',
    fontStyle: 'italic',
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
  footer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  placeOrderButton: {
    width: '100%',
  },
});
