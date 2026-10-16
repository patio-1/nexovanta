/**
 * ===================================================================
 * NEXOVANTA - USER PROFILE APPLICATION LOGIC
 * profile.js
 * ===================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Session & Auth Guard
  const session = NexovantaDB.Session.get();
  if (!session || !session.id) {
    window.location.href = 'login.html';
    return;
  }

  // 2. Resolve Profile Username from URL
  const urlParams = new URLSearchParams(window.location.search);
  let requestedUsername = urlParams.get('user');

  if (!requestedUsername || requestedUsername.trim() === '') {
    // Default to currently logged-in user's profile
    window.location.href = `profile.html?user=${encodeURIComponent(session.username)}`;
    return;
  }

  // Normalize username (strip leading '@' if present)
  requestedUsername = requestedUsername.trim().replace(/^@/, '');

  // 3. Retrieve User from Database
  let profileUser = NexovantaDB.Users.getByUsername(requestedUsername);

  if (!profileUser) {
    renderUserNotFound(requestedUsername);
    return;
  }

  // State Management
  let isOwner = (session.id === profileUser.id) || (session.username.toLowerCase() === profileUser.username.toLowerCase());
  let isViewingAsPublic = false;
  let activeTab = 'posts';

  // Setup UI Components
  setupTopNavigation(session);
  setupNotifications(session);
  setupGlobalSearch();
  renderProfileHeader();
  setupTabs();
  renderTabContent();
  setupOwnerControls();
  setupVisitorControls();
  setupEditProfileModal();
  setupLightbox();

  // ─── Header & Basic Profile Info ───────────────────────────────────────────
  function renderProfileHeader() {
    const isPublicPerspective = isOwner && isViewingAsPublic;

    // Cover Photo
    const coverSection = document.getElementById('coverPhotoSection');
    if (profileUser.cover_photo_url) {
      coverSection.style.backgroundImage = `url('${profileUser.cover_photo_url}')`;
    } else {
      coverSection.style.backgroundImage = '';
    }

    // Cover Change Button (Owner only, not in public view)
    const coverActionWrap = document.getElementById('coverActionWrap');
    if (coverActionWrap) {
      coverActionWrap.style.display = (isOwner && !isPublicPerspective) ? 'flex' : 'none';
    }

    // Avatar
    const avatarSlot = document.getElementById('profileAvatarContent');
    if (avatarSlot) {
      if (profileUser.avatar_url) {
        avatarSlot.innerHTML = `<img src="${profileUser.avatar_url}" alt="${profileUser.username}" class="profile-avatar-img">`;
      } else {
        const initials = profileUser.username.substring(0, 2).toUpperCase();
        avatarSlot.innerHTML = `<div class="avatar-initials-large">${initials}</div>`;
      }
    }

    // Avatar Overlay Camera Button (Owner only, not in public view)
    const avatarOverlay = document.getElementById('avatarOverlayBtn');
    if (avatarOverlay) {
      avatarOverlay.style.display = (isOwner && !isPublicPerspective) ? 'flex' : 'none';
    }

    // Identity texts
    document.getElementById('profileUsernameEl').textContent = `@${profileUser.username}`;
    document.title = `@${profileUser.username} | Nexovanta Chuka Community`;

    const fullNameEl = document.getElementById('profileFullNameEl');
    if (profileUser.full_name && profileUser.full_name.trim() !== '') {
      fullNameEl.textContent = profileUser.full_name;
      fullNameEl.style.display = 'inline';
    } else {
      fullNameEl.style.display = 'none';
    }

    // Badges
    const catBadge = document.getElementById('categoryBadge');
    if (catBadge) {
      const catText = profileUser.category === 'business' ? 'Local Business' :
                      profileUser.category === 'community' ? 'Town Resident' : 'Campus Community';
      catBadge.textContent = catText;
    }

    const roleBadge = document.getElementById('roleBadge');
    if (roleBadge) {
      const role = profileUser.role || 'student';
      roleBadge.className = `badge-pill badge-role-${role}`;
      roleBadge.innerHTML = role === 'student' ? '<i class="fa-solid fa-graduation-cap"></i> Student 🎓' :
                            role === 'business' ? '<i class="fa-solid fa-store"></i> Merchant 💼' :
                            '<i class="fa-solid fa-house-chimney"></i> Resident 🏘️';
    }

    // Account role badges (Admin / Mod)
    const adminBadge = document.getElementById('adminBadge');
    const modBadge = document.getElementById('modBadge');
    if (adminBadge) adminBadge.style.display = (profileUser.account_role === 'admin') ? 'inline-flex' : 'none';
    if (modBadge) modBadge.style.display = (profileUser.account_role === 'moderator') ? 'inline-flex' : 'none';

    // Bio
    const bioEl = document.getElementById('profileBioEl');
    if (bioEl) {
      bioEl.textContent = profileUser.bio || 'Chuka Community member exploring connections and local opportunities.';
    }

    // Location
    const locBox = document.getElementById('profileLocationEl');
    const locText = document.getElementById('locationText');
    if (profileUser.location && profileUser.location.trim() !== '') {
      locText.textContent = profileUser.location;
      locBox.style.display = 'inline-flex';
    } else {
      locBox.style.display = 'none';
    }

    // Joined Date
    const joinedEl = document.getElementById('joinedDateText');
    if (joinedEl && profileUser.created_at) {
      try {
        const d = new Date(profileUser.created_at);
        const monthName = d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
        joinedEl.textContent = `Member since ${monthName}`;
      } catch {
        joinedEl.textContent = 'Member since 2026';
      }
    }

    // Stats Strip
    const userPosts = NexovantaDB.Posts.getByAuthor(profileUser.username);
    document.getElementById('statPostsCount').textContent = userPosts.length;
    document.getElementById('tabCountPosts').textContent = userPosts.length;

    const allEvents = NexovantaDB.Events.getAll();
    const userEvents = allEvents.filter(e => e.organiser_username === profileUser.username);
    document.getElementById('statEventsCount').textContent = userEvents.length;
    document.getElementById('tabCountEvents').textContent = userEvents.length;

    // Photos count
    const photoPosts = userPosts.filter(p => p.media && p.media.some(m => m.type === 'image'));
    document.getElementById('tabCountPhotos').textContent = photoPosts.length;

    // Videos count
    const videoPosts = userPosts.filter(p => p.post_type === 'video' || (p.media && p.media.some(m => m.type === 'video')));
    document.getElementById('tabCountVideos').textContent = videoPosts.length;

    // Saved count (only show if owner and not in public view)
    const savedStatItem = document.getElementById('statSavedItem');
    const savedTabBtn = document.getElementById('tabBtnSaved');
    if (isOwner && !isPublicPerspective) {
      const savedPosts = NexovantaDB.SavedPosts.getByUser(session.id);
      document.getElementById('statSavedCount').textContent = savedPosts.length;
      savedStatItem.style.display = 'flex';
      savedTabBtn.style.display = 'flex';
    } else {
      savedStatItem.style.display = 'none';
      savedTabBtn.style.display = 'none';
    }

    // Followers
    const followsKey = `nx_followers_${profileUser.id}`;
    const storedFollows = JSON.parse(localStorage.getItem(followsKey) || '[]');
    const baseCount = 14;
    document.getElementById('statFollowersCount').textContent = baseCount + storedFollows.length;

    // Controls Row Visibility
    const ownerRow = document.getElementById('ownerActionsRow');
    const visitorRow = document.getElementById('visitorActionsRow');
    const publicBanner = document.getElementById('publicModeNotice');

    if (isOwner) {
      ownerRow.style.display = 'flex';
      visitorRow.style.display = 'none';
      publicBanner.style.display = isViewingAsPublic ? 'flex' : 'none';
      document.getElementById('togglePublicText').textContent = isViewingAsPublic ? 'Exit Public View' : 'View as Public';
    } else {
      ownerRow.style.display = 'none';
      visitorRow.style.display = 'flex';
      publicBanner.style.display = 'none';

      // Follow status for visitor
      const visitorFollows = JSON.parse(localStorage.getItem(`nx_following_${session.id}`) || '[]');
      const isFollowing = visitorFollows.includes(profileUser.id);
      const followBtn = document.getElementById('btnFollowUser');
      const followText = document.getElementById('followBtnText');
      if (isFollowing) {
        followBtn.classList.remove('btn-primary');
        followBtn.classList.add('btn-outline');
        followBtn.style.borderColor = 'var(--accent-cyan)';
        followBtn.style.color = 'var(--accent-cyan)';
        followText.textContent = 'Following ✓';
      } else {
        followBtn.classList.add('btn-primary');
        followBtn.classList.remove('btn-outline');
        followBtn.style.borderColor = '';
        followBtn.style.color = '';
        followText.textContent = 'Follow';
      }
    }
  }

  // ─── Owner Controls Setup ──────────────────────────────────────────────────
  function setupOwnerControls() {
    if (!isOwner) return;

    // View as Public toggle
    const toggleBtn = document.getElementById('btnTogglePublicView');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        isViewingAsPublic = !isViewingAsPublic;
        renderProfileHeader();
        renderTabContent();
        const msg = isViewingAsPublic
          ? 'Switched to Public View. You are now seeing this profile as visitors do.'
          : 'Returned to Owner View. Full editing options restored.';
        if (typeof showToast === 'function') showToast(msg);
      });
    }

    // Direct Cover Upload
    const coverInput = document.getElementById('coverFileInput');
    if (coverInput) {
      coverInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (uploadEvent) => {
          const dataUrl = uploadEvent.target.result;
          try {
            profileUser = await NexovantaAuth.updateProfile({ cover_photo_url: dataUrl });
            if (session.id === profileUser.id) NexovantaDB.Session.set(profileUser);
            renderProfileHeader();
            if (typeof showToast === 'function') showToast('Cover photo updated successfully!');
          } catch (error) {
            if (typeof showToast === 'function') showToast(error.message || 'Unable to update cover photo.');
          }
        };
        reader.readAsDataURL(file);
      });
    }

    // Direct Avatar Upload
    const avatarInput = document.getElementById('avatarFileInput');
    if (avatarInput) {
      avatarInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (uploadEvent) => {
          const dataUrl = uploadEvent.target.result;
          try {
            profileUser = await NexovantaAuth.updateProfile({ avatar_url: dataUrl });
            if (session.id === profileUser.id) NexovantaDB.Session.set(profileUser);
            renderProfileHeader();
            setupTopNavigation(profileUser);
            if (typeof showToast === 'function') showToast('Profile avatar updated successfully!');
          } catch (error) {
            if (typeof showToast === 'function') showToast(error.message || 'Unable to update profile avatar.');
          }
        };
        reader.readAsDataURL(file);
      });
    }

    // Publish Post from Profile (Inline composer)
    const btnPublish = document.getElementById('btnPublishPost');
    const inputContent = document.getElementById('createPostInput');
    const inputCategory = document.getElementById('createPostCategory');
    const inputImage = document.getElementById('postImageUploadInput');
    const labelImgName = document.getElementById('postImageSelectedName');

    if (inputImage) {
      inputImage.addEventListener('change', (e) => {
        const f = e.target.files[0];
        if (f && labelImgName) {
          labelImgName.textContent = f.name;
        }
      });
    }

    if (btnPublish && inputContent) {
      btnPublish.addEventListener('click', () => {
        const text = inputContent.value.trim();
        if (!text) {
          if (typeof showToast === 'function') showToast('Please write something before publishing.');
          return;
        }

        const category = inputCategory ? inputCategory.value : 'campus';
        const file = inputImage?.files?.[0];

        const doCreate = (mediaArr) => {
          // Extract hashtags from text
          const hashtags = (text.match(/#[a-zA-Z0-9_]+/g) || []).map(t => t.replace('#', ''));

          NexovantaDB.Posts.create({
            author_username: session.username,
            author_id: session.id,
            content: text,
            post_type: mediaArr.length > 0 ? 'image' : 'text',
            category: category,
            media: mediaArr,
            hashtags: hashtags
          });

          inputContent.value = '';
          if (inputImage) inputImage.value = '';
          if (labelImgName) labelImgName.textContent = '';
          if (typeof showToast === 'function') showToast('Post published to your Nexovanta profile!');

          renderProfileHeader();
          renderPostsTab();
        };

        if (file) {
          const reader = new FileReader();
          reader.onload = (ev) => {
            doCreate([{ type: 'image', url: ev.target.result }]);
          };
          reader.readAsDataURL(file);
        } else {
          doCreate([]);
        }
      });
    }
  }

  // ─── Visitor Controls Setup ────────────────────────────────────────────────
  function setupVisitorControls() {
    // Follow / Unfollow
    const followBtn = document.getElementById('btnFollowUser');
    if (followBtn) {
      followBtn.addEventListener('click', () => {
        const myFollowingKey = `nx_following_${session.id}`;
        let following = JSON.parse(localStorage.getItem(myFollowingKey) || '[]');

        const theirFollowersKey = `nx_followers_${profileUser.id}`;
        let theirFollowers = JSON.parse(localStorage.getItem(theirFollowersKey) || '[]');

        const idx = following.indexOf(profileUser.id);
        if (idx === -1) {
          // Follow
          following.push(profileUser.id);
          theirFollowers.push(session.id);
          localStorage.setItem(myFollowingKey, JSON.stringify(following));
          localStorage.setItem(theirFollowersKey, JSON.stringify(theirFollowers));
          if (typeof showToast === 'function') showToast(`Now following @${profileUser.username}!`);
        } else {
          // Unfollow
          following.splice(idx, 1);
          const fIdx = theirFollowers.indexOf(session.id);
          if (fIdx !== -1) theirFollowers.splice(fIdx, 1);
          localStorage.setItem(myFollowingKey, JSON.stringify(following));
          localStorage.setItem(theirFollowersKey, JSON.stringify(theirFollowers));
          if (typeof showToast === 'function') showToast(`Unfollowed @${profileUser.username}.`);
        }
        renderProfileHeader();
      });
    }

    // Message Button
    const messageBtn = document.getElementById('btnMessageUser');
    if (messageBtn) {
      messageBtn.addEventListener('click', () => {
        if (typeof showToast === 'function') {
          showToast(`Direct message channel opened with @${profileUser.username}.`);
        }
      });
    }

    // Share Profile Button
    const shareBtn = document.getElementById('btnShareProfile');
    if (shareBtn) {
      shareBtn.addEventListener('click', () => {
        const profileUrl = window.location.href;
        navigator.clipboard.writeText(profileUrl).then(() => {
          if (typeof showToast === 'function') {
            showToast('Profile link copied to clipboard!');
          }
        }).catch(() => {
          if (typeof showToast === 'function') {
            showToast(`Profile: ${profileUrl}`);
          }
        });
      });
    }
  }

  // ─── Tabs Switcher ─────────────────────────────────────────────────────────
  function setupTabs() {
    const tabBtns = document.querySelectorAll('.profile-tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        activeTab = btn.getAttribute('data-tab');
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));

        const targetPanel = document.getElementById(`tab-${activeTab}`);
        if (targetPanel) {
          targetPanel.classList.add('active');
        }

        renderTabContent();
      });
    });
  }

  function renderTabContent() {
    if (activeTab === 'posts') renderPostsTab();
    else if (activeTab === 'about') renderAboutTab();
    else if (activeTab === 'photos') renderPhotosTab();
    else if (activeTab === 'videos') renderVideosTab();
    else if (activeTab === 'events') renderEventsTab();
    else if (activeTab === 'saved') renderSavedTab();
  }

  // ─── TAB 1: POSTS ──────────────────────────────────────────────────────────
  function renderPostsTab() {
    const isPublicPerspective = isOwner && isViewingAsPublic;
    const createBox = document.getElementById('profileCreatePostBox');
    if (createBox) {
      createBox.style.display = (isOwner && !isPublicPerspective) ? 'block' : 'none';
      const slot = document.getElementById('createPostAvatarSlot');
      if (slot) {
        slot.innerHTML = NexovantaDB.getAvatarHtml(session.username, session.avatar_url, 40);
      }
    }

    const grid = document.getElementById('userPostsGrid');
    const emptyState = document.getElementById('postsEmptyState');
    if (!grid) return;

    const posts = NexovantaDB.Posts.getByAuthor(profileUser.username);
    if (!posts || posts.length === 0) {
      grid.innerHTML = '';
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';

    grid.innerHTML = posts.map(post => {
      const hasLiked = NexovantaDB.Reactions.hasReacted(post.id, session.id);
      const isSaved = NexovantaDB.SavedPosts.isSaved(session.id, post.id);
      const likeCount = NexovantaDB.Reactions.countByPost(post.id);
      const commentCount = NexovantaDB.Comments.countByPost(post.id);
      const canDelete = isOwner || ['admin', 'moderator'].includes(session.account_role);

      // Highlight hashtags
      const formattedContent = escapeHtml(post.content).replace(/#([a-zA-Z0-9_]+)/g, '<span class="post-hashtag">#$1</span>');

      // Media preview
      let mediaHtml = '';
      if (post.media && post.media.length > 0) {
        const m = post.media[0];
        if (m.type === 'image') {
          mediaHtml = `
            <div class="post-media-container" onclick="openLightboxImage('${m.url}', '${escapeAttr(post.content)}')">
              <img src="${m.url}" alt="Post attachment">
            </div>
          `;
        } else if (m.type === 'video') {
          mediaHtml = `
            <div class="post-media-container" onclick="openLightboxVideo('${m.url}', '${escapeAttr(post.content)}')">
              <video src="${m.url}" preload="metadata"></video>
            </div>
          `;
        }
      }

      return `
        <article class="post-card" id="postCard-${post.id}">
          <div class="post-header">
            <div class="post-author-wrap">
              ${NexovantaDB.getAvatarHtml(profileUser.username, profileUser.avatar_url, 40)}
              <div class="post-author-info">
                <h5>@${post.author_username}</h5>
                <span class="post-time-tag">${NexovantaDB.timeAgo(post.created_at)} • <span style="text-transform: capitalize;">${post.category}</span></span>
              </div>
            </div>
            ${canDelete ? `
              <button class="nav-icon-btn btn-delete-post" data-post-id="${post.id}" title="Delete Post" style="width: 32px; height: 32px; font-size: 0.8rem; color: #ef4444; border: none;">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            ` : ''}
          </div>

          <div class="post-content-body">${formattedContent}</div>

          ${mediaHtml}

          <div class="post-actions-strip">
            <button class="post-action-btn ${hasLiked ? 'active-like' : ''}" data-action="like" data-post-id="${post.id}">
              <i class="${hasLiked ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
              <span class="like-counter">${likeCount}</span>
            </button>

            <button class="post-action-btn" data-action="comment-toggle" data-post-id="${post.id}">
              <i class="fa-regular fa-comment"></i>
              <span class="comment-counter">${commentCount}</span>
            </button>

            <button class="post-action-btn ${isSaved ? 'active-saved' : ''}" data-action="save" data-post-id="${post.id}">
              <i class="${isSaved ? 'fa-solid' : 'fa-regular'} fa-bookmark"></i>
            </button>

            <button class="post-action-btn" data-action="share" data-post-id="${post.id}" title="Share">
              <i class="fa-solid fa-share-nodes"></i>
            </button>
          </div>

          <!-- Comments Container -->
          <div class="post-comments-section" id="commentsSection-${post.id}">
            <div class="comments-list" id="commentsList-${post.id}"></div>
            <div class="comment-input-row">
              <input type="text" class="comment-input-field" id="inputComment-${post.id}" placeholder="Write a reply...">
              <button class="btn btn-primary btn-sm btn-submit-comment" data-post-id="${post.id}" style="padding: 6px 14px;">
                <i class="fa-solid fa-paper-plane"></i>
              </button>
            </div>
          </div>
        </article>
      `;
    }).join('');

    bindPostCardEvents();
  }

  function bindPostCardEvents() {
    // Like button
    document.querySelectorAll('[data-action="like"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const postId = btn.getAttribute('data-post-id');
        const res = NexovantaDB.Reactions.toggle(postId, session.id);
        const icon = btn.querySelector('i');
        const counter = btn.querySelector('.like-counter');

        if (res.action === 'added') {
          btn.classList.add('active-like');
          icon.className = 'fa-solid fa-heart';
        } else {
          btn.classList.remove('active-like');
          icon.className = 'fa-regular fa-heart';
        }
        counter.textContent = res.count;
      });
    });

    // Save button
    document.querySelectorAll('[data-action="save"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const postId = btn.getAttribute('data-post-id');
        const isNowSaved = NexovantaDB.SavedPosts.toggle(session.id, postId);
        const icon = btn.querySelector('i');

        if (isNowSaved) {
          btn.classList.add('active-saved');
          icon.className = 'fa-solid fa-bookmark';
          if (typeof showToast === 'function') showToast('Post saved to your bookmarks.');
        } else {
          btn.classList.remove('active-saved');
          icon.className = 'fa-regular fa-bookmark';
          if (typeof showToast === 'function') showToast('Post removed from bookmarks.');
        }
        renderProfileHeader();
      });
    });

    // Share button
    document.querySelectorAll('[data-action="share"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const postId = btn.getAttribute('data-post-id');
        const postUrl = `${window.location.origin}${window.location.pathname}?user=${profileUser.username}#postCard-${postId}`;
        navigator.clipboard.writeText(postUrl).then(() => {
          if (typeof showToast === 'function') showToast('Post link copied to clipboard!');
        }).catch(() => {
          if (typeof showToast === 'function') showToast(`Post URL: ${postUrl}`);
        });
      });
    });

    // Toggle comments
    document.querySelectorAll('[data-action="comment-toggle"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const postId = btn.getAttribute('data-post-id');
        const sec = document.getElementById(`commentsSection-${postId}`);
        if (!sec) return;

        if (sec.classList.contains('open')) {
          sec.classList.remove('open');
        } else {
          sec.classList.add('open');
          renderCommentsList(postId);
        }
      });
    });

    // Submit comment
    document.querySelectorAll('.btn-submit-comment').forEach(btn => {
      btn.addEventListener('click', () => {
        const postId = btn.getAttribute('data-post-id');
        const input = document.getElementById(`inputComment-${postId}`);
        const content = input ? input.value.trim() : '';

        if (!content) return;

        NexovantaDB.Comments.create({
          post_id: postId,
          author_username: session.username,
          author_id: session.id,
          content: content
        });

        input.value = '';
        renderCommentsList(postId);

        // Update comment count on post
        const countSpan = document.querySelector(`[data-action="comment-toggle"][data-post-id="${postId}"] .comment-counter`);
        if (countSpan) {
          countSpan.textContent = NexovantaDB.Comments.countByPost(postId);
        }
      });
    });

    // Delete post button
    document.querySelectorAll('.btn-delete-post').forEach(btn => {
      btn.addEventListener('click', () => {
        const postId = btn.getAttribute('data-post-id');
        if (confirm('Are you sure you want to delete this post?')) {
          const success = NexovantaDB.Posts.delete(postId, session.id);
          if (success) {
            if (typeof showToast === 'function') showToast('Post deleted successfully.');
            renderProfileHeader();
            renderPostsTab();
          } else {
            if (typeof showToast === 'function') showToast('Could not delete post.');
          }
        }
      });
    });
  }

  function renderCommentsList(postId) {
    const listEl = document.getElementById(`commentsList-${postId}`);
    if (!listEl) return;

    const comments = NexovantaDB.Comments.getByPost(postId);
    if (!comments || comments.length === 0) {
      listEl.innerHTML = '<div style="font-size: 0.78rem; color: var(--text-dim); padding: 6px 0;">No comments yet. Be the first to reply!</div>';
      return;
    }

    listEl.innerHTML = comments.map(c => `
      <div class="comment-bubble">
        <div class="comment-bubble-header">
          <span class="comment-author-name">@${c.author_username}</span>
          <span style="font-size: 0.7rem; color: var(--text-dim);">${NexovantaDB.timeAgo(c.created_at)}</span>
        </div>
        <div style="color: #cbd5e1; word-break: break-word;">${escapeHtml(c.content)}</div>
      </div>
    `).join('');
  }

  // ─── TAB 2: ABOUT ──────────────────────────────────────────────────────────
  function renderAboutTab() {
    const isPublicPerspective = isOwner && isViewingAsPublic;

    document.getElementById('aboutUsername').textContent = `@${profileUser.username}`;
    document.getElementById('aboutFullName').textContent = profileUser.full_name || 'Not set';

    const catName = profileUser.category === 'business' ? 'Local Business' :
                    profileUser.category === 'community' ? 'Chuka Town Resident' : 'Chuka Campus Student';
    document.getElementById('aboutCategory').textContent = catName;

    const roleName = profileUser.role === 'student' ? 'Student 🎓' :
                     profileUser.role === 'business' ? 'Business Merchant 💼' : 'Resident 🏘️';
    document.getElementById('aboutRole').textContent = roleName;

    const accRole = profileUser.account_role === 'admin' ? 'Platform Administrator 🛡️' :
                    profileUser.account_role === 'moderator' ? 'Community Moderator ⚖️' : 'Standard Member';
    document.getElementById('aboutAccountRole').textContent = accRole;

    document.getElementById('aboutLocation').textContent = profileUser.location || 'Chuka, Kenya';
    document.getElementById('aboutBio').textContent = profileUser.bio || 'No bio provided.';

    // Registration date
    try {
      const d = new Date(profileUser.created_at);
      document.getElementById('aboutJoined').textContent = d.toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      document.getElementById('aboutJoined').textContent = '2026';
    }

    // Private Email & Phone (Only show to owner when not in public mode)
    const emailItem = document.getElementById('aboutEmailItem');
    const phoneItem = document.getElementById('aboutPhoneItem');

    if (isOwner && !isPublicPerspective) {
      if (emailItem) {
        emailItem.style.display = 'flex';
        document.getElementById('aboutEmail').textContent = profileUser.email || 'None';
      }
      if (phoneItem) {
        phoneItem.style.display = 'flex';
        document.getElementById('aboutPhone').textContent = profileUser.phone || 'None provided';
      }
    } else {
      if (emailItem) emailItem.style.display = 'none';
      if (phoneItem) phoneItem.style.display = 'none';
    }
  }

  // ─── TAB 3: PHOTOS ─────────────────────────────────────────────────────────
  function renderPhotosTab() {
    const grid = document.getElementById('photosGalleryGrid');
    const emptyState = document.getElementById('photosEmptyState');
    if (!grid) return;

    const posts = NexovantaDB.Posts.getByAuthor(profileUser.username);
    const photoItems = [];

    posts.forEach(p => {
      if (p.media && Array.isArray(p.media)) {
        p.media.forEach(m => {
          if (m.type === 'image') {
            photoItems.push({ url: m.url, caption: p.content, postId: p.id, likes: NexovantaDB.Reactions.countByPost(p.id) });
          }
        });
      }
    });

    if (photoItems.length === 0) {
      grid.innerHTML = '';
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';

    grid.innerHTML = photoItems.map(item => `
      <div class="gallery-item" onclick="openLightboxImage('${item.url}', '${escapeAttr(item.caption)}')">
        <img src="${item.url}" alt="User photo">
        <div class="gallery-overlay">
          <span><i class="fa-solid fa-heart" style="color: #ef4444;"></i> ${item.likes}</span>
          <span><i class="fa-solid fa-expand"></i> View</span>
        </div>
      </div>
    `).join('');
  }

  // ─── TAB 4: VIDEOS ─────────────────────────────────────────────────────────
  function renderVideosTab() {
    const grid = document.getElementById('videosGalleryGrid');
    const emptyState = document.getElementById('videosEmptyState');
    if (!grid) return;

    const posts = NexovantaDB.Posts.getByAuthor(profileUser.username);
    const videoItems = [];

    posts.forEach(p => {
      if (p.media && Array.isArray(p.media)) {
        p.media.forEach(m => {
          if (m.type === 'video') {
            videoItems.push({ url: m.url, caption: p.content, postId: p.id });
          }
        });
      }
    });

    if (videoItems.length === 0) {
      grid.innerHTML = '';
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';

    grid.innerHTML = videoItems.map(item => `
      <div class="gallery-item" onclick="openLightboxVideo('${item.url}', '${escapeAttr(item.caption)}')">
        <video src="${item.url}" preload="metadata"></video>
        <div class="video-play-badge"><i class="fa-solid fa-play"></i></div>
        <div class="gallery-overlay">
          <span><i class="fa-solid fa-play"></i> Watch</span>
        </div>
      </div>
    `).join('');
  }

  // ─── TAB 5: EVENTS ─────────────────────────────────────────────────────────
  function renderEventsTab() {
    const grid = document.getElementById('eventsGridContainer');
    const emptyState = document.getElementById('eventsEmptyState');
    if (!grid) return;

    const allEvents = NexovantaDB.Events.getAll();
    const userEvents = allEvents.filter(e => e.organiser_username === profileUser.username);

    if (userEvents.length === 0) {
      grid.innerHTML = '';
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';

    grid.innerHTML = userEvents.map(ev => {
      const rsvpCount = NexovantaDB.EventRSVPs.countByEvent(ev.id);
      const myRsvp = NexovantaDB.EventRSVPs.get(ev.id, session.id);
      const isGoing = myRsvp && myRsvp.response === 'going';

      return `
        <div class="event-card">
          <div class="event-badge-strip">
            <span class="badge-pill badge-category" style="text-transform: capitalize;">${ev.category}</span>
            <span style="font-size: 0.78rem; font-weight: 700; color: ${ev.is_free ? 'var(--accent-teal)' : '#f59e0b'};">
              ${ev.is_free ? 'Free Event' : `KES ${ev.price || 0}`}
            </span>
          </div>

          <h4 class="event-title">${escapeHtml(ev.title)}</h4>

          <div class="event-meta-line">
            <i class="fa-regular fa-clock"></i>
            <span>${NexovantaDB.Events.formatDateNairobi(ev.start_at)}</span>
          </div>

          <div class="event-meta-line">
            <i class="fa-solid fa-location-dot"></i>
            <span>${escapeHtml(ev.venue || 'Chuka')} • ${escapeHtml(ev.location || '')}</span>
          </div>

          <p style="font-size: 0.86rem; color: var(--text-muted); margin: 10px 0; line-height: 1.5; flex-grow: 1;">
            ${escapeHtml(ev.description || '')}
          </p>

          <div class="event-rsvp-bar">
            <span style="font-size: 0.8rem; color: var(--text-dim);">
              <i class="fa-solid fa-users" style="color: var(--accent-cyan);"></i> ${rsvpCount.going} going
            </span>

            <button class="btn btn-sm ${isGoing ? 'btn-primary' : 'btn-outline'} btn-event-rsvp" data-event-id="${ev.id}">
              <i class="fa-solid fa-check"></i> ${isGoing ? 'Going ✓' : 'RSVP'}
            </button>
          </div>
        </div>
      `;
    }).join('');

    // RSVP click listeners
    grid.querySelectorAll('.btn-event-rsvp').forEach(btn => {
      btn.addEventListener('click', () => {
        const eventId = btn.getAttribute('data-event-id');
        const current = NexovantaDB.EventRSVPs.get(eventId, session.id);
        const newResponse = (current && current.response === 'going') ? 'cannot_attend' : 'going';

        NexovantaDB.EventRSVPs.upsert(eventId, session.id, newResponse);
        if (typeof showToast === 'function') {
          showToast(newResponse === 'going' ? 'RSVP confirmed! See you there.' : 'RSVP updated.');
        }
        renderEventsTab();
      });
    });
  }

  // ─── TAB 6: SAVED POSTS ────────────────────────────────────────────────────
  function renderSavedTab() {
    if (!isOwner) return;

    const grid = document.getElementById('savedPostsGrid');
    const emptyState = document.getElementById('savedEmptyState');
    if (!grid) return;

    const savedRecords = NexovantaDB.SavedPosts.getByUser(session.id);
    const allPosts = NexovantaDB.Posts.getAll();
    const savedPosts = allPosts.filter(p => savedRecords.some(s => s.post_id === p.id));

    if (savedPosts.length === 0) {
      grid.innerHTML = '';
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';

    grid.innerHTML = savedPosts.map(post => {
      const hasLiked = NexovantaDB.Reactions.hasReacted(post.id, session.id);
      const likeCount = NexovantaDB.Reactions.countByPost(post.id);
      const commentCount = NexovantaDB.Comments.countByPost(post.id);

      return `
        <article class="post-card">
          <div class="post-header">
            <div class="post-author-wrap">
              ${NexovantaDB.getAvatarHtml(post.author_username, null, 36)}
              <div class="post-author-info">
                <h5>@${post.author_username}</h5>
                <span class="post-time-tag">${NexovantaDB.timeAgo(post.created_at)}</span>
              </div>
            </div>
            <button class="nav-icon-btn btn-unsave-post" data-post-id="${post.id}" title="Remove Bookmark" style="width: 30px; height: 30px; color: var(--accent-cyan); border: none;">
              <i class="fa-solid fa-bookmark"></i>
            </button>
          </div>

          <div class="post-content-body">${escapeHtml(post.content)}</div>

          <div class="post-actions-strip">
            <span style="font-size: 0.8rem; color: var(--text-dim);"><i class="fa-solid fa-heart" style="color: #ef4444;"></i> ${likeCount}</span>
            <span style="font-size: 0.8rem; color: var(--text-dim);"><i class="fa-regular fa-comment"></i> ${commentCount}</span>
            <a href="profile.html?user=${post.author_username}#postCard-${post.id}" class="btn btn-outline btn-sm" style="font-size: 0.72rem; padding: 4px 10px;">View Original</a>
          </div>
        </article>
      `;
    }).join('');

    grid.querySelectorAll('.btn-unsave-post').forEach(b => {
      b.addEventListener('click', () => {
        const pid = b.getAttribute('data-post-id');
        NexovantaDB.SavedPosts.toggle(session.id, pid);
        if (typeof showToast === 'function') showToast('Bookmark removed.');
        renderProfileHeader();
        renderSavedTab();
      });
    });
  }

  // ─── EDIT PROFILE MODAL ────────────────────────────────────────────────────
  function setupEditProfileModal() {
    const modal = document.getElementById('editProfileModal');
    const openBtn = document.getElementById('btnEditProfile');
    const closeBtn = document.getElementById('closeEditModalBtn');
    const cancelBtn = document.getElementById('cancelEditBtn');
    const saveBtn = document.getElementById('saveProfileBtn');

    if (!modal || !openBtn) return;

    const uInput = document.getElementById('editUsernameInput');
    const nameInput = document.getElementById('editFullNameInput');
    const bioInput = document.getElementById('editBioInput');
    const locInput = document.getElementById('editLocationInput');
    const catInput = document.getElementById('editCategoryInput');
    const roleInput = document.getElementById('editRoleInput');
    const phoneInput = document.getElementById('editPhoneInput');
    const bioCounter = document.getElementById('bioCharCounter');
    const feedback = document.getElementById('usernameCheckFeedback');

    const openModal = () => {
      // Pre-fill fields
      uInput.value = profileUser.username;
      nameInput.value = profileUser.full_name || '';
      bioInput.value = profileUser.bio || '';
      locInput.value = profileUser.location || '';
      catInput.value = profileUser.category || 'campus';
      roleInput.value = profileUser.role || 'student';
      phoneInput.value = profileUser.phone || '';
      bioCounter.textContent = `${bioInput.value.length} / 160`;
      feedback.textContent = '';
      feedback.style.color = '';

      modal.classList.add('active');
    };

    const closeModal = () => {
      modal.classList.remove('active');
    };

    openBtn.addEventListener('click', openModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

    // Bio length counter
    bioInput.addEventListener('input', () => {
      bioCounter.textContent = `${bioInput.value.length} / 160`;
    });

    // Live Username Uniqueness Check
    uInput.addEventListener('input', async () => {
      const val = uInput.value.trim().toLowerCase();
      const valRes = NexovantaDB.validateUsername(val);

      if (!valRes.valid) {
        feedback.textContent = `❌ ${valRes.error}`;
        feedback.style.color = '#ef4444';
        return;
      }

      feedback.textContent = 'Checking username…';
      try {
        const available = await NexovantaAuth.isUsernameAvailable(val);
        if (uInput.value.trim().toLowerCase() !== val) return;
        feedback.textContent = available
          ? `✓ @${val} is available!`
          : `❌ @${val} is already taken by another Chuka member.`;
        feedback.style.color = available ? 'var(--accent-teal)' : '#ef4444';
      } catch (error) {
        feedback.textContent = error.message || 'Unable to check username availability.';
        feedback.style.color = '#ef4444';
      }
    });

    // Save Changes
    saveBtn.addEventListener('click', async () => {
      const newUsername = uInput.value.trim().toLowerCase();
      const valRes = NexovantaDB.validateUsername(newUsername);

      if (!valRes.valid) {
        alert(valRes.error);
        return;
      }

      if (!await NexovantaAuth.isUsernameAvailable(newUsername)) {
        alert('This username is already taken. Please choose another.');
        return;
      }

      const changes = {
        username: newUsername,
        full_name: nameInput.value.trim(),
        bio: bioInput.value.trim(),
        location: locInput.value.trim(),
        category: catInput.value,
        role: roleInput.value,
        phone: phoneInput.value.trim(),
        public_posts: document.getElementById('editPublicPostsCheckbox').checked
      };

      // Check modal avatar file
      const avatarFile = document.getElementById('modalAvatarFile').files[0];
      const coverFile = document.getElementById('modalCoverFile').files[0];

      const previousUsername = profileUser.username;
      const commitSave = async () => {
        try {
          profileUser = await NexovantaAuth.updateProfile(changes);
          if (session.id === profileUser.id) NexovantaDB.Session.set(profileUser);

          closeModal();
          if (typeof showToast === 'function') showToast('Profile changes saved successfully!');

          if (newUsername !== previousUsername) {
            window.location.href = `profile.html?user=${encodeURIComponent(newUsername)}`;
          } else {
            renderProfileHeader();
            renderTabContent();
            setupTopNavigation(profileUser);
          }
        } catch (error) {
          alert(error.message || 'Unable to save profile changes.');
        }
      };

      // Read files if any
      if (avatarFile && coverFile) {
        const r1 = new FileReader();
        r1.onload = async (e1) => {
          changes.avatar_url = e1.target.result;
          const r2 = new FileReader();
          r2.onload = async (e2) => {
            changes.cover_photo_url = e2.target.result;
            await commitSave();
          };
          r2.readAsDataURL(coverFile);
        };
        r1.readAsDataURL(avatarFile);
      } else if (avatarFile) {
        const r = new FileReader();
        r.onload = async (e) => {
          changes.avatar_url = e.target.result;
          await commitSave();
        };
        r.readAsDataURL(avatarFile);
      } else if (coverFile) {
        const r = new FileReader();
        r.onload = async (e) => {
          changes.cover_photo_url = e.target.result;
          await commitSave();
        };
        r.readAsDataURL(coverFile);
      } else {
        commitSave();
      }
    });
  }

  // ─── LIGHTBOX MODAL ────────────────────────────────────────────────────────
  function setupLightbox() {
    const modal = document.getElementById('mediaLightboxModal');
    const closeBtn = document.getElementById('lightboxCloseBtn');

    if (!modal) return;

    const hide = () => modal.classList.remove('active');

    if (closeBtn) closeBtn.addEventListener('click', hide);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) hide();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('active')) hide();
    });

    window.openLightboxImage = (url, caption) => {
      const slot = document.getElementById('lightboxMediaSlot');
      const capEl = document.getElementById('lightboxCaptionEl');
      slot.innerHTML = `<img src="${url}" alt="Full preview" class="lightbox-img-el">`;
      capEl.textContent = caption || '';
      modal.classList.add('active');
    };

    window.openLightboxVideo = (url, caption) => {
      const slot = document.getElementById('lightboxMediaSlot');
      const capEl = document.getElementById('lightboxCaptionEl');
      slot.innerHTML = `<video src="${url}" controls autoplay class="lightbox-img-el" style="max-height: 70vh;"></video>`;
      capEl.textContent = caption || '';
      modal.classList.add('active');
    };
  }

  // ─── TOP NAVIGATION COMPONENT ──────────────────────────────────────────────
  function setupTopNavigation(curUser) {
    // Nav User Display
    const navUsername = document.getElementById('navUsernameDisplay');
    const navRole = document.getElementById('navRoleDisplay');
    const navSlot = document.getElementById('navUserAvatarSlot');

    if (navUsername) navUsername.textContent = `@${curUser.username}`;
    if (navRole) navRole.textContent = curUser.role === 'student' ? 'Student 🎓' :
                                      curUser.role === 'business' ? 'Business 💼' : 'Resident 🏘️';

    if (navSlot) {
      navSlot.innerHTML = NexovantaDB.getAvatarHtml(curUser.username, curUser.avatar_url, 32);
    }

    // User Dropdown header
    const menuHeadSlot = document.getElementById('menuHeaderAvatarSlot');
    const menuHeadUser = document.getElementById('menuHeaderUsername');
    const menuHeadEmail = document.getElementById('menuHeaderEmail');

    if (menuHeadSlot) menuHeadSlot.innerHTML = NexovantaDB.getAvatarHtml(curUser.username, curUser.avatar_url, 38);
    if (menuHeadUser) menuHeadUser.textContent = `@${curUser.username}`;
    if (menuHeadEmail) menuHeadEmail.textContent = curUser.email || '';

    // Menu links
    const myProfileLink = document.getElementById('menuMyProfileLink');
    if (myProfileLink) myProfileLink.href = `profile.html?user=${encodeURIComponent(curUser.username)}`;

    const mobileProfile = document.getElementById('mobileProfileLink');
    if (mobileProfile) mobileProfile.href = `profile.html?user=${encodeURIComponent(curUser.username)}`;

    // Admin link if moderator / admin
    const isAdminOrMod = ['admin', 'moderator'].includes(curUser.account_role);
    const adminNavLi = document.getElementById('adminNavLi');
    const menuAdminLink = document.getElementById('menuAdminLink');

    if (adminNavLi) adminNavLi.style.display = isAdminOrMod ? 'list-item' : 'none';
    if (menuAdminLink) menuAdminLink.style.display = isAdminOrMod ? 'flex' : 'none';

    // Dropdown toggle
    const trigger = document.getElementById('navUserTrigger');
    const menu = document.getElementById('userMenuDropdown');

    if (trigger && menu) {
      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        menu.classList.toggle('show');
        document.getElementById('notifDropdownPanel')?.classList.remove('show');
      });
    }

    // Logout
    const logoutBtn = document.getElementById('menuLogoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        NexovantaAuth.signOut().then(() => window.location.replace('login.html'));
      });
    }

    // Close on outside click
    document.addEventListener('click', () => {
      menu?.classList.remove('show');
      document.getElementById('notifDropdownPanel')?.classList.remove('show');
    });
  }

  // ─── NOTIFICATIONS DROPDOWN ────────────────────────────────────────────────
  function setupNotifications(curUser) {
    const bellBtn = document.getElementById('notifBellBtn');
    const panel = document.getElementById('notifDropdownPanel');
    const badge = document.getElementById('notifUnreadBadge');
    const list = document.getElementById('notifListContainer');
    const markAllBtn = document.getElementById('markAllReadBtn');

    if (!bellBtn || !panel) return;

    const refreshNotifs = () => {
      const notifs = NexovantaDB.Notifications.getByUser(curUser.id);
      const unreadCount = NexovantaDB.Notifications.getUnreadCount(curUser.id);

      if (unreadCount > 0) {
        badge.textContent = unreadCount;
        badge.style.display = 'flex';
      } else {
        badge.style.display = 'none';
      }

      if (!notifs || notifs.length === 0) {
        list.innerHTML = '<li style="padding: 24px; text-align: center; color: var(--text-dim); font-size: 0.85rem;">No notifications right now.</li>';
        return;
      }

      list.innerHTML = notifs.map(n => `
        <li class="notif-item ${!n.read_at ? 'unread' : ''}">
          <div style="font-size: 1.1rem; color: var(--accent-cyan); margin-top: 2px;">
            <i class="fa-solid fa-circle-dot"></i>
          </div>
          <div style="flex-grow: 1;">
            <div style="color: #fff; margin-bottom: 2px;">${escapeHtml(n.message)}</div>
            <div style="font-size: 0.7rem; color: var(--text-dim);">${NexovantaDB.timeAgo(n.created_at)}</div>
          </div>
        </li>
      `).join('');
    };

    bellBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      panel.classList.toggle('show');
      document.getElementById('userMenuDropdown')?.classList.remove('show');
      refreshNotifs();
    });

    if (markAllBtn) {
      markAllBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        NexovantaDB.Notifications.markAllRead(curUser.id);
        refreshNotifs();
        if (typeof showToast === 'function') showToast('All notifications marked as read.');
      });
    }

    refreshNotifs();
  }

  // ─── GLOBAL QUICK SEARCH IN NAVBAR ─────────────────────────────────────────
  function setupGlobalSearch() {
    const searchInput = document.getElementById('globalSearchInput');
    const resultsBox = document.getElementById('navSearchResults');
    if (!searchInput || !resultsBox) return;

    searchInput.addEventListener('input', () => {
      const q = searchInput.value.trim().toLowerCase().replace(/^@/, '');
      if (q.length === 0) {
        resultsBox.style.display = 'none';
        resultsBox.innerHTML = '';
        return;
      }

      const allUsers = NexovantaDB.Users.getAll();
      const matches = allUsers.filter(u =>
        u.username.toLowerCase().includes(q) ||
        (u.full_name && u.full_name.toLowerCase().includes(q))
      ).slice(0, 5);

      if (matches.length === 0) {
        resultsBox.innerHTML = '<div style="padding: 12px 16px; font-size: 0.82rem; color: var(--text-dim);">No members found matching "' + escapeHtml(q) + '"</div>';
      } else {
        resultsBox.innerHTML = matches.map(u => `
          <a href="profile.html?user=${encodeURIComponent(u.username)}" class="nav-search-item">
            ${NexovantaDB.getAvatarHtml(u.username, u.avatar_url, 30)}
            <div>
              <div style="font-size: 0.86rem; font-weight: 700;">@${u.username}</div>
              <div style="font-size: 0.72rem; color: var(--text-dim);">${u.full_name || u.role}</div>
            </div>
          </a>
        `).join('');
      }

      resultsBox.style.display = 'block';
    });

    // Close search on click outside
    document.addEventListener('click', (e) => {
      if (!searchInput.contains(e.target) && !resultsBox.contains(e.target)) {
        resultsBox.style.display = 'none';
      }
    });

    // Search on Enter
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const q = searchInput.value.trim().replace(/^@/, '');
        if (q) {
          window.location.href = `profile.html?user=${encodeURIComponent(q)}`;
        }
      }
    });
  }

  // ─── USER NOT FOUND VIEW ───────────────────────────────────────────────────
  function renderUserNotFound(uname) {
    const main = document.getElementById('profileMainApp');
    if (!main) return;

    main.innerHTML = `
      <div class="container" style="padding: 120px 20px; text-align: center;">
        <div style="max-width: 520px; margin: 0 auto; background: var(--bg-card); border: 1px solid var(--border-glow); border-radius: var(--radius-xl); padding: 50px 30px; box-shadow: var(--shadow-cyan);">
          <div style="font-size: 3.5rem; color: var(--accent-cyan); margin-bottom: 16px;"><i class="fa-solid fa-user-slash"></i></div>
          <h2 style="font-size: 1.8rem; margin-bottom: 12px;">Member Not Found</h2>
          <p style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 28px;">
            The username <strong style="color: #fff;">@${escapeHtml(uname)}</strong> does not exist in the Chuka community directory, or may have changed their handle.
          </p>
          <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
            <a href="index.html" class="btn btn-primary"><i class="fa-solid fa-house"></i> Community Feed</a>
            <a href="profile.html?user=${encodeURIComponent(session.username)}" class="btn btn-outline"><i class="fa-solid fa-user"></i> My Profile</a>
          </div>
        </div>
      </div>
    `;
  }

  // ─── UTILITIES ─────────────────────────────────────────────────────────────
  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, m => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[m]);
  }

  function escapeAttr(str) {
    if (!str) return '';
    return str.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
});
