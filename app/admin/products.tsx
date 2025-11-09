import React, { useState } from 'react';
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
import { ArrowLeft, Plus, Edit, Trash2 } from 'lucide-react-native';
import { ProductCard } from '@/components/ProductCard';
import { Button } from '@/components/ui/Button';
import { useProducts } from '@/hooks/useProducts';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function AdminProductsScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  const { data: products, isLoading } = useProducts();
  const queryClient = useQueryClient();

  const deleteProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      const { error } = await supabase.from('products').delete().eq('id', productId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      Alert.alert('Success', 'Product deleted successfully');
    },
    onError: (error: any) => {
      Alert.alert('Error', error.message || 'Failed to delete product');
    },
  });

  const handleDelete = (productId: string, productName: string) => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete "${productName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteProductMutation.mutate(productId),
        },
      ]
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
        <Text style={styles.title}>Manage Products</Text>
        <TouchableOpacity
          onPress={() => router.push('/admin/product-form')}
          style={styles.addButton}
        >
          <Plus size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.productWrapper}>
            <ProductCard
              product={item}
              onPress={() => router.push(`/product/${item.id}`)}
            />
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.editButton]}
                onPress={() => router.push(`/admin/product-form?id=${item.id}`)}
              >
                <Edit size={16} color="#007AFF" />
                <Text style={styles.editText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => handleDelete(item.id, item.name)}
              >
                <Trash2 size={16} color="#FF3B30" />
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
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
  addButton: {
    width: 40,
    alignItems: 'flex-end',
  },
  listContent: {
    padding: 20,
  },
  productWrapper: {
    marginBottom: 0,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  editButton: {
    backgroundColor: '#E5F2FF',
  },
  deleteButton: {
    backgroundColor: '#FFE5E5',
  },
  editText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  deleteText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF3B30',
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
  },
});
