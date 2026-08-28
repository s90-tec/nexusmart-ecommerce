const db = require('./database');
const bcrypt = require('bcryptjs');

function seedDatabase() {
  console.log('🌱 Starting NexusMart database seeding...');

  // 1. Clear existing records for fresh seed
  db.exec(`
    DELETE FROM order_timeline;
    DELETE FROM order_items;
    DELETE FROM orders;
    DELETE FROM reviews;
    DELETE FROM products;
    DELETE FROM coupons;
    DELETE FROM users;
  `);

  // 2. Seed Users
  const salt = bcrypt.genSaltSync(10);
  const adminPassword = bcrypt.hashSync('Admin@123', salt);
  const userPassword = bcrypt.hashSync('User@123', salt);

  const insertUser = db.prepare(`
    INSERT INTO users (name, email, password, role, avatar, phone, address)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const adminId = insertUser.run(
    'Admin Nexus',
    'admin@nexusmart.com',
    adminPassword,
    'admin',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    '+1 (555) 019-2834',
    '100 Enterprise Way, Suite 400, Silicon Valley, CA 94025'
  ).lastInsertRowid;

  const alexId = insertUser.run(
    'Alex Morgan',
    'alex@example.com',
    userPassword,
    'customer',
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
    '+1 (555) 234-5678',
    '742 Evergreen Terrace, Springfield, OR 97477'
  ).lastInsertRowid;

  const sarahId = insertUser.run(
    'Sarah Chen',
    'sarah@example.com',
    userPassword,
    'customer',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    '+1 (555) 987-6543',
    '456 Pine Street, Apt 12B, Seattle, WA 98101'
  ).lastInsertRowid;

  console.log('✅ Users seeded: Admin and Customers created.');

  // 3. Seed Products
  const products = [
    {
      title: 'Apex Pro Wireless ANC Headphones',
      slug: 'apex-pro-wireless-anc-headphones',
      description: 'Engineered for audiophiles. Features industry-leading Active Noise Cancellation, 40-hour ultra battery life, spatial acoustic audio, and memory foam comfort pads with aerospace aluminum framing.',
      price: 299.99,
      original_price: 349.99,
      discount_percent: 14,
      category: 'Electronics & Audio',
      brand: 'AcoustiQ',
      stock: 35,
      rating: 4.9,
      review_count: 128,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
      gallery: JSON.stringify([
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80'
      ]),
      features: JSON.stringify([
        'Adaptive Hybrid ANC with Transparency Mode',
        'Custom 45mm Bio-Cellulose Dynamic Drivers',
        '40 Hours Playtime on Single Charge (USB-C Fast Charge)',
        'Bluetooth 5.3 Multipoint Dual-Device Connection'
      ]),
      tags: JSON.stringify(['Audio', 'Wireless', 'Noise-Cancelling', 'Headphones', 'Premium']),
      is_featured: 1
    },
    {
      title: 'AuraPulse 360° Studio Bluetooth Speaker',
      slug: 'aurapulse-360-studio-speaker',
      description: 'Room-filling high-fidelity sound with ambient reactive LED lighting. IPX7 waterproof rating makes it perfect for both living rooms and outdoor adventures.',
      price: 149.99,
      original_price: 179.99,
      discount_percent: 17,
      category: 'Electronics & Audio',
      brand: 'AcoustiQ',
      stock: 24,
      rating: 4.7,
      review_count: 86,
      image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&auto=format&fit=crop&q=80',
      gallery: JSON.stringify([
        'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80'
      ]),
      features: JSON.stringify([
        '360-degree Omnidirectional Surround Acoustics',
        'IPX7 Waterproof and Dustproof Durability',
        '24-Hour Continuous Battery Life',
        'Dynamic RGB Ambient Aura Sync'
      ]),
      tags: JSON.stringify(['Speaker', 'Bluetooth', 'Waterproof', 'Outdoor']),
      is_featured: 1
    },
    {
      title: 'CyberStudio 4K Pro HDR Webcam',
      slug: 'cyberstudio-4k-pro-hdr-webcam',
      description: 'Broadcast in cinema-grade 4K at 60FPS. AI auto-framing, dual noise-reducing stereo microphones, and physical privacy shutter for streamers, creators, and executives.',
      price: 189.99,
      original_price: 219.99,
      discount_percent: 13,
      category: 'Computing & Office',
      brand: 'CyberTech',
      stock: 18,
      rating: 4.8,
      review_count: 64,
      image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
      gallery: JSON.stringify([
        'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80'
      ]),
      features: JSON.stringify([
        'Sony STARVIS CMOS 4K Sensor',
        'AI Facial Auto-Tracking & HDR Compensation',
        'Integrated Mechanical Privacy Lens Cover',
        'Dual Beamforming Noise-Filter Microphones'
      ]),
      tags: JSON.stringify(['Webcam', 'Streaming', '4K', 'Office', 'Creator']),
      is_featured: 0
    },
    {
      title: 'QuantumX RGB Wireless Mechanical Keyboard',
      slug: 'quantumx-rgb-mechanical-keyboard',
      description: 'Hot-swappable tactile linear switches with aircraft aluminum body, customizable per-key OLED display widget, and seamless tri-mode wireless connectivity.',
      price: 169.99,
      original_price: 199.99,
      discount_percent: 15,
      category: 'Computing & Office',
      brand: 'HyperKey',
      stock: 40,
      rating: 4.9,
      review_count: 210,
      image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
      gallery: JSON.stringify([
        'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80'
      ]),
      features: JSON.stringify([
        'Gateron Pro Yellow Lubed Mechanical Switches',
        'PBT Double-Shot Sound-Dampening Keycaps',
        'Tri-Mode: 2.4GHz Dongle, Bluetooth 5.2, USB-C Cable',
        'Smart Interactive Mini OLED Info Display'
      ]),
      tags: JSON.stringify(['Keyboard', 'Mechanical', 'RGB', 'Gaming', 'Office']),
      is_featured: 1
    },
    {
      title: 'Horizon Pro 16" OLED M3 Laptop',
      slug: 'horizon-pro-16-oled-laptop',
      description: 'Ultimate creative powerhouse with 16-inch 3.2K 120Hz OLED display, 32GB Unified Memory, 1TB NVMe Gen4 SSD, and lightweight forged magnesium chassis.',
      price: 1899.99,
      original_price: 2199.99,
      discount_percent: 14,
      category: 'Computing & Office',
      brand: 'Zenith',
      stock: 12,
      rating: 4.95,
      review_count: 53,
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
      gallery: JSON.stringify([
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&auto=format&fit=crop&q=80'
      ]),
      features: JSON.stringify([
        '16-inch 3.2K 120Hz 100% DCI-P3 Nano-OLED Screen',
        '16-Core Ultra CPU + 40-Core Neural Graphic Engine',
        '100Wh High Density Battery (Up to 18 hrs use)',
        'Vapor Chamber Liquid Stealth Cooling'
      ]),
      tags: JSON.stringify(['Laptop', 'OLED', 'Performance', 'Computing']),
      is_featured: 1
    },
    {
      title: 'ErgoGlide Aluminum Adjustable Laptop Stand',
      slug: 'ergoglide-aluminum-laptop-stand',
      description: 'Precision CNC-machined aerospace alloy with 360-degree dual swivel pivot, ergonomic eye-level adjustment, and thermal dissipation airflow vents.',
      price: 59.99,
      original_price: 79.99,
      discount_percent: 25,
      category: 'Computing & Office',
      brand: 'ErgoTech',
      stock: 65,
      rating: 4.6,
      review_count: 92,
      image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&auto=format&fit=crop&q=80',
      gallery: JSON.stringify([
        'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&auto=format&fit=crop&q=80'
      ]),
      features: JSON.stringify([
        'Supports laptops up to 17.3 inches (Up to 20kg payload)',
        'Infinite Tilt Angles for Perfect Spinal Posture',
        'Non-Slip Silicone Cushion Base and Scratch Guard'
      ]),
      tags: JSON.stringify(['Ergonomics', 'Accessories', 'Desk Setup', 'Office']),
      is_featured: 0
    },
    {
      title: 'PulseFit Series 9 Titanium Smartwatch',
      slug: 'pulsefit-series-9-titanium-smartwatch',
      description: 'Aerospace Grade 5 titanium bezel with sapphire crystal glass. Features ECG, SpO2, HRV stress tracking, offline topographic GPS maps, and 14-day battery.',
      price: 349.99,
      original_price: 399.99,
      discount_percent: 12,
      category: 'Smart Wearables',
      brand: 'PulseFit',
      stock: 22,
      rating: 4.85,
      review_count: 147,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
      gallery: JSON.stringify([
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80'
      ]),
      features: JSON.stringify([
        '1.43" Always-On LTPO AMOLED (2000 nits peak)',
        'Advanced Biometric Multi-Sensor Suite (ECG, SpO2, Temp)',
        'Dual-Frequency Multi-Band GPS for Extreme Precision',
        '5ATM / 50M Dive Waterproof Certified'
      ]),
      tags: JSON.stringify(['Smartwatch', 'Fitness', 'Titanium', 'GPS', 'Wearable']),
      is_featured: 1
    },
    {
      title: 'VeloTrack Slim GPS Fitness Tracker',
      slug: 'velotrack-slim-gps-fitness-tracker',
      description: 'Ultralight 22-gram curved AMOLED wristband with 24/7 heart rate monitoring, sleep staging analysis, and 100+ automated workout sports modes.',
      price: 79.99,
      original_price: 99.99,
      discount_percent: 20,
      category: 'Smart Wearables',
      brand: 'PulseFit',
      stock: 45,
      rating: 4.5,
      review_count: 73,
      image: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=800&auto=format&fit=crop&q=80',
      gallery: JSON.stringify([
        'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=800&auto=format&fit=crop&q=80'
      ]),
      features: JSON.stringify([
        'Featherlight 22g Ergonomic Waterproof Band',
        'Continuous Heart Rate & Sleep Apnea Alerts',
        '10-Day Battery Life on Rapid Magnetic Charge'
      ]),
      tags: JSON.stringify(['Fitness', 'Wearable', 'Tracker', 'Health']),
      is_featured: 0
    },
    {
      title: 'HydroPure Smart Thermos with UV-C Purifier',
      slug: 'hydropure-smart-thermos-uvc',
      description: 'Self-cleaning insulated 750ml bottle with built-in UV-C cap that neutralizes 99.99% of bio-contaminants. Digital LED touch cap shows exact liquid temperature.',
      price: 69.99,
      original_price: 89.99,
      discount_percent: 22,
      category: 'Home & Lifestyle',
      brand: 'HydroPure',
      stock: 50,
      rating: 4.75,
      review_count: 112,
      image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80',
      gallery: JSON.stringify([
        'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80'
      ]),
      features: JSON.stringify([
        'UV-C LED Sterilization Cycle Every 2 Hours',
        'Triple-Wall Vacuum Insulation (24h Cold / 14h Hot)',
        'Touch OLED Real-Time Temperature Display',
        'BPA-Free 316 Food-Grade Stainless Steel'
      ]),
      tags: JSON.stringify(['Thermos', 'Smart Home', 'Hydration', 'Purifier']),
      is_featured: 1
    },
    {
      title: 'AromaCloud Ultrasonic Ambient Diffuser',
      slug: 'aromacloud-ultrasonic-ambient-diffuser',
      description: 'Sculpted ceramic ultrasonic essential oil diffuser with soothing flame simulation mist lighting, whisper-quiet operation (<20dB), and smart timer shutoff.',
      price: 49.99,
      original_price: 65.00,
      discount_percent: 23,
      category: 'Home & Lifestyle',
      brand: 'ZenHome',
      stock: 30,
      rating: 4.65,
      review_count: 88,
      image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&auto=format&fit=crop&q=80',
      gallery: JSON.stringify([
        'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&auto=format&fit=crop&q=80'
      ]),
      features: JSON.stringify([
        'Ultrasonic 2.4MHz Cool Mist Vaporization',
        'Warm Ambient Flame Atmosphere Lighting',
        'Auto Waterless Safety Power Shutoff'
      ]),
      tags: JSON.stringify(['Aromatherapy', 'Home', 'Relaxation', 'Diffuser']),
      is_featured: 0
    },
    {
      title: 'BaristaCraft Touchscreen Espresso Machine',
      slug: 'baristacraft-touchscreen-espresso-machine',
      description: 'Commercial 20-bar Italian pump with precision thermoblock heating, integrated burr grinder, and automatic micro-foam milk texturing wand.',
      price: 599.99,
      original_price: 699.99,
      discount_percent: 14,
      category: 'Home & Lifestyle',
      brand: 'BaristaCraft',
      stock: 8,
      rating: 4.9,
      review_count: 42,
      image: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&auto=format&fit=crop&q=80',
      gallery: JSON.stringify([
        'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&auto=format&fit=crop&q=80'
      ]),
      features: JSON.stringify([
        '20-Bar High Pressure Italian Extraction Pump',
        'Integrated Conical Steel Burr Grinder with 15 Grind Levels',
        'Instant 3-Second ThermoJet Thermal System',
        'Interactive Color Touchscreen with Custom Profiles'
      ]),
      tags: JSON.stringify(['Coffee', 'Espresso', 'Kitchen', 'Barista']),
      is_featured: 1
    },
    {
      title: 'Nomad Shield Tactical Anti-Theft Backpack',
      slug: 'nomad-shield-anti-theft-backpack',
      description: 'Water-repellent Cordura ballistic nylon with hidden TSA locks, RFID-blocking passport sleeves, padded 16\" laptop compartment, and external USB-C pass-through port.',
      price: 119.99,
      original_price: 149.99,
      discount_percent: 20,
      category: 'Accessories & Gear',
      brand: 'NomadGear',
      stock: 42,
      rating: 4.8,
      review_count: 156,
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80',
      gallery: JSON.stringify([
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80'
      ]),
      features: JSON.stringify([
        'Cut-Proof Weatherproof 1000D Cordura Fabric',
        'Integrated TSA Hidden Combination Lock System',
        'Ergonomic Air-Mesh Lumbar Support Straps',
        'Expandable 25L to 35L Capacity'
      ]),
      tags: JSON.stringify(['Backpack', 'Travel', 'Anti-Theft', 'Accessories']),
      is_featured: 1
    },
    {
      title: 'PowerVault 25000mAh 140W MagSafe Power Bank',
      slug: 'powervault-25000mah-140w-magsafe-powerbank',
      description: 'High-density airline-safe power bank capable of fast-charging a 16\" MacBook Pro, iPhone, and Apple Watch concurrently with real-time IPS digital power telemetry display.',
      price: 99.99,
      original_price: 129.99,
      discount_percent: 23,
      category: 'Accessories & Gear',
      brand: 'VoltEdge',
      stock: 35,
      rating: 4.88,
      review_count: 98,
      image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800&auto=format&fit=crop&q=80',
      gallery: JSON.stringify([
        'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800&auto=format&fit=crop&q=80'
      ]),
      features: JSON.stringify([
        '140W Dual-Port USB-C Power Delivery 3.1 Fast Charge',
        'Smart Color IPS Display with Wattage & Time-to-Empty',
        '15W Fast MagSafe Magnetic Wireless Puck',
        '25,000mAh Massive Airline-Compliant Capacity'
      ]),
      tags: JSON.stringify(['PowerBank', 'MagSafe', 'Charging', 'Travel']),
      is_featured: 1
    },
    {
      title: 'Lumina Arc Ergonomic Monitor Light Bar',
      slug: 'lumina-arc-monitor-light-bar',
      description: 'Asymmetric optical glare-free desk lamp with wireless rotary dial puck, auto-ambient dimming sensor, and dual-tone front & back backlight bias illumination.',
      price: 89.99,
      original_price: 109.99,
      discount_percent: 18,
      category: 'Computing & Office',
      brand: 'Lumina',
      stock: 28,
      rating: 4.7,
      review_count: 67,
      image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&auto=format&fit=crop&q=80',
      gallery: JSON.stringify([
        'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&auto=format&fit=crop&q=80'
      ]),
      features: JSON.stringify([
        'Zero Screen Glare Precision Asymmetric Light Beam',
        'Wireless 2.4GHz Desktop Rotary Dimmer Controller',
        'Adjustable 2700K - 6500K Stepless Color Temperature'
      ]),
      tags: JSON.stringify(['Desk', 'Lighting', 'Productivity', 'Office']),
      is_featured: 0
    },
    {
      title: 'AeroShield Polarized Titanium Sunglasses',
      slug: 'aeroshield-polarized-titanium-sunglasses',
      description: 'Ultra-durable memory titanium frames weighing just 14g, fitted with HD TAC polarized UV400 anti-reflective scratch-resistant lenses.',
      price: 129.99,
      original_price: 159.99,
      discount_percent: 19,
      category: 'Accessories & Gear',
      brand: 'OpticEdge',
      stock: 20,
      rating: 4.6,
      review_count: 51,
      image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop&q=80',
      gallery: JSON.stringify([
        'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop&q=80'
      ]),
      features: JSON.stringify([
        'Beta-Titanium Flexible Non-Corrosive Frames',
        '9-Layer Polarized HD Clarity UV400 Protection',
        'Hydrophobic Oil & Smudge Resistant Coating'
      ]),
      tags: JSON.stringify(['Eyewear', 'Fashion', 'Titanium', 'Lifestyle']),
      is_featured: 0
    },
    {
      title: 'NovaPod Pro ANC Wireless Earbuds',
      slug: 'novapod-pro-anc-wireless-earbuds',
      description: 'Featherlight in-ear buds with hybrid 48dB noise reduction, spatial audio head tracking, wireless Qi charging pebble case, and IP55 water resistance.',
      price: 139.99,
      original_price: 169.99,
      discount_percent: 18,
      category: 'Electronics & Audio',
      brand: 'AcoustiQ',
      stock: 32,
      rating: 4.8,
      review_count: 104,
      image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80',
      gallery: JSON.stringify([
        'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80'
      ]),
      features: JSON.stringify([
        '48dB Ultra-Deep Hybrid Noise Cancellation',
        '6-Microphone Array with AI Environmental Wind Filtration',
        '36-Hour Combined Case Playtime with Qi Wireless Support'
      ]),
      tags: JSON.stringify(['Earbuds', 'Audio', 'Wireless', 'ANC']),
      is_featured: 1
    }
  ];

  const insertProduct = db.prepare(`
    INSERT INTO products (
      title, slug, description, price, original_price, discount_percent,
      category, brand, stock, rating, review_count, image, gallery, features, tags, is_featured
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const productIds = [];
  for (const p of products) {
    const res = insertProduct.run(
      p.title, p.slug, p.description, p.price, p.original_price, p.discount_percent,
      p.category, p.brand, p.stock, p.rating, p.review_count, p.image, p.gallery,
      p.features, p.tags, p.is_featured
    );
    productIds.push(res.lastInsertRowid);
  }
  console.log(`✅ Seeded ${products.length} high-quality products.`);

  // 4. Seed Reviews
  const insertReview = db.prepare(`
    INSERT INTO reviews (product_id, user_id, user_name, rating, comment, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const sampleReviews = [
    {
      productId: productIds[0],
      userId: alexId,
      userName: 'Alex Morgan',
      rating: 5,
      comment: 'The noise cancellation is shockingly good! Battery lasts through an entire week of conference calls and gym workouts.',
      created: '2026-08-15 14:30:00'
    },
    {
      productId: productIds[0],
      userId: sarahId,
      userName: 'Sarah Chen',
      rating: 5,
      comment: 'Super lightweight and the soundstage is crisp. The memory foam feels great even after 6 hours.',
      created: '2026-08-20 10:15:00'
    },
    {
      productId: productIds[4],
      userId: alexId,
      userName: 'Alex Morgan',
      rating: 5,
      comment: 'The OLED screen on the Horizon Pro is unmatched. Colors pop and compiling large builds is instantaneous.',
      created: '2026-08-18 16:45:00'
    },
    {
      productId: productIds[6],
      userId: sarahId,
      userName: 'Sarah Chen',
      rating: 5,
      comment: 'The titanium build of this smartwatch is breathtaking. GPS tracks my trail runs without skipping a beat.',
      created: '2026-08-22 09:00:00'
    }
  ];

  for (const rev of sampleReviews) {
    insertReview.run(rev.productId, rev.userId, rev.userName, rev.rating, rev.comment, rev.created);
  }
  console.log('✅ Seeded customer product reviews.');

  // 5. Seed Coupons
  const insertCoupon = db.prepare(`
    INSERT INTO coupons (code, discount_type, discount_value, min_purchase, max_discount, description, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const coupons = [
    ['NEXUS20', 'percentage', 20, 50, 100, 'Get 20% off your entire order over $50', 1],
    ['SAVE50', 'fixed', 50, 200, 50, 'Save $50 flat on orders of $200 or more', 1],
    ['WELCOME10', 'percentage', 10, 0, 50, 'Welcome offer: 10% off for all new shoppers', 1],
    ['FREESHIP', 'shipping', 15, 30, 15, 'Free express shipping on orders over $30', 1]
  ];

  for (const c of coupons) {
    insertCoupon.run(...c);
  }
  console.log('✅ Seeded promo coupons.');

  // 6. Seed Sample Orders with Live Tracking Milestones for Alex
  const insertOrder = db.prepare(`
    INSERT INTO orders (
      order_number, user_id, customer_name, customer_email, customer_phone,
      shipping_address, shipping_city, shipping_state, shipping_zip, shipping_country,
      shipping_method, payment_method, payment_status, status,
      subtotal, discount, coupon_code, tax, shipping_fee, total,
      tracking_carrier, tracking_code, estimated_delivery, notes, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertOrderItem = db.prepare(`
    INSERT INTO order_items (order_id, product_id, title, price, quantity, image, total)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const insertTimeline = db.prepare(`
    INSERT INTO order_timeline (order_id, status, title, description, location, timestamp, is_completed)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  // Order 1: Shipped (Active Order with Live Tracking)
  const order1 = insertOrder.run(
    'NEX-84920',
    alexId,
    'Alex Morgan',
    'alex@example.com',
    '+1 (555) 234-5678',
    '742 Evergreen Terrace',
    'Springfield',
    'OR',
    '97477',
    'USA',
    'Express Air',
    'Credit Card (•••• 4242)',
    'Paid',
    'Shipped',
    449.98,
    45.00,
    'WELCOME10',
    32.40,
    12.99,
    450.37,
    'Nexus Express Priority',
    'NX-TRK-98402198',
    'Aug 30, 2026',
    'Please leave package at the front porch if unavailable.',
    '2026-08-26 11:20:00'
  );
  const order1Id = order1.lastInsertRowid;

  insertOrderItem.run(order1Id, productIds[0], 'Apex Pro Wireless ANC Headphones', 299.99, 1, products[0].image, 299.99);
  insertOrderItem.run(order1Id, productIds[1], 'AuraPulse 360° Studio Bluetooth Speaker', 149.99, 1, products[1].image, 149.99);

  insertTimeline.run(order1Id, 'Ordered', 'Order Confirmed', 'Payment processed and order received into fulfillment system.', 'Nexus Fulfillment Center (Seattle, WA)', '2026-08-26 11:20:00', 1);
  insertTimeline.run(order1Id, 'Processing', 'Quality Check & Packed', 'Items inspected, serial numbers recorded, and boxed securely.', 'Nexus Hub #4 (Seattle, WA)', '2026-08-26 16:45:00', 1);
  insertTimeline.run(order1Id, 'Shipped', 'Handed to Carrier in Transit', 'Package departs regional sorting hub en route to destination facility.', 'Northwest Logistics Gateway (Portland, OR)', '2026-08-27 08:30:00', 1);
  insertTimeline.run(order1Id, 'Out for Delivery', 'Local Courier Dispatch', 'Package is loaded onto the local delivery van.', 'Springfield Distribution Center (OR)', '2026-08-28 07:15:00', 0);
  insertTimeline.run(order1Id, 'Delivered', 'Delivered to Customer', 'Signature recorded and package handed over.', '742 Evergreen Terrace, Springfield, OR', 'Estimated Aug 30, 2026', 0);

  // Order 2: Delivered (Past Completed Order)
  const order2 = insertOrder.run(
    'NEX-71204',
    alexId,
    'Alex Morgan',
    'alex@example.com',
    '+1 (555) 234-5678',
    '742 Evergreen Terrace',
    'Springfield',
    'OR',
    '97477',
    'USA',
    'Standard',
    'UPI / NetBanking',
    'Paid',
    'Delivered',
    349.99,
    0,
    null,
    28.00,
    0,
    377.99,
    'Nexus Express Ground',
    'NX-TRK-71204900',
    'Aug 22, 2026',
    'Delivered to recipient doorstep.',
    '2026-08-18 09:10:00'
  );
  const order2Id = order2.lastInsertRowid;

  insertOrderItem.run(order2Id, productIds[6], 'PulseFit Series 9 Titanium Smartwatch', 349.99, 1, products[6].image, 349.99);

  insertTimeline.run(order2Id, 'Ordered', 'Order Confirmed', 'Payment verified and order accepted.', 'Nexus Hub (San Francisco, CA)', '2026-08-18 09:10:00', 1);
  insertTimeline.run(order2Id, 'Processing', 'Packaging Completed', 'Packed in eco-friendly protective casing.', 'San Francisco Distribution Center', '2026-08-18 14:00:00', 1);
  insertTimeline.run(order2Id, 'Shipped', 'In Transit', 'Package arrived at regional facility.', 'Eugene Regional Depot (OR)', '2026-08-20 18:20:00', 1);
  insertTimeline.run(order2Id, 'Out for Delivery', 'Out for Delivery', 'Courier on route for delivery.', 'Springfield Center (OR)', '2026-08-22 08:30:00', 1);
  insertTimeline.run(order2Id, 'Delivered', 'Delivered & Signed', 'Successfully delivered to front porch.', 'Springfield, OR 97477', '2026-08-22 13:42:00', 1);

  // Order 3: Processing (New order)
  const order3 = insertOrder.run(
    'NEX-93011',
    sarahId,
    'Sarah Chen',
    'sarah@example.com',
    '+1 (555) 987-6543',
    '456 Pine Street, Apt 12B',
    'Seattle',
    'WA',
    '98101',
    'USA',
    'Overnight Priority',
    'Credit Card (•••• 8812)',
    'Paid',
    'Processing',
    119.99,
    20.00,
    'NEXUS20',
    8.00,
    15.00,
    122.99,
    'Nexus Express Overnight',
    'NX-TRK-93011882',
    'Aug 29, 2026',
    'Call apartment buzzer #12B upon arrival.',
    '2026-08-28 09:00:00'
  );
  const order3Id = order3.lastInsertRowid;
  insertOrderItem.run(order3Id, productIds[11], 'Nomad Shield Tactical Anti-Theft Backpack', 119.99, 1, products[11].image, 119.99);
  insertTimeline.run(order3Id, 'Ordered', 'Order Confirmed', 'Order placed and payment authorized.', 'Nexus Main Hub (Seattle, WA)', '2026-08-28 09:00:00', 1);
  insertTimeline.run(order3Id, 'Processing', 'Picking & Verification', 'Items currently being packed by inventory specialists.', 'Seattle Warehouse Unit 3', '2026-08-28 10:15:00', 1);

  console.log('✅ Seeded demo orders with live tracking histories.');
  console.log('🎉 Database seeding complete!');
}

if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
