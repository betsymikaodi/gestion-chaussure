import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClientProvider } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthProvider } from '@/contexts/AuthContext';
import { queryClient, asyncStoragePersister } from '@/lib/queryClient';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: asyncStoragePersister }}
    >
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="+not-found" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="product/[id]" />
          <Stack.Screen name="order/[id]" />
          <Stack.Screen name="checkout" />
          <Stack.Screen name="admin" />
        </Stack>
        <StatusBar style="auto" />
      </AuthProvider>
    </PersistQueryClientProvider>
  );
}
