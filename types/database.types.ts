export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          phone: string | null;
          is_admin: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          phone?: string | null;
          is_admin?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          phone?: string | null;
          is_admin?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      addresses: {
        Row: {
          id: string;
          user_id: string;
          label: string;
          street: string;
          city: string;
          state: string | null;
          postal_code: string;
          country: string;
          is_default: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          label: string;
          street: string;
          city: string;
          state?: string | null;
          postal_code: string;
          country: string;
          is_default?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          label?: string;
          street?: string;
          city?: string;
          state?: string | null;
          postal_code?: string;
          country?: string;
          is_default?: boolean;
          created_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          brand: string;
          price: number;
          images: string[];
          sizes: number[];
          colors: string[];
          stock_by_size: Record<string, number>;
          categories: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          brand: string;
          price: number;
          images?: string[];
          sizes?: number[];
          colors?: string[];
          stock_by_size?: Record<string, number>;
          categories?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          brand?: string;
          price?: number;
          images?: string[];
          sizes?: number[];
          colors?: string[];
          stock_by_size?: Record<string, number>;
          categories?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      cart_items: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          size: number;
          color: string;
          quantity: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          size: number;
          color: string;
          quantity: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          product_id?: string;
          size?: number;
          color?: string;
          quantity?: number;
          created_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          order_number: string;
          status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
          items: OrderItem[];
          total_amount: number;
          shipping_address: ShippingAddress;
          payment_intent_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          order_number: string;
          status?: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
          items: OrderItem[];
          total_amount: number;
          shipping_address: ShippingAddress;
          payment_intent_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          order_number?: string;
          status?: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
          items?: OrderItem[];
          total_amount?: number;
          shipping_address?: ShippingAddress;
          payment_intent_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

export interface OrderItem {
  product_id: string;
  product_name: string;
  brand: string;
  size: number;
  color: string;
  quantity: number;
  price: number;
  image: string;
}

export interface ShippingAddress {
  label: string;
  street: string;
  city: string;
  state?: string;
  postal_code: string;
  country: string;
}

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Address = Database['public']['Tables']['addresses']['Row'];
export type Product = Database['public']['Tables']['products']['Row'];
export type CartItem = Database['public']['Tables']['cart_items']['Row'];
export type Order = Database['public']['Tables']['orders']['Row'];
