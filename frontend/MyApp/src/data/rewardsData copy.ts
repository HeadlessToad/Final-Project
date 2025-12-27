// // src/data/rewardsData.ts

// export interface RewardItem {
//   id: string;
//   title: string;
//   points: number;
//   image: string;
//   description: string;
//   category: 'All' | 'Food' | 'Home' | 'Fitness' | 'Gadgets' | 'Eco';
//   shippingInfo: string;
// }

// export const CATEGORIES = ['All', 'Food', 'Home', 'Fitness', 'Gadgets', 'Eco'];

// export const REWARDS_DATA: RewardItem[] = [
//   // --- FOOD & DRINK (Small Rewards) ---
//   { 
//     id: '1', 
//     title: 'Double Espresso & Pastry', 
//     points: 250, 
//     category: 'Food',
//     image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800', 
//     description: 'Start your morning with a large coffee and a fresh butter croissant.',
//     shippingInfo: 'Digital Voucher: Show code at checkout.'
//   },
//   { 
//     id: '2', 
//     title: 'Premium Burger Meal', 
//     points: 600, 
//     category: 'Food',
//     image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800', 
//     description: 'Includes a 220g burger, fries, and a soft drink at participating restaurants.',
//     shippingInfo: 'Digital Voucher sent via SMS.'
//   },
//   { 
//     id: '3', 
//     title: 'Family Pizza Night', 
//     points: 850, 
//     category: 'Food',
//     image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800', 
//     description: 'Large family pizza + 2 toppings and a 1.5L drink.',
//     shippingInfo: 'Valid for delivery or pickup.'
//   },
//   { 
//     id: '4', 
//     title: 'Breakfast for Two', 
//     points: 1200, 
//     category: 'Food',
//     image: 'https://images.unsplash.com/photo-1528605105345-5344ea20e269?w=800', 
//     description: 'A classic Israeli breakfast: eggs, salads, dips, bread, and coffee for two.',
//     shippingInfo: 'Valid at select cafes nationwide.'
//   },
//   { 
//     id: '5', 
//     title: '1kg Italian Gelato', 
//     points: 550, 
//     category: 'Food',
//     image: 'https://images.unsplash.com/photo-1560008581-09826d1de69e?w=800', 
//     description: 'Take home a 1kg tub of premium artisanal gelato. Multiple flavors available.',
//     shippingInfo: 'Pickup from participating ice cream parlors.'
//   },

//   // --- HOME & KITCHEN (Medium Rewards) ---
//   { 
//     id: '6', 
//     title: 'Professional Chef Knife Set', 
//     points: 1400, 
//     category: 'Home',
//     image: 'https://images.unsplash.com/photo-1593618998160-e34014e67546?w=800', 
//     description: '5-piece stainless steel knife set with a wooden block.',
//     shippingInfo: 'Home delivery included (3-5 business days).'
//   },
//   { 
//     id: '7', 
//     title: 'Ninja Personal Blender', 
//     points: 2500, 
//     category: 'Home',
//     image: 'https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?w=800',
//     description: 'Perfect for smoothies and shakes. Includes two portable cups.',
//     shippingInfo: 'Pickup from distribution center.'
//   },
//   { 
//     id: '8', 
//     title: 'Luxury Bath Towel Set', 
//     points: 900, 
//     category: 'Home',
//     image: 'https://images.unsplash.com/photo-1616627547584-bf28cee262db?w=800', 
//     description: '100% Egyptian cotton. Includes 2 bath towels and 2 hand towels.',
//     shippingInfo: 'Home delivery within 7 days.'
//   },
//   { 
//     id: '9', 
//     title: 'Non-Stick Wok Pan (28cm)', 
//     points: 1100, 
//     category: 'Home',
//     image: 'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=800',
//     description: 'Professional stir-fry pan with durable non-stick coating.',
//     shippingInfo: 'Pickup available.'
//   },

//   // --- FITNESS & OUTDOORS (Active Lifestyle) ---
//   { 
//     id: '10', 
//     title: 'Pro Yoga Mat', 
//     points: 450, 
//     category: 'Fitness',
//     image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800', 
//     description: 'Extra thick 6mm non-slip mat. Comes with a carrying strap.',
//     shippingInfo: 'Pickup from fitness stores.'
//   },
//   { 
//     id: '11', 
//     title: 'Adjustable Dumbbell Set', 
//     points: 3200, 
//     category: 'Fitness',
//     image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800', 
//     description: 'Pair of dumbbells adjustable from 2kg to 10kg. Space saving design.',
//     shippingInfo: 'Home delivery (Heavy Item).'
//   },
//   { 
//     id: '12', 
//     title: 'Running Backpack (15L)', 
//     points: 1300, 
//     category: 'Fitness',
//     image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800', 
//     description: 'Lightweight hydration backpack, perfect for long runs or day hikes.',
//     shippingInfo: 'Standard shipping.'
//   },
//   { 
//     id: '13', 
//     title: 'Smart Fitness Band', 
//     points: 2800, 
//     category: 'Fitness',
//     image: 'https://images.unsplash.com/photo-1557935728-e6d1eaed5540?w=800',
//     description: 'Tracks steps, heart rate, and sleep. Waterproof and durable.',
//     shippingInfo: 'Home delivery.'
//   },

//   // --- GADGETS & TECH (High Value) ---
//   { 
//     id: '14', 
//     title: 'Wireless Earbuds', 
//     points: 1800, 
//     category: 'Gadgets',
//     image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800', 
//     description: 'Noise cancelling bluetooth earbuds with charging case.',
//     shippingInfo: 'Pickup from tech partners.'
//   },
//   { 
//     id: '15', 
//     title: 'Portable Bluetooth Speaker', 
//     points: 1500, 
//     category: 'Gadgets',
//     image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800', 
//     description: 'Waterproof speaker with 12-hour battery life. Great for the beach.',
//     shippingInfo: 'Standard shipping.'
//   },
//   { 
//     id: '16', 
//     title: 'Cinema Ticket Pair', 
//     points: 700, 
//     category: 'Gadgets',
//     image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800', 
//     description: 'Two VIP tickets to any movie at Planet or Cinema City.',
//     shippingInfo: 'Digital Code sent instantly.'
//   },

//   // --- ECO & SUSTAINABLE (App Theme) ---
//   { 
//     id: '17', 
//     title: '14L Cooler Bag', 
//     points: 465, 
//     category: 'Eco',
//     image: 'https://images.unsplash.com/photo-1627483297929-37f416fec7cd?w=800', 
//     description: 'Thermal cooler bag for groceries or picnics. Reusable and durable.',
//     shippingInfo: 'Pickup from distribution point.'
//   },
//   { 
//     id: '18', 
//     title: 'Bamboo Toothbrush Set', 
//     points: 150, 
//     category: 'Eco',
//     image: 'https://images.unsplash.com/photo-1607613009820-a29f7bb6dc2d?w=800', 
//     description: 'Pack of 4 biodegradable brushes. Plastic-free packaging.',
//     shippingInfo: 'Standard shipping.'
//   },
//   { 
//     id: '19', 
//     title: 'Reusable Coffee Cup', 
//     points: 350, 
//     category: 'Eco',
//     image: 'https://images.unsplash.com/photo-1577963283259-22a3637dbf2c?w=800', 
//     description: 'Collapsible silicone cup. Bring your own cup and save money.',
//     shippingInfo: 'Pickup available.'
//   },
//   { 
//     id: '20', 
//     title: 'Plant a Tree Donation', 
//     points: 200, 
//     category: 'Eco',
//     image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb7d5fa5?w=800', 
//     description: 'We will donate to plant a tree in the JNF forest on your behalf.',
//     shippingInfo: 'Digital Certificate sent via email.'
//   },

//   // --- CONTINUATION (Items 21-100) ---
//   { 
//     id: '21', 
//     title: 'Frozen Yogurt Cup', 
//     points: 300, 
//     category: 'Food', 
//     image: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=800', 
//     description: 'Medium frozen yogurt with 3 toppings of your choice.', 
//     shippingInfo: 'Show code at checkout.' 
//   },
//   { 
//     id: '22', 
//     title: 'Sushi Platter (16 pcs)', 
//     points: 1100, 
//     category: 'Food', 
//     image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800', 
//     description: 'Assorted sushi rolls including salmon avocado and spicy tuna.', 
//     shippingInfo: 'Valid for pickup or dine-in.' 
//   },
//   { 
//     id: '23', 
//     title: 'Fresh Fruit Smoothie', 
//     points: 350, 
//     category: 'Food', 
//     image: 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=800', 
//     description: 'Large fruit smoothie made with fresh seasonal fruits.', 
//     shippingInfo: 'Digital Voucher.' 
//   },
//   { 
//     id: '24', 
//     title: 'Artisan Bread Loaf', 
//     points: 200, 
//     category: 'Food', 
//     image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800', 
//     description: 'Freshly baked sourdough or whole wheat loaf from local bakery.', 
//     shippingInfo: 'Pickup only.' 
//   },
//   { 
//     id: '25', 
//     title: 'Box of 6 Donuts', 
//     points: 450, 
//     category: 'Food', 
//     image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800', 
//     description: 'Assorted glazed and filled donuts.', 
//     shippingInfo: 'Show code at checkout.' 
//   },
//   { 
//     id: '26', 
//     title: 'Vegan Burger Meal', 
//     points: 650, 
//     category: 'Food', 
//     image: 'https://images.unsplash.com/photo-1525059696034-4967a8e1dca2?w=800', 
//     description: 'Plant-based patty with vegan cheese and sweet potato fries.', 
//     shippingInfo: 'Digital Voucher.' 
//   },
//   { 
//     id: '27', 
//     title: 'Cold Brew Coffee Kit', 
//     points: 900, 
//     category: 'Food', 
//     image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=800', 
//     description: 'Take home kit including ground beans and filter jar.', 
//     shippingInfo: 'Pickup from coffee shop.' 
//   },
//   { 
//     id: '28', 
//     title: 'Gourmet Chocolate Box', 
//     points: 750, 
//     category: 'Food', 
//     image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=800', 
//     description: 'Selection of 12 dark and milk Belgian chocolates.', 
//     shippingInfo: 'Standard shipping.' 
//   },
//   { 
//     id: '29', 
//     title: 'Pasta Dinner for Two', 
//     points: 950, 
//     category: 'Food', 
//     image: 'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=800', 
//     description: 'Two pasta dishes and a starter at Italian family restaurants.', 
//     shippingInfo: 'Digital Voucher.' 
//   },
//   { 
//     id: '30', 
//     title: 'Large Acai Bowl', 
//     points: 400, 
//     category: 'Food', 
//     image: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=800', 
//     description: 'Refreshing acai base topped with granola, banana, and honey.', 
//     shippingInfo: 'Show code at checkout.' 
//   },
//   { 
//     id: '31', 
//     title: 'Winery Tour & Tasting', 
//     points: 1800, 
//     category: 'Food', 
//     image: 'https://images.unsplash.com/photo-1516594915697-87eb3b1c14ea?w=800', 
//     description: 'Tour for two at a local boutique winery including 4 tastings.', 
//     shippingInfo: 'Reservation required.' 
//   },
//   { 
//     id: '32', 
//     title: 'Picnic Hamper', 
//     points: 1500, 
//     category: 'Food', 
//     image: 'https://images.unsplash.com/photo-1544654922-834f6e026197?w=800', 
//     description: 'Basket with cheeses, baguette, dips, and wine.', 
//     shippingInfo: 'Pickup from deli.' 
//   },
//   { 
//     id: '33', 
//     title: 'Chef\'s Salad', 
//     points: 380, 
//     category: 'Food', 
//     image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800', 
//     description: 'Large healthy salad with grilled chicken or tofu.', 
//     shippingInfo: 'Digital Voucher.' 
//   },
//   { 
//     id: '34', 
//     title: 'Thai Noodle Stir-Fry', 
//     points: 500, 
//     category: 'Food', 
//     image: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=800', 
//     description: 'Pad Thai or Pad See Ew with tofu or chicken.', 
//     shippingInfo: 'Valid for delivery.' 
//   },
//   { 
//     id: '35', 
//     title: 'Bubble Tea (Large)', 
//     points: 220, 
//     category: 'Food', 
//     image: 'https://images.unsplash.com/photo-1626880295195-2df94d76f554?w=800',
//     description: 'Taro or Milk Tea with tapioca pearls.', 
//     shippingInfo: 'Show code at counter.' 
//   },
//   { 
//     id: '36', 
//     title: 'Ceramic Plant Pot', 
//     points: 450, 
//     category: 'Home', 
//     image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800', 
//     description: 'Minimalist white ceramic pot for indoor plants (15cm).', 
//     shippingInfo: 'Pickup from garden center.' 
//   },
//   { 
//     id: '37', 
//     title: 'Essential Oil Diffuser', 
//     points: 1100, 
//     category: 'Home', 
//     image: 'https://images.unsplash.com/photo-1602166555132-72049b4db75c?w=800', 
//     description: 'Ultrasonic aromatherapy diffuser with LED lights.', 
//     shippingInfo: 'Home delivery.' 
//   },
//   { 
//     id: '38', 
//     title: 'Soft Throw Blanket', 
//     points: 800, 
//     category: 'Home', 
//     image: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=800', 
//     description: 'Cozy fleece throw blanket (150x200cm), grey.', 
//     shippingInfo: 'Standard shipping.' 
//   },
//   { 
//     id: '39', 
//     title: 'Glass Water Pitcher', 
//     points: 550, 
//     category: 'Home', 
//     image: 'https://images.unsplash.com/photo-1512413914633-b5043f4041ea?w=800', 
//     description: 'Elegant glass carafe with cork lid (1L).', 
//     shippingInfo: 'Pickup available.' 
//   },
//   { 
//     id: '40', 
//     title: 'Bamboo Cutting Board', 
//     points: 600, 
//     category: 'Home', 
//     image: 'https://images.unsplash.com/photo-1594385208974-2e75f8d7bb48?w=800', 
//     description: 'Durable organic bamboo chopping board.', 
//     shippingInfo: 'Standard shipping.' 
//   },
//   { 
//     id: '41', 
//     title: 'Scented Soy Candle', 
//     points: 350, 
//     category: 'Home', 
//     image: 'https://images.unsplash.com/photo-1602826647953-273a5e8184a5?w=800', 
//     description: 'Lavender and vanilla scented candle in glass jar.', 
//     shippingInfo: 'Pickup from store.' 
//   },
//   { 
//     id: '42', 
//     title: 'French Press Coffee Maker', 
//     points: 850, 
//     category: 'Home', 
//     image: 'https://images.unsplash.com/photo-1565452344054-01369143d915?w=800', 
//     description: '800ml stainless steel and glass coffee press.', 
//     shippingInfo: 'Home delivery.' 
//   },
//   { 
//     id: '43', 
//     title: 'Memory Foam Pillow', 
//     points: 1200, 
//     category: 'Home', 
//     image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e6?w=800', 
//     description: 'Orthopedic cervical pillow for neck pain relief.', 
//     shippingInfo: 'Home delivery.' 
//   },
//   { 
//     id: '44', 
//     title: 'Set of 4 Wine Glasses', 
//     points: 750, 
//     category: 'Home', 
//     image: 'https://images.unsplash.com/photo-1510626176961-4b57d4fbad71?w=800', 
//     description: 'Crystal red wine glasses, dishwasher safe.', 
//     shippingInfo: 'Fragile shipping included.' 
//   },
//   { 
//     id: '45', 
//     title: 'Digital Kitchen Scale', 
//     points: 400, 
//     category: 'Home', 
//     image: 'https://images.unsplash.com/photo-1595475207225-428b62bda831?w=800', 
//     description: 'Precise food scale up to 5kg.', 
//     shippingInfo: 'Standard shipping.' 
//   },
//   { 
//     id: '46', 
//     title: 'Decorative Wall Mirror', 
//     points: 1500, 
//     category: 'Home', 
//     image: 'https://images.unsplash.com/photo-1618220179428-22790b461013?w=800', 
//     description: 'Round hanging mirror with black metal frame (50cm).', 
//     shippingInfo: 'Home delivery.' 
//   },
//   { 
//     id: '47', 
//     title: 'Spice Jar Organizer', 
//     points: 500, 
//     category: 'Home', 
//     image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800', 
//     description: 'Set of 12 glass jars with labels.', 
//     shippingInfo: 'Standard shipping.' 
//   },
//   { 
//     id: '48', 
//     title: 'Desk Lamp (LED)', 
//     points: 900, 
//     category: 'Home', 
//     image: 'https://images.unsplash.com/photo-1534073828943-f801091a7d58?w=800', 
//     description: 'Adjustable desk lamp with USB charging port.', 
//     shippingInfo: 'Home delivery.' 
//   },
//   { 
//     id: '49', 
//     title: 'Cotton Bed Sheets (Queen)', 
//     points: 1800, 
//     category: 'Home', 
//     image: 'https://images.unsplash.com/photo-1522771753035-1a5b6564f3a4?w=800', 
//     description: '100% Cotton satin sheet set, white.', 
//     shippingInfo: 'Home delivery.' 
//   },
//   { 
//     id: '50', 
//     title: 'Cast Iron Skillet', 
//     points: 1300, 
//     category: 'Home', 
//     image: 'https://images.unsplash.com/photo-1558197775-f71665eb2419?w=800', 
//     description: 'Pre-seasoned 10-inch heavy duty skillet.', 
//     shippingInfo: 'Heavy shipping included.' 
//   },
//   { 
//     id: '51', 
//     title: 'Electric Kettle', 
//     points: 950, 
//     category: 'Home', 
//     image: 'https://images.unsplash.com/photo-1536329068-0775d116c906?w=800', 
//     description: 'Glass body 1.7L fast boil kettle.', 
//     shippingInfo: 'Pickup available.' 
//   },
//   { 
//     id: '52', 
//     title: 'Storage Baskets (Set of 3)', 
//     points: 600, 
//     category: 'Home', 
//     image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800', 
//     description: 'Woven fabric baskets for organization.', 
//     shippingInfo: 'Standard shipping.' 
//   },
//   { 
//     id: '53', 
//     title: 'Resistance Bands Set', 
//     points: 300, 
//     category: 'Fitness', 
//     image: 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=800', 
//     description: '5 bands with different resistance levels.', 
//     shippingInfo: 'Standard shipping.' 
//   },
//   { 
//     id: '54', 
//     title: 'Foam Roller', 
//     points: 450, 
//     category: 'Fitness', 
//     image: 'https://images.unsplash.com/photo-1600881333168-2ef49b341f30?w=800', 
//     description: 'High density foam roller for muscle recovery.', 
//     shippingInfo: 'Pickup from sports store.' 
//   },
//   { 
//     id: '55', 
//     title: 'Kettlebell 6kg', 
//     points: 800, 
//     category: 'Fitness', 
//     image: 'https://images.unsplash.com/photo-1599447421405-0c1741427447?w=800', 
//     description: 'Vinyl coated cast iron kettlebell.', 
//     shippingInfo: 'Home delivery.' 
//   },
//   { 
//     id: '56', 
//     title: 'Jump Rope (Speed)', 
//     points: 200, 
//     category: 'Fitness', 
//     image: 'https://images.unsplash.com/photo-1594737625785-a6cbdabd333c?w=800', 
//     description: 'Adjustable steel wire jump rope.', 
//     shippingInfo: 'Standard shipping.' 
//   },
//   { 
//     id: '57', 
//     title: 'Gym Duffel Bag', 
//     points: 900, 
//     category: 'Fitness', 
//     image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800', 
//     description: 'Water resistant sports bag with shoe compartment.', 
//     shippingInfo: 'Standard shipping.' 
//   },
//   { 
//     id: '58', 
//     title: 'Pilates Ring', 
//     points: 500, 
//     category: 'Fitness', 
//     image: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=800', 
//     description: 'Magic circle ring for toning thighs and arms.', 
//     shippingInfo: 'Pickup available.' 
//   },
//   { 
//     id: '59', 
//     title: 'Men\'s Running Shorts', 
//     points: 600, 
//     category: 'Fitness', 
//     image: 'https://images.unsplash.com/photo-1565259160565-d62b531475ee?w=800', 
//     description: 'Breathable fabric shorts with phone pocket.', 
//     shippingInfo: 'Choose size at checkout.' 
//   },
//   { 
//     id: '60', 
//     title: 'Women\'s Sports Bra', 
//     points: 550, 
//     category: 'Fitness', 
//     image: 'https://images.unsplash.com/photo-1571731956672-f2b94d7dd0cb?w=800', 
//     description: 'High support racerback sports bra.', 
//     shippingInfo: 'Choose size at checkout.' 
//   },
//   { 
//     id: '61', 
//     title: 'Ab Roller Wheel', 
//     points: 400, 
//     category: 'Fitness', 
//     image: 'https://images.unsplash.com/photo-1598971639058-211a73287750?w=800', 
//     description: 'Core workout wheel with knee pad.', 
//     shippingInfo: 'Standard shipping.' 
//   },
//   { 
//     id: '62', 
//     title: 'Hiking Poles (Pair)', 
//     points: 1100, 
//     category: 'Fitness', 
//     image: 'https://images.unsplash.com/photo-1597658093240-a3594892780e?w=800', 
//     description: 'Collapsible aluminum trekking poles.', 
//     shippingInfo: 'Home delivery.' 
//   },
//   { 
//     id: '63', 
//     title: 'Swimming Goggles', 
//     points: 350, 
//     category: 'Fitness', 
//     image: 'https://images.unsplash.com/photo-1596707328003-7cb73c9c991b?w=800', 
//     description: 'Anti-fog UV protection goggles.', 
//     shippingInfo: 'Standard shipping.' 
//   },
//   { 
//     id: '64', 
//     title: 'Protein Shaker Bottle', 
//     points: 150, 
//     category: 'Fitness', 
//     image: 'https://images.unsplash.com/photo-1573336717524-73347b778749?w=800', 
//     description: '700ml shaker with mixing ball.', 
//     shippingInfo: 'Standard shipping.' 
//   },
//   { 
//     id: '65', 
//     title: 'Camping Tent (2 Person)', 
//     points: 3500, 
//     category: 'Fitness', 
//     image: 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=800', 
//     description: 'Lightweight waterproof dome tent.', 
//     shippingInfo: 'Home delivery.' 
//   },
//   { 
//     id: '66', 
//     title: 'Power Bank 10000mAh', 
//     points: 800, 
//     category: 'Gadgets', 
//     image: 'https://images.unsplash.com/photo-1609592425023-e189874a956d?w=800', 
//     description: 'Fast charging slim power bank (USB-C).', 
//     shippingInfo: 'Standard shipping.' 
//   },
//   { 
//     id: '67', 
//     title: 'Phone Tripod Stand', 
//     points: 450, 
//     category: 'Gadgets', 
//     image: 'https://images.unsplash.com/photo-1533228876829-65c94e7b5025?w=800', 
//     description: 'Flexible tripod with bluetooth remote.', 
//     shippingInfo: 'Standard shipping.' 
//   },
//   { 
//     id: '68', 
//     title: 'Wireless Mouse', 
//     points: 600, 
//     category: 'Gadgets', 
//     image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800', 
//     description: 'Ergonomic silent click mouse.', 
//     shippingInfo: 'Standard shipping.' 
//   },
//   { 
//     id: '69', 
//     title: 'Smart LED Bulb', 
//     points: 350, 
//     category: 'Gadgets', 
//     image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800', 
//     description: 'Color changing bulb, WiFi controlled.', 
//     shippingInfo: 'Standard shipping.' 
//   },
//   { 
//     id: '70', 
//     title: 'Laptop Sleeve 13"', 
//     points: 500, 
//     category: 'Gadgets', 
//     image: 'https://images.unsplash.com/photo-1529337004473-19961ee452b4?w=800', 
//     description: 'Protective padded case, water resistant.', 
//     shippingInfo: 'Standard shipping.' 
//   },
//   { 
//     id: '71', 
//     title: 'Bluetooth Headset', 
//     points: 950, 
//     category: 'Gadgets', 
//     image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800', 
//     description: 'Over-ear headphones with mic.', 
//     shippingInfo: 'Home delivery.' 
//   },
//   { 
//     id: '72', 
//     title: 'Car Phone Mount', 
//     points: 300, 
//     category: 'Gadgets', 
//     image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800', 
//     description: 'Magnetic dashboard mount.', 
//     shippingInfo: 'Standard shipping.' 
//   },
//   { 
//     id: '73', 
//     title: 'Gaming Mouse Pad', 
//     points: 250, 
//     category: 'Gadgets', 
//     image: 'https://images.unsplash.com/photo-1615870216519-2f9fa575fa5c?w=800', 
//     description: 'Large extended desk mat (RGB).', 
//     shippingInfo: 'Standard shipping.' 
//   },
//   { 
//     id: '74', 
//     title: 'GoPro Style Action Cam', 
//     points: 4000, 
//     category: 'Gadgets', 
//     image: 'https://images.unsplash.com/photo-1563297121-0847b2c58908?w=800', 
//     description: '4K waterproof camera with mounting kit.', 
//     shippingInfo: 'Insured shipping.' 
//   },
//   { 
//     id: '75', 
//     title: 'USB Flash Drive 128GB', 
//     points: 400, 
//     category: 'Gadgets', 
//     image: 'https://images.unsplash.com/photo-1623945202868-b7107779d712?w=800', 
//     description: 'High speed USB 3.0 metal drive.', 
//     shippingInfo: 'Standard shipping.' 
//   },
//   { 
//     id: '76', 
//     title: 'Webcam 1080p', 
//     points: 1100, 
//     category: 'Gadgets', 
//     image: 'https://images.unsplash.com/photo-1598257006626-485314071169?w=800', 
//     description: 'HD webcam with built-in microphone.', 
//     shippingInfo: 'Home delivery.' 
//   },
//   { 
//     id: '77', 
//     title: 'Beeswax Food Wraps', 
//     points: 350, 
//     category: 'Eco', 
//     image: 'https://images.unsplash.com/photo-1627916607164-7b64f9c54e0c?w=800', 
//     description: 'Set of 3 reusable food covers. Plastic alternative.', 
//     shippingInfo: 'Standard shipping.' 
//   },
//   { 
//     id: '78', 
//     title: 'Glass Tupperware Set', 
//     points: 900, 
//     category: 'Eco', 
//     image: 'https://images.unsplash.com/photo-1614373407986-9a22f309a473?w=800', 
//     description: '3 glass containers with bamboo lids.', 
//     shippingInfo: 'Pickup available.' 
//   },
//   { 
//     id: '79', 
//     title: 'Compost Bin (Kitchen)', 
//     points: 750, 
//     category: 'Eco', 
//     image: 'https://images.unsplash.com/photo-1605218427368-35b0b2308947?w=800', 
//     description: 'Odor-free countertop compost pail.', 
//     shippingInfo: 'Standard shipping.' 
//   },
//   { 
//     id: '80', 
//     title: 'Recycled Notebook', 
//     points: 150, 
//     category: 'Eco', 
//     image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800', 
//     description: 'A5 notebook made from 100% recycled paper.', 
//     shippingInfo: 'Standard shipping.' 
//   },
//   { 
//     id: '81', 
//     title: 'Solar Power Bank', 
//     points: 1200, 
//     category: 'Eco', 
//     image: 'https://images.unsplash.com/photo-1555543163-470081d4316d?w=800', 
//     description: 'Charges via sunlight, rugged design.', 
//     shippingInfo: 'Home delivery.' 
//   },
//   { 
//     id: '82', 
//     title: 'Metal Straw Set', 
//     points: 100, 
//     category: 'Eco', 
//     image: 'https://images.unsplash.com/photo-1571657805212-9216d246c4f0?w=800', 
//     description: '4 stainless steel straws with cleaning brush.', 
//     shippingInfo: 'Standard shipping.' 
//   },
//   { 
//     id: '83', 
//     title: 'Biodegradable Phone Case', 
//     points: 500, 
//     category: 'Eco', 
//     image: 'https://images.unsplash.com/photo-1615234567262-11f81d82803b?w=800', 
//     description: 'Compostable case, fits iPhone/Android.', 
//     shippingInfo: 'Choose model at checkout.' 
//   },
//   { 
//     id: '84', 
//     title: 'Loofah Sponge', 
//     points: 120, 
//     category: 'Eco', 
//     image: 'https://images.unsplash.com/photo-1596660124357-128a39d48261?w=800', 
//     description: 'Natural scrubbing sponge for bath or dishes.', 
//     shippingInfo: 'Standard shipping.' 
//   },
//   { 
//     id: '85', 
//     title: 'Solid Shampoo Bar', 
//     points: 300, 
//     category: 'Eco', 
//     image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfbc8?w=800', 
//     description: 'Plastic-free shampoo bar, lasts 50 washes.', 
//     shippingInfo: 'Standard shipping.' 
//   },
//   { 
//     id: '86', 
//     title: 'Seed Bomb Kit', 
//     points: 250, 
//     category: 'Eco', 
//     image: 'https://images.unsplash.com/photo-1454562061637-2591696b92be?w=800', 
//     description: 'Throw to plant wildflowers anywhere.', 
//     shippingInfo: 'Standard shipping.' 
//   },
//   { 
//     id: '87', 
//     title: 'Organic Cotton Socks', 
//     points: 350, 
//     category: 'Eco', 
//     image: 'https://images.unsplash.com/photo-1582966772652-13a015383f98?w=800', 
//     description: 'Pack of 3 breathable eco-cotton socks.', 
//     shippingInfo: 'Choose size at checkout.' 
//   },
//   { 
//     id: '88', 
//     title: 'Safety Razor', 
//     points: 800, 
//     category: 'Eco', 
//     image: 'https://images.unsplash.com/photo-1618222956976-9c4c11b0e9d6?w=800', 
//     description: 'Classic double-edge razor, zero waste.', 
//     shippingInfo: 'Includes 5 blades.' 
//   },
//   { 
//     id: '89', 
//     title: 'Jute Shopping Bag', 
//     points: 200, 
//     category: 'Eco', 
//     image: 'https://images.unsplash.com/photo-1596205216390-272e0b575225?w=800', 
//     description: 'Heavy duty natural fiber grocery bag.', 
//     shippingInfo: 'Standard shipping.' 
//   },
//   { 
//     id: '90', 
//     title: 'Wooden Hair Brush', 
//     points: 300, 
//     category: 'Eco', 
//     image: 'https://images.unsplash.com/photo-1590156637373-c875152865d1?w=800', 
//     description: 'Bamboo paddle brush for all hair types.', 
//     shippingInfo: 'Standard shipping.' 
//   },
//   { 
//     id: '91', 
//     title: 'Herb Garden Kit', 
//     points: 650, 
//     category: 'Eco', 
//     image: 'https://images.unsplash.com/photo-1584803738016-b51f08d0a0b2?w=800', 
//     description: 'Grow basil, mint, and thyme indoors.', 
//     shippingInfo: 'Standard shipping.' 
//   },
//   { 
//     id: '92', 
//     title: 'Recycled Glass Vase', 
//     points: 550, 
//     category: 'Eco', 
//     image: 'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=800', 
//     description: 'Hand-blown decorative vase.', 
//     shippingInfo: 'Standard shipping.' 
//   },
//   { 
//     id: '93', 
//     title: 'Solar Garden Lights', 
//     points: 900, 
//     category: 'Eco', 
//     image: 'https://images.unsplash.com/photo-1595126860083-207d6a54162e?w=800', 
//     description: 'Pack of 4 path lights, auto on/off.', 
//     shippingInfo: 'Home delivery.' 
//   },
//   { 
//     id: '94', 
//     title: 'Eco-Friendly Laundry Strips', 
//     points: 400, 
//     category: 'Eco', 
//     image: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=800', 
//     description: 'Plastic-free detergent sheets (32 loads).', 
//     shippingInfo: 'Standard shipping.' 
//   },
//   { 
//     id: '95', 
//     title: 'Cork Yoga Block', 
//     points: 350, 
//     category: 'Eco', 
//     image: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=800', 
//     description: 'Natural cork block for stability.', 
//     shippingInfo: 'Standard shipping.' 
//   },
//   { 
//     id: '96', 
//     title: 'Donate: Clean Water', 
//     points: 500, 
//     category: 'Eco', 
//     image: 'https://images.unsplash.com/photo-1538300342682-cf57afb97285?w=800', 
//     description: 'Donation to provide clean water access.', 
//     shippingInfo: 'Digital Certificate.' 
//   },
//   { 
//     id: '97', 
//     title: 'Donate: Animal Shelter', 
//     points: 500, 
//     category: 'Eco', 
//     image: 'https://images.unsplash.com/photo-1552565651-d4198305c6d3?w=800', 
//     description: 'Buy food for a shelter dog.', 
//     shippingInfo: 'Digital Certificate.' 
//   },
//   { 
//     id: '98', 
//     title: 'Donate: Ocean Cleanup', 
//     points: 1000, 
//     category: 'Eco', 
//     image: 'https://images.unsplash.com/photo-1484291470158-b8f8d608850d?w=800', 
//     description: 'Support removal of ocean plastics.', 
//     shippingInfo: 'Digital Certificate.' 
//   },
//   { 
//     id: '99', 
//     title: 'Macramé Plant Hanger', 
//     points: 300, 
//     category: 'Home', 
//     image: 'https://images.unsplash.com/photo-1590453535266-992a820c4516?w=800', 
//     description: 'Handmade cotton hanging planter.', 
//     shippingInfo: 'Standard shipping.' 
//   },
//   { 
//     id: '100', 
//     title: 'Hammock', 
//     points: 1600, 
//     category: 'Home', 
//     image: 'https://images.unsplash.com/photo-1528698000570-76034e34e565?w=800', 
//     description: 'Double camping hammock with straps.', 
//     shippingInfo: 'Standard shipping.' 
//   }
// ];