import React, { useEffect, useRef } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Animated, View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import HomeScreen from '../screens/home/HomeScreen';
import ProductListScreen from '../screens/products/ProductListScreen';
import WalletScreen from '../screens/wallet/WalletScreen';
import AccountScreen from '../screens/profile/AccountScreen';
import CartScreen from '../screens/cart/CartScreen';
import OrderSuccessScreen from '../screens/cart/OrderSuccessScreen';
import LocationSelectionScreen from '../screens/home/LocationSelectionScreen';
import AddAddressScreen from '../screens/profile/AddAddressScreen';
import ReferEarnScreen from '../screens/profile/ReferEarnScreen';
import OfferDetailsScreen from '../screens/home/OfferDetailsScreen';
import ProductDetailsScreen from '../screens/products/ProductDetailsScreen';
import CheckoutScreen from '../screens/cart/CheckoutScreen';

const Tab = createBottomTabNavigator();
const { width } = Dimensions.get('window');
const ACTIVE = '#2196F3';
const INACTIVE = '#8A8F98';
const WHITE = '#FFFFFF';
const PILL_W = Math.min(width - 28, 430);

const TABS = {
  Home: { icon: 'home-variant-outline', activeIcon: 'home-variant', label: 'Home' },
  Products: { icon: 'view-grid-outline', activeIcon: 'view-grid', label: 'Products' },
  Wallet: { icon: 'wallet-outline', activeIcon: 'wallet', label: 'Wallet' },
  Subscriptions: { icon: 'calendar-sync-outline', activeIcon: 'calendar-sync', label: 'Subscriptions' },
  Account: { icon: 'account-circle-outline', activeIcon: 'account-circle', label: 'Account' },
};

function PlaceholderScreen({ route }) {
  const tab = TABS[route.name] || { icon: 'apps', label: route.name };

  return (
    <View style={styles.placeholder}>
      <MaterialCommunityIcons name={tab.icon} size={52} color={ACTIVE} />
      <Text style={styles.phTitle}>{tab.label}</Text>
      <Text style={styles.phSub}>Coming Soon</Text>
    </View>
  );
}

function TabItem({ route, descriptor, navigation, isFocused }) {
  const tab = TABS[route.name];
  const color = isFocused ? ACTIVE : INACTIVE;
  const progress = useRef(new Animated.Value(isFocused ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(progress, {
      toValue: isFocused ? 1 : 0,
      friction: 8,
      tension: 120,
      useNativeDriver: true,
    }).start();
  }, [isFocused, progress]);

  const onPress = () => {
    const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
    if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
  };

  const scale = progress.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] });
  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [0, -2] });

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={descriptor.options.tabBarAccessibilityLabel || tab.label}
      testID={descriptor.options.tabBarTestID}
      onPress={onPress}
      activeOpacity={0.78}
      style={styles.tabItem}
    >
      <Animated.View style={[styles.iconSpot, isFocused && styles.iconSpotActive, { transform: [{ scale }, { translateY }] }]}>
        <MaterialCommunityIcons name={isFocused ? tab.activeIcon : tab.icon} size={22} color={color} />
      </Animated.View>
      <Text style={[styles.tabLabel, { color }]} numberOfLines={1}>{tab.label}</Text>
    </TouchableOpacity>
  );
}

function CustomTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();
  const visibleRoutes = state.routes.filter(route => TABS[route.name]);
  const currentRoute = state.routes[state.index];
  const focusedRouteKey = TABS[currentRoute?.name]
    ? currentRoute.key
    : [...(state.history || [])]
        .reverse()
        .map(entry => entry.key)
        .find(key => TABS[state.routes.find(route => route.key === key)?.name]);

  return (
    <View style={[styles.navShell, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      <View style={styles.navPill}>
        {visibleRoutes.map((route) => {
          const descriptor = descriptors[route.key];
          const isFocused = focusedRouteKey === route.key;

          return (
            <TabItem
              key={route.key}
              route={route}
              descriptor={descriptor}
              navigation={navigation}
              isFocused={isFocused}
            />
          );
        })}
      </View>
    </View>
  );
}

export default function BottomTabNavigator() {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneContainerStyle: { backgroundColor: WHITE },
      }}
    >
      <Tab.Screen name="Home"          component={HomeScreen} />
      <Tab.Screen name="Products"      component={ProductListScreen} />
      <Tab.Screen name="Wallet"        component={WalletScreen} />
      <Tab.Screen name="Subscriptions" component={PlaceholderScreen} />
      <Tab.Screen name="Account"       component={AccountScreen} />
      <Tab.Screen name="Cart" component={CartScreen} />
      <Tab.Screen name="OrderSuccessScreen" component={OrderSuccessScreen} />
      <Tab.Screen name="LocationSelectionScreen" component={LocationSelectionScreen} />
      <Tab.Screen name="AddAddressScreen" component={AddAddressScreen} />
      <Tab.Screen name="ReferEarnScreen" component={ReferEarnScreen} />
      <Tab.Screen name="OfferDetailsScreen" component={OfferDetailsScreen} />
      <Tab.Screen name="ProductListScreen" component={ProductListScreen} />
      <Tab.Screen name="ProductDetailsScreen" component={ProductDetailsScreen} />
      <Tab.Screen name="CheckoutScreen" component={CheckoutScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  navShell: {
    backgroundColor: WHITE,
    alignItems: 'center',
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: '#E7EEF4',
  },

  navPill: {
    width: PILL_W,
    minHeight: 68,
    borderRadius: 0,
    backgroundColor: WHITE,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
    borderWidth: 0,
  },

  tabItem: {
    flex: 1,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconSpot: {
    width: 42,
    height: 32,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconSpotActive: { backgroundColor: '#E3F2FD' },
  tabLabel: { fontSize: 10, fontWeight: '800', marginTop: 2, color: INACTIVE },

  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: WHITE },
  phTitle: { fontSize: 22, fontWeight: '800', color: ACTIVE, marginTop: 14, marginBottom: 6 },
  phSub: { fontSize: 15, color: INACTIVE },
});