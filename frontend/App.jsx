import 'react-native-gesture-handler';
import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { registerRootComponent } from 'expo';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { AddressProvider } from './src/context/AddressContext';
import { CartProvider } from './src/context/CartContext';
import AuthNavigator from './src/navigation/AuthNavigator';
import AppNavigator from './src/navigation/AppNavigator';

const navTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: '#FFFFFF', card: '#FFFFFF' },
};

// ── Splash / boot gate ────────────────────────────────────────────────────────
// Shown while AuthContext validates the stored token against the server.
function BootScreen() {
  return (
    <View style={styles.boot}>
      <ActivityIndicator size="large" color="#025F86" />
    </View>
  );
}

// ── Root navigator gated by auth state ───────────────────────────────────────
function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) return <BootScreen />;

  // user !== null  →  valid token confirmed at boot, go straight to app
  // user === null  →  no token / expired, show auth flow
  return user ? <AppNavigator /> : <AuthNavigator />;
}

// ── App ───────────────────────────────────────────────────────────────────────
function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <AuthProvider>
        <AddressProvider>
          <CartProvider>
            <NavigationContainer theme={navTheme}>
              <RootNavigator />
            </NavigationContainer>
          </CartProvider>
        </AddressProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  boot: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
});

export default registerRootComponent(App);
