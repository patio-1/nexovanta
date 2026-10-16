/**
 * auth-guard.js — Nexovanta Authentication Guard
 * 
 * Include this script after supabase-auth.js on every protected page.
 * Supabase is the authentication authority; the local DB session is only a
 * compatibility profile for existing page code.
 * 
 * Usage:
 *   <script src="supabase-auth.js"></script>
 *   <script src="nexovanta-db.js"></script>
 *   <script src="auth-guard.js"></script>
 */

(function () {
  'use strict';

  document.documentElement.style.visibility = 'hidden';

  var returnPath = window.location.pathname + window.location.search;
  var loginUrl = 'login.html';
  if (returnPath && returnPath !== '/' && returnPath !== '/login.html') {
    loginUrl += '?return=' + encodeURIComponent(returnPath);
  }

  window.NexovantaAuth.getCurrentProfile()
    .then(function (profile) {
      if (!profile) {
        window.location.replace(loginUrl);
        return;
      }
      document.documentElement.style.visibility = '';
    })
    .catch(function (error) {
      console.error('Supabase session validation failed:', error);
      window.location.replace(loginUrl);
    });
})();
