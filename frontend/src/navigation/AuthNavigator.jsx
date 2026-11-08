import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SignupScreen from '../screens/auth/SignupScreen';
import LoginScreen  from '../screens/auth/LoginScreen';

const Stack = createNativeStackNavigator();

/**
 * AuthNavigator is now only shown when the user is NOT authenticated
 * (controlled by RootNavigator in App.jsx).
 *
 * After a successful login/signup the screens call AuthContext.login()
 * which sets user state → RootNavigator swaps to AppNavigator automatically.
 * No manual navigation.replace('AppRoot') needed, but we keep it as a
 * fallback for backward compatibility with the existing LoginScreen code.
 */
export default function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login"  component={LoginScreen}  />
      <Stack.Screen name="Signup" component={SignupScreen} />
    </Stack.Navigator>
  );
}
