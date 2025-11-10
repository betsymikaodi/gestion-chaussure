import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Lock, User, Shield } from 'lucide-react-native';

const signupSchema = Yup.object().shape({
  fullName: Yup.string().required('Full name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
});

export default function SignupScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSignup = async (values: {
    fullName: string;
    email: string;
    password: string;
    isAdmin: boolean;
  }) => {
    try {
      setLoading(true);
      const { error } = await signUp(values.email, values.password, values.fullName, values.isAdmin);
      
      if (error) {
        // Si l'erreur indique que l'email doit être confirmé
        if (error.message.includes('check your email')) {
          Alert.alert(
            'Confirmation Required',
            'Please check your email to confirm your account before signing in.',
            [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }]
          );
        } else {
          Alert.alert('Error', error.message || 'Signup failed. Please try again.');
        }
        return;
      }
      
      // Si pas d'erreur, l'utilisateur est connecté automatiquement
      Alert.alert(
        'Success',
        'Account created successfully! You are now logged in.',
        [{ text: 'OK', onPress: () => router.replace('/(tabs)') }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Sign up to get started</Text>
        </View>

        <Formik
          initialValues={{
            fullName: '',
            email: '',
            password: '',
            confirmPassword: '',
            isAdmin: false,
          }}
          validationSchema={signupSchema}
          onSubmit={handleSignup}
        >
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            errors,
            touched,
          }) => (
            <View style={styles.form}>
              <Input
                label="Full Name"
                placeholder="John Doe"
                value={values.fullName}
                onChangeText={handleChange('fullName')}
                onBlur={handleBlur('fullName')}
                error={
                  touched.fullName && errors.fullName
                    ? errors.fullName
                    : undefined
                }
                autoCapitalize="words"
                leftIcon={<User size={20} color="#8E8E93" />}
              />

              <Input
                label="Email"
                placeholder="your@email.com"
                value={values.email}
                onChangeText={handleChange('email')}
                onBlur={handleBlur('email')}
                error={touched.email && errors.email ? errors.email : undefined}
                keyboardType="email-address"
                autoCapitalize="none"
                leftIcon={<Mail size={20} color="#8E8E93" />}
                containerStyle={styles.inputSpacing}
              />

              <Input
                label="Password"
                placeholder="At least 6 characters"
                value={values.password}
                onChangeText={handleChange('password')}
                onBlur={handleBlur('password')}
                error={
                  touched.password && errors.password
                    ? errors.password
                    : undefined
                }
                secureTextEntry
                leftIcon={<Lock size={20} color="#8E8E93" />}
                containerStyle={styles.inputSpacing}
              />

              <Input
                label="Confirm Password"
                placeholder="Re-enter your password"
                value={values.confirmPassword}
                onChangeText={handleChange('confirmPassword')}
                onBlur={handleBlur('confirmPassword')}
                error={
                  touched.confirmPassword && errors.confirmPassword
                    ? errors.confirmPassword
                    : undefined
                }
                secureTextEntry
                leftIcon={<Lock size={20} color="#8E8E93" />}
                containerStyle={styles.inputSpacing}
              />

              <View style={styles.adminToggle}>
                <View style={styles.adminToggleLeft}>
                  <Shield size={20} color={values.isAdmin ? '#007AFF' : '#8E8E93'} />
                  <View style={styles.adminToggleText}>
                    <Text style={styles.adminToggleTitle}>Admin Account</Text>
                    <Text style={styles.adminToggleSubtitle}>
                      {values.isAdmin ? 'Full access to manage products and orders' : 'Standard user account'}
                    </Text>
                  </View>
                </View>
                <Switch
                  value={values.isAdmin}
                  onValueChange={(value) => {
                    handleChange('isAdmin')(value.toString());
                    values.isAdmin = value;
                  }}
                  trackColor={{ false: '#E5E5EA', true: '#007AFF' }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <Button
                title="Sign Up"
                onPress={handleSubmit as any}
                loading={loading}
                style={styles.submitButton}
              />

              <View style={styles.footer}>
                <Text style={styles.footerText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                  <Text style={styles.linkText}>Sign In</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </Formik>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
  },
  form: {
    width: '100%',
  },
  inputSpacing: {
    marginTop: 16,
  },
  submitButton: {
    marginTop: 24,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  linkText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  adminToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  adminToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  adminToggleText: {
    flex: 1,
  },
  adminToggleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  adminToggleSubtitle: {
    fontSize: 13,
    color: '#8E8E93',
  },
});
