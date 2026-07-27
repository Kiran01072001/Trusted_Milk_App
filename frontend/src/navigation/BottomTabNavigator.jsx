import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import HomeScreen from '../screens/home/HomeScreen';
import ProductListScreen from '../screens/products/ProductListScreen';
import CartScreen from '../screens/cart/CartScreen';
import { useCart } from '../context/CartContext';

const Tab = createBottomTabNavigator();
const ACTIVE = '#1EAFF2';
const INACTIVE = '#8FA3B1';
const WHITE = '#FFFFFF';

const TABS = {
  Home:     { icon: 'home-variant',           label: 'Home' },
  Products: { icon: 'view-grid-outline',       label: 'Products' },
  Cart:     { icon: 'cart-outline',            label: 'Cart' },
  Orders:   { icon: 'package-variant-closed',  label: 'Orders' },
  Account:  { icon: 'account-circle-outline',  label: 'Account' },
};

function PlaceholderScreen({ route }) {
  return (
    <View style={styles.placeholder}>
      <MaterialCommunityIcons name={TABS[route.name]?.icon || 'home'} size={52} color={ACTIVE} />
      <Text style={styles.phTitle}>{route.name}</Text>
      <Text style={styles.phSub}>Coming Soon</Text>
    </View>
  );
}

function TabItem({ route, descriptor, navigation, isFocused }) {
  const tab = TABS[route.name];
  const color = isFocused ? ACTIVE : INACTIVE;

  const onPress = () => {
    const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
    if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
  };

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={descriptor.options.tabBarAccessibilityLabel}
      testID={descriptor.options.tabBarTestID}
      onPress={onPress}
      activeOpacity={0.75}
      style={styles.tabItem}
    >
      <View style={[styles.iconSpot, isFocused && styles.iconSpotActive]}>
        <MaterialCommunityIcons name={tab.icon} size={22} color={color} />
      </View>
      <Text style={[styles.tabLabel, { color }]} numberOfLines={1}>{tab.label}</Text>
    </TouchableOpacity>
  );
}

function CartFab({ route, descriptor, navigation, isFocused }) {
  const { totalItems } = useCart();

  const onPress = () => {
    const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
    if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
  };

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={descriptor.options.tabBarAccessibilityLabel}
      testID={descriptor.options.tabBarTestID}
      onPress={onPress}
      activeOpacity={0.88}
      style={styles.fabSlot}
    >
      <View style={[styles.cartFab, isFocused && styles.cartFabActive]}>
        <MaterialCommunityIcons name="cart-outline" size={24} color={WHITE} />
        {totalItems > 0 && (
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>{Math.min(totalItems, 99)}</Text>
          </View>
        )}
      </View>
      <Text style={[styles.tabLabel, { color: isFocused ? ACTIVE : INACTIVE }]}>Cart</Text>
    </TouchableOpacity>
  );
}

function CustomTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.outerWrap, { paddingBottom: insets.bottom }]}>
      <View style={styles.tabRow}>
        {state.routes.map((route, index) => {
          const descriptor = descriptors[route.key];
          const isFocused = state.index === index;

          if (route.name === 'Cart') {
            return (
              <CartFab
                key={route.key}
                route={route}
                descriptor={descriptor}
                navigation={navigation}
                isFocused={isFocused}
              />
            );
          }

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
      <Tab.Screen name="Home"     component={HomeScreen} />
      <Tab.Screen name="Products" component={ProductListScreen} />
      <Tab.Screen name="Cart"     component={CartScreen} />
      <Tab.Screen name="Orders"   component={PlaceholderScreen} />
      <Tab.Screen name="Account"  component={PlaceholderScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  outerWrap: {
    backgroundColor: WHITE,
    paddingHorizontal: 4,
    paddingTop: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#D8E6EF',
  },

  tabRow: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  // Regular tab — icon pill + label, fixed height matches tabRow
  tabItem: {
    flex: 1,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Cart slot — identical dimensions to tabItem
  fabSlot: {
    flex: 1,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconSpot: {
    width: 32, height: 28, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  iconSpotActive: { backgroundColor: '#E6F6FE' },
  tabLabel: { fontSize: 10, fontWeight: '700', marginTop: 3, color: INACTIVE },

  // Cart FAB — 44px circle so icon(24) + marginTop(3) + label(13) = 40px fits in 60px slot
  cartFab: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: ACTIVE,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0D7EAA',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  cartFabActive: { backgroundColor: '#0EA5E9' },
  cartBadge: {
    position: 'absolute', top: 1, right: 1,
    minWidth: 15, height: 15, borderRadius: 8,
    backgroundColor: '#EF4444',
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5, borderColor: WHITE,
  },
  cartBadgeText: { color: WHITE, fontSize: 8, fontWeight: '900' },

  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: WHITE },
  phTitle: { fontSize: 22, fontWeight: '800', color: ACTIVE, marginTop: 14, marginBottom: 6 },
  phSub: { fontSize: 15, color: INACTIVE },
});
