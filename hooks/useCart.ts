import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export interface CartItemWithProduct {
  id: string;
  product_id: string;
  size: number;
  color: string;
  quantity: number;
  product: {
    name: string;
    brand: string;
    price: number;
    images: string[];
  };
}

export function useCart() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: cartItems, isLoading } = useQuery({
    queryKey: ['cart', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('cart_items')
        .select(
          `
          *,
          product:products(name, brand, price, images)
        `
        )
        .eq('user_id', user.id);

      if (error) throw error;
      return data as unknown as CartItemWithProduct[];
    },
    enabled: !!user,
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      if (quantity <= 0) {
        const { error } = await supabase.from('cart_items').delete().eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity })
          .eq('id', id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('cart_items').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const clearCartMutation = useMutation({
    mutationFn: async () => {
      if (!user) return;
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const total =
    cartItems?.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    ) || 0;

  return {
    cartItems: cartItems || [],
    isLoading,
    total,
    updateQuantity: updateQuantityMutation.mutate,
    removeItem: removeItemMutation.mutate,
    clearCart: clearCartMutation.mutate,
  };
}
