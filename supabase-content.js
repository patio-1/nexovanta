window.NexovantaCloud = (() => {
  'use strict';

  const collections = {
    nx_posts: 'posts',
    nx_comments: 'comments',
    nx_reactions: 'reactions',
    nx_events: 'events',
    nx_event_rsvps: 'event_rsvps',
    nx_saved_posts: 'saved_posts',
    nx_notifications: 'notifications',
    nx_reports: 'reports',
    nx_news: 'news',
    nx_chats: 'chats',
    nx_chat_messages: 'messages',
    nexovanta_shops_db: 'shops',
    nexovanta_products_db: 'products',
    nexovanta_orders_db: 'orders',
    nexovanta_reviews_db: 'reviews',
  };

  const ownerFields = {
    posts: 'author_id',
    comments: 'author_id',
    reactions: 'user_id',
    events: 'organiser_id',
    event_rsvps: 'user_id',
    saved_posts: 'user_id',
    reports: 'reporter_id',
    news: 'author_id',
    messages: 'sender_id',
    shops: 'owner_id',
    products: 'owner_id',
    orders: 'customer_id',
    reviews: 'user_id',
  };

  let client;

  function reportError(error, operation) {
    console.error(`Supabase ${operation} failed:`, error);
    if (typeof window.showToast === 'function') {
      window.showToast('Cloud data could not be saved. Check your connection and try again.');
    }
  }

  function getClient() {
    if (!window.NexovantaAuth?.isConfigured) return null;
    if (!client) client = window.NexovantaAuth.getClient();
    return client;
  }

  function getRecords(collection, serialized) {
    try {
      const records = JSON.parse(serialized || '[]');
      return Array.isArray(records) ? records : [];
    } catch (error) {
      reportError(error, `local ${collection} data read`);
      return [];
    }
  }

  async function fetchAllRecords(supabase) {
    const records = [];
    const pageSize = 500;
    for (let offset = 0; ; offset += pageSize) {
      const { data, error } = await supabase
        .from('platform_records')
        .select('record_type, record_id, owner_id, data')
        .range(offset, offset + pageSize - 1);
      if (error) throw error;
      records.push(...data);
      if (data.length < pageSize) return records;
    }
  }

  function preserveLegacyCache(storageKey, serialized) {
    if (!serialized || serialized === '[]') return true;
    const backupKey = `nexovanta-legacy-backup:${storageKey}`;
    if (localStorage.getItem(backupKey)) return true;
    try {
      localStorage.setItem(backupKey, serialized);
      return true;
    } catch (error) {
      reportError(error, `legacy ${storageKey} backup`);
      return false;
    }
  }

  async function hydrate() {
    const supabase = getClient();
    if (!supabase) return { changed: false };

    const records = await fetchAllRecords(supabase);
    const { data: profiles, error: profileError } = await supabase
      .from('public_profiles')
      .select('id, username, full_name, avatar_url, cover_photo_url, bio, location, community_category, role, account_role, marketplace_shop_id, created_at, updated_at');
    if (profileError) throw profileError;
    const { data: rsvpCounts, error: rsvpCountError } = await supabase
      .from('public_event_rsvp_counts')
      .select('event_id, going_count');
    if (rsvpCountError) throw rsvpCountError;

    const grouped = new Map(Object.values(collections).map(type => [type, []]));
    records.forEach(({ record_type, data }) => {
      const rows = grouped.get(record_type);
      if (rows) rows.push(data);
    });

    let changed = false;
    Object.entries(collections).forEach(([storageKey, recordType]) => {
      const previous = localStorage.getItem(storageKey) || '[]';
      if (!preserveLegacyCache(storageKey, previous)) return;
      const next = JSON.stringify(grouped.get(recordType));
      if (previous !== next) changed = true;
      localStorage.setItem(storageKey, next);
    });

    let localUsers = [];
    try {
      localUsers = JSON.parse(localStorage.getItem('nx_users') || '[]');
    } catch (error) {
      reportError(error, 'local profile cache read');
    }
    let session = null;
    try {
      session = JSON.parse(localStorage.getItem('nexovanta_user') || 'null');
    } catch (error) {
      reportError(error, 'local session cache read');
    }
    const currentProfile = localUsers.find(user => user.id === session?.id);
    const nextUsers = profiles || [];
    if (currentProfile && !nextUsers.some(user => user.id === currentProfile.id)) {
      nextUsers.push(currentProfile);
    } else if (currentProfile) {
      Object.assign(nextUsers.find(user => user.id === currentProfile.id), currentProfile);
    }
    const previousUsers = localStorage.getItem('nx_users') || '[]';
    const serializedUsers = JSON.stringify(nextUsers);
    if (preserveLegacyCache('nx_users', previousUsers)) {
      if (previousUsers !== serializedUsers) changed = true;
      localStorage.setItem('nx_users', serializedUsers);

      const previousRsvpCounts = localStorage.getItem('nx_event_rsvp_counts') || '{}';
      const serializedRsvpCounts = JSON.stringify(Object.fromEntries(
        (rsvpCounts || []).map(({ event_id, going_count }) => [event_id, going_count])
      ));
      if (previousRsvpCounts !== serializedRsvpCounts) changed = true;
      localStorage.setItem('nx_event_rsvp_counts', serializedRsvpCounts);
    }

    return { changed };
  }

  const ready = hydrate().catch(error => {
    reportError(error, 'initial data load');
    return { changed: false, error };
  });

  ready.then(({ changed }) => {
    const key = `nexovanta-cloud-loaded:${window.location.pathname}`;
    if (!changed || document.readyState === 'loading') {
      sessionStorage.removeItem(key);
      return;
    }
    if (sessionStorage.getItem(key) === '1') return;
    sessionStorage.setItem(key, '1');
    window.location.reload();
  });

  function ownerIdFor(recordType, record) {
    const field = ownerFields[recordType];
    if (field && record[field]) return record[field];
    if (recordType === 'notifications') return record.actor_id || null;
    if (recordType === 'chats') {
      if (record.created_by) return record.created_by;
      const currentUserId = window.NexovantaDB?.Session?.get()?.id;
      if (currentUserId && (record.participants || []).includes(currentUserId)) return currentUserId;
      if (currentUserId && (record.members || []).includes(currentUserId)) return currentUserId;
      return record.participants?.[0] || record.members?.[0] || null;
    }
    if (recordType === 'products') {
      const shopData = getRecords('shops', localStorage.getItem('nexovanta_shops_db'))
        .find(shop => shop.id === record.shop_id);
      return shopData?.owner_id || null;
    }
    return null;
  }

  function recordIdFor(recordType, record) {
    if (recordType === 'saved_posts') return `${record.user_id}:${record.post_id}`;
    return record.id;
  }

  async function syncCollection(storageKey, before, after) {
    const recordType = collections[storageKey];
    const supabase = getClient();
    if (!recordType || !supabase || !window.NexovantaDB?.Session?.isLoggedIn()) return;

    const state = await ready;
    if (state.error) throw new Error(`Cloud initialization failed; ${recordType} was not saved.`);
    const oldRecords = new Map(getRecords(recordType, before).map(record => [String(recordIdFor(recordType, record)), record]));
    const newRecords = getRecords(recordType, after);
    const newById = new Map(newRecords.map(record => [String(recordIdFor(recordType, record)), record]));
    const changedRows = newRecords
      .filter(record => JSON.stringify(oldRecords.get(String(recordIdFor(recordType, record)))) !== JSON.stringify(record))
      .map(record => {
        const id = recordIdFor(recordType, record);
        return {
          record_type: recordType,
          record_id: id == null ? '' : String(id),
          owner_id: ownerIdFor(recordType, record),
          data: record,
        };
      });

    if (changedRows.some(row => !row.record_id || !row.owner_id)) {
      throw new Error(`Cannot save ${recordType}: each changed record needs an id and an owner.`);
    }

    if (changedRows.length) {
      const { error } = await supabase
        .from('platform_records')
        .upsert(changedRows, { onConflict: 'record_type,record_id' });
      if (error) throw error;
    }

    const removedIds = [...oldRecords.keys()].filter(id => !newById.has(id));
    if (removedIds.length) {
      const { error } = await supabase
        .from('platform_records')
        .delete()
        .eq('record_type', recordType)
        .in('record_id', removedIds);
      if (error) throw error;
    }
  }

  function trackStorage(storageKey, before, after) {
    syncCollection(storageKey, before, after).catch(error => {
      reportError(error, `${collections[storageKey] || storageKey} sync`);
    });
  }

  async function createMarketplaceOrders(orders) {
    const supabase = getClient();
    if (!supabase) throw new Error('Supabase is not configured; marketplace orders were not saved.');
    const state = await ready;
    if (state.error) throw new Error('Cloud initialization failed; marketplace orders were not saved.');
    const { error } = await supabase.rpc('create_marketplace_orders', { order_records: orders });
    if (error) throw error;
    return true;
  }

  async function updateMarketplaceOrderStatus(orderId, status) {
    const supabase = getClient();
    if (!supabase) throw new Error('Supabase is not configured; marketplace order status was not saved.');
    const state = await ready;
    if (state.error) throw new Error('Cloud initialization failed; marketplace order status was not saved.');
    const { error } = await supabase.rpc('update_marketplace_order_status', {
      order_record_id: String(orderId),
      new_status: status,
    });
    if (error) throw error;
    return true;
  }

  return { ready, trackStorage, createMarketplaceOrders, updateMarketplaceOrderStatus };
})();
