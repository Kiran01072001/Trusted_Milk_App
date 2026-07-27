import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabNavigator from './BottomTabNavigator';
import LocationSelectionScreen from '../screens/home/LocationSelectionScreen';
import AddAddressScreen from '../screens/profile/AddAddressScreen';
import ReferEarnScreen from '../screens/profile/ReferEarnScreen';
import OfferDetailsScreen from '../screens/home/OfferDetailsScreen';
import ProductListScreen from '../screens/products/ProductListScreen';
import ProductDetailsScreen from '../screens/products/ProductDetailsScreen';
import CartScreen from '../screens/cart/CartScreen';
import CheckoutScreen from '../screens/cart/CheckoutScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={BottomTabNavigator} />
      <Stack.Screen name="LocationSelectionScreen" component={LocationSelectionScreen} />
      <Stack.Screen name="AddAddressScreen" component={AddAddressScreen} />
      <Stack.Screen name="ReferEarnScreen" component={ReferEarnScreen} />
      <Stack.Screen name="OfferDetailsScreen" component={OfferDetailsScreen} />
      <Stack.Screen name="ProductListScreen" component={ProductListScreen} />
      <Stack.Screen name="ProductDetailsScreen" component={ProductDetailsScreen} />
      <Stack.Screen name="CartScreen" component={CartScreen} />
      <Stack.Screen name="CheckoutScreen" component={CheckoutScreen} />
    </Stack.Navigator>
  );
}
