# Supabase Setup

1. Create a Supabase project and run `supabase-migration.sql` in its SQL Editor.
2. Put the project URL and public anon key in your ignored `.env` file using the names in `.env.example`. Never put a service-role key in this frontend server.
3. Run `node server.js` (or `npm start`) from the project directory and open `http://127.0.0.1:3000`. The server reads `.env` and provides the public Supabase config to the browser; restart it after changing `.env`.
4. The anon key is intended for browser use; database access must remain protected by RLS.
5. In Supabase Auth URL configuration, set the site URL to `http://127.0.0.1:3000` for local development and allow the local/hosted redirect URLs. `file://` pages are not a supported Auth origin.
6. Test registration with an email address. When email confirmation is enabled, users must confirm before signing in. New accounts receive the `member` account role; grant moderator/admin roles only through a trusted server or SQL administration.

## Deployment

Deploy to a Node.js host with `npm start` as its start command. Set `SUPABASE_URL` and `SUPABASE_ANON_KEY` in the host's environment settings; the server binds to `0.0.0.0` and honors the host's `PORT`. Add the production site's origin and redirect URLs to Supabase Auth URL configuration. Do not deploy the local `.env` file.

Authentication and profile reads/writes now use Supabase. The existing browser data layer remains in use for posts, comments, reactions, events, news, marketplace listings, chats, and messages; those domains are not migrated by this first phase.

Existing browser-only accounts are not imported by this setup. Their local password hashes are removed, so existing users must register with Supabase or be migrated through a separately planned, trusted account-import process.