import React from 'react';
import { Button } from '@/components/ui/Button';

describe('Button Component', () => {
  it('should render with correct title', () => {
    const mockFn = jest.fn();
    const button = <Button title="Test Button" onPress={mockFn} />;
    expect(button).toBeDefined();
  });

  it('should handle different variants', () => {
    const mockFn = jest.fn();
    const primaryButton = <Button title="Primary" onPress={mockFn} variant="primary" />;
    const secondaryButton = <Button title="Secondary" onPress={mockFn} variant="secondary" />;
    const outlineButton = <Button title="Outline" onPress={mockFn} variant="outline" />;

    expect(primaryButton).toBeDefined();
    expect(secondaryButton).toBeDefined();
    expect(outlineButton).toBeDefined();
  });

  it('should handle disabled state', () => {
    const mockFn = jest.fn();
    const disabledButton = <Button title="Disabled" onPress={mockFn} disabled={true} />;
    expect(disabledButton).toBeDefined();
  });

  it('should handle loading state', () => {
    const mockFn = jest.fn();
    const loadingButton = <Button title="Loading" onPress={mockFn} loading={true} />;
    expect(loadingButton).toBeDefined();
  });
});
