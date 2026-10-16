/**
 * Nexovanta Virtual Community Marketplace
 * Interactive Controller & Routing Script
 * Powering Chuka University & Ndagani Town Commercial District
 */

(function () {
  'use strict';

  // Global State
  const state = {
    currentView: 'market', // 'market' | 'shop'
    currentShop: null,
    currentDistrict: 'all',
    currentCategory: 'all',
    currentLocation: 'all',
    currentSort: 'newest',
    searchQuery: '',
    selectedProductForModal: null,
    activeVariant: '',
    modalQuantity: 1,
    activeSellerDashboardShopId: 'shop-2' // Default to Oloika Electronics for instant testing
  };

  document.addEventListener('DOMContentLoaded', () => {
    initMarketplace();
  });

  function initMarketplace() {
    // 1. Initial State from URL
    handleUrlRouting();
    window.addEventListener('popstate', handleUrlRouting);

    // 2. Render Static / Seed UI Components
    renderHeroStats();
    renderDistrictTabs();
    renderCategoryFilters();
    renderLocationFilters();
    renderVirtualMarketWalk(state.currentDistrict);
    renderShopDirectory();
    renderMarketDiscoveryFeeds();

    // 3. Setup Interactive Event Listeners
    setupSearchHandlers();
    setupCartHandlers();
    setupModalHandlers();
    setupAuthSync();

    // 4. Update Cart Pill
    updateCartUI();
  }

  /* ===================================================================
     1. ROUTING & VIEW CONTROLLER
     =================================================================== */
  function handleUrlRouting() {
    const params = new URLSearchParams(window.location.search);
    const shopSlug = params.get('shop');
    const searchParam = params.get('search');
    const categoryParam = params.get('category');

    if (searchParam) {
      state.searchQuery = searchParam;
      const searchInput = document.getElementById('heroSearchInput');
      if (searchInput) searchInput.value = searchParam;
    }

    if (categoryParam) {
      state.currentCategory = categoryParam;
    }

    if (shopSlug) {
      openShopView(shopSlug, false);
    } else {
      showMarketView(false);
    }
  }

  function showMarketView(pushHistory = true) {
    state.currentView = 'market';
    state.currentShop = null;

    const marketView = document.getElementById('marketMainView');
    const shopView = document.getElementById('shopDetailView');

    if (marketView) marketView.style.display = 'block';
    if (shopView) {
      shopView.style.display = 'none';
      shopView.classList.remove('active');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (pushHistory) {
      const url = new URL(window.location.href);
      url.searchParams.delete('shop');
      window.history.pushState({}, '', url.pathname + url.search);
    }
  }

  function openShopView(shopSlugOrId, pushHistory = true) {
    const shop = window.MarketplaceStore.getShopBySlug(shopSlugOrId);
    if (!shop) {
      showToast('Shop not found. Returning to market boulevard.');
      showMarketView(pushHistory);
      return;
    }

    state.currentView = 'shop';
    state.currentShop = shop;

    const marketView = document.getElementById('marketMainView');
    const shopView = document.getElementById('shopDetailView');

    if (marketView) marketView.style.display = 'none';
    if (shopView) {
      shopView.style.display = 'block';
      shopView.classList.add('active');
    }

    renderShopDetailContent(shop);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (pushHistory) {
      const url = new URL(window.location.href);
      url.searchParams.set('shop', shop.slug);
      window.history.pushState({}, '', url.toString());
    }
  }

  /* ===================================================================
     2. HERO & STATS
     =================================================================== */
  function renderHeroStats() {
    const stats = window.MarketplaceStore.getStats();
    const statShops = document.getElementById('statRegisteredShops');
    const statProds = document.getElementById('statProductsAvailable');
    const statDistricts = document.getElementById('statActiveDistricts');

    if (statShops) statShops.textContent = stats.registeredShops + '+';
    if (statProds) statProds.textContent = stats.productsAvailable + '+';
    if (statDistricts) statDistricts.textContent = stats.activeDistricts;
  }

  /* ===================================================================
     3. VIRTUAL MARKET WALK (THE SIGNATURE FEATURE)
     =================================================================== */
  function renderDistrictTabs() {
    const container = document.getElementById('districtTabsContainer');
    if (!container) return;

    const districts = window.MarketplaceStore.getDistricts();
    let html = `
      <button class="district-tab-btn ${state.currentDistrict === 'all' ? 'active' : ''}" data-district="all">
        <i class="fa-solid fa-map-location-dot"></i>
        <span>All Commercial Districts</span>
      </button>
    `;

    districts.forEach(d => {
      const isActive = state.currentDistrict === d.id ? 'active' : '';
      html += `
        <button class="district-tab-btn ${isActive}" data-district="${d.id}">
          <i class="fa-solid ${d.icon}"></i>
          <span>${escapeHtml(d.name)}</span>
        </button>
      `;
    });

    container.innerHTML = html;

    container.querySelectorAll('.district-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const dist = btn.getAttribute('data-district');
        state.currentDistrict = dist;

        container.querySelectorAll('.district-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        renderVirtualMarketWalk(dist);
      });
    });
  }

  function renderVirtualMarketWalk(districtId = 'all') {
    const grid = document.getElementById('virtualStreetGrid');
    const bannerInfo = document.getElementById('activeDistrictBanner');
    if (!grid) return;

    const districts = window.MarketplaceStore.getDistricts();
    const curDist = districts.find(d => d.id === districtId);

    if (bannerInfo) {
      if (curDist) {
        bannerInfo.innerHTML = `
          <div style="display:flex; align-items:center; gap:12px; margin-bottom:20px; padding:16px 20px; background:${curDist.accentBg}; border:1px solid ${curDist.color}; border-radius:14px;">
            <i class="fa-solid ${curDist.icon}" style="font-size:1.8rem; color:${curDist.color};"></i>
            <div>
              <h3 style="font-size:1.2rem; color:#fff; margin-bottom:2px;">${curDist.name}</h3>
              <p style="font-size:0.85rem; color:#cbd5e1;">${curDist.description}</p>
            </div>
          </div>
        `;
      } else {
        bannerInfo.innerHTML = '';
      }
    }

    const shops = window.MarketplaceStore.getShops({
      district: districtId
    });

    if (!shops.length) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align:center; padding:50px 20px; color:var(--text-muted);">
          <i class="fa-solid fa-store-slash" style="font-size:2.5rem; margin-bottom:14px; opacity:0.6;"></i>
          <h3>No Storefronts In This District Yet</h3>
          <p>Be the first merchant to set up a digital shop here!</p>
          <button class="btn btn-primary btn-sm btn-open-seller-reg" style="margin-top:16px;">
            <i class="fa-solid fa-plus"></i> Open Your Shop Here
          </button>
        </div>
      `;
      return;
    }

    grid.innerHTML = shops.map(shop => {
      const awningColor = shop.awning_color || '#00d2ff';
      const isOpen = shop.status === 'open';

      return `
        <div class="storefront-facade-card" style="--awning-color: ${awningColor};">
          <!-- 3D Striped Awning -->
          <div class="storefront-awning">
            <div class="storefront-awning-scallop"></div>
          </div>

          <!-- Illuminated Shop Signage Plate -->
          <div class="storefront-signage-plate">
            <img src="${escapeHtml(shop.logo_url)}" alt="${escapeHtml(shop.name)}" class="storefront-logo-circle" onerror="this.src='Logo.jpg'">
            <div class="storefront-sign-text">
              <h4 class="storefront-sign-title">${escapeHtml(shop.name)}</h4>
              <p class="storefront-sign-tagline">${escapeHtml(shop.tagline)}</p>
            </div>
            <div class="storefront-status-pill">
              <span class="status-dot-pulse"></span>
              <span>${isOpen ? 'OPEN' : 'CLOSED'}</span>
            </div>
          </div>

          <!-- Display Window -->
          <div class="storefront-display-window">
            <img src="${escapeHtml(shop.banner_url)}" alt="${escapeHtml(shop.name)}" class="storefront-window-img" loading="lazy" onerror="this.src='Logo.jpg'">
            <div class="storefront-window-overlay">
              <span class="storefront-location-tag">
                <i class="fa-solid fa-location-dot" style="color:var(--accent-cyan);"></i>
                ${escapeHtml(shop.location)}
              </span>
            </div>
          </div>

          <!-- Entrance Door & Base -->
          <div class="storefront-entrance-base">
            <p class="storefront-short-bio">${escapeHtml(shop.description)}</p>

            <div class="storefront-facets-row">
              <span class="storefront-rating-badge">
                <i class="fa-solid fa-star"></i> ${shop.rating.toFixed(1)} (${shop.review_count})
              </span>
              <span><i class="fa-solid fa-boxes-stacked"></i> ${shop.product_count} products</span>
            </div>

            <button class="btn-enter-storefront btn-visit-shop" data-shop="${escapeHtml(shop.slug)}">
              <span>ENTER SHOP</span>
              <i class="fa-solid fa-arrow-right"></i>
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Attach click listeners to storefront cards & enter buttons
    grid.querySelectorAll('.btn-visit-shop').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const slug = btn.getAttribute('data-shop');
        openShopView(slug);
      });
    });
  }

  /* ===================================================================
     4. SHOP DIRECTORY & FILTERS
     =================================================================== */
  function renderCategoryFilters() {
    const select = document.getElementById('dirCategoryFilter');
    if (!select) return;

    const categories = window.MarketplaceStore.getCategories();
    select.innerHTML = categories.map(c => `
      <option value="${c.id}" ${state.currentCategory === c.id ? 'selected' : ''}>${escapeHtml(c.name)}</option>
    `).join('');

    select.addEventListener('change', () => {
      state.currentCategory = select.value;
      renderShopDirectory();
    });
  }

  function renderLocationFilters() {
    const select = document.getElementById('dirLocationFilter');
    if (!select) return;

    select.addEventListener('change', () => {
      state.currentLocation = select.value;
      renderShopDirectory();
    });
  }

  function renderShopDirectory() {
    const container = document.getElementById('shopDirectoryGrid');
    if (!container) return;

    const shops = window.MarketplaceStore.getShops({
      category: state.currentCategory,
      location: state.currentLocation,
      search: state.searchQuery
    });

    const countLabel = document.getElementById('directoryCountLabel');
    if (countLabel) {
      countLabel.textContent = `Showing ${shops.length} independent shops`;
    }

    if (!shops.length) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align:center; padding:60px 20px; color:var(--text-muted); background:var(--bg-card); border-radius:18px;">
          <i class="fa-solid fa-magnifying-glass" style="font-size:2.5rem; margin-bottom:14px; opacity:0.5;"></i>
          <h3>No shops matched your filters</h3>
          <p>Try resetting your category or location filters.</p>
          <button class="btn btn-outline btn-sm" id="btnResetFilters" style="margin-top:16px;">
            <i class="fa-solid fa-rotate-left"></i> Reset All Filters
          </button>
        </div>
      `;

      const resetBtn = document.getElementById('btnResetFilters');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          state.currentCategory = 'all';
          state.currentLocation = 'all';
          state.searchQuery = '';
          const catEl = document.getElementById('dirCategoryFilter');
          const locEl = document.getElementById('dirLocationFilter');
          if (catEl) catEl.value = 'all';
          if (locEl) locEl.value = 'all';
          renderShopDirectory();
        });
      }
      return;
    }

    container.innerHTML = shops.map(shop => {
      return `
        <div class="product-item-card" style="border-top: 3px solid ${shop.awning_color || 'var(--accent-cyan)'};">
          <div class="product-card-media btn-visit-shop" data-shop="${escapeHtml(shop.slug)}">
            <img src="${escapeHtml(shop.banner_url)}" alt="${escapeHtml(shop.name)}" class="product-card-img" loading="lazy" onerror="this.src='Logo.jpg'">
            <span class="product-card-badge">
              <i class="fa-solid fa-location-dot"></i> ${escapeHtml(shop.area || 'Chuka')}
            </span>
          </div>

          <div class="product-card-body">
            <div style="display:flex; align-items:center; gap:10px; margin-bottom:10px;">
              <img src="${escapeHtml(shop.logo_url)}" alt="${escapeHtml(shop.name)}" style="width:36px; height:36px; border-radius:8px; object-fit:cover; border:1px solid var(--border-light);" onerror="this.src='Logo.jpg'">
              <div>
                <h4 style="font-size:0.98rem; font-weight:800; color:#fff; line-height:1.2;">${escapeHtml(shop.name)}</h4>
                <span style="font-size:0.75rem; color:var(--text-dim);">${escapeHtml(shop.location)}</span>
              </div>
            </div>

            <p style="font-size:0.82rem; color:var(--text-muted); line-height:1.45; margin-bottom:14px; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">
              ${escapeHtml(shop.description)}
            </p>

            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:auto; padding-top:12px; border-top:1px solid var(--border-light);">
              <span style="font-size:0.82rem; color:#fbbf24; font-weight:700;">
                <i class="fa-solid fa-star"></i> ${shop.rating.toFixed(1)} (${shop.review_count})
              </span>
              <button class="btn btn-outline btn-sm btn-visit-shop" data-shop="${escapeHtml(shop.slug)}" style="padding:6px 14px; font-size:0.8rem;">
                Visit Shop <i class="fa-solid fa-arrow-right"></i>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    container.querySelectorAll('.btn-visit-shop').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const slug = btn.getAttribute('data-shop');
        openShopView(slug);
      });
    });
  }

  /* ===================================================================
     5. MARKET DISCOVERY FEEDS (Trending, Recently Added, Categories)
     =================================================================== */
  function renderMarketDiscoveryFeeds() {
    renderFeaturedShops();
    renderTrendingProducts();
    renderRecentlyAdded();
    renderCategoryGridCards();
  }

  function renderFeaturedShops() {
    const container = document.getElementById('featuredShopsGrid');
    if (!container) return;

    const shops = window.MarketplaceStore.getShops().filter(s => s.is_featured).slice(0, 4);
    container.innerHTML = shops.map(shop => `
      <div class="product-item-card btn-visit-shop" data-shop="${escapeHtml(shop.slug)}" style="cursor:pointer;">
        <div class="product-card-media">
          <img src="${escapeHtml(shop.banner_url)}" alt="${escapeHtml(shop.name)}" class="product-card-img" loading="lazy" onerror="this.src='Logo.jpg'">
          <span class="product-card-badge" style="background:rgba(245, 158, 11, 0.25); color:#fbbf24; border-color:#fbbf24;">
            <i class="fa-solid fa-certificate"></i> Verified Merchant
          </span>
        </div>
        <div class="product-card-body">
          <h4 style="font-size:1.05rem; font-weight:800; color:#fff; margin-bottom:4px;">${escapeHtml(shop.name)}</h4>
          <p style="font-size:0.8rem; color:var(--accent-cyan); margin-bottom:10px;">${escapeHtml(shop.tagline)}</p>
          <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.8rem; color:var(--text-dim); margin-top:auto;">
            <span><i class="fa-solid fa-location-dot"></i> ${escapeHtml(shop.area || 'Chuka')}</span>
            <span style="color:#fbbf24; font-weight:700;"><i class="fa-solid fa-star"></i> ${shop.rating.toFixed(1)}</span>
          </div>
        </div>
      </div>
    `).join('');

    container.querySelectorAll('.btn-visit-shop').forEach(btn => {
      btn.addEventListener('click', () => {
        const slug = btn.getAttribute('data-shop');
        openShopView(slug);
      });
    });
  }

  function renderTrendingProducts() {
    const container = document.getElementById('trendingProductsGrid');
    if (!container) return;

    const products = window.MarketplaceStore.getProducts().slice(0, 8);
    container.innerHTML = products.map(prod => renderProductCardHTML(prod)).join('');
    attachProductCardEvents(container);
  }

  function renderRecentlyAdded() {
    const container = document.getElementById('recentProductsGrid');
    if (!container) return;

    const products = window.MarketplaceStore.getProducts({ sort: 'newest' }).slice(4, 12);
    container.innerHTML = products.map(prod => renderProductCardHTML(prod)).join('');
    attachProductCardEvents(container);
  }

  function renderCategoryGridCards() {
    const container = document.getElementById('categoryShowcaseGrid');
    if (!container) return;

    const categories = window.MarketplaceStore.getCategories().filter(c => c.id !== 'all');
    container.innerHTML = categories.map(cat => `
      <div class="product-item-card cat-card-interactive" data-cat="${cat.id}" style="padding:22px; cursor:pointer; text-align:center;">
        <div style="width:56px; height:56px; border-radius:16px; background:rgba(0, 210, 255, 0.12); color:var(--accent-cyan); display:flex; align-items:center; justify-content:center; font-size:1.5rem; margin:0 auto 14px auto;">
          <i class="fa-solid ${cat.icon}"></i>
        </div>
        <h4 style="font-size:1rem; font-weight:800; color:#fff; margin-bottom:4px;">${escapeHtml(cat.name)}</h4>
        <span style="font-size:0.78rem; color:var(--text-dim);">Browse Category ➔</span>
      </div>
    `).join('');

    container.querySelectorAll('.cat-card-interactive').forEach(card => {
      card.addEventListener('click', () => {
        const catId = card.getAttribute('data-cat');
        state.currentCategory = catId;
        const select = document.getElementById('dirCategoryFilter');
        if (select) select.value = catId;
        renderShopDirectory();
        const dirSection = document.getElementById('shop-directory');
        if (dirSection) dirSection.scrollIntoView({ behavior: 'smooth' });
      });
    });
  }

  /* ===================================================================
     6. PRODUCT CARD TEMPLATE & EVENT BINDINGS
     =================================================================== */
  function renderProductCardHTML(product) {
    const isWish = window.MarketplaceStore.isWishlisted(product.id);
    const shop = window.MarketplaceStore.getShopById(product.shop_id) || { name: 'Chuka Merchant', slug: '' };

    return `
      <div class="product-item-card" data-product-id="${product.id}">
        <div class="product-card-media">
          <img src="${escapeHtml((product.image_urls && product.image_urls[0]) || 'Logo.jpg')}" alt="${escapeHtml(product.name)}" class="product-card-img" loading="lazy" onerror="this.src='Logo.jpg'">
          ${product.badge ? `<span class="product-card-badge">${escapeHtml(product.badge)}</span>` : ''}
          <button class="product-wishlist-btn ${isWish ? 'active' : ''}" data-wishlist-id="${product.id}" title="Save to Favourites">
            <i class="fa-${isWish ? 'solid' : 'regular'} fa-heart"></i>
          </button>
        </div>

        <div class="product-card-body">
          <a href="#" class="product-shop-link btn-visit-shop" data-shop="${escapeHtml(shop.slug || product.shop_id)}">
            <i class="fa-solid fa-store"></i> ${escapeHtml(shop.name)}
          </a>

          <h4 class="product-card-title btn-trigger-quickview" data-product-id="${product.id}">${escapeHtml(product.name)}</h4>

          <div class="stock-indicator-pill">
            <i class="fa-solid fa-circle-check"></i>
            <span>${product.stock_quantity > 0 ? `In Stock (${product.stock_quantity} available)` : 'Out of Stock'}</span>
          </div>

          <div class="product-card-price-row">
            <span class="price-current">KES ${product.price.toLocaleString()}</span>
            ${product.original_price ? `<span class="price-original">KES ${product.original_price.toLocaleString()}</span>` : ''}
          </div>

          <div class="product-card-actions">
            <button class="btn-add-to-cart" data-cart-product-id="${product.id}">
              <i class="fa-solid fa-cart-plus"></i> Add to Cart
            </button>
            <button class="btn-quick-view btn-trigger-quickview" data-product-id="${product.id}" title="Quick View">
              <i class="fa-solid fa-eye"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  function attachProductCardEvents(parentElement) {
    // Quick View Triggers
    parentElement.querySelectorAll('.btn-trigger-quickview').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const prodId = btn.getAttribute('data-product-id');
        openProductModal(prodId);
      });
    });

    // Add to Cart Triggers
    parentElement.querySelectorAll('.btn-add-to-cart').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const prodId = btn.getAttribute('data-cart-product-id');
        const res = window.MarketplaceStore.addToCart(prodId, 1, '');
        if (res.success) {
          showToast(res.message);
          updateCartUI(true);
        } else {
          showToast(res.message);
        }
      });
    });

    // Wishlist Triggers
    parentElement.querySelectorAll('.product-wishlist-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const prodId = btn.getAttribute('data-wishlist-id');
        const res = window.MarketplaceStore.toggleWishlist(prodId);
        if (res.added) {
          btn.classList.add('active');
          btn.innerHTML = '<i class="fa-solid fa-heart"></i>';
          showToast('Added to your community wishlist! ❤️');
        } else {
          btn.classList.remove('active');
          btn.innerHTML = '<i class="fa-regular fa-heart"></i>';
          showToast('Removed from your wishlist.');
        }
      });
    });

    // Shop Link Triggers
    parentElement.querySelectorAll('.btn-visit-shop').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const slug = btn.getAttribute('data-shop');
        openShopView(slug);
      });
    });
  }

  /* ===================================================================
     7. INDIVIDUAL SHOP STOREFRONT VIEW CONTROLLER
     =================================================================== */
  function renderShopDetailContent(shop) {
    const headerBanner = document.getElementById('shopHeaderBanner');
    const avatar = document.getElementById('shopDetailAvatar');
    const nameEl = document.getElementById('shopDetailName');
    const taglineEl = document.getElementById('shopDetailTagline');
    const locationEl = document.getElementById('shopDetailLocation');
    const hoursEl = document.getElementById('shopDetailHours');
    const ratingEl = document.getElementById('shopDetailRating');
    const badgesWrap = document.getElementById('shopDetailBadges');
    const waBtn = document.getElementById('shopDetailWhatsApp');
    const callBtn = document.getElementById('shopDetailCall');

    if (headerBanner) {
      headerBanner.style.backgroundImage = `url('${shop.banner_url || "Logo.jpg"}')`;
    }
    if (avatar) avatar.src = shop.logo_url || 'Logo.jpg';
    if (nameEl) nameEl.textContent = shop.name;
    if (taglineEl) taglineEl.textContent = shop.tagline;
    if (locationEl) locationEl.innerHTML = `<i class="fa-solid fa-location-dot"></i> ${escapeHtml(shop.location)}`;
    if (hoursEl) hoursEl.innerHTML = `<i class="fa-solid fa-clock"></i> ${escapeHtml(shop.opening_hours || '8:00 AM - 8:00 PM')}`;
    if (ratingEl) ratingEl.innerHTML = `<i class="fa-solid fa-star" style="color:#fbbf24;"></i> ${shop.rating.toFixed(1)} (${shop.review_count} community reviews)`;

    if (badgesWrap) {
      let badgesHtml = (shop.badges || []).map(b => `
        <span class="storefront-status-pill" style="background:rgba(0, 210, 255, 0.12); color:var(--accent-cyan); border-color:rgba(0, 210, 255, 0.3);">
          <i class="fa-solid fa-circle-check"></i> ${escapeHtml(b)}
        </span>
      `).join('');

      // If the current user is the shop owner, show a "Manage Shop" button
      const session = typeof NexovantaDB !== 'undefined' ? NexovantaDB.Session.get() : null;
      const isOwner = session && session.loggedIn && shop.owner_id && session.id === shop.owner_id;
      if (isOwner) {
        badgesHtml += `
          <a href="storefront.html" class="btn btn-business btn-sm" style="padding:6px 16px;margin-left:4px;">
            <i class="fa-solid fa-sliders"></i> Manage My Shop
          </a>
        `;
      }

      badgesWrap.innerHTML = badgesHtml;
    }

    // Direct WhatsApp and Call Links
    if (waBtn) {
      waBtn.href = window.MarketplaceStore.generateWhatsAppInquiryUrl(shop);
    }
    if (callBtn) {
      callBtn.href = `tel:${shop.phone || '+254700000000'}`;
    }

    // Render Tabs for this shop
    initShopTabs(shop);
  }

  function initShopTabs(shop) {
    const tabs = document.querySelectorAll('.shop-nav-tab');
    const productsContainer = document.getElementById('shopProductsGrid');
    const aboutContainer = document.getElementById('shopAboutPanel');
    const reviewsContainer = document.getElementById('shopReviewsPanel');

    // Default to 'all'
    renderShopProducts(shop.id, 'all');
    renderShopAbout(shop);
    renderShopReviews(shop.id);

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const tabType = tab.getAttribute('data-shop-tab');

        if (tabType === 'about') {
          if (productsContainer) productsContainer.style.display = 'none';
          if (aboutContainer) aboutContainer.style.display = 'block';
          if (reviewsContainer) reviewsContainer.style.display = 'none';
        } else if (tabType === 'reviews') {
          if (productsContainer) productsContainer.style.display = 'none';
          if (aboutContainer) aboutContainer.style.display = 'none';
          if (reviewsContainer) reviewsContainer.style.display = 'block';
        } else {
          if (productsContainer) productsContainer.style.display = 'grid';
          if (aboutContainer) aboutContainer.style.display = 'none';
          if (reviewsContainer) reviewsContainer.style.display = 'none';
          renderShopProducts(shop.id, tabType);
        }
      });
    });
  }

  function renderShopProducts(shopId, filterType = 'all') {
    const container = document.getElementById('shopProductsGrid');
    if (!container) return;

    let products = window.MarketplaceStore.getProducts({ shop_id: shopId });

    if (filterType === 'popular') {
      products = [...products].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (filterType === 'new') {
      products = [...products].reverse();
    }

    if (!products.length) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align:center; padding:50px 20px; color:var(--text-muted); background:var(--bg-card); border-radius:18px;">
          <i class="fa-solid fa-boxes-stacked" style="font-size:2.5rem; margin-bottom:14px; opacity:0.6;"></i>
          <h3>No products listed in this section</h3>
          <p>This shop will list more inventory shortly.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = products.map(p => renderProductCardHTML(p)).join('');
    attachProductCardEvents(container);
  }

  function renderShopAbout(shop) {
    const container = document.getElementById('shopAboutPanel');
    if (!container) return;

    // Try to get richer owner info from NexovantaDB
    let ownerProfile = null;
    if (typeof NexovantaDB !== 'undefined' && shop.owner_id) {
      ownerProfile = NexovantaDB.Users.getById(shop.owner_id);
    }

    const ownerName = ownerProfile
      ? (ownerProfile.full_name || ownerProfile.username)
      : (shop.owner_name || 'Verified Merchant');
    const ownerBio = ownerProfile && ownerProfile.bio
      ? ownerProfile.bio
      : '';
    const ownerPhone = ownerProfile && ownerProfile.phone
      ? ownerProfile.phone
      : shop.phone;
    const ownerLocation = ownerProfile && ownerProfile.location
      ? ownerProfile.location
      : shop.location;
    const ownerAvatar = ownerProfile && ownerProfile.avatar_url
      ? ownerProfile.avatar_url
      : null;

    // Build owner avatar HTML
    let avatarHtml;
    if (ownerAvatar) {
      avatarHtml = `<img src="${escapeHtml(ownerAvatar)}" alt="${escapeHtml(ownerName)}"
        style="width:56px;height:56px;border-radius:50%;object-fit:cover;border:2px solid rgba(245,158,11,0.5);"
        onerror="this.style.display='none'">`;
    } else {
      const initials = ownerName.slice(0, 2).toUpperCase();
      avatarHtml = `<div style="width:56px;height:56px;border-radius:50%;background:rgba(245,158,11,0.2);
        border:2px solid rgba(245,158,11,0.4);display:flex;align-items:center;justify-content:center;
        font-family:var(--font-heading);font-size:1.2rem;font-weight:800;color:#fbbf24;">${initials}</div>`;
    }

    container.innerHTML = `
      <div style="background:var(--bg-card); border:1px solid var(--border-light); border-radius:var(--radius-lg); padding:30px; margin-top:20px;">
        <h3 style="font-family:var(--font-heading); font-size:1.4rem; color:#fff; margin-bottom:16px;">About ${escapeHtml(shop.name)}</h3>
        <p style="font-size:0.95rem; color:#cbd5e1; line-height:1.7; margin-bottom:24px;">
          ${escapeHtml(shop.description)}
        </p>

        ${ownerBio ? `
          <div style="background:rgba(245,158,11,0.07);border:1px solid rgba(245,158,11,0.2);border-radius:var(--radius-md);padding:16px 20px;margin-bottom:24px;">
            <div style="font-size:0.78rem;font-weight:800;color:#fbbf24;text-transform:uppercase;margin-bottom:6px;">
              <i class="fa-solid fa-store"></i> Business Owner's Community Bio
            </div>
            <p style="font-size:0.88rem;color:#cbd5e1;line-height:1.6;margin:0;">${escapeHtml(ownerBio)}</p>
          </div>
        ` : ''}

        <!-- Owner Card -->
        <div style="display:flex;align-items:center;gap:16px;background:rgba(6,11,24,0.5);
          border:1px solid var(--border-light);border-radius:var(--radius-md);padding:16px 20px;margin-bottom:24px;">
          ${avatarHtml}
          <div>
            <div style="font-weight:800;font-size:1.05rem;color:#fff;">${escapeHtml(ownerName)}</div>
            <div style="font-size:0.8rem;color:var(--accent-cyan);margin-top:2px;">
              <i class="fa-solid fa-certificate"></i> Verified Nexovanta Business Owner
            </div>
            ${ownerProfile && ownerProfile.username ? `
              <div style="font-size:0.75rem;color:var(--text-dim);margin-top:2px;">
                @${escapeHtml(ownerProfile.username)} · Chuka Community Platform
              </div>
            ` : ''}
          </div>
        </div>

        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:20px; padding-top:20px; border-top:1px solid var(--border-light);">
          <div>
            <h5 style="font-size:0.8rem; color:var(--text-dim); text-transform:uppercase; margin-bottom:6px;">Physical Storefront</h5>
            <p style="font-size:1rem; font-weight:700; color:#fff;"><i class="fa-solid fa-location-dot" style="color:var(--accent-cyan);"></i> ${escapeHtml(shop.location)}</p>
          </div>
          ${ownerLocation && ownerLocation !== shop.location ? `
          <div>
            <h5 style="font-size:0.8rem; color:var(--text-dim); text-transform:uppercase; margin-bottom:6px;">Owner's Community Area</h5>
            <p style="font-size:1rem; font-weight:700; color:#fff;"><i class="fa-solid fa-map-location-dot" style="color:#fbbf24;"></i> ${escapeHtml(ownerLocation)}</p>
          </div>
          ` : ''}
          <div>
            <h5 style="font-size:0.8rem; color:var(--text-dim); text-transform:uppercase; margin-bottom:6px;">Customer Service</h5>
            <p style="font-size:1rem; font-weight:700; color:var(--accent-cyan);">
              <a href="tel:${escapeHtml(ownerPhone)}" style="color:var(--accent-cyan);text-decoration:none;">${escapeHtml(ownerPhone)}</a>
            </p>
          </div>
          <div>
            <h5 style="font-size:0.8rem; color:var(--text-dim); text-transform:uppercase; margin-bottom:6px;">Store Hours</h5>
            <p style="font-size:1rem; font-weight:700; color:#fff;">${escapeHtml(shop.opening_hours || '8:00 AM – 8:00 PM')}</p>
          </div>
          ${ownerProfile && ownerProfile.email ? `
          <div>
            <h5 style="font-size:0.8rem; color:var(--text-dim); text-transform:uppercase; margin-bottom:6px;">Business Email</h5>
            <p style="font-size:0.9rem; font-weight:700; color:#fff;">
              <a href="mailto:${escapeHtml(ownerProfile.email)}" style="color:var(--accent-cyan);text-decoration:none;">${escapeHtml(ownerProfile.email)}</a>
            </p>
          </div>
          ` : ''}
        </div>

        <!-- WhatsApp CTA -->
        <div style="margin-top:24px;text-align:center;">
          <a href="${escapeHtml(window.MarketplaceStore.generateWhatsAppInquiryUrl(shop))}"
             target="_blank" rel="noopener noreferrer" class="btn-whatsapp-direct" style="display:inline-flex;">
            <i class="fa-brands fa-whatsapp"></i> Chat Directly with ${escapeHtml(ownerName)} on WhatsApp
          </a>
        </div>
      </div>
    `;
  }

  function renderShopReviews(shopId) {
    const container = document.getElementById('shopReviewsPanel');
    if (!container) return;

    const reviews = window.MarketplaceStore.getReviews(shopId);

    container.innerHTML = `
      <div style="background:var(--bg-card); border:1px solid var(--border-light); border-radius:var(--radius-lg); padding:30px; margin-top:20px;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px; margin-bottom:24px;">
          <div>
            <h3 style="font-family:var(--font-heading); font-size:1.4rem; color:#fff;">Community Feedback</h3>
            <p style="font-size:0.85rem; color:var(--text-muted);">Verified reviews from Chuka University students and town residents.</p>
          </div>
          <button class="btn btn-outline btn-sm" id="btnOpenReviewModal">
            <i class="fa-solid fa-pen"></i> Leave a Review
          </button>
        </div>

        <div style="display:flex; flex-direction:column; gap:16px;">
          ${reviews.length ? reviews.map(r => `
            <div style="background:rgba(6, 11, 24, 0.6); border:1px solid var(--border-light); border-radius:var(--radius-md); padding:18px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                <div>
                  <h5 style="font-size:0.95rem; font-weight:800; color:#fff;">${escapeHtml(r.customer_name)}</h5>
                  <span style="font-size:0.75rem; color:var(--accent-teal);">${escapeHtml(r.customer_role || 'Chuka Member')}</span>
                </div>
                <div style="color:#fbbf24; font-size:0.85rem;">
                  ${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}
                </div>
              </div>
              <p style="font-size:0.88rem; color:#cbd5e1; line-height:1.5;">${escapeHtml(r.comment)}</p>
              <span style="font-size:0.72rem; color:var(--text-dim); margin-top:8px; display:block;">${escapeHtml(r.date)}</span>
            </div>
          `).join('') : '<p style="color:var(--text-muted);">No reviews written yet. Be the first to share your experience!</p>'}
        </div>
      </div>
    `;

    const writeBtn = document.getElementById('btnOpenReviewModal');
    if (writeBtn) {
      writeBtn.addEventListener('click', () => {
        openReviewModal(shopId);
      });
    }
  }

  function openReviewModal(shopId) {
    const modal = document.getElementById('reviewModalBackdrop');
    if (modal) {
      modal.setAttribute('data-target-shop', shopId);
      modal.classList.add('active');
    }
  }

  /* ===================================================================
     8. PRODUCT DETAILS MODAL (WINDOW SHOPPING & QUICK VIEW)
     =================================================================== */
  function openProductModal(productId) {
    const product = window.MarketplaceStore.getProductById(productId);
    if (!product) return;

    state.selectedProductForModal = product;
    state.modalQuantity = 1;
    state.activeVariant = '';

    const modal = document.getElementById('productDetailModal');
    if (!modal) return;

    const mainImg = document.getElementById('modalMainImage');
    const thumbStrip = document.getElementById('modalThumbnailStrip');
    const titleEl = document.getElementById('modalProductTitle');
    const priceEl = document.getElementById('modalProductPrice');
    const origPriceEl = document.getElementById('modalOriginalPrice');
    const descEl = document.getElementById('modalProductDesc');
    const stockEl = document.getElementById('modalStockBadge');
    const shopLink = document.getElementById('modalShopLink');
    const variantsWrap = document.getElementById('modalVariantsWrap');
    const featuresWrap = document.getElementById('modalFeaturesList');
    const qtyInput = document.getElementById('modalQtyInput');
    const waInquiryBtn = document.getElementById('modalWhatsAppInquiry');

    const shop = window.MarketplaceStore.getShopById(product.shop_id) || { name: 'Chuka Merchant', slug: '' };

    if (mainImg) mainImg.src = (product.image_urls && product.image_urls[0]) || 'Logo.jpg';
    if (titleEl) titleEl.textContent = product.name;
    if (priceEl) priceEl.textContent = `KES ${product.price.toLocaleString()}`;
    if (origPriceEl) {
      origPriceEl.textContent = product.original_price ? `KES ${product.original_price.toLocaleString()}` : '';
    }
    if (descEl) descEl.textContent = product.description;
    if (stockEl) {
      stockEl.textContent = product.stock_quantity > 0 ? `In Stock (${product.stock_quantity} available)` : 'Out of Stock';
    }
    if (shopLink) {
      shopLink.textContent = `Sold by ${shop.name}`;
      shopLink.setAttribute('data-shop', shop.slug);
    }
    if (qtyInput) qtyInput.value = 1;

    // Direct WhatsApp Inquiry link
    if (waInquiryBtn) {
      waInquiryBtn.href = window.MarketplaceStore.generateWhatsAppInquiryUrl(shop, product);
    }

    // Thumbnails
    if (thumbStrip) {
      if (product.image_urls && product.image_urls.length > 1) {
        thumbStrip.innerHTML = product.image_urls.map((url, idx) => `
          <img src="${escapeHtml(url)}" class="modal-thumb-item ${idx === 0 ? 'active' : ''}" data-idx="${idx}" alt="Thumb" onerror="this.src='Logo.jpg'">
        `).join('');

        thumbStrip.querySelectorAll('.modal-thumb-item').forEach(th => {
          th.addEventListener('click', () => {
            thumbStrip.querySelectorAll('.modal-thumb-item').forEach(t => t.classList.remove('active'));
            th.classList.add('active');
            const idx = th.getAttribute('data-idx');
            if (mainImg) mainImg.src = product.image_urls[idx];
          });
        });
      } else {
        thumbStrip.innerHTML = '';
      }
    }

    // Variants (Sizes, Colors, etc.)
    if (variantsWrap) {
      if (product.variants && Object.keys(product.variants).length) {
        let html = '';
        for (const [key, options] of Object.entries(product.variants)) {
          html += `
            <div class="variant-selector-group">
              <span class="variant-label">Select ${escapeHtml(key.charAt(0).toUpperCase() + key.slice(1))}:</span>
              <div class="variant-chips-wrap">
                ${options.map((opt, i) => `
                  <button type="button" class="variant-chip ${i === 0 ? 'active' : ''}" data-variant="${escapeHtml(opt)}">
                    ${escapeHtml(opt)}
                  </button>
                `).join('')}
              </div>
            </div>
          `;
          // Default to first variant
          if (options.length && !state.activeVariant) {
            state.activeVariant = options[0];
          }
        }
        variantsWrap.innerHTML = html;

        variantsWrap.querySelectorAll('.variant-chip').forEach(chip => {
          chip.addEventListener('click', () => {
            const group = chip.closest('.variant-chips-wrap');
            group.querySelectorAll('.variant-chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            state.activeVariant = chip.getAttribute('data-variant');
          });
        });
      } else {
        variantsWrap.innerHTML = '';
      }
    }

    // Features
    if (featuresWrap) {
      featuresWrap.innerHTML = (product.features || []).map(f => `
        <li style="font-size:0.85rem; color:#cbd5e1; margin-bottom:6px; display:flex; align-items:center; gap:8px;">
          <i class="fa-solid fa-circle-check" style="color:var(--accent-teal); font-size:0.8rem;"></i>
          ${escapeHtml(f)}
        </li>
      `).join('');
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeProductModal() {
    const modal = document.getElementById('productDetailModal');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  /* ===================================================================
     9. SHOPPING CART (MULTI-SELLER SUPPORT)
     =================================================================== */
  function updateCartUI(bump = false) {
    const summary = window.MarketplaceStore.getCartSummary();
    const pills = document.querySelectorAll('.cart-counter-pill');

    pills.forEach(pill => {
      pill.textContent = summary.totalItems;
      if (bump) {
        pill.classList.add('bump');
        setTimeout(() => pill.classList.remove('bump'), 300);
      }
    });

    renderCartDrawerContent(summary);
  }

  function openCartDrawer() {
    const drawer = document.getElementById('cartDrawerBackdrop');
    if (drawer) {
      drawer.classList.add('active');
      document.body.style.overflow = 'hidden';
      updateCartUI();
    }
  }

  function closeCartDrawer() {
    const drawer = document.getElementById('cartDrawerBackdrop');
    if (drawer) {
      drawer.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  function renderCartDrawerContent(summary) {
    const container = document.getElementById('cartDrawerItemsList');
    const grandTotalEl = document.getElementById('cartGrandTotalText');
    const subtotalEl = document.getElementById('cartSubtotalText');
    const checkoutBtn = document.getElementById('cartProceedCheckoutBtn');

    if (!container) return;

    if (!summary.items.length) {
      container.innerHTML = `
        <div style="text-align:center; padding:60px 20px; color:var(--text-muted);">
          <i class="fa-solid fa-cart-shopping" style="font-size:3rem; margin-bottom:16px; opacity:0.4;"></i>
          <h4 style="color:#fff; font-size:1.15rem; margin-bottom:6px;">Your Cart is Empty</h4>
          <p style="font-size:0.85rem;">Explore the virtual street and add items from independent Chuka merchants.</p>
          <button class="btn btn-primary btn-sm" id="btnEmptyCartExplore" style="margin-top:20px;">
            <i class="fa-solid fa-store"></i> Explore Market Walk
          </button>
        </div>
      `;

      if (subtotalEl) subtotalEl.textContent = 'KES 0';
      if (grandTotalEl) grandTotalEl.textContent = 'KES 0';
      if (checkoutBtn) checkoutBtn.disabled = true;

      const exploreBtn = document.getElementById('btnEmptyCartExplore');
      if (exploreBtn) {
        exploreBtn.addEventListener('click', () => {
          closeCartDrawer();
          showMarketView();
        });
      }
      return;
    }

    if (checkoutBtn) checkoutBtn.disabled = false;
    if (subtotalEl) subtotalEl.textContent = `KES ${summary.grandTotal.toLocaleString()}`;
    if (grandTotalEl) grandTotalEl.textContent = `KES ${summary.grandTotal.toLocaleString()}`;

    // Grouped by independent local seller for clear fulfillment!
    let html = '';
    summary.sellerGroups.forEach(group => {
      html += `
        <div class="cart-seller-group-box">
          <div class="cart-seller-title-strip">
            <span><i class="fa-solid fa-store"></i> ${escapeHtml(group.shop_name)}</span>
            <span style="font-size:0.75rem; color:#cbd5e1;">${group.item_count} items</span>
          </div>

          <div class="cart-items-wrapper">
            ${group.items.map(item => `
              <div class="cart-item-row" data-cart-item-id="${escapeHtml(item.cartItemId)}">
                <img src="${escapeHtml(item.product_image || 'Logo.jpg')}" alt="${escapeHtml(item.product_name)}" class="cart-item-thumb" onerror="this.src='Logo.jpg'">
                <div class="cart-item-details">
                  <h5 class="cart-item-title">${escapeHtml(item.product_name)}</h5>
                  ${item.selected_variant ? `<span class="cart-item-variant">${escapeHtml(item.selected_variant)}</span>` : ''}
                  <div class="cart-item-price">KES ${item.line_total.toLocaleString()}</div>
                </div>
                <div style="display:flex; flex-direction:column; align-items:flex-end; gap:6px;">
                  <button class="btn-remove-cart-item" data-cart-item-id="${escapeHtml(item.cartItemId)}" style="background:transparent; border:none; color:var(--text-dim); cursor:pointer; font-size:0.85rem;" title="Remove Item">
                    <i class="fa-solid fa-trash-can"></i>
                  </button>
                  <div class="qty-stepper-wrap" style="margin:0;">
                    <button type="button" class="qty-step-btn btn-cart-step-minus" data-cart-item-id="${escapeHtml(item.cartItemId)}">-</button>
                    <span class="qty-input-box" style="display:inline-block; line-height:36px;">${item.quantity}</span>
                    <button type="button" class="qty-step-btn btn-cart-step-plus" data-cart-item-id="${escapeHtml(item.cartItemId)}">+</button>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>

          <div class="cart-seller-notice-mini">
            <i class="fa-solid fa-truck-fast" style="color:var(--accent-teal);"></i>
            <span>Fulfilled independently from ${escapeHtml(group.shop_location || 'Chuka')}</span>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;

    // Attach Cart Action Listeners
    container.querySelectorAll('.btn-cart-step-plus').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-cart-item-id');
        window.MarketplaceStore.updateCartQuantity(id, 1);
        updateCartUI();
      });
    });

    container.querySelectorAll('.btn-cart-step-minus').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-cart-item-id');
        window.MarketplaceStore.updateCartQuantity(id, -1);
        updateCartUI();
      });
    });

    container.querySelectorAll('.btn-remove-cart-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-cart-item-id');
        window.MarketplaceStore.removeFromCart(id);
        updateCartUI();
        showToast('Item removed from cart.');
      });
    });
  }

  /* ===================================================================
     10. CHECKOUT & ORDER FLOW
     =================================================================== */
  function openCheckoutModal() {
    closeCartDrawer();
    const modal = document.getElementById('checkoutModalBackdrop');
    if (!modal) return;

    const summary = window.MarketplaceStore.getCartSummary();
    if (!summary.items.length) {
      showToast('Your cart is empty.');
      return;
    }

    // Populate multi-seller breakdown in checkout summary
    const sellerPackagesBox = document.getElementById('checkoutSellerPackages');
    if (sellerPackagesBox) {
      sellerPackagesBox.innerHTML = summary.sellerGroups.map((g, idx) => `
        <div style="background:rgba(16, 28, 54, 0.6); border:1px solid var(--border-light); border-radius:10px; padding:12px; margin-bottom:10px;">
          <div style="display:flex; justify-content:space-between; font-weight:700; font-size:0.86rem; color:var(--accent-cyan); margin-bottom:6px;">
            <span>Package ${idx + 1}: ${escapeHtml(g.shop_name)}</span>
            <span>KES ${g.subtotal.toLocaleString()}</span>
          </div>
          <div style="font-size:0.78rem; color:var(--text-muted);">
            ${g.items.map(it => `${it.product_name} x ${it.quantity}`).join(', ')}
          </div>
        </div>
      `).join('');
    }

    // Pre-fill user details if logged in
    const savedUser = localStorage.getItem('nexovanta_user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        const nameIn = document.getElementById('checkoutCustomerName');
        if (nameIn && user.name) nameIn.value = user.name;
      } catch (e) {
        console.error(e);
      }
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeCheckoutModal() {
    const modal = document.getElementById('checkoutModalBackdrop');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  function handleCheckoutSubmit(e) {
    e.preventDefault();

    const name = document.getElementById('checkoutCustomerName')?.value;
    const phone = document.getElementById('checkoutCustomerPhone')?.value;
    const email = document.getElementById('checkoutCustomerEmail')?.value;
    const deliveryMethod = document.querySelector('input[name="deliveryMethod"]:checked')?.value || 'delivery';
    const address = document.getElementById('checkoutDeliveryAddress')?.value;
    const notes = document.getElementById('checkoutNotes')?.value;
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value || 'mpesa';

    const orderResult = window.MarketplaceStore.createOrders({
      customer_name: name,
      customer_phone: phone,
      customer_email: email,
      delivery_method: deliveryMethod,
      delivery_address: address,
      special_instructions: notes,
      payment_method: paymentMethod
    });

    if (!orderResult.success) {
      showToast(orderResult.message);
      return;
    }

    // Order Success! Render confirmation
    closeCheckoutModal();
    updateCartUI();
    openOrderConfirmation(orderResult);
  }

  function openOrderConfirmation(orderResult) {
    const modal = document.getElementById('orderConfirmModalBackdrop');
    if (!modal) return;

    const codeEl = document.getElementById('confirmOrderCode');
    const packagesEl = document.getElementById('confirmOrdersList');

    if (codeEl) codeEl.textContent = orderResult.parentOrderCode;

    if (packagesEl) {
      packagesEl.innerHTML = orderResult.orders.map(order => {
        const waLink = window.MarketplaceStore.generateWhatsAppOrderUrl(order);
        return `
          <div style="background:rgba(13, 23, 44, 0.7); border:1px solid var(--border-light); border-radius:12px; padding:16px; margin-bottom:14px; text-align:left;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
              <h5 style="color:#fff; font-size:1rem; font-weight:800;">${escapeHtml(order.shop_name)}</h5>
              <span class="storefront-status-pill" style="font-size:0.75rem;">Ref: ${escapeHtml(order.order_number)}</span>
            </div>

            <div style="font-size:0.84rem; color:#cbd5e1; margin-bottom:10px;">
              ${order.items.map(it => `• ${escapeHtml(it.product_name)} (x${it.quantity})`).join('<br>')}
            </div>

            <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border-light); padding-top:10px;">
              <span style="font-size:0.95rem; font-weight:800; color:#fbbf24;">Total: KES ${order.total_amount.toLocaleString()}</span>
              <a href="${waLink}" target="_blank" rel="noopener noreferrer" class="btn-whatsapp-direct" style="padding:6px 14px; font-size:0.78rem;">
                <i class="fa-brands fa-whatsapp"></i> Notify Seller
              </a>
            </div>
          </div>
        `;
      }).join('');
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  /* ===================================================================
     11. SELLER ONBOARDING & SELLER DASHBOARD
     ================================================================== */
  function openSellerRegistrationModal() {
    // ── Role Guard: only Business Owner accounts may register a shop ──────────
    const session = NexovantaDB.Session.get();

    if (!session || !session.loggedIn) {
      showToast('⚠️ Please log in to access the Seller Portal.');
      return;
    }

    if (session.role !== 'business') {
      showToast(
        '🔒 Only registered Business Owners can become sellers. ' +
        'Update your account role to "Business Owner" in your profile settings.'
      );
      return;
    }
    // ─────────────────────────────────────────────────────────────────────────

    const modal = document.getElementById('sellerRegisterModalBackdrop');
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function handleSellerRegistration(e) {
    e.preventDefault();

    const name = document.getElementById('regShopName')?.value;
    const category = document.getElementById('regShopCategory')?.value;
    const district = document.getElementById('regShopDistrict')?.value;
    const location = document.getElementById('regShopLocation')?.value;
    const phone = document.getElementById('regShopPhone')?.value;
    const whatsapp = document.getElementById('regShopWhatsApp')?.value;
    const description = document.getElementById('regShopDesc')?.value;

    const newShop = window.MarketplaceStore.registerShop({
      name: name,
      category_id: category,
      district_id: district,
      location: location,
      phone: phone,
      whatsapp_number: whatsapp,
      description: description
    });

    const modal = document.getElementById('sellerRegisterModalBackdrop');
    if (modal) modal.classList.remove('active');
    document.body.style.overflow = '';

    showToast(`Congratulations! "${newShop.name}" is now live on Nexovanta.`);
    renderDistrictTabs();
    renderVirtualMarketWalk(district);
    renderShopDirectory();
    renderHeroStats();

    // Open their new shop
    openShopView(newShop.slug);
  }

  function openSellerDashboardModal(shopId = null) {
    const modal = document.getElementById('sellerDashboardModalBackdrop');
    if (!modal) return;

    if (shopId) state.activeSellerDashboardShopId = shopId;

    const shop = window.MarketplaceStore.getShopById(state.activeSellerDashboardShopId) || window.MarketplaceStore.getShops()[0];
    if (!shop) return;

    state.activeSellerDashboardShopId = shop.id;

    // Render Dashboard Content
    const shopNameEl = document.getElementById('sellerDashShopName');
    const prodCountEl = document.getElementById('sellerDashProdCount');
    const orderCountEl = document.getElementById('sellerDashOrderCount');
    const revenueEl = document.getElementById('sellerDashRevenue');
    const ordersTbody = document.getElementById('sellerOrdersTableBody');
    const prodsTbody = document.getElementById('sellerProductsTableBody');

    if (shopNameEl) shopNameEl.textContent = `${shop.name} Management Portal`;

    const products = window.MarketplaceStore.getProducts({ shop_id: shop.id });
    const orders = window.MarketplaceStore.getOrdersByShop(shop.id);

    const totalRev = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);

    if (prodCountEl) prodCountEl.textContent = products.length;
    if (orderCountEl) orderCountEl.textContent = orders.length;
    if (revenueEl) revenueEl.textContent = `KES ${totalRev.toLocaleString()}`;

    // Render Orders Table
    if (ordersTbody) {
      if (!orders.length) {
        ordersTbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-dim); padding:24px;">No incoming orders yet.</td></tr>`;
      } else {
        ordersTbody.innerHTML = orders.map(ord => `
          <tr>
            <td><strong>${escapeHtml(ord.order_number)}</strong></td>
            <td>${escapeHtml(ord.customer_name)}<br><small style="color:var(--text-dim);">${escapeHtml(ord.customer_phone)}</small></td>
            <td>${escapeHtml(ord.delivery_method === 'delivery' ? ord.delivery_address : 'Shop Pickup')}</td>
            <td>KES ${ord.total_amount.toLocaleString()}</td>
            <td>
              <select class="order-status-select" data-order-id="${ord.id}" style="background:#0f172a; color:#fff; border:1px solid var(--border-light); padding:4px 8px; border-radius:6px; font-size:0.8rem;">
                <option value="pending_confirmation" ${ord.order_status === 'pending_confirmation' ? 'selected' : ''}>Pending</option>
                <option value="preparing" ${ord.order_status === 'preparing' ? 'selected' : ''}>Preparing</option>
                <option value="ready_for_pickup" ${ord.order_status === 'ready_for_pickup' ? 'selected' : ''}>Ready for Pickup</option>
                <option value="delivered" ${ord.order_status === 'delivered' ? 'selected' : ''}>Delivered</option>
              </select>
            </td>
            <td>
              <a href="${window.MarketplaceStore.generateWhatsAppOrderUrl(ord)}" target="_blank" rel="noopener noreferrer" style="color:#25d366; font-size:1.1rem;" title="Chat Customer on WhatsApp">
                <i class="fa-brands fa-whatsapp"></i>
              </a>
            </td>
          </tr>
        `).join('');

        ordersTbody.querySelectorAll('.order-status-select').forEach(sel => {
          sel.addEventListener('change', () => {
            const ordId = sel.getAttribute('data-order-id');
            window.MarketplaceStore.updateOrderStatus(ordId, sel.value);
            showToast('Order status updated!');
          });
        });
      }
    }

    // Render Products Table
    if (prodsTbody) {
      if (!products.length) {
        prodsTbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-dim); padding:24px;">No products added yet. Click "Add Product".</td></tr>`;
      } else {
        prodsTbody.innerHTML = products.map(p => `
          <tr>
            <td>
              <div style="display:flex; align-items:center; gap:10px;">
                <img src="${escapeHtml((p.image_urls && p.image_urls[0]) || 'Logo.jpg')}" style="width:36px; height:36px; border-radius:6px; object-fit:cover;" onerror="this.src='Logo.jpg'">
                <strong>${escapeHtml(p.name)}</strong>
              </div>
            </td>
            <td>KES ${p.price.toLocaleString()}</td>
            <td>${p.stock_quantity} units</td>
            <td><span class="storefront-status-pill">${escapeHtml(p.badge || 'Active')}</span></td>
            <td>
              <button class="btn btn-outline btn-sm btn-delete-dash-prod" data-prod-id="${p.id}" style="padding:4px 8px; color:#ef4444; border-color:rgba(239, 68, 68, 0.3);">
                <i class="fa-solid fa-trash"></i>
              </button>
            </td>
          </tr>
        `).join('');

        prodsTbody.querySelectorAll('.btn-delete-dash-prod').forEach(delBtn => {
          delBtn.addEventListener('click', () => {
            const pId = delBtn.getAttribute('data-prod-id');
            if (confirm('Are you sure you want to remove this product from your shop?')) {
              window.MarketplaceStore.deleteProduct(pId);
              openSellerDashboardModal(state.activeSellerDashboardShopId);
              showToast('Product removed from shop catalog.');
            }
          });
        });
      }
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  /* ===================================================================
     12. EVENT LISTENERS SETUP
     =================================================================== */
  function setupSearchHandlers() {
    const heroInput = document.getElementById('heroSearchInput');
    const heroBtn = document.getElementById('heroSearchBtn');
    const navInput = document.getElementById('navSearchInput');
    const dropdown = document.getElementById('searchSuggestionsBox');

    function executeSearch(query) {
      state.searchQuery = query;
      if (dropdown) dropdown.classList.remove('active');
      renderShopDirectory();
      const dirSection = document.getElementById('shop-directory');
      if (dirSection) dirSection.scrollIntoView({ behavior: 'smooth' });
    }

    function handleLiveSuggestions(val) {
      if (!dropdown) return;
      if (!val || val.trim().length < 2) {
        dropdown.classList.remove('active');
        return;
      }

      const q = val.toLowerCase().trim();
      const matchedShops = window.MarketplaceStore.getShops({ search: q }).slice(0, 3);
      const matchedProds = window.MarketplaceStore.getProducts({ search: q }).slice(0, 4);

      if (!matchedShops.length && !matchedProds.length) {
        dropdown.classList.remove('active');
        return;
      }

      let html = '';
      if (matchedShops.length) {
        html += `<div style="padding:8px 16px; font-size:0.74rem; font-weight:800; color:var(--accent-cyan); text-transform:uppercase;">Independent Shops</div>`;
        matchedShops.forEach(s => {
          html += `
            <a href="#" class="suggestion-item btn-suggest-shop" data-slug="${escapeHtml(s.slug)}">
              <img src="${escapeHtml(s.logo_url)}" class="suggestion-thumb" alt="${escapeHtml(s.name)}" onerror="this.src='Logo.jpg'">
              <div class="suggestion-meta">
                <h4>${escapeHtml(s.name)}</h4>
                <p>${escapeHtml(s.location)}</p>
              </div>
              <span class="suggestion-badge" style="background:rgba(0, 210, 255, 0.15); color:var(--accent-cyan);">Shop</span>
            </a>
          `;
        });
      }

      if (matchedProds.length) {
        html += `<div style="padding:8px 16px; font-size:0.74rem; font-weight:800; color:var(--market-gold); text-transform:uppercase;">Products in Chuka</div>`;
        matchedProds.forEach(p => {
          html += `
            <a href="#" class="suggestion-item btn-suggest-prod" data-id="${escapeHtml(p.id)}">
              <img src="${escapeHtml((p.image_urls && p.image_urls[0]) || 'Logo.jpg')}" class="suggestion-thumb" alt="${escapeHtml(p.name)}" onerror="this.src='Logo.jpg'">
              <div class="suggestion-meta">
                <h4>${escapeHtml(p.name)}</h4>
                <p>KES ${p.price.toLocaleString()}</p>
              </div>
              <span class="suggestion-badge" style="background:rgba(245, 158, 11, 0.15); color:var(--market-gold);">Product</span>
            </a>
          `;
        });
      }

      dropdown.innerHTML = html;
      dropdown.classList.add('active');

      dropdown.querySelectorAll('.btn-suggest-shop').forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          dropdown.classList.remove('active');
          const slug = link.getAttribute('data-slug');
          openShopView(slug);
        });
      });

      dropdown.querySelectorAll('.btn-suggest-prod').forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          dropdown.classList.remove('active');
          const id = link.getAttribute('data-id');
          openProductModal(id);
        });
      });
    }

    if (heroInput) {
      heroInput.addEventListener('input', (e) => handleLiveSuggestions(e.target.value));
      heroInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') executeSearch(heroInput.value);
      });
    }

    if (heroBtn && heroInput) {
      heroBtn.addEventListener('click', () => executeSearch(heroInput.value));
    }

    if (navInput) {
      navInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') executeSearch(navInput.value);
      });
    }

    document.addEventListener('click', (e) => {
      if (dropdown && !dropdown.contains(e.target) && e.target !== heroInput) {
        dropdown.classList.remove('active');
      }
    });
  }

  function setupCartHandlers() {
    const navCartBtn = document.getElementById('navCartBtn');
    const closeDrawerBtn = document.getElementById('cartDrawerCloseBtn');
    const proceedCheckoutBtn = document.getElementById('cartProceedCheckoutBtn');

    if (navCartBtn) navCartBtn.addEventListener('click', openCartDrawer);
    if (closeDrawerBtn) closeDrawerBtn.addEventListener('click', closeCartDrawer);
    if (proceedCheckoutBtn) proceedCheckoutBtn.addEventListener('click', openCheckoutModal);

    // Modal Qty Stepper
    const minusBtn = document.getElementById('modalQtyMinus');
    const plusBtn = document.getElementById('modalQtyPlus');
    const qtyInput = document.getElementById('modalQtyInput');
    const addBtn = document.getElementById('modalAddToCartBtn');
    const buyNowBtn = document.getElementById('modalBuyNowBtn');

    if (minusBtn && qtyInput) {
      minusBtn.addEventListener('click', () => {
        let val = parseInt(qtyInput.value, 10) || 1;
        if (val > 1) {
          qtyInput.value = val - 1;
          state.modalQuantity = val - 1;
        }
      });
    }

    if (plusBtn && qtyInput) {
      plusBtn.addEventListener('click', () => {
        let val = parseInt(qtyInput.value, 10) || 1;
        qtyInput.value = val + 1;
        state.modalQuantity = val + 1;
      });
    }

    if (addBtn) {
      addBtn.addEventListener('click', () => {
        if (!state.selectedProductForModal) return;
        const res = window.MarketplaceStore.addToCart(
          state.selectedProductForModal.id,
          state.modalQuantity,
          state.activeVariant
        );
        if (res.success) {
          showToast(res.message);
          updateCartUI(true);
          closeProductModal();
        } else {
          showToast(res.message);
        }
      });
    }

    if (buyNowBtn) {
      buyNowBtn.addEventListener('click', () => {
        if (!state.selectedProductForModal) return;
        const res = window.MarketplaceStore.addToCart(
          state.selectedProductForModal.id,
          state.modalQuantity,
          state.activeVariant
        );
        if (res.success) {
          updateCartUI(true);
          closeProductModal();
          openCheckoutModal();
        } else {
          showToast(res.message);
        }
      });
    }
  }

  function setupModalHandlers() {
    // Product Detail Modal Close
    const closeProdModal = document.getElementById('modalCloseProductDetail');
    if (closeProdModal) closeProdModal.addEventListener('click', closeProductModal);

    // Shop Back Button
    const backBtn = document.getElementById('shopBackToMarket');
    if (backBtn) {
      backBtn.addEventListener('click', (e) => {
        e.preventDefault();
        showMarketView();
      });
    }

    // Checkout Modal Delivery Method Toggle
    const deliveryRadio = document.getElementById('methodDelivery');
    const pickupRadio = document.getElementById('methodPickup');
    const addressGroup = document.getElementById('checkoutAddressGroup');

    if (deliveryRadio && pickupRadio && addressGroup) {
      deliveryRadio.addEventListener('change', () => {
        addressGroup.style.display = 'block';
      });
      pickupRadio.addEventListener('change', () => {
        addressGroup.style.display = 'none';
      });
    }

    const closeCheckoutBtn = document.getElementById('checkoutCloseBtn');
    if (closeCheckoutBtn) closeCheckoutBtn.addEventListener('click', closeCheckoutModal);

    const checkoutForm = document.getElementById('checkoutOrderForm');
    if (checkoutForm) checkoutForm.addEventListener('submit', handleCheckoutSubmit);

    // Order Confirmation Modal Close
    const closeConfirmBtn = document.getElementById('confirmOrderCloseBtn');
    if (closeConfirmBtn) {
      closeConfirmBtn.addEventListener('click', () => {
        const modal = document.getElementById('orderConfirmModalBackdrop');
        if (modal) modal.classList.remove('active');
        document.body.style.overflow = '';
      });
    }

    // Review Modal Form
    const reviewForm = document.getElementById('reviewSubmitForm');
    const closeReviewBtn = document.getElementById('reviewModalCloseBtn');
    if (closeReviewBtn) {
      closeReviewBtn.addEventListener('click', () => {
        const modal = document.getElementById('reviewModalBackdrop');
        if (modal) modal.classList.remove('active');
      });
    }

    if (reviewForm) {
      reviewForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const modal = document.getElementById('reviewModalBackdrop');
        const shopId = modal?.getAttribute('data-target-shop');
        const name = document.getElementById('revCustomerName')?.value;
        const role = document.getElementById('revCustomerRole')?.value;
        const rating = document.getElementById('revStarRating')?.value;
        const comment = document.getElementById('revCommentText')?.value;

        if (shopId) {
          window.MarketplaceStore.addReview({
            shop_id: shopId,
            customer_name: name,
            customer_role: role,
            rating: rating,
            comment: comment
          });
          showToast('Thank you! Your community review has been posted.');
          if (modal) modal.classList.remove('active');
          renderShopReviews(shopId);
        }
      });
    }

    // Seller Register Modal
    const openSellerRegBtns = document.querySelectorAll('.btn-open-seller-reg');
    openSellerRegBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openSellerRegistrationModal();
      });
    });

    const closeSellerRegBtn = document.getElementById('sellerRegCloseBtn');
    if (closeSellerRegBtn) {
      closeSellerRegBtn.addEventListener('click', () => {
        const modal = document.getElementById('sellerRegisterModalBackdrop');
        if (modal) modal.classList.remove('active');
        document.body.style.overflow = '';
      });
    }

    const sellerRegForm = document.getElementById('sellerRegisterForm');
    if (sellerRegForm) sellerRegForm.addEventListener('submit', handleSellerRegistration);

    // Seller Dashboard Open / Close
    const openSellerDashBtns = document.querySelectorAll('.btn-open-seller-dash');
    openSellerDashBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openSellerDashboardModal();
      });
    });

    const closeSellerDashBtn = document.getElementById('sellerDashCloseBtn');
    if (closeSellerDashBtn) {
      closeSellerDashBtn.addEventListener('click', () => {
        const modal = document.getElementById('sellerDashboardModalBackdrop');
        if (modal) modal.classList.remove('active');
        document.body.style.overflow = '';
      });
    }

    // Add Product Modal Inside Seller Dashboard
    const btnOpenAddProdModal = document.getElementById('btnOpenAddProductModal');
    const addProdModal = document.getElementById('addProductModalBackdrop');
    const closeAddProdBtn = document.getElementById('addProdCloseBtn');
    const addProdForm = document.getElementById('addNewProductForm');

    if (btnOpenAddProdModal && addProdModal) {
      btnOpenAddProdModal.addEventListener('click', () => {
        addProdModal.classList.add('active');
      });
    }

    if (closeAddProdBtn && addProdModal) {
      closeAddProdBtn.addEventListener('click', () => {
        addProdModal.classList.remove('active');
      });
    }

    if (addProdForm) {
      addProdForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const shopId = state.activeSellerDashboardShopId;
        const name = document.getElementById('newProdName')?.value;
        const price = document.getElementById('newProdPrice')?.value;
        const stock = document.getElementById('newProdStock')?.value;
        const desc = document.getElementById('newProdDesc')?.value;
        const img = document.getElementById('newProdImg')?.value;

        window.MarketplaceStore.addProduct(shopId, {
          name: name,
          price: price,
          stock_quantity: stock,
          description: desc,
          image_urls: img ? [img] : []
        });

        if (addProdModal) addProdModal.classList.remove('active');
        showToast('New product added to your digital storefront!');
        openSellerDashboardModal(shopId);
        renderHeroStats();
      });
    }
  }

  /* ===================================================================
     13. AUTH SYNCHRONIZATION WITH NEXOVANTA PLATFORM
     =================================================================== */
  function setupAuthSync() {
    // Prefer NexovantaDB session; fall back to raw localStorage
    let user = null;
    if (typeof NexovantaDB !== 'undefined') {
      const sess = NexovantaDB.Session.get();
      if (sess && sess.loggedIn) user = sess;
    }
    if (!user) {
      try { user = JSON.parse(localStorage.getItem('nexovanta_user') || 'null'); } catch (_) {}
    }

    const navLoginBtn    = document.getElementById('navLoginBtn');
    const navUserBadge   = document.getElementById('navUserBadge');
    const navUserName    = document.getElementById('navUserName');
    const navUserRole    = document.getElementById('navUserRole');
    const navSellerBtn   = document.getElementById('navSellerDashBtn');
    const navUserAvatar  = document.getElementById('navUserAvatar');

    if (!user || !(user.id || user.name)) return;

    const displayName = user.username ? `@${user.username}` : (user.name || 'Chuka Member');
    if (navLoginBtn) navLoginBtn.style.display = 'none';
    if (navUserBadge) {
      navUserBadge.classList.add('active');
      if (navUserName) navUserName.textContent = displayName;
      if (navUserRole) navUserRole.textContent = user.roleTitle || (user.role === 'business' ? 'Merchant 💼' : user.role === 'student' ? 'Student 🎓' : 'Resident 🏘️');
    }

    // Avatar
    if (navUserAvatar) {
      if (user.avatar_url) {
        navUserAvatar.innerHTML = `<img src="${user.avatar_url}" style="width:28px;height:28px;border-radius:50%;object-fit:cover;">`;
      } else {
        const roleColors = { student: 'var(--role-student)', business: 'var(--role-business)', resident: 'var(--role-resident)' };
        const roleIcons  = { student: 'fa-graduation-cap', business: 'fa-store', resident: 'fa-house-chimney' };
        navUserAvatar.style.background = roleColors[user.role] || 'var(--role-student)';
        navUserAvatar.innerHTML = `<i class="fa-solid ${roleIcons[user.role] || 'fa-user'}" style="color:#060b18;"></i>`;
      }
    }

    // For business accounts: swap "Seller Hub" button to point to My Storefront page
    if (user.role === 'business') {
      if (navSellerBtn) {
        navSellerBtn.style.display = 'inline-flex';
        navSellerBtn.innerHTML = `<i class="fa-solid fa-store"></i> <span class="hide-mobile">My Storefront</span>`;
        navSellerBtn.classList.remove('btn-open-seller-dash');
        navSellerBtn.addEventListener('click', (e) => {
          e.preventDefault();
          window.location.href = 'storefront.html';
        });
      }

      // Show My Storefront nav link
      const myStorefrontLink = document.getElementById('navMyStorefrontLink');
      if (myStorefrontLink) myStorefrontLink.style.display = '';

      // Update "Become a Seller" links to also go to storefront
      document.querySelectorAll('.btn-open-seller-reg').forEach(link => {
        link.style.opacity = '';
        link.style.cursor  = '';
        link.title = 'Manage your digital storefront';
        link.removeEventListener('click', link._sfHandler);
        link._sfHandler = (e) => { e.preventDefault(); window.location.href = 'storefront.html'; };
        link.addEventListener('click', link._sfHandler);
      });
    } else {
      // Non-business: visually indicate seller features are restricted
      if (navSellerBtn) navSellerBtn.style.display = 'none';
      document.querySelectorAll('.btn-open-seller-reg').forEach(link => {
        link.style.opacity = '0.5';
        link.style.cursor  = 'not-allowed';
        link.title = 'Business Owner accounts only. Register a business account to unlock.';
      });
    }
  }

  /* ===================================================================
     UTILITY HELPERS
     =================================================================== */
  function escapeHtml(text) {
    if (!text) return '';
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  let toastTimeout;
  function showToast(message) {
    let toast = document.getElementById('nexovantaToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'nexovantaToast';
      toast.className = 'toast-notice';
      toast.innerHTML = `
        <i class="fa-solid fa-circle-check toast-icon"></i>
        <span class="toast-text" id="toastMessage"></span>
      `;
      document.body.appendChild(toast);
    }

    const toastText = document.getElementById('toastMessage');
    if (toastText) toastText.textContent = message;

    clearTimeout(toastTimeout);
    toast.classList.add('show');

    toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 3800);
  }

  // Export to window for global access if needed
  window.openShopView = openShopView;
  window.showMarketView = showMarketView;
  window.openProductModal = openProductModal;
  window.showToast = showToast;
})();
