import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Minus, Plus, Trash2 } from 'lucide-react-native';

interface CartItemCardProps {
  item: {
    id: string;
    product: {
      name: string;
      brand: string;
      price: number;
      images: string[];
    };
    size: number;
    color: string;
    quantity: number;
  };
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}

export function CartItemCard({
  item,
  onUpdateQuantity,
  onRemove,
}: CartItemCardProps) {
  const image = item.product.images[0] || 'https://via.placeholder.com/100';
  const total = item.product.price * item.quantity;

  return (
    <View style={styles.card}>
      <Image source={{ uri: image }} style={styles.image} />
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.info}>
            <Text style={styles.brand}>{item.product.brand}</Text>
            <Text style={styles.name} numberOfLines={2}>
              {item.product.name}
            </Text>
            <View style={styles.details}>
              <Text style={styles.detail}>Size: {item.size}</Text>
              <View
                style={[styles.colorDot, { backgroundColor: item.color }]}
              />
            </View>
          </View>
          <TouchableOpacity
            onPress={() => onRemove(item.id)}
            style={styles.deleteButton}
          >
            <Trash2 size={20} color="#FF3B30" />
          </TouchableOpacity>
        </View>
        <View style={styles.footer}>
          <View style={styles.quantityControl}>
            <TouchableOpacity
              onPress={() => onUpdateQuantity(item.id, item.quantity - 1)}
              disabled={item.quantity <= 1}
              style={[
                styles.quantityButton,
                item.quantity <= 1 && styles.quantityButtonDisabled,
              ]}
            >
              <Minus size={16} color={item.quantity <= 1 ? '#C7C7CC' : '#000'} />
            </TouchableOpacity>
            <Text style={styles.quantity}>{item.quantity}</Text>
            <TouchableOpacity
              onPress={() => onUpdateQuantity(item.id, item.quantity + 1)}
              style={styles.quantityButton}
            >
              <Plus size={16} color="#000" />
            </TouchableOpacity>
          </View>
          <Text style={styles.price}>${total.toFixed(2)}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: '#F2F2F7',
  },
  content: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  info: {
    flex: 1,
  },
  brand: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8E8E93',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 6,
  },
  details: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detail: {
    fontSize: 13,
    color: '#8E8E93',
  },
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  deleteButton: {
    padding: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  quantityButton: {
    padding: 4,
  },
  quantityButtonDisabled: {
    opacity: 0.3,
  },
  quantity: {
    fontSize: 15,
    fontWeight: '600',
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: 'center',
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: '#007AFF',
  },
});
