import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SignupScreen from '../screens/auth/SignupScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import AppNavigator from './AppNavigator';

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="AppRoot" component={AppNavigator} />
    </Stack.Navigator>
  );
}