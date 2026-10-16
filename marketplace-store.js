/**
 * Nexovanta Virtual Community Marketplace
 * Data Store & Service Layer (Supabase Ready)
 * Handles shops, products, multi-seller cart, orders, reviews, and seller management.
 */

(function (root) {
  'use strict';

  const STORAGE_KEYS = {
    SHOPS: 'nexovanta_shops_db',
    PRODUCTS: 'nexovanta_products_db',
    CART: 'nexovanta_cart_v2',
    ORDERS: 'nexovanta_orders_db',
    REVIEWS: 'nexovanta_reviews_db',
    WISHLIST: 'nexovanta_wishlist_db'
  };

  class MarketplaceStore {
    constructor() {
      this.initStorage();
      this.linkOwnersByNexovantaDB();
    }

    /**
     * For demo data: try to match seed shop owner_name to a NexovantaDB business user
     * so that owner_id is set on shops even before the storefront.html flow runs.
     */
    linkOwnersByNexovantaDB() {
      if (typeof NexovantaDB === 'undefined') return;
      const shops = JSON.parse(localStorage.getItem(STORAGE_KEYS.SHOPS) || '[]');
      const users = NexovantaDB.Users.getAll().filter(u => u.role === 'business');
      if (!users.length) return;

      let changed = false;
      shops.forEach(shop => {
        if (shop.owner_id) return; // already linked
        // Try matching by full_name or by username embedded in slug
        const matched = users.find(u => {
          const nameMatch = shop.owner_name && (
            u.full_name.toLowerCase().includes(shop.owner_name.toLowerCase().split(' ')[0]) ||
            shop.owner_name.toLowerCase().includes(u.full_name.toLowerCase().split(' ')[0])
          );
          const slugMatch = shop.slug && u.username && shop.slug.includes(u.username.toLowerCase());
          // Also match by the user's full_name being in the shop's name
          const shopNameMatch = shop.name && u.full_name && (
            shop.name.toLowerCase().includes(u.full_name.toLowerCase().split(' ')[0])
          );
          return nameMatch || slugMatch || shopNameMatch;
        });
        if (matched) {
          shop.owner_id   = matched.id;
          shop.owner_name = matched.full_name || matched.username;
          // Also update the user record so storefront.html can find this shop via owner_id
          if (!matched.marketplace_shop_id) {
            NexovantaDB.Users.update(matched.id, { marketplace_shop_id: shop.id });
          }
          changed = true;
        }
      });

      if (changed) {
        localStorage.setItem(STORAGE_KEYS.SHOPS, JSON.stringify(shops));
      }
    }

    initStorage() {
      const seed = window.NEXOVANTA_MARKETPLACE_DATA || {};

      // Initialize Shops
      if (!localStorage.getItem(STORAGE_KEYS.SHOPS)) {
        localStorage.setItem(STORAGE_KEYS.SHOPS, JSON.stringify(seed.shops || []));
      }

      // Initialize Products
      if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(seed.products || []));
      }

      // Initialize Reviews
      if (!localStorage.getItem(STORAGE_KEYS.REVIEWS)) {
        localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(seed.reviews || []));
      }

      // Initialize Empty Collections if missing
      if (!localStorage.getItem(STORAGE_KEYS.CART)) {
        localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify([]));
      }
      if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
        // Provide 2 realistic sample incoming orders so the seller dashboard is immediately testable!
        const sampleOrders = [
          {
            id: 'ord-101',
            order_number: 'NEX-72410',
            shop_id: 'shop-2',
            shop_name: 'Oloika Electronics',
            customer_name: 'Faith Chebet',
            customer_phone: '0714 555 888',
            delivery_method: 'delivery',
            delivery_address: 'Sunrise Hostels, Room 14, Ndagani',
            special_instructions: 'Please call when at the hostel gate',
            subtotal: 2400,
            delivery_fee: 100,
            total_amount: 2500,
            payment_method: 'mpesa',
            payment_status: 'pending_confirmation',
            order_status: 'preparing',
            created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
            items: [
              {
                product_id: 'prod-202',
                product_name: 'Casio FX-991EX ClassWiz Scientific Calculator',
                quantity: 1,
                unit_price: 2400,
                line_total: 2400,
                variant: 'Standard Black FX-991EX'
              }
            ]
          },
          {
            id: 'ord-102',
            order_number: 'NEX-72411',
            shop_id: 'shop-1',
            shop_name: 'Fridah Mitumba',
            customer_name: 'Dennis Munene',
            customer_phone: '0722 345 678',
            delivery_method: 'pickup',
            delivery_address: 'Customer will pick up at shop',
            special_instructions: 'Will collect after 4 PM class',
            subtotal: 950,
            delivery_fee: 0,
            total_amount: 950,
            payment_method: 'cash',
            payment_status: 'pay_on_collection',
            order_status: 'ready_for_pickup',
            created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
            items: [
              {
                product_id: 'prod-101',
                product_name: 'Oversized Vintage Campus Hoodie',
                quantity: 1,
                unit_price: 950,
                line_total: 950,
                variant: 'L / Washed Grey'
              }
            ]
          }
        ];
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(sampleOrders));
      }
      if (!localStorage.getItem(STORAGE_KEYS.WISHLIST)) {
        localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify([]));
      }
    }

    // --- DISTRICTS & CATEGORIES ---
    getDistricts() {
      return (window.NEXOVANTA_MARKETPLACE_DATA && window.NEXOVANTA_MARKETPLACE_DATA.districts) || [];
    }

    getCategories() {
      return (window.NEXOVANTA_MARKETPLACE_DATA && window.NEXOVANTA_MARKETPLACE_DATA.categories) || [];
    }

    getStats() {
      const shops = this.getShops();
      const products = this.getProducts();
      return {
        registeredShops: shops.length,
        productsAvailable: products.length,
        activeDistricts: this.getDistricts().length,
        verifiedMerchants: '100% Verified in Chuka',
        averageDelivery: '20-40 mins in Ndagani'
      };
    }

    // --- SHOPS ---
    getShops(filters = {}) {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEYS.SHOPS) || '[]');
      return data.filter(shop => {
        if (filters.district && filters.district !== 'all' && shop.district_id !== filters.district) {
          return false;
        }
        if (filters.category && filters.category !== 'all' && shop.category_id !== filters.category) {
          return false;
        }
        if (filters.location && filters.location !== 'all') {
          if (!shop.area || !shop.area.toLowerCase().includes(filters.location.toLowerCase())) {
            return false;
          }
        }
        if (filters.search) {
          const q = filters.search.toLowerCase().trim();
          const match = (
            shop.name.toLowerCase().includes(q) ||
            shop.tagline.toLowerCase().includes(q) ||
            shop.location.toLowerCase().includes(q) ||
            shop.description.toLowerCase().includes(q)
          );
          if (!match) return false;
        }
        return true;
      });
    }

    getShopBySlug(slug) {
      const shops = this.getShops();
      return shops.find(s => s.slug === slug || s.id === slug) || null;
    }

    getShopById(id) {
      const shops = this.getShops();
      return shops.find(s => s.id === id) || null;
    }

    registerShop(shopData) {
      const shops = this.getShops();
      const newId = 'shop-' + Date.now();
      const slug = (shopData.name || 'shop')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      const newShop = {
        id: newId,
        slug: slug,
        name: shopData.name,
        tagline: shopData.tagline || 'Local Merchant on Nexovanta',
        category_id: shopData.category_id || 'tech',
        district_id: shopData.district_id || 'tech',
        location: shopData.location || 'Ndagani, Chuka',
        area: shopData.area || 'Ndagani',
        phone: shopData.phone || '+254 700 000 000',
        whatsapp_number: (shopData.whatsapp_number || '254700000000').replace(/[^0-9]/g, ''),
        status: 'open',
        opening_hours: shopData.opening_hours || '8:00 AM - 8:00 PM',
        rating: 5.0,
        review_count: 1,
        product_count: 0,
        is_featured: false,
        logo_url: shopData.logo_url || 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=300&q=80',
        banner_url: shopData.banner_url || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80',
        storefront_style: 'standard-shop',
        awning_color: shopData.awning_color || '#00d2ff',
        accent_color: shopData.accent_color || '#0284c7',
        owner_name: shopData.owner_name || 'Verified Merchant',
        owner_id: shopData.owner_id || null,
        description: shopData.description || 'Welcome to our digital shopfront on Nexovanta!',
        badges: ['New Merchant', 'Community Verified'],
        created_at: new Date().toISOString()
      };

      shops.unshift(newShop);
      localStorage.setItem(STORAGE_KEYS.SHOPS, JSON.stringify(shops));
      return newShop;
    }

    updateShop(shopId, updateData) {
      const shops = this.getShops();
      const idx = shops.findIndex(s => s.id === shopId);
      if (idx !== -1) {
        shops[idx] = { ...shops[idx], ...updateData, updated_at: new Date().toISOString() };
        localStorage.setItem(STORAGE_KEYS.SHOPS, JSON.stringify(shops));
        return shops[idx];
      }
      return null;
    }

    // --- PRODUCTS ---
    getProducts(filters = {}) {
      let products = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]');

      if (filters.shop_id) {
        products = products.filter(p => p.shop_id === filters.shop_id);
      }
      if (filters.category_id && filters.category_id !== 'all') {
        products = products.filter(p => p.category_id === filters.category_id);
      }
      if (filters.district_id && filters.district_id !== 'all') {
        products = products.filter(p => p.district_id === filters.district_id);
      }
      if (filters.in_stock_only) {
        products = products.filter(p => p.stock_quantity > 0);
      }
      if (filters.min_price != null && !isNaN(filters.min_price)) {
        products = products.filter(p => p.price >= Number(filters.min_price));
      }
      if (filters.max_price != null && !isNaN(filters.max_price)) {
        products = products.filter(p => p.price <= Number(filters.max_price));
      }
      if (filters.search) {
        const q = filters.search.toLowerCase().trim();
        products = products.filter(p => {
          const matchName = p.name.toLowerCase().includes(q);
          const matchDesc = p.description && p.description.toLowerCase().includes(q);
          const matchBadge = p.badge && p.badge.toLowerCase().includes(q);
          return matchName || matchDesc || matchBadge;
        });
      }

      // Sorting
      if (filters.sort) {
        switch (filters.sort) {
          case 'price-asc':
            products.sort((a, b) => a.price - b.price);
            break;
          case 'price-desc':
            products.sort((a, b) => b.price - a.price);
            break;
          case 'rating-desc':
            products.sort((a, b) => (b.rating || 0) - (a.rating || 0));
            break;
          case 'name-asc':
            products.sort((a, b) => a.name.localeCompare(b.name));
            break;
          case 'newest':
          default:
            // preserve or reverse id
            break;
        }
      }

      return products;
    }

    getProductById(id) {
      const products = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]');
      return products.find(p => p.id === id) || null;
    }

    addProduct(shopId, productData) {
      const products = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]');
      const shop = this.getShopById(shopId);

      const newId = 'prod-' + Date.now();
      const slug = (productData.name || 'product')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      const newProduct = {
        id: newId,
        shop_id: shopId,
        name: productData.name,
        slug: slug,
        price: Number(productData.price) || 100,
        original_price: productData.original_price ? Number(productData.original_price) : null,
        category_id: productData.category_id || (shop ? shop.category_id : 'all'),
        district_id: shop ? shop.district_id : 'tech',
        stock_quantity: Number(productData.stock_quantity) || 10,
        badge: productData.badge || 'New Arrival',
        rating: 5.0,
        review_count: 0,
        image_urls: productData.image_urls && productData.image_urls.length
          ? productData.image_urls
          : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'],
        description: productData.description || 'Quality product available in Chuka.',
        variants: productData.variants || {},
        features: productData.features || ['Local Pickup or Delivery', 'Verified Quality'],
        status: 'published',
        created_at: new Date().toISOString()
      };

      products.unshift(newProduct);
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));

      // Update shop's product count
      if (shop) {
        this.updateShop(shopId, { product_count: (shop.product_count || 0) + 1 });
      }

      return newProduct;
    }

    updateProduct(productId, updateData) {
      const products = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]');
      const idx = products.findIndex(p => p.id === productId);
      if (idx !== -1) {
        products[idx] = { ...products[idx], ...updateData, updated_at: new Date().toISOString() };
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
        return products[idx];
      }
      return null;
    }

    deleteProduct(productId) {
      let products = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]');
      const product = products.find(p => p.id === productId);
      if (!product) return false;

      products = products.filter(p => p.id !== productId);
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));

      // Decrement shop product count
      const shop = this.getShopById(product.shop_id);
      if (shop && shop.product_count > 0) {
        this.updateShop(product.shop_id, { product_count: shop.product_count - 1 });
      }

      return true;
    }

    // --- MULTI-SELLER SHOPPING CART ---
    getCart() {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.CART) || '[]');
    }

    addToCart(productId, quantity = 1, selectedVariant = '') {
      const product = this.getProductById(productId);
      if (!product) return { success: false, message: 'Product not found.' };

      if (product.stock_quantity < quantity) {
        return { success: false, message: `Only ${product.stock_quantity} units available in stock.` };
      }

      const shop = this.getShopById(product.shop_id) || {
        id: product.shop_id,
        name: 'Chuka Merchant',
        location: 'Chuka'
      };

      let cart = this.getCart();
      const cartItemId = `${productId}_${selectedVariant || 'default'}`;

      const existingIndex = cart.findIndex(item => item.cartItemId === cartItemId);

      if (existingIndex !== -1) {
        const newQty = cart[existingIndex].quantity + quantity;
        if (newQty > product.stock_quantity) {
          return {
            success: false,
            message: `Cannot add more. Reached max available stock (${product.stock_quantity}).`
          };
        }
        cart[existingIndex].quantity = newQty;
        cart[existingIndex].line_total = newQty * product.price;
      } else {
        cart.push({
          cartItemId: cartItemId,
          product_id: product.id,
          product_name: product.name,
          product_image: (product.image_urls && product.image_urls[0]) || '',
          price: product.price,
          quantity: quantity,
          line_total: quantity * product.price,
          selected_variant: selectedVariant,
          shop_id: shop.id,
          shop_name: shop.name,
          shop_location: shop.location,
          shop_whatsapp: shop.whatsapp_number,
          stock_quantity: product.stock_quantity
        });
      }

      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
      return { success: true, message: `Added "${product.name}" to cart!`, cartSummary: this.getCartSummary() };
    }

    updateCartQuantity(cartItemId, delta) {
      let cart = this.getCart();
      const idx = cart.findIndex(item => item.cartItemId === cartItemId);
      if (idx === -1) return null;

      const product = this.getProductById(cart[idx].product_id);
      const newQty = cart[idx].quantity + delta;

      if (newQty <= 0) {
        cart.splice(idx, 1);
      } else {
        if (product && newQty > product.stock_quantity) {
          return { success: false, message: `Only ${product.stock_quantity} available in stock.` };
        }
        cart[idx].quantity = newQty;
        cart[idx].line_total = newQty * cart[idx].price;
      }

      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
      return { success: true, cartSummary: this.getCartSummary() };
    }

    removeFromCart(cartItemId) {
      let cart = this.getCart();
      cart = cart.filter(item => item.cartItemId !== cartItemId);
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
      return { success: true, cartSummary: this.getCartSummary() };
    }

    clearCart() {
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify([]));
      return { success: true, cartSummary: this.getCartSummary() };
    }

    /**
     * Group items by seller for multi-seller fulfillment as specified in requirements!
     */
    getCartSummary() {
      const cart = this.getCart();
      let totalItems = 0;
      let grandTotal = 0;

      // Group by shop_id
      const sellerGroupsMap = {};

      cart.forEach(item => {
        totalItems += item.quantity;
        grandTotal += item.line_total;

        if (!sellerGroupsMap[item.shop_id]) {
          sellerGroupsMap[item.shop_id] = {
            shop_id: item.shop_id,
            shop_name: item.shop_name,
            shop_location: item.shop_location,
            shop_whatsapp: item.shop_whatsapp,
            subtotal: 0,
            item_count: 0,
            items: []
          };
        }

        sellerGroupsMap[item.shop_id].items.push(item);
        sellerGroupsMap[item.shop_id].subtotal += item.line_total;
        sellerGroupsMap[item.shop_id].item_count += item.quantity;
      });

      const sellerGroups = Object.values(sellerGroupsMap);

      return {
        items: cart,
        totalItems: totalItems,
        grandTotal: grandTotal,
        sellerCount: sellerGroups.length,
        sellerGroups: sellerGroups
      };
    }

    // --- CHECKOUT & ORDER CREATION ---
    createOrders(checkoutData) {
      const cartSummary = this.getCartSummary();
      if (!cartSummary.items.length) {
        return { success: false, message: 'Your shopping cart is empty.' };
      }

      // Input Validation
      if (!checkoutData.customer_name || !checkoutData.customer_name.trim()) {
        return { success: false, message: 'Please provide your full name for order pickup/delivery.' };
      }
      if (!checkoutData.customer_phone || !checkoutData.customer_phone.trim()) {
        return { success: false, message: 'Please enter a valid phone number for seller communication.' };
      }
      if (checkoutData.delivery_method === 'delivery' && (!checkoutData.delivery_address || !checkoutData.delivery_address.trim())) {
        return { success: false, message: 'Please specify your hostel name or delivery address in Chuka.' };
      }

      // Validate stock for all items
      for (const item of cartSummary.items) {
        const product = this.getProductById(item.product_id);
        if (!product || product.stock_quantity < item.quantity) {
          return {
            success: false,
            message: `Product "${item.product_name}" is currently out of stock or does not have enough units.`
          };
        }
      }

      const existingOrders = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]');
      const createdOrders = [];
      const parentOrderCode = 'NEX-' + Math.floor(10000 + Math.random() * 90000);

      // Create separate seller-specific order for each shop as required!
      cartSummary.sellerGroups.forEach((group, index) => {
        const orderSuffix = cartSummary.sellerGroups.length > 1 ? `-${String.fromCharCode(65 + index)}` : '';
        const orderNumber = `${parentOrderCode}${orderSuffix}`;

        // Delivery fee: 0 for pickup, standard estimated KSh 100 per seller for Ndagani hostel bike runner
        const deliveryFee = checkoutData.delivery_method === 'delivery' ? 100 : 0;
        const totalAmount = group.subtotal + deliveryFee;

        const order = {
          id: 'ord-' + Date.now() + '-' + index,
          order_number: orderNumber,
          parent_code: parentOrderCode,
          customer_id: checkoutData.customer_id || null,
          customer_name: checkoutData.customer_name.trim(),
          customer_phone: checkoutData.customer_phone.trim(),
          customer_email: checkoutData.customer_email ? checkoutData.customer_email.trim() : '',
          shop_id: group.shop_id,
          shop_name: group.shop_name,
          shop_location: group.shop_location,
          shop_whatsapp: group.shop_whatsapp,
          delivery_method: checkoutData.delivery_method, // 'pickup' | 'delivery'
          delivery_address: checkoutData.delivery_method === 'delivery' ? checkoutData.delivery_address.trim() : 'Pickup at ' + group.shop_name,
          special_instructions: checkoutData.special_instructions ? checkoutData.special_instructions.trim() : '',
          subtotal: group.subtotal,
          delivery_fee: deliveryFee,
          total_amount: totalAmount,
          payment_method: checkoutData.payment_method || 'mpesa', // 'mpesa' | 'cash'
          payment_status: checkoutData.payment_method === 'mpesa' ? 'pending_mpesa_verification' : 'pay_on_collection',
          order_status: 'pending_confirmation', // 'pending_confirmation' | 'preparing' | 'ready_for_pickup' | 'delivered'
          created_at: new Date().toISOString(),
          items: group.items.map(it => ({
            product_id: it.product_id,
            product_name: it.product_name,
            quantity: it.quantity,
            unit_price: it.price,
            line_total: it.line_total,
            variant: it.selected_variant
          }))
        };

        // Deduct inventory stock
        group.items.forEach(it => {
          const prod = this.getProductById(it.product_id);
          if (prod) {
            const newStock = Math.max(0, prod.stock_quantity - it.quantity);
            this.updateProduct(prod.id, { stock_quantity: newStock });
          }
        });

        createdOrders.push(order);
        existingOrders.unshift(order);
      });

      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(existingOrders));

      // Clear Cart after successful order generation
      this.clearCart();

      return {
        success: true,
        parentOrderCode: parentOrderCode,
        orders: createdOrders,
        sellerCount: createdOrders.length,
        message: 'Your community order has been placed with the sellers!'
      };
    }

    getOrders() {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]');
    }

    getOrdersByShop(shopId) {
      const orders = this.getOrders();
      return orders.filter(o => o.shop_id === shopId);
    }

    getOrderById(orderId) {
      const orders = this.getOrders();
      return orders.find(o => o.id === orderId || o.order_number === orderId) || null;
    }

    updateOrderStatus(orderId, newStatus) {
      const orders = this.getOrders();
      const idx = orders.findIndex(o => o.id === orderId || o.order_number === orderId);
      if (idx !== -1) {
        orders[idx].order_status = newStatus;
        orders[idx].updated_at = new Date().toISOString();
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
        return orders[idx];
      }
      return null;
    }

    // --- REVIEWS ---
    getReviews(shopId = null, productId = null) {
      const reviews = JSON.parse(localStorage.getItem(STORAGE_KEYS.REVIEWS) || '[]');
      return reviews.filter(r => {
        if (shopId && r.shop_id !== shopId) return false;
        if (productId && r.product_id !== productId) return false;
        return true;
      });
    }

    addReview(reviewData) {
      const reviews = JSON.parse(localStorage.getItem(STORAGE_KEYS.REVIEWS) || '[]');
      const newReview = {
        id: 'rev-' + Date.now(),
        shop_id: reviewData.shop_id,
        product_id: reviewData.product_id || null,
        customer_name: reviewData.customer_name || 'Verified Buyer',
        customer_role: reviewData.customer_role || 'Chuka Community Member',
        rating: Number(reviewData.rating) || 5,
        date: 'Just now',
        comment: reviewData.comment || 'Great service and authentic products!'
      };

      reviews.unshift(newReview);
      localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));

      // Update shop rating average
      const shopReviews = reviews.filter(r => r.shop_id === reviewData.shop_id);
      if (shopReviews.length) {
        const sum = shopReviews.reduce((acc, r) => acc + r.rating, 0);
        const avg = (sum / shopReviews.length).toFixed(1);
        this.updateShop(reviewData.shop_id, {
          rating: Number(avg),
          review_count: shopReviews.length
        });
      }

      return newReview;
    }

    // --- WISHLIST / FAVOURITES ---
    getWishlist() {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.WISHLIST) || '[]');
    }

    isWishlisted(productId) {
      const list = this.getWishlist();
      return list.includes(productId);
    }

    toggleWishlist(productId) {
      let list = this.getWishlist();
      let added = false;
      if (list.includes(productId)) {
        list = list.filter(id => id !== productId);
        added = false;
      } else {
        list.push(productId);
        added = true;
      }
      localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(list));
      return { success: true, added: added, wishlist: list };
    }

    // --- WHATSAPP INQUIRY & ORDER LINK GENERATOR ---
    generateWhatsAppOrderUrl(order) {
      const phone = order.shop_whatsapp || '254712345001';
      const cleanPhone = phone.replace(/[^0-9]/g, '');

      let text = `*NEW NEXOVANTA ORDER*\n`;
      text += `*Order Ref:* ${order.order_number}\n`;
      text += `*Customer:* ${order.customer_name} (${order.customer_phone})\n`;
      text += `*Delivery Mode:* ${order.delivery_method === 'delivery' ? 'Local Rider Delivery' : 'Shop Pickup'}\n`;
      if (order.delivery_method === 'delivery') {
        text += `*Hostel / Location:* ${order.delivery_address}\n`;
      }
      text += `\n*Ordered Items:*\n`;
      order.items.forEach((it, i) => {
        text += `${i + 1}. ${it.product_name} x ${it.quantity} (KES ${it.line_total.toLocaleString()})${it.variant ? ' [' + it.variant + ']' : ''}\n`;
      });
      text += `\n*Subtotal:* KES ${order.subtotal.toLocaleString()}\n`;
      if (order.delivery_fee > 0) {
        text += `*Delivery Fee:* KES ${order.delivery_fee.toLocaleString()}\n`;
      }
      text += `*Total Amount:* KES ${order.total_amount.toLocaleString()}\n`;
      text += `*Payment:* ${order.payment_method.toUpperCase()}\n`;
      if (order.special_instructions) {
        text += `*Notes:* ${order.special_instructions}\n`;
      }
      text += `\nPlease confirm if this order is accepted. Sent via Nexovanta Community Marketplace.`;

      return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
    }

    generateWhatsAppInquiryUrl(shop, product = null) {
      const phone = (shop && shop.whatsapp_number) ? shop.whatsapp_number : '254712345001';
      const cleanPhone = phone.replace(/[^0-9]/g, '');

      let text = `Hello *${shop ? shop.name : 'Merchant'}*, I found your shop on Nexovanta Community Marketplace.\n`;
      if (product) {
        text += `I am inquiring about *${product.name}* priced at KES ${product.price.toLocaleString()}.\n`;
        text += `Is this item currently in stock at your ${shop.location} shop?`;
      } else {
        text += `I would like to make an inquiry regarding your products.`;
      }

      return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
    }
  }

  root.MarketplaceStore = new MarketplaceStore();
})(window);
