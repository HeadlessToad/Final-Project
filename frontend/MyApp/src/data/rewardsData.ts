// src/data/rewardsData.ts

export interface RewardItem {
  id: string;
  title: string;
  points: number;
  image: string;
  description: string;
  category: 'All' | 'Food' | 'Home' | 'Fitness' | 'Gadgets' | 'Eco';
  shippingInfo: string;
}

export const CATEGORIES = ['All', 'Food', 'Home', 'Fitness', 'Gadgets', 'Eco'];

export const REWARDS_DATA: RewardItem[] = [
  // --- FOOD & DRINK (Small Rewards) ---
  { 
    id: '1', 
    title: 'Double Espresso & Pastry', 
    points: 250, 
    category: 'Food',
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800', 
    description: 'Start your morning with a large coffee and a fresh butter croissant.',
    shippingInfo: 'Digital Voucher: Show code at checkout.'
  },
  { 
    id: '2', 
    title: 'Premium Burger Meal', 
    points: 600, 
    category: 'Food',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800', 
    description: 'Includes a 220g burger, fries, and a soft drink at participating restaurants.',
    shippingInfo: 'Digital Voucher sent via SMS.'
  },
  { 
    id: '3', 
    title: 'Family Pizza Night', 
    points: 850, 
    category: 'Food',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800', 
    description: 'Large family pizza + 2 toppings and a 1.5L drink.',
    shippingInfo: 'Valid for delivery or pickup.'
  },
  { 
    id: '4', 
    title: 'Breakfast for Two', 
    points: 1200, 
    category: 'Food',
    image: 'https://images.unsplash.com/photo-1528605105345-5344ea20e269?w=800', 
    description: 'A classic Israeli breakfast: eggs, salads, dips, bread, and coffee for two.',
    shippingInfo: 'Valid at select cafes nationwide.'
  },
  { 
    id: '5', 
    title: '1kg Italian Gelato', 
    points: 550, 
    category: 'Food',
    image: 'https://images.unsplash.com/photo-1560008581-09826d1de69e?w=800', 
    description: 'Take home a 1kg tub of premium artisanal gelato. Multiple flavors available.',
    shippingInfo: 'Pickup from participating ice cream parlors.'
  },

  // --- HOME & KITCHEN (Medium Rewards) ---
  { 
    id: '6', 
    title: 'Ninja Personal Blender', 
    points: 2500, 
    category: 'Home',
    image: 'https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?w=800',
    description: 'Perfect for smoothies and shakes. Includes two portable cups.',
    shippingInfo: 'Pickup from distribution center.'
  },
  { 
    id: '7', 
    title: 'Non-Stick Wok Pan (28cm)', 
    points: 1100, 
    category: 'Home',
    image: 'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=800',
    description: 'Professional stir-fry pan with durable non-stick coating.',
    shippingInfo: 'Pickup available.'
  },

  // --- FITNESS & OUTDOORS (Active Lifestyle) ---
  { 
    id: '8', 
    title: 'Pro Yoga Mat', 
    points: 450, 
    category: 'Fitness',
    image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800', 
    description: 'Extra thick 6mm non-slip mat. Comes with a carrying strap.',
    shippingInfo: 'Pickup from fitness stores.'
  },
  { 
    id: '9', 
    title: 'Adjustable Dumbbell Set', 
    points: 3200, 
    category: 'Fitness',
    image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800', 
    description: 'Pair of dumbbells adjustable from 2kg to 10kg. Space saving design.',
    shippingInfo: 'Home delivery (Heavy Item).'
  },
  { 
    id: '10', 
    title: 'Running Backpack (15L)', 
    points: 1300, 
    category: 'Fitness',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800', 
    description: 'Lightweight hydration backpack, perfect for long runs or day hikes.',
    shippingInfo: 'Standard shipping.'
  },

  // --- GADGETS & TECH (High Value) ---
  { 
    id: '11', 
    title: 'Wireless Earbuds', 
    points: 1800, 
    category: 'Gadgets',
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800', 
    description: 'Noise cancelling bluetooth earbuds with charging case.',
    shippingInfo: 'Pickup from tech partners.'
  },
  { 
    id: '12', 
    title: 'Portable Bluetooth Speaker', 
    points: 1500, 
    category: 'Gadgets',
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800', 
    description: 'Waterproof speaker with 12-hour battery life. Great for the beach.',
    shippingInfo: 'Standard shipping.'
  },
  { 
    id: '13', 
    title: 'Cinema Ticket Pair', 
    points: 700, 
    category: 'Gadgets',
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800', 
    description: 'Two VIP tickets to any movie at Planet or Cinema City.',
    shippingInfo: 'Digital Code sent instantly.'
  },

  // --- CONTINUATION ---
  { 
    id: '14', 
    title: 'Frozen Yogurt Cup', 
    points: 300, 
    category: 'Food', 
    image: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=800', 
    description: 'Medium frozen yogurt with 3 toppings of your choice.', 
    shippingInfo: 'Show code at checkout.' 
  },
  { 
    id: '15', 
    title: 'Sushi Platter (16 pcs)', 
    points: 1100, 
    category: 'Food', 
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800', 
    description: 'Assorted sushi rolls including salmon avocado and spicy tuna.', 
    shippingInfo: 'Valid for pickup or dine-in.' 
  },
  { 
    id: '16', 
    title: 'Fresh Fruit Smoothie', 
    points: 350, 
    category: 'Food', 
    image: 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=800', 
    description: 'Large fruit smoothie made with fresh seasonal fruits.', 
    shippingInfo: 'Digital Voucher.' 
  },
  { 
    id: '17', 
    title: 'Artisan Bread Loaf', 
    points: 200, 
    category: 'Food', 
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800', 
    description: 'Freshly baked sourdough or whole wheat loaf from local bakery.', 
    shippingInfo: 'Pickup only.' 
  },
  { 
    id: '18', 
    title: 'Box of 6 Donuts', 
    points: 450, 
    category: 'Food', 
    image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800', 
    description: 'Assorted glazed and filled donuts.', 
    shippingInfo: 'Show code at checkout.' 
  },
  { 
    id: '19', 
    title: 'Vegan Burger Meal', 
    points: 650, 
    category: 'Food', 
    image: 'https://images.unsplash.com/photo-1525059696034-4967a8e1dca2?w=800', 
    description: 'Plant-based patty with vegan cheese and sweet potato fries.', 
    shippingInfo: 'Digital Voucher.' 
  },
  { 
    id: '20', 
    title: 'Cold Brew Coffee Kit', 
    points: 900, 
    category: 'Food', 
    image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=800', 
    description: 'Take home kit including ground beans and filter jar.', 
    shippingInfo: 'Pickup from coffee shop.' 
  },
  { 
    id: '21', 
    title: 'Gourmet Chocolate Box', 
    points: 750, 
    category: 'Food', 
    image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=800', 
    description: 'Selection of 12 dark and milk Belgian chocolates.', 
    shippingInfo: 'Standard shipping.' 
  },
  { 
    id: '22', 
    title: 'Pasta Dinner for Two', 
    points: 950, 
    category: 'Food', 
    image: 'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=800', 
    description: 'Two pasta dishes and a starter at Italian family restaurants.', 
    shippingInfo: 'Digital Voucher.' 
  },
  { 
    id: '23', 
    title: 'Large Acai Bowl', 
    points: 400, 
    category: 'Food', 
    image: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=800', 
    description: 'Refreshing acai base topped with granola, banana, and honey.', 
    shippingInfo: 'Show code at checkout.' 
  },
  { 
    id: '24', 
    title: 'Winery Tour & Tasting', 
    points: 1800, 
    category: 'Food', 
    image: 'https://images.unsplash.com/photo-1516594915697-87eb3b1c14ea?w=800', 
    description: 'Tour for two at a local boutique winery including 4 tastings.', 
    shippingInfo: 'Reservation required.' 
  },
  { 
    id: '25', 
    title: 'Chef\'s Salad', 
    points: 380, 
    category: 'Food', 
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800', 
    description: 'Large healthy salad with grilled chicken or tofu.', 
    shippingInfo: 'Digital Voucher.' 
  },
  { 
    id: '26', 
    title: 'Thai Noodle Stir-Fry', 
    points: 500, 
    category: 'Food', 
    image: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=800', 
    description: 'Pad Thai or Pad See Ew with tofu or chicken.', 
    shippingInfo: 'Valid for delivery.' 
  },
  { 
    id: '27', 
    title: 'Ceramic Plant Pot', 
    points: 450, 
    category: 'Home', 
    image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800', 
    description: 'Minimalist white ceramic pot for indoor plants (15cm).', 
    shippingInfo: 'Pickup from garden center.' 
  },
  { 
    id: '28', 
    title: 'Soft Throw Blanket', 
    points: 800, 
    category: 'Home', 
    image: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=800', 
    description: 'Cozy fleece throw blanket (150x200cm), grey.', 
    shippingInfo: 'Standard shipping.' 
  },
  { 
    id: '29', 
    title: 'Glass Water Pitcher', 
    points: 550, 
    category: 'Home', 
    image: 'https://images.unsplash.com/photo-1512413914633-b5043f4041ea?w=800', 
    description: 'Elegant glass carafe with cork lid (1L).', 
    shippingInfo: 'Pickup available.' 
  },
  { 
    id: '30', 
    title: 'Digital Kitchen Scale', 
    points: 400, 
    category: 'Home', 
    image: 'https://images.unsplash.com/photo-1595475207225-428b62bda831?w=800', 
    description: 'Precise food scale up to 5kg.', 
    shippingInfo: 'Standard shipping.' 
  },
  { 
    id: '31', 
    title: 'Decorative Wall Mirror', 
    points: 1500, 
    category: 'Home', 
    image: 'https://images.unsplash.com/photo-1618220179428-22790b461013?w=800', 
    description: 'Round hanging mirror with black metal frame (50cm).', 
    shippingInfo: 'Home delivery.' 
  },
  { 
    id: '32', 
    title: 'Spice Jar Organizer', 
    points: 500, 
    category: 'Home', 
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800', 
    description: 'Set of 12 glass jars with labels.', 
    shippingInfo: 'Standard shipping.' 
  },
  { 
    id: '33', 
    title: 'Storage Baskets (Set of 3)', 
    points: 600, 
    category: 'Home', 
    image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800', 
    description: 'Woven fabric baskets for organization.', 
    shippingInfo: 'Standard shipping.' 
  },
  { 
    id: '34', 
    title: 'Resistance Bands Set', 
    points: 300, 
    category: 'Fitness', 
    image: 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=800', 
    description: '5 bands with different resistance levels.', 
    shippingInfo: 'Standard shipping.' 
  },
  { 
    id: '35', 
    title: 'Foam Roller', 
    points: 450, 
    category: 'Fitness', 
    image: 'https://images.unsplash.com/photo-1600881333168-2ef49b341f30?w=800', 
    description: 'High density foam roller for muscle recovery.', 
    shippingInfo: 'Pickup from sports store.' 
  },
  { 
    id: '36', 
    title: 'Jump Rope (Speed)', 
    points: 200, 
    category: 'Fitness', 
    image: 'https://images.unsplash.com/photo-1594737625785-a6cbdabd333c?w=800', 
    description: 'Adjustable steel wire jump rope.', 
    shippingInfo: 'Standard shipping.' 
  },
  { 
    id: '37', 
    title: 'Gym Duffel Bag', 
    points: 900, 
    category: 'Fitness', 
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800', 
    description: 'Water resistant sports bag with shoe compartment.', 
    shippingInfo: 'Standard shipping.' 
  },
  { 
    id: '38', 
    title: 'Pilates Ring', 
    points: 500, 
    category: 'Fitness', 
    image: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=800', 
    description: 'Magic circle ring for toning thighs and arms.', 
    shippingInfo: 'Pickup available.' 
  },
  { 
    id: '39', 
    title: 'Women\'s Sports Bra', 
    points: 550, 
    category: 'Fitness', 
    image: 'https://images.unsplash.com/photo-1571731956672-f2b94d7dd0cb?w=800', 
    description: 'High support racerback sports bra.', 
    shippingInfo: 'Choose size at checkout.' 
  },
  { 
    id: '40', 
    title: 'Camping Tent (2 Person)', 
    points: 3500, 
    category: 'Fitness', 
    image: 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=800', 
    description: 'Lightweight waterproof dome tent.', 
    shippingInfo: 'Home delivery.' 
  },
  { 
    id: '41', 
    title: 'Phone Tripod Stand', 
    points: 450, 
    category: 'Gadgets', 
    image: 'https://images.unsplash.com/photo-1533228876829-65c94e7b5025?w=800', 
    description: 'Flexible tripod with bluetooth remote.', 
    shippingInfo: 'Standard shipping.' 
  },
  { 
    id: '42', 
    title: 'Wireless Mouse', 
    points: 600, 
    category: 'Gadgets', 
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800', 
    description: 'Ergonomic silent click mouse.', 
    shippingInfo: 'Standard shipping.' 
  },
  { 
    id: '43', 
    title: 'Smart LED Bulb', 
    points: 350, 
    category: 'Gadgets', 
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800', 
    description: 'Color changing bulb, WiFi controlled.', 
    shippingInfo: 'Standard shipping.' 
  },
  { 
    id: '44', 
    title: 'Bluetooth Headset', 
    points: 950, 
    category: 'Gadgets', 
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800', 
    description: 'Over-ear headphones with mic.', 
    shippingInfo: 'Home delivery.' 
  },
  { 
    id: '45', 
    title: 'Car Phone Mount', 
    points: 300, 
    category: 'Gadgets', 
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800', 
    description: 'Magnetic dashboard mount.', 
    shippingInfo: 'Standard shipping.' 
  },
  { 
    id: '46', 
    title: 'Recycled Notebook', 
    points: 150, 
    category: 'Eco', 
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800', 
    description: 'A5 notebook made from 100% recycled paper.', 
    shippingInfo: 'Standard shipping.' 
  },
  { 
    id: '47', 
    title: 'Recycled Glass Vase', 
    points: 550, 
    category: 'Eco', 
    image: 'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=800', 
    description: 'Hand-blown decorative vase.', 
    shippingInfo: 'Standard shipping.' 
  },
  { 
    id: '48', 
    title: 'Eco-Friendly Laundry Strips', 
    points: 400, 
    category: 'Eco', 
    image: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=800', 
    description: 'Plastic-free detergent sheets (32 loads).', 
    shippingInfo: 'Standard shipping.' 
  },
  { 
    id: '49', 
    title: 'Cork Yoga Block', 
    points: 350, 
    category: 'Eco', 
    image: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=800', 
    description: 'Natural cork block for stability.', 
    shippingInfo: 'Standard shipping.' 
  },
  { 
    id: '50', 
    title: 'Donate: Clean Water', 
    points: 500, 
    category: 'Eco', 
    image: 'https://images.unsplash.com/photo-1538300342682-cf57afb97285?w=800', 
    description: 'Donation to provide clean water access.', 
    shippingInfo: 'Digital Certificate.' 
  },
  { 
    id: '51', 
    title: 'Donate: Ocean Cleanup', 
    points: 1000, 
    category: 'Eco', 
    image: 'https://images.unsplash.com/photo-1484291470158-b8f8d608850d?w=800', 
    description: 'Support removal of ocean plastics.', 
    shippingInfo: 'Digital Certificate.' 
  },
];