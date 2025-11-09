import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Product } from '@/types/database.types';

interface ProductCardProps {
  product: Product;
  onPress: () => void;
}

export function ProductCard({ product, onPress }: ProductCardProps) {
  const firstImage = product.images[0] || 'https://via.placeholder.com/300';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <Image source={{ uri: firstImage }} style={styles.image} />
      <View style={styles.content}>
        <Text style={styles.brand}>{product.brand}</Text>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        <View style={styles.footer}>
          <Text style={styles.price}>${product.price.toFixed(2)}</Text>
          <View style={styles.colors}>
            {product.colors.slice(0, 3).map((color, index) => (
              <View
                key={index}
                style={[styles.colorDot, { backgroundColor: color }]}
              />
            ))}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: 200,
    backgroundColor: '#F2F2F7',
  },
  content: {
    padding: 12,
  },
  brand: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: '#007AFF',
  },
  colors: {
    flexDirection: 'row',
    gap: 6,
  },
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
});
