import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { registerRootComponent } from 'expo';
import AuthNavigator from './src/navigation/AuthNavigator';
import { AddressProvider } from './src/context/AddressContext';
import { CartProvider } from './src/context/CartContext';

const navTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: '#FFFFFF', card: '#FFFFFF' },
};

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <AddressProvider>
        <CartProvider>
          <NavigationContainer theme={navTheme}>
            <AuthNavigator />
          </NavigationContainer>
        </CartProvider>
      </AddressProvider>
    </SafeAreaProvider>
  );
}

export default registerRootComponent(App);
