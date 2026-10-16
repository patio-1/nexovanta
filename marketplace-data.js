/**
 * Nexovanta Virtual Community Marketplace
 * Seed Data & Catalog Definitions
 * Covering Chuka University & Ndagani Town Commercial Ecosystem
 */

window.NEXOVANTA_MARKETPLACE_DATA = {
  districts: [
    {
      id: "fashion",
      name: "Fashion Street",
      tagline: "Trending campus apparel, thrift treasures & footwear",
      icon: "fa-shirt",
      color: "#ec4899",
      accentBg: "rgba(236, 72, 153, 0.15)",
      banner: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=1200&q=80",
      description: "From handpicked Grade-1 Mitumba to custom varsity fits and trendy footwear, explore Chuka's trendiest stalls."
    },
    {
      id: "fresh",
      name: "Fresh Market",
      tagline: "Farm greens, Tharaka fruits & organic produce",
      icon: "fa-carrot",
      color: "#10b981",
      accentBg: "rgba(16, 185, 129, 0.15)",
      banner: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80",
      description: "Direct-from-farm avocados, organic bananas, greens, and fresh groceries from local Tharaka Nithi farmers."
    },
    {
      id: "tech",
      name: "Technology Hub",
      tagline: "Laptops, accessories, fast printing & gadget repairs",
      icon: "fa-laptop-code",
      color: "#00d2ff",
      accentBg: "rgba(0, 210, 255, 0.15)",
      banner: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
      description: "Chuka University's premier destination for student laptops, power banks, scientific calculators, and cyber services."
    },
    {
      id: "home",
      name: "Home & Living",
      tagline: "Hostel furniture, orthopedic chairs & study essentials",
      icon: "fa-couch",
      color: "#8b5cf6",
      accentBg: "rgba(139, 92, 246, 0.15)",
      banner: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80",
      description: "Equip your Ndagani hostel or Chuka home with compact study tables, durable mattresses, curtains, and ergonomic chairs."
    },
    {
      id: "hardware",
      name: "Builders' Square",
      tagline: "Heavy-duty padlocks, electricals & maintenance tools",
      icon: "fa-hammer",
      color: "#f59e0b",
      accentBg: "rgba(245, 158, 11, 0.15)",
      banner: "https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?auto=format&fit=crop&w=1200&q=80",
      description: "Quality hardware essentials for students and homeowners: brass padlocks, extension cords, LED lighting, and repair tools."
    },
    {
      id: "food",
      name: "Food & Local Products",
      tagline: "Campus snacks, Tharaka honey & quick meals",
      icon: "fa-utensils",
      color: "#f97316",
      accentBg: "rgba(249, 115, 22, 0.15)",
      banner: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80",
      description: "Savor fresh Ndagani bakes, pure Tharaka wild honey, energy smoothies, and hostel-friendly nutritious meals."
    }
  ],

  categories: [
    { id: "all", name: "All Categories", icon: "fa-boxes-stacked" },
    { id: "fashion", name: "Fashion & Mitumba", icon: "fa-shirt" },
    { id: "tech", name: "Tech & Electronics", icon: "fa-laptop" },
    { id: "fresh", name: "Fresh Produce", icon: "fa-apple-whole" },
    { id: "hardware", name: "Hardware & Tools", icon: "fa-wrench" },
    { id: "home", name: "Furniture & Home", icon: "fa-chair" },
    { id: "footwear", name: "Footwear & Shoes", icon: "fa-shoe-prints" },
    { id: "food", name: "Food & Beverages", icon: "fa-bowl-food" },
    { id: "ict", name: "ICT & Printing Services", icon: "fa-print" }
  ],

  shops: [
    {
      id: "shop-1",
      slug: "fridah-mitumba",
      name: "Fridah Mitumba",
      tagline: "Grade-1 Thrift Apparel & Vintage Campus Fits",
      category_id: "fashion",
      district_id: "fashion",
      location: "Ndagani Stage, opposite Gate B",
      area: "Ndagani",
      phone: "+254 712 345 001",
      whatsapp_number: "254712345001",
      status: "open",
      opening_hours: "8:00 AM - 8:30 PM (Mon - Sat)",
      rating: 4.9,
      review_count: 42,
      product_count: 5,
      is_featured: true,
      logo_url: "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=300&q=80",
      banner_url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80",
      storefront_style: "vintage-boutique",
      awning_color: "#ec4899",
      accent_color: "#f43f5e",
      owner_name: "Fridah Nkatha",
      description: "Chuka University's premier curated thrift stall. We carefully handpick Grade-1 vintage denim jackets, oversized campus hoodies, retro shirts, and stylish trousers. Every piece is cleaned, steamed, and priced gently for students and Ndagani residents.",
      badges: ["Student Verified", "Grade 1 Mitumba", "Eco-Friendly Thrift"]
    },
    {
      id: "shop-2",
      slug: "oloika-electronics",
      name: "Oloika Electronics",
      tagline: "Certified Student Laptops, Gadgets & Audio",
      category_id: "tech",
      district_id: "tech",
      location: "Gate A Commercial Centre, Shop #12",
      area: "Gate A",
      phone: "+254 712 345 002",
      whatsapp_number: "254712345002",
      status: "open",
      opening_hours: "7:30 AM - 9:00 PM (Daily)",
      rating: 4.8,
      review_count: 67,
      product_count: 5,
      is_featured: true,
      logo_url: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=300&q=80",
      banner_url: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
      storefront_style: "cyber-hub",
      awning_color: "#00d2ff",
      accent_color: "#0284c7",
      owner_name: "Dennis Oloika",
      description: "Reliable electronics and computer accessories trusted by engineering and computer science students at Chuka. We stock thoroughly tested refurbished HP and Lenovo laptops, fast chargers, power banks, Casio calculators, and Bluetooth audio accessories.",
      badges: ["1-Year Warranty", "Free Campus Delivery", "Pay After Test"]
    },
    {
      id: "shop-3",
      slug: "mama-naserian-fresh-produce",
      name: "Mama Naserian Fresh Produce",
      tagline: "Fresh Farm Harvest & Tharaka Green Groceries",
      category_id: "fresh",
      district_id: "fresh",
      location: "Chuka Central Open Market, Stalls 4-6",
      area: "Chuka Town",
      phone: "+254 712 345 003",
      whatsapp_number: "254712345003",
      status: "open",
      opening_hours: "6:30 AM - 7:30 PM (Daily)",
      rating: 4.9,
      review_count: 85,
      product_count: 4,
      is_featured: true,
      logo_url: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=300&q=80",
      banner_url: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80",
      storefront_style: "fresh-stall",
      awning_color: "#10b981",
      accent_color: "#059669",
      owner_name: "Mama Naserian",
      description: "Harvested fresh each morning from fertile Tharaka Nithi farms. We bring you crisp kales (sukuma wiki), indigenous spinach, buttery ripe avocados, sweet Tharaka bananas, and farm-fresh free-range eggs directly to your hostel door or kitchen.",
      badges: ["Farm Fresh Daily", "Organic Tharaka", "Bundle Discounts"]
    },
    {
      id: "shop-4",
      slug: "silingo-hardware",
      name: "Silingo Hardware",
      tagline: "Hostel Security Padlocks, Electricals & Tools",
      category_id: "hardware",
      district_id: "hardware",
      location: "Ndagani Junction, near Main Bus Park",
      area: "Ndagani",
      phone: "+254 712 345 004",
      whatsapp_number: "254712345004",
      status: "open",
      opening_hours: "7:00 AM - 7:00 PM (Mon - Sat)",
      rating: 4.7,
      review_count: 31,
      product_count: 4,
      is_featured: false,
      logo_url: "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=300&q=80",
      banner_url: "https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?auto=format&fit=crop&w=1200&q=80",
      storefront_style: "industrial-depot",
      awning_color: "#f59e0b",
      accent_color: "#d97706",
      owner_name: "Mr. Silingo Gitonga",
      description: "The trusted neighborhood hardware supplier for Ndagani hostel residents and homeowners. Find unbreakable brass padlocks, surge-protected extension sockets, bright energy-saving LED bulbs, curtain rods, and hand repair tools.",
      badges: ["High Security", "Genuine Brass", "Hostel Delivery"]
    },
    {
      id: "shop-5",
      slug: "tenebo-furniture",
      name: "Tenebo Furniture",
      tagline: "Handcrafted Student Study Tables & Hostel Beds",
      category_id: "home",
      district_id: "home",
      location: "Chuka Town Highway, opposite Total Station",
      area: "Chuka Town",
      phone: "+254 712 345 005",
      whatsapp_number: "254712345005",
      status: "open",
      opening_hours: "8:00 AM - 7:00 PM (Mon - Sat)",
      rating: 4.8,
      review_count: 49,
      product_count: 4,
      is_featured: true,
      logo_url: "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=300&q=80",
      banner_url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80",
      storefront_style: "artisan-workshop",
      awning_color: "#8b5cf6",
      accent_color: "#7c3aed",
      owner_name: "Ezekiel Tenebo",
      description: "Solid hardwood and metal fabrication workshop specializing in ergonomic student study furniture. We design compact study desks with laptop drawers, orthopedically contoured revision chairs, sturdy 3x6 hostel beds, and space-saving tiered shoe racks.",
      badges: ["Solid Hardwood", "Custom Built", "Free Ndagani Assembly"]
    },
    {
      id: "shop-6",
      slug: "oloika-footwear",
      name: "Oloika Footwear",
      tagline: "Trendy Sneakers, Campus Kicks & Official Shoes",
      category_id: "footwear",
      district_id: "fashion",
      location: "Gate A Commercial Arcade, Floor 1",
      area: "Gate A",
      phone: "+254 712 345 006",
      whatsapp_number: "254712345006",
      status: "open",
      opening_hours: "8:30 AM - 8:30 PM (Daily)",
      rating: 4.6,
      review_count: 36,
      product_count: 4,
      is_featured: false,
      logo_url: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=300&q=80",
      banner_url: "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=1200&q=80",
      storefront_style: "sneaker-lounge",
      awning_color: "#06b6d4",
      accent_color: "#0891b2",
      owner_name: "Alex Oloika",
      description: "Step out in confidence. Oloika Footwear brings Chuka University students the freshest streetwear sneakers, comfortable running shoes, smart leather shoes for presentations, and durable hostel slides at unmatched prices.",
      badges: ["Original Brands", "Size Replacement Guaranteed", "Student Deals"]
    },
    {
      id: "shop-7",
      slug: "community-bites",
      name: "Community Bites",
      tagline: "Tharaka Pure Wild Honey, Smoothies & Ndagani Bakes",
      category_id: "food",
      district_id: "food",
      location: "Ndagani Food Court, Shop #5",
      area: "Ndagani",
      phone: "+254 712 345 007",
      whatsapp_number: "254712345007",
      status: "open",
      opening_hours: "7:00 AM - 10:00 PM (Daily)",
      rating: 4.9,
      review_count: 104,
      product_count: 4,
      is_featured: true,
      logo_url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=300&q=80",
      banner_url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80",
      storefront_style: "cozy-cafe",
      awning_color: "#f97316",
      accent_color: "#ea580c",
      owner_name: "Grace Kawira",
      description: "Quick comfort food and raw local superfoods. Renowned for raw unfiltered Tharaka Nithi wild honey, crispy beef & vegetable samosas, fresh passion-mango smoothies, and affordable combo meal plates delivered warm to your room.",
      badges: ["100% Raw Tharaka Honey", "Made Fresh Hourly", "Speedy Delivery"]
    },
    {
      id: "shop-8",
      slug: "tenebo-ict-centre",
      name: "Tenebo ICT Centre",
      tagline: "Express Printing, Thesis Binding & Tech Repairs",
      category_id: "ict",
      district_id: "tech",
      location: "Chuka University Gate B Plaza",
      area: "Gate B",
      phone: "+254 712 345 008",
      whatsapp_number: "254712345008",
      status: "open",
      opening_hours: "7:00 AM - 9:30 PM (Daily)",
      rating: 4.7,
      review_count: 58,
      product_count: 4,
      is_featured: false,
      logo_url: "https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=300&q=80",
      banner_url: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80",
      storefront_style: "cyber-hub",
      awning_color: "#3b82f6",
      accent_color: "#1d4ed8",
      owner_name: "Kennedy Tenebo",
      description: "The official academic print & cyber station at Gate B. We handle high-volume assignment printing, hardcover dissertation & thesis binding, laptop OS repairs, virus removals, screen replacements, and university portal assistance.",
      badges: ["High-Speed Laser Printing", "Thesis Certified", "24/7 Gate B Access"]
    }
  ],

  products: [
    // --- Shop 1: Fridah Mitumba (Fashion) ---
    {
      id: "prod-101",
      shop_id: "shop-1",
      name: "Oversized Vintage Campus Hoodie",
      slug: "oversized-vintage-campus-hoodie",
      price: 950,
      original_price: 1300,
      category_id: "fashion",
      district_id: "fashion",
      stock_quantity: 12,
      badge: "Student Bestseller",
      rating: 4.9,
      review_count: 18,
      image_urls: [
        "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80"
      ],
      description: "Thick, ultra-cozy heavyweight fleece hoodie with front kangaroo pocket. Perfect for chilly morning 7:00 AM lectures in Chuka. Steamed and sanitised Grade-1 import.",
      variants: {
        sizes: ["M", "L", "XL", "XXL"],
        colors: ["Washed Grey", "Forest Green", "Midnight Black", "Heather Blue"]
      },
      features: [
        "100% Heavy cotton fleece lining",
        "Double-stitched hood drawstring",
        "Retains shape after multiple washes",
        "Curated Grade-1 thrift selection"
      ]
    },
    {
      id: "prod-102",
      shop_id: "shop-1",
      name: "Vintage Distressed Denim Jacket",
      slug: "vintage-distressed-denim-jacket",
      price: 1400,
      original_price: 1800,
      category_id: "fashion",
      district_id: "fashion",
      stock_quantity: 7,
      badge: "Retro Pick",
      rating: 4.8,
      review_count: 11,
      image_urls: [
        "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80"
      ],
      description: "Classic 90s vintage wash jean jacket with reinforced brass buttons and deep side pockets. A versatile wardrobe staple for campus weekends.",
      variants: {
        sizes: ["S", "M", "L"],
        colors: ["Light Acid Wash", "Classic Indigo"]
      },
      features: [
        "14oz Authentic rugged denim",
        "Custom brass hardware buttons",
        "Two chest flap pockets + side slashes"
      ]
    },
    {
      id: "prod-103",
      shop_id: "shop-1",
      name: "Unisex Cargo Utility Pants",
      slug: "unisex-cargo-utility-pants",
      price: 1100,
      original_price: 1500,
      category_id: "fashion",
      district_id: "fashion",
      stock_quantity: 15,
      badge: "Trending",
      rating: 4.7,
      review_count: 8,
      image_urls: [
        "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80"
      ],
      description: "Multi-pocket relaxed tactical cargo trousers with elastic drawstring cuffs. Extremely comfortable for long campus days and fieldwork.",
      variants: {
        sizes: ["28-30", "32-34", "36-38"],
        colors: ["Khaki Olive", "Desert Tan", "Tactical Black"]
      },
      features: [
        "6 Reinforced utility pockets",
        "Sturdy ripstop cotton blend",
        "Adjustable bungee ankle cords"
      ]
    },
    {
      id: "prod-104",
      shop_id: "shop-1",
      name: "Heavy Knit Campus Cardigan",
      slug: "heavy-knit-campus-cardigan",
      price: 850,
      original_price: 1100,
      category_id: "fashion",
      district_id: "fashion",
      stock_quantity: 9,
      badge: "Winter Warmth",
      rating: 5.0,
      review_count: 5,
      image_urls: [
        "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=800&q=80"
      ],
      description: "Cozy knit button-down cardigan sweater. Soft wool blend that keeps you comfortable during breezy Ndagani evenings.",
      variants: {
        sizes: ["M", "L"],
        colors: ["Cream Beige", "Burgundy Red"]
      },
      features: [
        "Chunky rib knit collar",
        "Tortoiseshell-style front buttons",
        "Non-itch hypoallergenic yarn"
      ]
    },

    // --- Shop 2: Oloika Electronics (Tech) ---
    {
      id: "prod-201",
      shop_id: "shop-2",
      name: "HP EliteBook 840 G5 (Core i5, 16GB RAM, 256GB SSD)",
      slug: "hp-elitebook-840-g5-core-i5",
      price: 32500,
      original_price: 36000,
      category_id: "tech",
      district_id: "tech",
      stock_quantity: 4,
      badge: "Engineering Choice",
      rating: 4.9,
      review_count: 24,
      image_urls: [
        "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=800&q=80"
      ],
      description: "Premium aluminum business ultrabook equipped with Intel Core i5 8th Gen quad-core processor, 16GB DDR4 RAM for effortless multitasking, and lightning-fast 256GB NVMe SSD. Crisp 14-inch Full HD anti-glare screen with 5+ hour battery life.",
      variants: {
        configs: ["16GB RAM / 256GB SSD", "16GB RAM / 512GB SSD (+ KSh 2,500)"]
      },
      features: [
        "Intel Core i5-8250U Quad-Core Turbo 3.4GHz",
        "16GB DDR4 RAM (Upgradable to 32GB)",
        "Crisp 14-inch FHD 1080p IPS Display",
        "Backlit Spill-Resistant Keyboard",
        "Original HP Smart Fast Charger included",
        "6-Month written store warranty"
      ]
    },
    {
      id: "prod-202",
      shop_id: "shop-2",
      name: "Casio FX-991EX ClassWiz Scientific Calculator",
      slug: "casio-fx-991ex-classwiz",
      price: 2400,
      original_price: 2800,
      category_id: "tech",
      district_id: "tech",
      stock_quantity: 18,
      badge: "Exam Essential",
      rating: 5.0,
      review_count: 32,
      image_urls: [
        "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=800&q=80"
      ],
      description: "Original Casio ClassWiz high-resolution display scientific calculator with 552 functions. Approved for Chuka University engineering, mathematics, economics, and science examinations.",
      variants: {
        models: ["Standard Black FX-991EX"]
      },
      features: [
        "High-resolution Natural Textbook display",
        "Spreadsheet calculation & matrix inversion",
        "Solar powered + backup coin battery",
        "Anti-slip hard protective case"
      ]
    },
    {
      id: "prod-203",
      shop_id: "shop-2",
      name: "Oraimo 20,000mAh Ultra-Fast Power Bank (22.5W)",
      slug: "oraimo-20000mah-fast-power-bank",
      price: 2600,
      original_price: 3100,
      category_id: "tech",
      district_id: "tech",
      stock_quantity: 14,
      badge: "Hostel Lifesaver",
      rating: 4.8,
      review_count: 19,
      image_urls: [
        "https://images.unsplash.com/photo-1609592424364-e461b4020a67?auto=format&fit=crop&w=800&q=80"
      ],
      description: "Dual-port 22.5W Power Delivery power bank with digital LED battery percentage indicator. Charges smartphones up to 5 times. Vital for study sessions during power cuts.",
      variants: {
        colors: ["Matte Black", "Ice White"]
      },
      features: [
        "20,000mAh high-density Li-Polymer battery",
        "PD 3.0 & QC 3.0 Quick Charge capability",
        "Smart multi-protection against surges",
        "Dual USB-A + Type-C Input/Output"
      ]
    },
    {
      id: "prod-204",
      shop_id: "shop-2",
      name: "Sandisk Ultra Dual Drive Go 64GB (Type-C & USB 3.1)",
      slug: "sandisk-ultra-dual-drive-64gb",
      price: 1200,
      original_price: 1500,
      category_id: "tech",
      district_id: "tech",
      stock_quantity: 25,
      badge: "Student Deal",
      rating: 4.7,
      review_count: 14,
      image_urls: [
        "https://images.unsplash.com/photo-1618042164219-62c820f10723?auto=format&fit=crop&w=800&q=80"
      ],
      description: "2-in-1 flash drive with reversible USB Type-C and traditional USB Type-A connectors. Effortlessly move lecture notes, movies, and slides between your phone and laptop.",
      variants: {
        capacity: ["64GB", "128GB (+ KSh 700)"]
      },
      features: [
        "Up to 150MB/s high-speed read performance",
        "Swivel design protects connectors",
        "Keyring hole for campus ID lanyard"
      ]
    },

    // --- Shop 3: Mama Naserian Fresh Produce (Fresh Produce) ---
    {
      id: "prod-301",
      shop_id: "shop-3",
      name: "Tharaka Giant Hass Avocados (Pack of 5)",
      slug: "tharaka-giant-hass-avocados",
      price: 150,
      original_price: 200,
      category_id: "fresh",
      district_id: "fresh",
      stock_quantity: 30,
      badge: "Farm Harvest",
      rating: 5.0,
      review_count: 45,
      image_urls: [
        "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=800&q=80"
      ],
      description: "Buttery, rich, and naturally ripened giant Hass avocados picked directly from Tharaka highland farms. Guaranteed creaminess for every meal.",
      variants: {
        packs: ["5 Large Hass Avocados", "10 Avocados Super Bundle (+ KSh 120)"]
      },
      features: [
        "Naturally tree-ripened with no artificial ripening",
        "Rich in potassium and heart-healthy oils",
        "Carefully inspected for zero bruising"
      ]
    },
    {
      id: "prod-302",
      shop_id: "shop-3",
      name: "Fresh Local Kales & Spinach Basket (Sukuma Wiki)",
      slug: "fresh-local-kales-and-spinach",
      price: 100,
      original_price: 130,
      category_id: "fresh",
      district_id: "fresh",
      stock_quantity: 40,
      badge: "Daily Essential",
      rating: 4.9,
      review_count: 28,
      image_urls: [
        "https://images.unsplash.com/photo-1524179091875-bf99a9a6fa57?auto=format&fit=crop&w=800&q=80"
      ],
      description: "Crisp, green, organic sukuma wiki and tender indigenous spinach, freshly harvested at dawn. Washed and tied in generous cooking bunches.",
      variants: {
        options: ["Whole Fresh Leaves (Untouched)", "Pre-Chopped & Sorted (+ KSh 20)"]
      },
      features: [
        "Harvested at dawn from Ndagani river farms",
        "Crisp leaves with maximum nutrient retention",
        "Free of synthetic chemicals"
      ]
    },
    {
      id: "prod-303",
      shop_id: "shop-3",
      name: "Farm-Fresh Free-Range Kienyeji Eggs (Tray of 30)",
      slug: "free-range-kienyeji-eggs-tray",
      price: 600,
      original_price: 700,
      category_id: "fresh",
      district_id: "fresh",
      stock_quantity: 15,
      badge: "High Protein",
      rating: 4.8,
      review_count: 33,
      image_urls: [
        "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=800&q=80"
      ],
      description: "Golden-yolk authentic free-range eggs from healthy local Tharaka hens. Packed securely in sturdy egg crates for safe hostel transport.",
      variants: {
        packs: ["Full Tray (30 Eggs)", "Half Tray (15 Eggs - KSh 320)"]
      },
      features: [
        "100% Authentic Kienyeji free-range nutrition",
        "Rich deep orange yolks",
        "Cushioned delivery packaging guaranteed zero breakage"
      ]
    },
    {
      id: "prod-304",
      shop_id: "shop-3",
      name: "Sweet Tharaka Ripe Bananas (Bunch of 12)",
      slug: "sweet-tharaka-ripe-bananas",
      price: 120,
      original_price: 160,
      category_id: "fresh",
      district_id: "fresh",
      stock_quantity: 22,
      badge: "Sweet Energy",
      rating: 4.9,
      review_count: 16,
      image_urls: [
        "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=800&q=80"
      ],
      description: "Sweet, potassium-packed mountain bananas from Tharaka Nithi. Ideal healthy brain food for late-night revision sessions.",
      variants: {
        bundles: ["Bunch of 12 ripe bananas", "Bunch of 24 bananas (KSh 220)"]
      },
      features: [
        "Naturally tree-matured",
        "High quick energy for morning lectures",
        "Clean skin and sweet aroma"
      ]
    },

    // --- Shop 4: Silingo Hardware (Builders' Square) ---
    {
      id: "prod-401",
      shop_id: "shop-4",
      name: "Tri-Circle Heavy Duty Solid Brass Padlock (60mm)",
      slug: "tri-circle-heavy-duty-brass-padlock",
      price: 750,
      original_price: 950,
      category_id: "hardware",
      district_id: "hardware",
      stock_quantity: 20,
      badge: "Hostel Security",
      rating: 4.9,
      review_count: 17,
      image_urls: [
        "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=800&q=80"
      ],
      description: "Heavy solid brass anti-cut padlock with hardened steel shackle and 3 precision keys. Essential for securing your hostel room, trunk, or gate.",
      variants: {
        sizes: ["50mm", "60mm Heavy Duty (+ KSh 150)"]
      },
      features: [
        "Solid forged brass body resists weathering",
        "Hardened chrome-plated anti-hacksaw shackle",
        "Precision brass pin tumbler cylinder",
        "Comes with 3 factory duplicate keys"
      ]
    },
    {
      id: "prod-402",
      shop_id: "shop-4",
      name: "Master Surge Protected Extension Cable (4-Way, 3M)",
      slug: "master-surge-protected-extension-cable",
      price: 1100,
      original_price: 1400,
      category_id: "hardware",
      district_id: "hardware",
      stock_quantity: 14,
      badge: "Safe Power",
      rating: 4.8,
      review_count: 22,
      image_urls: [
        "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80"
      ],
      description: "Heavy duty 4-gang extension block with individual safety switches, neon power indicators, and built-in surge suppressor to safeguard laptops.",
      variants: {
        lengths: ["3 Metres", "5 Metres Heavy (+ KSh 300)"]
      },
      features: [
        "Surge protection protects computers and kettles",
        "Individual neon on/off rocker switches",
        "Fire-retardant durable casing",
        "13A UK 3-pin standard fused plug"
      ]
    },
    {
      id: "prod-403",
      shop_id: "shop-4",
      name: "Bright LED Daylight Bulb (15W B22 / E27, 2-Pack)",
      slug: "bright-led-daylight-bulb-2-pack",
      price: 350,
      original_price: 450,
      category_id: "hardware",
      district_id: "hardware",
      stock_quantity: 35,
      badge: "Energy Saver",
      rating: 4.7,
      review_count: 14,
      image_urls: [
        "https://images.unsplash.com/photo-1532009324734-20a7a5813719?auto=format&fit=crop&w=800&q=80"
      ],
      description: "Crisp cool daylight 6500K LED bulbs. 85% energy saving, bright enough to clearly illuminate entire hostel rooms for comfortable study.",
      variants: {
        socket: ["B22 Pin Type", "E27 Screw Type"]
      },
      features: [
        "15W equivalent to 100W incandescent brightness",
        "25,000 hour rated lifespan",
        "Flicker-free eye-care study light"
      ]
    },
    {
      id: "prod-404",
      shop_id: "shop-4",
      name: "Complete Home & Hostel Tool Kit (12 Pieces)",
      slug: "complete-home-hostel-tool-kit",
      price: 1650,
      original_price: 2100,
      category_id: "hardware",
      district_id: "hardware",
      stock_quantity: 8,
      badge: "Handyman Choice",
      rating: 4.9,
      review_count: 9,
      image_urls: [
        "https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?auto=format&fit=crop&w=800&q=80"
      ],
      description: "Includes claw hammer, pliers, screwdriver set with magnetic bits, measuring tape, utility knife, and insulating tape inside a sturdy portable case.",
      variants: {
        sets: ["Standard 12-Piece Case"]
      },
      features: [
        "Forged carbon steel tools with non-slip grips",
        "Compact blow-molded carrying box",
        "Essential for hostel curtain hanging & DIY repairs"
      ]
    },

    // --- Shop 5: Tenebo Furniture (Home & Living) ---
    {
      id: "prod-501",
      shop_id: "shop-5",
      name: "Modern Student Study Desk with Book Shelf",
      slug: "modern-student-study-desk",
      price: 4200,
      original_price: 5000,
      category_id: "home",
      district_id: "home",
      stock_quantity: 6,
      badge: "Campus Best Seller",
      rating: 4.9,
      review_count: 27,
      image_urls: [
        "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80"
      ],
      description: "Engineered specifically for student hostel rooms. Features smooth water-resistant worktop, slide-out stationery drawer, lower textbook storage shelf, and cable routing hole.",
      variants: {
        finishes: ["Warm Teak Polish", "Mahogany Dark Brown", "Modern Matte Black"]
      },
      features: [
        "Dimensions: 100cm (W) x 55cm (D) x 75cm (H)",
        "Sturdy steel frame with reinforced solid timber top",
        "Scratch-resistant water-repellent laminate finish",
        "Free assembly inside Ndagani hostels"
      ]
    },
    {
      id: "prod-502",
      shop_id: "shop-5",
      name: "Ergonomic Mesh Study & Office Chair",
      slug: "ergonomic-mesh-study-chair",
      price: 3600,
      original_price: 4200,
      category_id: "home",
      district_id: "home",
      stock_quantity: 9,
      badge: "Back Support",
      rating: 4.8,
      review_count: 18,
      image_urls: [
        "https://images.unsplash.com/photo-1580481077195-c328a37db71a?auto=format&fit=crop&w=800&q=80"
      ],
      description: "Breathable mesh backrest with built-in lumbar arch support, hydraulic gas-lift height adjustment, and smooth 360-degree silent castor wheels.",
      variants: {
        colors: ["Jet Black", "Steel Grey", "Cobalt Blue"]
      },
      features: [
        "High-density molded foam seat cushion",
        "Pneumatic seat height adjustment (10cm range)",
        "Breathable Korean mesh fabric prevents sweating",
        "Supports up to 130kg body weight"
      ]
    },
    {
      id: "prod-503",
      shop_id: "shop-5",
      name: "4-Tier Hostel Shoe & Storage Rack",
      slug: "4-tier-hostel-shoe-storage-rack",
      price: 1200,
      original_price: 1600,
      category_id: "home",
      district_id: "home",
      stock_quantity: 16,
      badge: "Compact Living",
      rating: 4.7,
      review_count: 13,
      image_urls: [
        "https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?auto=format&fit=crop&w=800&q=80"
      ],
      description: "Lightweight, space-saving 4-tier steel tube rack. Holds up to 12 pairs of shoes or acts as a textbook shelf in tight room spaces.",
      variants: {
        colors: ["Matte Black Steel", "Silver Metallic"]
      },
      features: [
        "Holds up to 12 pairs of shoes comfortably",
        "Quick tool-free snap assembly in 3 minutes",
        "Rust-resistant electrostatic coating"
      ]
    },
    {
      id: "prod-504",
      shop_id: "shop-5",
      name: "3x6 Heavy Duty Wooden Hostel Bed Frame",
      slug: "heavy-duty-wooden-hostel-bed-frame",
      price: 5800,
      original_price: 6800,
      category_id: "home",
      district_id: "home",
      stock_quantity: 4,
      badge: "Handcrafted Timber",
      rating: 5.0,
      review_count: 15,
      image_urls: [
        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80"
      ],
      description: "Crafted from seasoned Meru cypress and blue-gum timber. Reinforced cross-beams prevent squeaking and sagging. Built to last throughout your degree.",
      variants: {
        finishes: ["Natural Pine Varnish", "Dark Walnut"]
      },
      features: [
        "Standard 3 feet by 6 feet student mattress fit",
        "Solid 2x4 headboard and footboard posts",
        "Under-bed 35cm storage clearance for boxes and bags"
      ]
    },

    // --- Shop 6: Oloika Footwear (Footwear) ---
    {
      id: "prod-601",
      shop_id: "shop-6",
      name: "Classic White Campus Street Sneakers",
      slug: "classic-white-campus-street-sneakers",
      price: 2200,
      original_price: 2800,
      category_id: "footwear",
      district_id: "fashion",
      stock_quantity: 11,
      badge: "Fashion Top Pick",
      rating: 4.9,
      review_count: 21,
      image_urls: [
        "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=800&q=80"
      ],
      description: "Minimalist, sleek, all-white low-top sneakers with cushioned insoles and durable vulcanized rubber soles. Complements both jeans and smart campus wear.",
      variants: {
        sizes: ["EU 38", "EU 39", "EU 40", "EU 41", "EU 42", "EU 43", "EU 44"]
      },
      features: [
        "Premium synthetic leather upper (easy to clean)",
        "Memory foam comfort insole",
        "Non-slip herringbone outsole"
      ]
    },
    {
      id: "prod-602",
      shop_id: "shop-6",
      name: "Men's Formal Oxford Presentation Shoes",
      slug: "mens-formal-oxford-presentation-shoes",
      price: 2800,
      original_price: 3400,
      category_id: "footwear",
      district_id: "fashion",
      stock_quantity: 8,
      badge: "Exam & Interview",
      rating: 4.8,
      review_count: 12,
      image_urls: [
        "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=800&q=80"
      ],
      description: "Smart polished leather Oxford dress shoes. Ideal for class presentations, project defenses, internships, and church services.",
      variants: {
        sizes: ["EU 40", "EU 41", "EU 42", "EU 43", "EU 44"],
        colors: ["Glossy Black", "Cognac Brown"]
      },
      features: [
        "High-grade synthetic leather with polished shine",
        "Reinforced toe cap stitching",
        "Comfort arch support"
      ]
    },
    {
      id: "prod-603",
      shop_id: "shop-6",
      name: "Cushioned Waterproof Hostel Slides",
      slug: "cushioned-waterproof-hostel-slides",
      price: 450,
      original_price: 600,
      category_id: "footwear",
      district_id: "fashion",
      stock_quantity: 24,
      badge: "Daily Comfort",
      rating: 4.7,
      review_count: 19,
      image_urls: [
        "https://images.unsplash.com/photo-1603808033192-082d6919d3e1?auto=format&fit=crop&w=800&q=80"
      ],
      description: "Thick sole pillow slides made from ultra-soft EVA foam. Waterproof, quick-drying, and slip-resistant for hostel showers and lounging.",
      variants: {
        sizes: ["36-37", "38-39", "40-41", "42-43", "44-45"],
        colors: ["Cloud White", "Charcoal Black", "Olive Green"]
      },
      features: [
        "4cm thick pillow cushion sole",
        "Hydrophobic anti-mold EVA material",
        "Textured grip sole prevents slipping on wet tiles"
      ]
    },
    {
      id: "prod-604",
      shop_id: "shop-6",
      name: "Breathable Lightweight Running Shoes",
      slug: "breathable-lightweight-running-shoes",
      price: 2400,
      original_price: 2900,
      category_id: "footwear",
      district_id: "fashion",
      stock_quantity: 10,
      badge: "Athletics",
      rating: 4.8,
      review_count: 14,
      image_urls: [
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80"
      ],
      description: "Flyknit breathable athletic trainers designed for long campus walks, jogging tracks, and active gym sessions.",
      variants: {
        sizes: ["EU 39", "EU 40", "EU 41", "EU 42", "EU 43"],
        colors: ["Crimson Red", "Stealth Grey", "Volt Yellow"]
      },
      features: [
        "Ultra-lightweight mesh upper keeps feet dry",
        "Responsive air-cushion heel absorption",
        "Reinforced rubber traction pads"
      ]
    },

    // --- Shop 7: Community Bites (Food & Local Delights) ---
    {
      id: "prod-701",
      shop_id: "shop-7",
      name: "100% Pure Raw Tharaka Wild Honey (500g Glass Jar)",
      slug: "pure-raw-tharaka-wild-honey-500g",
      price: 550,
      original_price: 700,
      category_id: "food",
      district_id: "food",
      stock_quantity: 20,
      badge: "Tharaka Specialty",
      rating: 5.0,
      review_count: 48,
      image_urls: [
        "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80"
      ],
      description: "Directly harvested from traditional log beehives in the acacia woodlands of Tharaka Nithi. 100% unpasteurized, cold-filtered, and rich in natural pollen and enzymes. Soothes sore throats and boosts immune health.",
      variants: {
        sizes: ["500g Glass Jar", "1kg Economy Tub (+ KSh 450)"]
      },
      features: [
        "Zero added sugars, syrups, or preservatives",
        "Raw cold-filtered preserving all bee pollen",
        "Authentic smoky floral aroma",
        "Tamper-evident vacuum sealed"
      ]
    },
    {
      id: "prod-702",
      shop_id: "shop-7",
      name: "Crispy Beef & Veggie Samosas (Box of 6)",
      slug: "crispy-beef-veggie-samosas-box-of-6",
      price: 300,
      original_price: 360,
      category_id: "food",
      district_id: "food",
      stock_quantity: 25,
      badge: "Freshly Fried",
      rating: 4.9,
      review_count: 52,
      image_urls: [
        "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80"
      ],
      description: "Crispy golden triangular pastries loaded with seasoned minced beef, fresh coriander, onions, and delicate ginger-garlic spice. Served with lemon wedges and chili dip.",
      variants: {
        filling: ["Spiced Minced Beef", "Vegetarian Spiced Potato & Peas"]
      },
      features: [
        "Made fresh every 2 hours in Ndagani kitchen",
        "Crispy thin homemade pastry shell",
        "Delivered warm wrapped in foil box"
      ]
    },
    {
      id: "prod-703",
      shop_id: "shop-7",
      name: "Fresh Tropical Energy Smoothie (500ml Bottle)",
      slug: "fresh-tropical-energy-smoothie",
      price: 180,
      original_price: 220,
      category_id: "food",
      district_id: "food",
      stock_quantity: 18,
      badge: "Health Booster",
      rating: 4.8,
      review_count: 29,
      image_urls: [
        "https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=800&q=80"
      ],
      description: "Refreshing blend of ripe Tharaka mangoes, sweet bananas, passion fruit puree, and a touch of pure honey. Packed with vitamins for revision focus.",
      variants: {
        flavors: ["Mango-Passion Splash", "Berry-Banana Blast", "Green Detox Blend"]
      },
      features: [
        "100% Real fruit with zero artificial syrups",
        "Chilled in sealed bottle",
        "Rich in Vitamin C and antioxidants"
      ]
    },
    {
      id: "prod-704",
      shop_id: "shop-7",
      name: "Ndagani Fresh Golden Mandazi (Pack of 8)",
      slug: "ndagani-fresh-golden-mandazi-pack-of-8",
      price: 160,
      original_price: 200,
      category_id: "food",
      district_id: "food",
      stock_quantity: 30,
      badge: "Campus Breakfast",
      rating: 4.9,
      review_count: 38,
      image_urls: [
        "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80"
      ],
      description: "Soft, fluffy, cardamom-spiced East African donuts fried to golden perfection. The quintessential Chuka morning tea companion.",
      variants: {
        packs: ["Pack of 8 Mandazi", "Family Pack of 16 (KSh 300)"]
      },
      features: [
        "Infused with aromatic crushed green cardamom",
        "Soft airy texture, not oily",
        "Baked fresh every morning at 6:30 AM"
      ]
    },

    // --- Shop 8: Tenebo ICT Centre (ICT & Printing) ---
    {
      id: "prod-801",
      shop_id: "shop-8",
      name: "Undergraduate Dissertation & Project Hardcover Binding",
      slug: "undergraduate-dissertation-hardcover-binding",
      price: 800,
      original_price: 1000,
      category_id: "ict",
      district_id: "tech",
      stock_quantity: 50,
      badge: "Chuka Uni Standard",
      rating: 5.0,
      review_count: 36,
      image_urls: [
        "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80"
      ],
      description: "Official university-approved gold embossed lettering hardcover binding. Conforms to Chuka University Board of Postgraduate Studies & Faculty guidelines.",
      variants: {
        faculties: ["Science & Tech (Navy Blue / Gold)", "Business (Maroon / Gold)", "Education (Green / Gold)", "Health Sciences (Royal Blue / Gold)"]
      },
      features: [
        "Premium embossed gold foil lettering",
        "High-density bookbinding boards",
        "Turnaround in 3 hours express option",
        "Approved thesis format guarantee"
      ]
    },
    {
      id: "prod-802",
      shop_id: "shop-8",
      name: "High-Volume Laser Color Printing & Spiral Binding",
      slug: "high-volume-color-printing-spiral-binding",
      price: 250,
      original_price: 320,
      category_id: "ict",
      district_id: "tech",
      stock_quantity: 100,
      badge: "Same-Hour Service",
      rating: 4.8,
      review_count: 24,
      image_urls: [
        "https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=800&q=80"
      ],
      description: "Professional digital color document printing on bright 80gsm paper with durable plastic spiral comb and clear protective acetate covers.",
      variants: {
        bundles: ["Up to 50 Pages Bound", "100 Pages Bound (+ KSh 150)"]
      },
      features: [
        "Sharp 1200 DPI laser color printing",
        "Durable PVC spiral coils in various sizes",
        "Clear protective front sheet + frosted back"
      ]
    },
    {
      id: "prod-803",
      shop_id: "shop-8",
      name: "Full Laptop System Clean, Thermal Paste & Antivirus",
      slug: "laptop-system-clean-thermal-paste-antivirus",
      price: 1200,
      original_price: 1500,
      category_id: "ict",
      district_id: "tech",
      stock_quantity: 10,
      badge: "Speed Boost",
      rating: 4.9,
      review_count: 20,
      image_urls: [
        "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=800&q=80"
      ],
      description: "Is your laptop overheating, noisy, or lagging? Complete internal dust removal, Arctic MX-4 thermal paste renewal, OS debloating, and 1-year licensed antivirus installation.",
      variants: {
        services: ["Standard Clean + OS Tune-up", "Deep Clean + Hardware Diagnostic (+ KSh 300)"]
      },
      features: [
        "Lowers CPU operating temperatures by up to 15°C",
        "Replaces dried factory thermal paste with Arctic MX-4",
        "Removes spyware and background bloatware",
        "Free 30-day follow-up check"
      ]
    },
    {
      id: "prod-804",
      shop_id: "shop-8",
      name: "High-Speed 32GB Bootable Windows & Office USB",
      slug: "high-speed-32gb-bootable-windows-office-usb",
      price: 1500,
      original_price: 1800,
      category_id: "ict",
      district_id: "tech",
      stock_quantity: 15,
      badge: "Tech Kit",
      rating: 4.8,
      review_count: 17,
      image_urls: [
        "https://images.unsplash.com/photo-1618042164219-62c820f10723?auto=format&fit=crop&w=800&q=80"
      ],
      description: "SanDisk 32GB flash drive preloaded with genuine Windows 10/11 installation images, essential drivers, and open office tools. Lifesaver when your OS crashes before assignment deadlines.",
      variants: {
        os: ["Windows 11 Pro 64-bit", "Windows 10 Pro 64-bit"]
      },
      features: [
        "Genuine SanDisk USB 3.0 flash drive",
        "UEFI & Legacy BIOS compatible boot partition",
        "Includes essential offline offline PDF reader & drivers",
        "Reuseable as regular storage afterwards"
      ]
    }
  ],

  reviews: [
    {
      id: "rev-1",
      shop_id: "shop-1",
      product_id: "prod-101",
      customer_name: "Kevin Mwenda",
      customer_role: "Computer Science Y3",
      rating: 5,
      date: "2 days ago",
      comment: "The oversized hoodie is top quality! Heavy fabric, keeps me super warm during morning 7 AM lectures in Pavilion. Fridah delivered it to my Sunrise Hostel within 30 minutes."
    },
    {
      id: "rev-2",
      shop_id: "shop-2",
      product_id: "prod-201",
      customer_name: "Brian Kiptoo",
      customer_role: "Software Engineering Y4",
      rating: 5,
      date: "1 week ago",
      comment: "Bought the HP EliteBook 840 G5 from Dennis at Oloika Electronics. Battery lasts over 6 hours, 16GB RAM handles Android Studio and Docker like a dream. Legit merchant!"
    },
    {
      id: "rev-3",
      shop_id: "shop-3",
      product_id: "prod-301",
      customer_name: "Joy Muthoni",
      customer_role: "Nursing Y2",
      rating: 5,
      date: "3 days ago",
      comment: "Mama Naserian's avocados are the best in Tharaka Nithi! So creamy and large. Ordering through Nexovanta saved me a trip to town in the rain."
    },
    {
      id: "rev-4",
      shop_id: "shop-5",
      product_id: "prod-501",
      customer_name: "Faith Chebet",
      customer_role: "Economics Y2",
      rating: 5,
      date: "5 days ago",
      comment: "Tenebo delivered this study desk directly to my room at Ndagani Gate B and even assembled it for free. Solid timber, no shaking. Truly worth the price!"
    },
    {
      id: "rev-5",
      shop_id: "shop-7",
      product_id: "prod-701",
      customer_name: "Dr. Silas Murithi",
      customer_role: "Chuka Resident & Lecturer",
      rating: 5,
      date: "4 days ago",
      comment: "100% genuine raw Tharaka honey. You can taste the authenticity immediately. Glad to see local beekeepers connected through Nexovanta."
    }
  ],

  demoStats: {
    registeredShops: 48,
    productsAvailable: 340,
    activeDistricts: 6,
    verifiedMerchants: "100%",
    localDeliverySpeed: "20-45 mins average"
  }
};
