/* Supabase Auth and profile bridge for the existing static frontend. */
window.NexovantaAuth = (() => {
  const config = window.NEXOVANTA_SUPABASE_CONFIG || {};
  const isConfigured = Boolean(
    config.url &&
    config.anonKey &&
    !config.url.includes('YOUR_') &&
    !config.anonKey.includes('YOUR_')
  );

  let client = null;

  function getClient() {
    if (!isConfigured) {
      throw new Error('Supabase is not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY in .env, then run node server.js.');
    }
    if (!window.supabase?.createClient) {
      throw new Error('Supabase client failed to load. Check your network connection and reload.');
    }
    if (!client) client = window.supabase.createClient(config.url, config.anonKey);
    return client;
  }

  function toLegacyProfile(profile, email) {
    return {
      ...profile,
      email: profile.email || email || '',
      category: profile.community_category,
      public_posts: profile.privacy_settings?.public_posts ?? true,
      roleTitle: profile.role === 'student' ? 'Chuka Student'
        : profile.role === 'business' ? 'Chuka Merchant'
          : 'Chuka Resident',
      loggedIn: true,
    };
  }

  async function getProfile(user) {
    const { data, error } = await getClient()
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    if (error) throw error;
    return toLegacyProfile(data, user.email);
  }

  function cacheProfile(profile) {
    if (window.NexovantaDB?.Users?.upsert) {
      const { loggedIn, roleTitle, ...cachedProfile } = profile;
      window.NexovantaDB.Users.upsert(cachedProfile);
    }
    if (window.NexovantaDB?.Session) window.NexovantaDB.Session.set(profile);
    return profile;
  }

  return {
    isConfigured,

    getClient,

    async signIn(email, password) {
      const { data, error } = await getClient().auth.signInWithPassword({ email, password });
      if (error) throw error;
      return cacheProfile(await getProfile(data.user));
    },

    async signUp({ email, password, profile }) {
      const { data, error } = await getClient().auth.signUp({
        email,
        password,
        options: { data: profile },
      });
      if (error) throw error;
      return {
        user: data.user,
        profile: data.session ? cacheProfile(await getProfile(data.user)) : null,
        needsEmailConfirmation: !data.session,
      };
    },

    async getCurrentProfile() {
      const { data, error } = await getClient().auth.getSession();
      if (error) throw error;
      if (!data.session?.user) return null;
      return cacheProfile(await getProfile(data.session.user));
    },

    async isUsernameAvailable(username) {
      const { data, error } = await getClient().rpc('is_username_available', {
        candidate_username: username,
      });
      if (error) throw error;
      return data;
    },

    async updateProfile(changes) {
      const { data: userData, error: userError } = await getClient().auth.getUser();
      if (userError) throw userError;
      if (!userData.user) throw new Error('Your session has expired. Please sign in again.');

      const allowed = [
        'username', 'full_name', 'bio', 'location', 'role', 'phone',
        'avatar_url', 'cover_photo_url', 'community_category', 'privacy_settings',
        'marketplace_shop_id',
      ];
      const updates = Object.fromEntries(
        Object.entries(changes).filter(([key]) => allowed.includes(key))
      );
      if (changes.category !== undefined) updates.community_category = changes.category;
      if (changes.public_posts !== undefined) {
        updates.privacy_settings = { public_posts: Boolean(changes.public_posts) };
      }

      const { data, error } = await getClient()
        .from('profiles')
        .update(updates)
        .eq('id', userData.user.id)
        .select('*')
        .single();
      if (error) throw error;
      return cacheProfile(toLegacyProfile(data, userData.user.email));
    },

    async resetPassword(email) {
      const { error } = await getClient().auth.resetPasswordForEmail(email);
      if (error) throw error;
    },

    async signOut() {
      const { error } = await getClient().auth.signOut({ scope: 'local' });
      if (error) throw error;
      if (window.NexovantaDB?.Session) window.NexovantaDB.Session.clear();
    },
  };
})();