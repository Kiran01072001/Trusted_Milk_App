export const CATEGORIES = [
  { id: '1', name: 'Milk', image: require('../../assets/products/Milk.png') },
  { id: '2', name: 'Curd', image: require('../../assets/products/Pot Curd.png') },
  { id: '3', name: 'Paneer', image: require('../../assets/products/Paneer.png') },
  { id: '4', name: 'Ghee', image: require('../../assets/products/Ghee.png') },
  { id: '5', name: 'Lassi', image: require('../../assets/products/Lassi.png') },
  { id: '6', name: 'Butter', image: require('../../assets/products/Butter Milk.png') },
  { id: '7', name: 'More', image: null },
];

export const PRODUCT_CATEGORIES = [
  { id: 'all', name: 'All' },
  { id: 'milk', name: 'Milk' },
  { id: 'curd', name: 'Curd' },
  { id: 'ghee', name: 'Ghee' },
  { id: 'paneer', name: 'Paneer' },
  { id: 'kova', name: 'Kova' },
  { id: 'more', name: 'More' },
];

export const ALL_PRODUCTS = [
  {
    id: 'p1', name: 'Buffalo Milk', desc: 'Rich & creamy farm-fresh buffalo milk',
    category: 'milk', unit: 'Litre',
    variants: [{ label: '500 ml', price: 50 }, { label: '1 L', price: 100 }, { label: '2 L', price: 200 }],
    price: 100, image: require('../../assets/products/Milk.png'), badge: 'Fresh',
  },
  {
    id: 'p2', name: 'Cow Milk', desc: 'Pure & light A2 cow milk daily fresh',
    category: 'milk', unit: 'Litre',
    variants: [{ label: '500 ml', price: 40 }, { label: '1 L', price: 80 }, { label: '2 L', price: 160 }],
    price: 80, image: require('../../assets/products/Milk.png'), badge: 'Fresh',
  },
  {
    id: 'p3', name: 'Pot Curd', desc: 'Set in traditional clay pot, thick & tasty',
    category: 'curd', unit: 'Kg',
    variants: [{ label: '250 g', price: 25 }, { label: '500 g', price: 50 }],
    price: 25, image: require('../../assets/products/Pot Curd.png'), badge: 'Fresh',
  },
  {
    id: 'p4', name: 'Paneer', desc: 'Soft homemade paneer from pure milk',
    category: 'paneer', unit: 'Kg',
    variants: [{ label: '250 g', price: 150 }, { label: '500 g', price: 300 }, { label: '1 Kg', price: 600 }],
    price: 150, image: require('../../assets/products/Paneer.png'), badge: 'Fresh',
  },
  {
    id: 'p5', name: 'Buffalo Ghee', desc: 'Pure desi ghee slow-churned from cream',
    category: 'ghee', unit: 'Kg',
    variants: [{ label: '250 g', price: 250 }, { label: '500 g', price: 500 }, { label: '1 Kg', price: 1000 }],
    price: 250, image: require('../../assets/products/Ghee.png'), badge: 'Pure',
  },
  {
    id: 'p6', name: 'Cow Ghee', desc: 'A2 cow ghee with rich golden aroma',
    category: 'ghee', unit: 'Kg',
    variants: [{ label: '250 g', price: 250 }, { label: '500 g', price: 500 }, { label: '1 Kg', price: 1000 }],
    price: 250, image: require('../../assets/products/Ghee.png'), badge: 'Pure',
  },
  {
    id: 'p7', name: 'Kova', desc: 'Traditional milk solids, sweet & rich',
    category: 'kova', unit: 'Kg',
    variants: [{ label: '250 g', price: 125 }, { label: '500 g', price: 250 }, { label: '1 Kg', price: 500 }],
    price: 125, image: require('../../assets/products/Kova.png'), badge: 'Fresh',
  },
  {
    id: 'p8', name: 'Lassi', desc: 'Chilled sweet lassi made from fresh curd',
    category: 'more', unit: 'Litre',
    variants: [{ label: '500 ml', price: 50 }, { label: '1 L', price: 100 }],
    price: 50, image: require('../../assets/products/Lassi.png'), badge: 'Fresh',
  },
  {
    id: 'p9', name: 'Junnu', desc: 'Traditional colostrum milk pudding',
    category: 'more', unit: 'Kg',
    variants: [{ label: '250 g', price: 50 }, { label: '500 g', price: 100 }],
    price: 50, image: require('../../assets/products/Junnu.png'), badge: 'Special',
  },
  {
    id: 'p10', name: 'Kova Bun', desc: 'Soft bun filled with sweet kova',
    category: 'kova', unit: 'Piece',
    variants: [{ label: '1 pc', price: 50 }],
    price: 50, image: require('../../assets/products/Kova Bun.png'), badge: 'Fresh',
  },
  {
    id: 'p11', name: 'Malai Bun', desc: 'Fluffy bun with rich malai filling',
    category: 'more', unit: 'Piece',
    variants: [{ label: '1 pc', price: 40 }],
    price: 40, image: require('../../assets/products/Malai Bun.png'), badge: 'Fresh',
  },
  {
    id: 'p12', name: 'Butter Milk', desc: 'Refreshing spiced buttermilk, chilled',
    category: 'more', unit: 'Litre',
    variants: [{ label: '100 ml', price: 10 }, { label: '250 ml', price: 20 }],
    price: 10, image: require('../../assets/products/Butter Milk.png'), badge: 'Fresh',
  },
];

export const TODAY_PRODUCTS = [
  { id: '1', name: 'Buffalo Milk', qty: '1 L', price: 100, image: require('../../assets/products/Milk.png') },
  { id: '2', name: 'Cow Milk', qty: '1 L', price: 80, image: require('../../assets/products/Milk.png') },
  { id: '3', name: 'Pot Curd', qty: '250 g', price: 25, image: require('../../assets/products/Pot Curd.png') },
  { id: '4', name: 'Paneer', qty: '250 g', price: 150, image: require('../../assets/products/Paneer.png') },
];

export const TOMORROW_PRODUCTS = [
  { id: '1', name: 'Buffalo Milk', qty: '1 L', price: 100, image: require('../../assets/products/Milk.png') },
  { id: '2', name: 'Kova', qty: '250 g', price: 125, image: require('../../assets/products/Kova.png') },
  { id: '3', name: 'Junnu', qty: '250 g', price: 50, image: require('../../assets/products/Junnu.png') },
  { id: '4', name: 'Malai Bun', qty: '1 pc', price: 40, image: require('../../assets/products/Malai Bun.png') },
  { id: '5', name: '+8 More', qty: '', price: null, image: null },
];

export const TRUST_BADGES = [
  { id: '1', icon: '\uD83C\uDF3F', label: '100% Natural' },
  { id: '2', icon: '\uD83D\uDD12', label: 'Secure & Safe' },
  { id: '3', icon: '\uD83E\uDD5B', label: 'Pure & Fresh Every Time' },
  { id: '4', icon: '\uD83D\uDEE1\uFE0F', label: 'Hygienic & Trusted' },
];
