/**
 * Nexovanta - Chuka Community Platform
 * Main Interactive Application Script
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Video Background Controls
  initVideoControls();

  // 2. Pillar Tabs Navigation (From WhatsApp mockup)
  initPillarTabs();

  // 3. Category Filter Tabs
  initCategoryFilters();

  // 4. Interactive Feed / Post Actions
  initInteractiveFeed();

  // 5. Authentication Modal & Role-Specific Form Fields
  initAuthSystem();

  // 6. Navbar Scroll Effects
  initNavbarScroll();
});

/* ===================================================================
   1. Video Background Management
   =================================================================== */
function initVideoControls() {
  const video = document.getElementById('bgVideo');
  const playBtn = document.getElementById('videoTogglePlay');
  const muteBtn = document.getElementById('videoToggleMute');
  const overlayBtn = document.getElementById('videoToggleOverlay');
  const overlayLayer = document.querySelector('.video-overlay-layer');

  if (!video) return;

  // Ensure muted and autoplay properties
  video.muted = true;
  video.playsInline = true;
  video.loop = true;

  // Play attempt
  video.play().catch((err) => {
    console.log('Video autoplay prevented by browser policies, waiting for interaction:', err);
  });

  if (playBtn) {
    playBtn.addEventListener('click', () => {
      if (video.paused) {
        video.play();
        playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
        showToast('Background video resumed');
      } else {
        video.pause();
        playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
        showToast('Background video paused');
      }
    });
  }

  if (muteBtn) {
    muteBtn.addEventListener('click', () => {
      if (video.muted) {
        video.muted = false;
        muteBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
        showToast('Video audio enabled');
      } else {
        video.muted = true;
        muteBtn.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
        showToast('Video audio muted');
      }
    });
  }

  let dimmed = true;
  if (overlayBtn && overlayLayer) {
    overlayBtn.addEventListener('click', () => {
      dimmed = !dimmed;
      if (dimmed) {
        overlayLayer.style.background = 'var(--grad-overlay)';
        overlayLayer.style.backdropFilter = 'blur(2px)';
        overlayBtn.innerHTML = '<i class="fa-solid fa-circle-half-stroke"></i>';
        showToast('Overlay: Standard contrast');
      } else {
        overlayLayer.style.background = 'rgba(6, 11, 24, 0.45)';
        overlayLayer.style.backdropFilter = 'blur(0px)';
        overlayBtn.innerHTML = '<i class="fa-solid fa-eye"></i>';
        showToast('Overlay: Clear video view');
      }
    });
  }
}

/* ===================================================================
   2. The Five Pillars Tabs (Chuka Community, Marketplace, News, Connect, Messages)
   =================================================================== */
function initPillarTabs() {
  const navBtns = document.querySelectorAll('.pillar-nav-btn');
  const showcaseCards = document.querySelectorAll('.pillar-showcase-card');

  navBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetPillar = btn.getAttribute('data-pillar');

      // Update button state
      navBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      // Update showcase cards
      showcaseCards.forEach((card) => {
        if (card.id === `pillar-${targetPillar}`) {
          card.classList.add('active');
        } else {
          card.classList.remove('active');
        }
      });
    });
  });
}

/* ===================================================================
   3. Category Filters (Students, Businesses, Chuka Residents)
   =================================================================== */
function initCategoryFilters() {
  const filterTabs = document.querySelectorAll('.filter-tab');
  const audienceCards = document.querySelectorAll('.audience-card');

  filterTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const role = tab.getAttribute('data-role');

      filterTabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');

      if (role === 'all') {
        audienceCards.forEach((card) => {
          card.style.display = 'flex';
          card.style.opacity = '1';
        });
        showToast('Showing all Chuka community perspectives');
      } else {
        audienceCards.forEach((card) => {
          if (card.getAttribute('data-role') === role) {
            card.style.display = 'flex';
            card.style.opacity = '1';
          } else {
            card.style.display = 'none';
          }
        });
        const roleNames = {
          student: 'Chuka University Students',
          business: 'Local Chuka Businesses & Merchants',
          resident: 'Chuka Town Residents & Neighbors'
        };
        showToast(`Filtered for: ${roleNames[role] || role}`);
      }
    });
  });
}

/* ===================================================================
   4. Interactive Feed Actions (Likes, Comments, Shares)
   =================================================================== */
function initInteractiveFeed() {
  // Like buttons
  const likeButtons = document.querySelectorAll('.mock-action-like');
  likeButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const countSpan = btn.querySelector('.like-count');
      const icon = btn.querySelector('i');
      let currentLikes = parseInt(countSpan.textContent, 10) || 0;

      if (btn.classList.contains('active')) {
        btn.classList.remove('active');
        icon.className = 'fa-regular fa-heart';
        countSpan.textContent = currentLikes - 1;
      } else {
        btn.classList.add('active');
        icon.className = 'fa-solid fa-heart';
        icon.style.color = '#ef4444';
        countSpan.textContent = currentLikes + 1;
        showToast('You liked this Chuka community post! ❤️');
      }
    });
  });

  // Action buttons toast preview
  const commentButtons = document.querySelectorAll('.mock-action-comment');
  commentButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      showToast('Opening comments thread... Log in to join the discussion.');
    });
  });

  const shareButtons = document.querySelectorAll('.mock-action-share');
  shareButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      navigator.clipboard?.writeText(window.location.href);
      showToast('Community post link copied to clipboard! 🔗');
    });
  });
}

/* ===================================================================
   5. Role-Differentiated Authentication System
      Roles: Students, Business People, Other Chuka Residents
   =================================================================== */
let currentAuthRole = 'student'; // 'student' | 'business' | 'resident'
let currentAuthMode = 'login';   // 'login' | 'register'

function initAuthSystem() {
  const modalBackdrop = document.getElementById('authModal');
  const openLoginBtns = document.querySelectorAll('.btn-open-login');
  const openRegisterBtns = document.querySelectorAll('.btn-open-register');
  const closeModalBtn = document.getElementById('modalCloseBtn');
  const catBtns = document.querySelectorAll('.auth-cat-btn');
  const modeTabs = document.querySelectorAll('.auth-tab-btn');
  const authForm = document.getElementById('authForm');

  // Open Modal triggers
  openLoginBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const roleAttr = btn.getAttribute('data-role');
      if (roleAttr) setAuthRole(roleAttr);
      setAuthMode('login');
      openModal();
    });
  });

  openRegisterBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const roleAttr = btn.getAttribute('data-role');
      if (roleAttr) setAuthRole(roleAttr);
      setAuthMode('register');
      openModal();
    });
  });

  // Close Modal
  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeModal);
  }

  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) closeModal();
    });
  }

  // Category Selector
  catBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const selectedRole = btn.getAttribute('data-cat');
      setAuthRole(selectedRole);
    });
  });

  // Mode Switcher (Login vs Sign Up)
  modeTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const mode = tab.getAttribute('data-mode');
      setAuthMode(mode);
    });
  });

  // Form Submission
  if (authForm) {
    authForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleAuthSubmit();
    });
  }

  // Restore the Supabase-backed profile for the navbar
  checkLoggedState();
}

function openModal() {
  const modal = document.getElementById('authModal');
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal() {
  const modal = document.getElementById('authModal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function setAuthRole(role) {
  currentAuthRole = role;

  // Update Category Buttons
  const catBtns = document.querySelectorAll('.auth-cat-btn');
  catBtns.forEach((b) => {
    if (b.getAttribute('data-cat') === role) {
      b.classList.add('active');
    } else {
      b.classList.remove('active');
    }
  });

  renderRoleSpecificInputs();
}

function setAuthMode(mode) {
  currentAuthMode = mode;

  const modeTabs = document.querySelectorAll('.auth-tab-btn');
  modeTabs.forEach((t) => {
    if (t.getAttribute('data-mode') === mode) {
      t.classList.add('active');
    } else {
      t.classList.remove('active');
    }
  });

  const submitBtn = document.getElementById('authSubmitBtn');
  const termsRow = document.getElementById('termsRow');
  const rememberRow = document.getElementById('rememberRow');

  if (mode === 'login') {
    if (submitBtn) submitBtn.textContent = 'Log In to Nexovanta';
    if (termsRow) termsRow.style.display = 'none';
    if (rememberRow) rememberRow.style.display = 'flex';
  } else {
    if (submitBtn) submitBtn.textContent = 'Create My Nexovanta Account';
    if (termsRow) termsRow.style.display = 'flex';
    if (rememberRow) rememberRow.style.display = 'none';
  }

  renderRoleSpecificInputs();
}

function renderRoleSpecificInputs() {
  const dynamicContainer = document.getElementById('roleDynamicFields');
  const roleTitleSpan = document.getElementById('authModalRoleText');
  const roleHelpText = document.getElementById('authRoleHelper');
  const primaryIdLabel = document.getElementById('primaryIdentifierLabel');
  const primaryIdInput = document.getElementById('primaryIdentifierInput');

  if (!dynamicContainer) return;

  if (currentAuthRole === 'student') {
    if (roleTitleSpan) roleTitleSpan.textContent = '🎓 Chuka University Student Portal';
    if (roleHelpText) roleHelpText.textContent = 'Connect with classmates, find hostels, trade revision books, and get campus updates.';
    if (primaryIdLabel) primaryIdLabel.textContent = 'Student Reg No or Student Email';
    if (primaryIdInput) primaryIdInput.placeholder = 'e.g. EB3/12345/23 or student@chuka.ac.ke';

    if (currentAuthMode === 'register') {
      dynamicContainer.innerHTML = `
        <div class="auth-form-group">
          <label class="auth-label">Faculty / Academic Department</label>
          <div class="auth-input-wrap">
            <i class="fa-solid fa-graduation-cap auth-input-icon"></i>
            <select class="auth-input auth-select" required>
              <option value="" disabled selected>Select your Faculty</option>
              <option value="sci-tech">Faculty of Science, Engineering & Technology</option>
              <option value="business">Faculty of Business Studies</option>
              <option value="health">Faculty of Health & Medical Sciences</option>
              <option value="arts">Faculty of Humanities & Social Sciences</option>
              <option value="law">Faculty of Law</option>
              <option value="agri">Faculty of Agriculture & Environmental Sciences</option>
            </select>
          </div>
        </div>
        <div class="auth-form-group">
          <label class="auth-label">Year of Study & Residence Zone</label>
          <div class="auth-input-wrap">
            <i class="fa-solid fa-location-dot auth-input-icon"></i>
            <select class="auth-input auth-select" required>
              <option value="" disabled selected>Select Year & Location</option>
              <option value="y1-ndagani">Year 1 - Ndagani Hostels</option>
              <option value="y2-ndagani">Year 2 - Ndagani Hostels</option>
              <option value="y3-town">Year 3 - Chuka Town / Kangaru</option>
              <option value="y4-internal">Year 4 - Internal Campus Halls</option>
              <option value="postgrad">Postgraduate / Masters</option>
            </select>
          </div>
        </div>
      `;
    } else {
      dynamicContainer.innerHTML = '';
    }

  } else if (currentAuthRole === 'business') {
    if (roleTitleSpan) roleTitleSpan.textContent = '💼 Chuka Business & Merchant Hub';
    if (roleHelpText) roleHelpText.textContent = 'List products, manage your digital shop, reach 15,000+ students & Chuka residents.';
    if (primaryIdLabel) primaryIdLabel.textContent = 'Business Email or Phone Number';
    if (primaryIdInput) primaryIdInput.placeholder = 'e.g. contact@chukabakes.co.ke or 0712 345 678';

    if (currentAuthMode === 'register') {
      dynamicContainer.innerHTML = `
        <div class="auth-form-group">
          <label class="auth-label">Registered Business Name</label>
          <div class="auth-input-wrap">
            <i class="fa-solid fa-store auth-input-icon"></i>
            <input type="text" class="auth-input" placeholder="e.g. Ndagani Tech & Cyber Hub" required />
          </div>
        </div>
        <div class="auth-form-group">
          <label class="auth-label">Business Category</label>
          <div class="auth-input-wrap">
            <i class="fa-solid fa-tags auth-input-icon"></i>
            <select class="auth-input auth-select" required>
              <option value="" disabled selected>Select Category</option>
              <option value="retail">Retail Shop / Mini-Supermarket</option>
              <option value="food">Restaurant, Cafe & Ndagani Fast Foods</option>
              <option value="tech">Tech, Laptops, Phones & Printing</option>
              <option value="hostel-mgmt">Hostel / Rental Property Management</option>
              <option value="salon">Salon, Kinyozi & Grooming</option>
              <option value="transport">Boda Boda & Transport Service</option>
              <option value="pharmacy">Chemist & Health Services</option>
            </select>
          </div>
        </div>
        <div class="auth-form-group">
          <label class="auth-label">Physical Location in Chuka</label>
          <div class="auth-input-wrap">
            <i class="fa-solid fa-map-pin auth-input-icon"></i>
            <input type="text" class="auth-input" placeholder="e.g. Ndagani Stage, opposite Gate B" required />
          </div>
        </div>
      `;
    } else {
      dynamicContainer.innerHTML = '';
    }

  } else if (currentAuthRole === 'resident') {
    if (roleTitleSpan) roleTitleSpan.textContent = '🏘️ Chuka Resident & Community Portal';
    if (roleHelpText) roleHelpText.textContent = 'Stay informed on local town news, list rental properties, and connect with trusted local services.';
    if (primaryIdLabel) primaryIdLabel.textContent = 'Phone Number or Email';
    if (primaryIdInput) primaryIdInput.placeholder = 'e.g. 0722 000 111 or resident@gmail.com';

    if (currentAuthMode === 'register') {
      dynamicContainer.innerHTML = `
        <div class="auth-form-group">
          <label class="auth-label">Full Community Name</label>
          <div class="auth-input-wrap">
            <i class="fa-solid fa-user auth-input-icon"></i>
            <input type="text" class="auth-input" placeholder="e.g. Mama Mwangi" required />
          </div>
        </div>
        <div class="auth-form-group">
          <label class="auth-label">Estate / Residential Area</label>
          <div class="auth-input-wrap">
            <i class="fa-solid fa-house-chimney auth-input-icon"></i>
            <select class="auth-input auth-select" required>
              <option value="" disabled selected>Select Area</option>
              <option value="ndagani">Ndagani Community</option>
              <option value="chuka-town">Chuka Town Central</option>
              <option value="kangaru">Kangaru / Junction Area</option>
              <option value="weru">Weru / Karingani</option>
              <option value="kibugua">Kibugua / Surrounding Hills</option>
            </select>
          </div>
        </div>
        <div class="auth-form-group">
          <label class="auth-label">Primary Engagement Role</label>
          <div class="auth-input-wrap">
            <i class="fa-solid fa-briefcase auth-input-icon"></i>
            <select class="auth-input auth-select">
              <option value="landlord">Landlord / Property Owner</option>
              <option value="artisan">Artisan / Technician / Local Expert</option>
              <option value="professional">Resident / Civil Servant / Professional</option>
              <option value="elder">Community Elder / Leader</option>
            </select>
          </div>
        </div>
      `;
    } else {
      dynamicContainer.innerHTML = '';
    }
  }
}

function handleAuthSubmit() {
  // Redirect to login page for full auth handling
  closeModal();
  window.location.href = 'login.html';
}

async function checkLoggedState() {
  if (!window.NexovantaAuth?.isConfigured) return;
  try {
    const profile = await NexovantaAuth.getCurrentProfile();
    if (profile) updateUIForLoggedInUser(profile);
  } catch (error) {
    console.error('Unable to restore Supabase session:', error);
  }
}

function updateUIForLoggedInUser(user) {
  const loginNavBtn = document.getElementById('navLoginBtn');
  const userBadgeNav = document.getElementById('navUserBadge');
  const userNameNav = document.getElementById('navUserName');
  const userRoleNav = document.getElementById('navUserRole');
  const userAvatar = document.getElementById('navUserAvatar');
  const navNotifWrap = document.getElementById('navNotifWrap');
  const navNotifBadge = document.getElementById('navNotifBadge');

  if (loginNavBtn) loginNavBtn.style.display = 'none';
  if (navNotifWrap) navNotifWrap.style.display = 'block';

  if (userBadgeNav) {
    userBadgeNav.classList.add('active');
    // Prefer @username display
    const displayName = user.username ? `@${user.username}` : (user.name || 'Chuka Member');
    if (userNameNav) userNameNav.textContent = displayName;
    if (userRoleNav) userRoleNav.textContent = user.roleTitle || (user.role === 'student' ? 'Student 🎓' : user.role === 'business' ? 'Merchant 💼' : 'Resident 🏘️');

    // Avatar
    if (userAvatar) {
      if (user.avatar_url) {
        userAvatar.innerHTML = `<img src="${user.avatar_url}" style="width:28px;height:28px;border-radius:50%;object-fit:cover;">`;
      } else {
        const roleColors = { student: 'var(--role-student)', business: 'var(--role-business)', resident: 'var(--role-resident)' };
        const bgColor = roleColors[user.role] || 'var(--role-student)';
        const roleIcons = { student: 'fa-graduation-cap', business: 'fa-store', resident: 'fa-house-chimney' };
        const icon = roleIcons[user.role] || 'fa-user';
        userAvatar.style.background = bgColor;
        userAvatar.innerHTML = `<i class="fa-solid ${icon}" style="color:#060b18;"></i>`;
      }
    }
  }

  // Notification count
  if (navNotifBadge && typeof NexovantaDB !== 'undefined' && user.id) {
    const count = NexovantaDB.Notifications.getUnreadCount(user.id);
    if (count > 0) {
      navNotifBadge.textContent = count > 9 ? '9+' : count;
      navNotifBadge.style.display = 'flex';
    }
  }
}

// Log out function
window.logoutNexovanta = async function() {
  try {
    await NexovantaAuth.signOut();
    window.location.replace('login.html');
  } catch (error) {
    showToast(error.message || 'Unable to sign out. Please try again.');
  }
};

/* ===================================================================
   6. Navbar Scroll Effects
   =================================================================== */
function initNavbarScroll() {
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }
  });
}

/* ===================================================================
   Toast Notification Helper
   =================================================================== */
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
  }, 3500);
}
