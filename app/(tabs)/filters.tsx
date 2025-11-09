import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';

export default function FiltersScreen() {
  const router = useRouter();
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [priceRange, setPriceRange] = useState<string>('');

  const brands = ['Nike', 'Adidas', 'Converse', 'Puma', 'New Balance', 'Vans', 'Asics'];
  const sizes = [6, 7, 8, 9, 10, 11, 12, 13];
  const priceRanges = [
    { label: 'Under $50', value: '0-50' },
    { label: '$50 - $100', value: '50-100' },
    { label: '$100 - $150', value: '100-150' },
    { label: '$150+', value: '150-999' },
  ];

  const handleApply = () => {
    router.back();
  };

  const handleReset = () => {
    setSelectedBrand('');
    setSelectedSize(null);
    setPriceRange('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.title}>Filters</Text>
        <TouchableOpacity onPress={handleReset}>
          <Text style={styles.resetText}>Reset</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Brand</Text>
          <View style={styles.optionsGrid}>
            {brands.map((brand) => (
              <TouchableOpacity
                key={brand}
                style={[
                  styles.optionButton,
                  selectedBrand === brand && styles.optionButtonSelected,
                ]}
                onPress={() => setSelectedBrand(brand === selectedBrand ? '' : brand)}
              >
                <Text
                  style={[
                    styles.optionText,
                    selectedBrand === brand && styles.optionTextSelected,
                  ]}
                >
                  {brand}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Size</Text>
          <View style={styles.optionsGrid}>
            {sizes.map((size) => (
              <TouchableOpacity
                key={size}
                style={[
                  styles.sizeButton,
                  selectedSize === size && styles.sizeButtonSelected,
                ]}
                onPress={() => setSelectedSize(size === selectedSize ? null : size)}
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
          <Text style={styles.sectionTitle}>Price Range</Text>
          <View style={styles.optionsList}>
            {priceRanges.map((range) => (
              <TouchableOpacity
                key={range.value}
                style={[
                  styles.priceButton,
                  priceRange === range.value && styles.priceButtonSelected,
                ]}
                onPress={() => setPriceRange(range.value === priceRange ? '' : range.value)}
              >
                <Text
                  style={[
                    styles.priceText,
                    priceRange === range.value && styles.priceTextSelected,
                  ]}
                >
                  {range.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button title="Apply Filters" onPress={handleApply} style={styles.applyButton} />
      </View>
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
  resetText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
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
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionButtonSelected: {
    backgroundColor: '#E5F2FF',
    borderColor: '#007AFF',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  optionTextSelected: {
    color: '#007AFF',
  },
  sizeButton: {
    width: 60,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#F2F2F7',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  sizeButtonSelected: {
    backgroundColor: '#E5F2FF',
    borderColor: '#007AFF',
  },
  sizeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  sizeTextSelected: {
    color: '#007AFF',
  },
  optionsList: {
    gap: 12,
  },
  priceButton: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F2F2F7',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  priceButtonSelected: {
    backgroundColor: '#E5F2FF',
    borderColor: '#007AFF',
  },
  priceText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  priceTextSelected: {
    color: '#007AFF',
  },
  footer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  applyButton: {
    width: '100%',
  },
});
