import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, ShoppingCart } from 'lucide-react-native';
import { useProduct } from '@/hooks/useProducts';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { data: product, isLoading } = useProduct(id!);

  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);

  const handleAddToCart = async () => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to add items to cart', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign In', onPress: () => router.push('/(auth)/login') },
      ]);
      return;
    }

    if (!selectedSize || !selectedColor) {
      Alert.alert('Selection Required', 'Please select size and color');
      return;
    }

    try {
      setAddingToCart(true);

      const { data: existingItem } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('product_id', id)
        .eq('size', selectedSize)
        .eq('color', selectedColor)
        .maybeSingle();

      if (existingItem) {
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: existingItem.quantity + 1 })
          .eq('id', existingItem.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('cart_items').insert({
          user_id: user.id,
          product_id: id!,
          size: selectedSize,
          color: selectedColor,
          quantity: 1,
        });

        if (error) throw error;
      }

      Alert.alert('Success', 'Item added to cart!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Product not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <ArrowLeft size={24} color="#000000" />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={(e) => {
            const index = Math.round(e.nativeEvent.contentOffset.x / width);
            setCurrentImageIndex(index);
          }}
          scrollEventThrottle={16}
        >
          {product.images.map((image, index) => (
            <Image
              key={index}
              source={{ uri: image }}
              style={styles.productImage}
            />
          ))}
        </ScrollView>

        <View style={styles.pagination}>
          {product.images.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                index === currentImageIndex && styles.paginationDotActive,
              ]}
            />
          ))}
        </View>

        <View style={styles.content}>
          <Text style={styles.brand}>{product.brand}</Text>
          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.price}>${product.price.toFixed(2)}</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{product.description}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Size</Text>
            <View style={styles.sizeContainer}>
              {product.sizes.map((size) => (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.sizeButton,
                    selectedSize === size && styles.sizeButtonSelected,
                  ]}
                  onPress={() => setSelectedSize(size)}
                >
                  <Text
                    style={[
                      styles.sizeText,
                      selectedSize === size && styles.sizeTextSelected,
                    ]}
                  >
                    {size}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Color</Text>
            <View style={styles.colorContainer}>
              {product.colors.map((color, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.colorButton,
                    selectedColor === color && styles.colorButtonSelected,
                  ]}
                  onPress={() => setSelectedColor(color)}
                >
                  <View
                    style={[styles.colorCircle, { backgroundColor: color }]}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Add to Cart"
          onPress={handleAddToCart}
          loading={addingToCart}
          style={styles.addButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: width,
    height: width,
    backgroundColor: '#F2F2F7',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 6,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E5EA',
  },
  paginationDotActive: {
    backgroundColor: '#007AFF',
    width: 24,
  },
  content: {
    padding: 20,
  },
  brand: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 12,
  },
  price: {
    fontSize: 28,
    fontWeight: '700',
    color: '#007AFF',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: '#3C3C43',
    lineHeight: 22,
  },
  sizeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  sizeButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E5EA',
    backgroundColor: '#FFFFFF',
  },
  sizeButtonSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF',
  },
  sizeText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
  },
  sizeTextSelected: {
    color: '#FFFFFF',
  },
  colorContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  colorButton: {
    padding: 4,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorButtonSelected: {
    borderColor: '#007AFF',
  },
  colorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    backgroundColor: '#FFFFFF',
  },
  addButton: {
    width: '100%',
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
  },
});
