import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { User, Mail, Phone, MapPin, Settings, LogOut } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, profile, signOut } = useAuth();

  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
            router.replace('/(auth)/login');
          } catch (error: any) {
            Alert.alert('Error', error.message);
          }
        },
      },
    ]);
  };

  if (!user || !profile) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <User size={64} color="#C7C7CC" />
          <Text style={styles.emptyTitle}>Sign In Required</Text>
          <Text style={styles.emptyText}>
            Please sign in to view your profile
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        {profile.is_admin && (
          <TouchableOpacity
            style={styles.adminButton}
            onPress={() => router.push('/admin')}
          >
            <Settings size={24} color="#007AFF" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <User size={40} color="#007AFF" />
          </View>
          <Text style={styles.name}>
            {profile.full_name || 'User'}
          </Text>
          <Text style={styles.email}>{profile.email}</Text>
          {profile.is_admin && (
            <View style={styles.adminBadge}>
              <Text style={styles.adminBadgeText}>Admin</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Information</Text>

          <View style={styles.infoItem}>
            <View style={styles.infoIcon}>
              <Mail size={20} color="#8E8E93" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{profile.email}</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <View style={styles.infoIcon}>
              <Phone size={20} color="#8E8E93" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoValue}>
                {profile.phone || 'Not provided'}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.infoItem}
            onPress={() => Alert.alert('Coming Soon', 'Address management will be available soon')}
          >
            <View style={styles.infoIcon}>
              <MapPin size={20} color="#8E8E93" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Addresses</Text>
              <Text style={styles.infoValue}>Manage your addresses</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions</Text>
          <Button
            title="Sign Out"
            onPress={handleSignOut}
            variant="danger"
            style={styles.signOutButton}
          />
        </View>
      </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
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
  },
  adminButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    padding: 32,
    alignItems: 'center',
    marginTop: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E5F2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#8E8E93',
  },
  adminBadge: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: '#007AFF',
    borderRadius: 12,
  },
  adminBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'uppercase',
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
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  infoIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#F2F2F7',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    color: '#8E8E93',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  signOutButton: {
    width: '100%',
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
});
