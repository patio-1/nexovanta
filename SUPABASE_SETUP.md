# Supabase Setup

1. Create a Supabase project and run the full `supabase-migration.sql` in its SQL Editor.
2. Put the project URL and public anon key in your ignored `.env` file using the names in `.env.example`. The current public project URL and anon key are also embedded as browser-side fallbacks in `supabase-auth.js`; the config served by the local server or deployment environment takes precedence. Never put a service-role key in this frontend server or browser code.
3. Run `node server.js` (or `npm start`) from the project directory and open `http://127.0.0.1:3000`. The server reads `.env` and provides the public Supabase config to the browser; restart it after changing `.env`.
4. The anon key is intended for browser use. Profile and shared-content access is protected by row-level security (RLS); never put a service-role key in the browser or server configuration.
5. In Supabase Auth URL configuration, set the site URL to `http://127.0.0.1:3000` for local development and allow the local/hosted redirect URLs. `file://` pages are not a supported Auth origin.
6. Test registration with an email address. When email confirmation is enabled, users must confirm before signing in. New accounts receive the `member` account role; grant moderator/admin roles only through a trusted server or SQL administration.

## Deployment

This project is a browser-rendered HTML/JavaScript app, not a Next.js app. Deploy it to Vercel with the **Other** framework preset. The checked-in `vercel.json` explicitly builds the HTML, CSS, browser scripts, and media as static assets, and builds only `api/supabase-config.js` as a serverless function. It also routes `/` directly to `index.html`; the browser globals in scripts are never evaluated in Node.js. The main browser script is named `site.js` so Vercel cannot mistake it for a Node.js application entry point. Do not override the build or output settings in the Vercel dashboard; the repository config defines them.

In Vercel's project settings, set `SUPABASE_URL` and `SUPABASE_ANON_KEY` as environment variables for the Production and Preview environments you use. Do not deploy `.env`. Vercel routes `/supabase-config.js` to the function, matching the local Node server's behavior. Add the production site's origin and redirect URLs to Supabase Auth URL configuration.

Alternatively, deploy to a Node.js host with `npm start` as its start command. Set the same environment variables there; `server.js` binds to `0.0.0.0` and honors the host's `PORT`.

If you are migrating these pages into Next.js separately, keep browser-only scripts out of server-rendered modules. Render them only in client components after mount, or use a client-only dynamic import with server-side rendering disabled; the existing HTML site does not require that migration to deploy on Vercel.

Authentication, profiles, posts, comments, reactions, events and RSVPs, news, marketplace listings/orders/reviews, chats, messages, notifications, reports, and saved posts use Supabase as their shared data store. The browser retains a local cache for the existing synchronous page code; changes are synchronized to Supabase and refreshed when pages load. Marketplace checkout validates current product prices and stock and creates orders atomically in Supabase. The shopping cart and marketplace wishlist remain browser-local.

Existing browser-only accounts and their local content are not automatically imported by this setup. Their local password hashes are removed, so existing users must register with Supabase or be migrated through a separately planned, trusted account-import process. When Supabase is configured, demo seed accounts and sample marketplace orders are no longer created; content appears after users publish it or it is migrated.

For safety, any pre-existing browser content cache is retained under localStorage keys prefixed with `nexovanta-legacy-backup:` before the app switches that collection to cloud data. These backups are browser-specific and are not a substitute for a trusted import; export or migrate them separately if they contain data you need.