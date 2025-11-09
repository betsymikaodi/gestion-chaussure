import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Product } from '@/types/database.types';

export interface ProductFilters {
  search?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  size?: number;
  category?: string;
}

export function useProducts(filters: ProductFilters = {}) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      let query = supabase.from('products').select('*');

      if (filters.search) {
        query = query.or(
          `name.ilike.%${filters.search}%,brand.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
        );
      }

      if (filters.brand) {
        query = query.eq('brand', filters.brand);
      }

      if (filters.minPrice !== undefined) {
        query = query.gte('price', filters.minPrice);
      }

      if (filters.maxPrice !== undefined) {
        query = query.lte('price', filters.maxPrice);
      }

      if (filters.size) {
        query = query.contains('sizes', [filters.size]);
      }

      if (filters.category) {
        query = query.contains('categories', [filters.category]);
      }

      const { data, error } = await query.order('created_at', {
        ascending: false,
      });

      if (error) throw error;
      return data as Product[];
    },
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data as Product;
    },
    enabled: !!id,
  });
}
