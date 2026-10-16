create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique check (username ~ '^[a-z0-9_]{3,30}$'),
  full_name text not null default '',
  email text not null default '',
  phone text not null default '',
  avatar_url text,
  cover_photo_url text,
  bio text not null default '',
  location text not null default '',
  community_category text not null default 'general',
  privacy_settings jsonb not null default '{"public_posts": true, "show_email": false}'::jsonb,
  role text not null default 'student' check (role in ('student', 'business', 'resident')),
  account_role text not null default 'member' check (account_role in ('member', 'moderator', 'admin')),
  marketplace_shop_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
grant select, insert, update on public.profiles to authenticated;
revoke all on public.profiles from anon;

drop policy if exists "Profiles are readable by their owner" on public.profiles;
create policy "Profiles are readable by their owner"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Profiles are insertable by their owner" on public.profiles;
create policy "Profiles are insertable by their owner"
  on public.profiles for insert
  with check (auth.uid() = id and account_role = 'member');

drop policy if exists "Profiles are updatable by their owner" on public.profiles;
create policy "Profiles are updatable by their owner"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create or replace function public.prevent_profile_role_escalation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if auth.uid() is not null then
    new.account_role := old.account_role;
  end if;
  return new;
end;
$$;

drop trigger if exists prevent_profile_role_escalation on public.profiles;
create trigger prevent_profile_role_escalation
  before update on public.profiles
  for each row execute procedure public.prevent_profile_role_escalation();

create or replace function public.create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (
    id, username, full_name, email, phone, role, community_category, location
  ) values (
    new.id,
    lower(new.raw_user_meta_data ->> 'username'),
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'phone', ''),
    coalesce(new.raw_user_meta_data ->> 'role', 'student'),
    coalesce(new.raw_user_meta_data ->> 'community_category', 'general'),
    coalesce(new.raw_user_meta_data ->> 'location', '')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.create_profile_for_new_user();

create or replace function public.is_username_available(candidate_username text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select candidate_username ~ '^[a-z0-9_]{3,30}$'
    and not exists (
      select 1 from public.profiles
      where username = lower(candidate_username)
        and (auth.uid() is null or id <> auth.uid())
    );
$$;

revoke all on function public.is_username_available(text) from public;
grant execute on function public.is_username_available(text) to anon, authenticated;

drop policy if exists "Public profiles are readable" on public.profiles;

create or replace view public.public_profiles
with (security_invoker = false)
as
select
  id, username, full_name, avatar_url, cover_photo_url, bio, location,
  community_category, role, account_role, marketplace_shop_id, created_at, updated_at
from public.profiles
where coalesce(privacy_settings ->> 'public_posts', 'true') = 'true';

grant select on public.public_profiles to anon, authenticated;

create table if not exists public.platform_records (
  record_type text not null check (record_type in (
    'posts', 'comments', 'reactions', 'events', 'event_rsvps',
    'saved_posts', 'notifications', 'reports', 'news', 'chats', 'messages',
    'shops', 'products', 'orders', 'reviews'
  )),
  record_id text not null,
  owner_id uuid not null references auth.users (id) on delete cascade,
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (record_type, record_id),
  check (jsonb_typeof(data) = 'object')
);

create index if not exists platform_records_owner_idx
  on public.platform_records (owner_id, record_type);
create index if not exists platform_records_type_created_idx
  on public.platform_records (record_type, created_at desc);
create index if not exists platform_records_data_gin_idx
  on public.platform_records using gin (data);

alter table public.platform_records enable row level security;
grant select on public.platform_records to anon, authenticated;
grant insert, update, delete on public.platform_records to authenticated;

create or replace function public.is_platform_moderator()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and account_role in ('moderator', 'admin')
  );
$$;

revoke all on function public.is_platform_moderator() from public;
grant execute on function public.is_platform_moderator() to anon, authenticated;

create or replace function public.is_chat_member(chat_record_id text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select auth.uid() is not null and exists (
    select 1
    from public.platform_records chat
    where chat.record_type = 'chats'
      and chat.record_id = chat_record_id
      and (
        chat.data -> 'participants' ? auth.uid()::text
        or chat.data -> 'members' ? auth.uid()::text
      )
  );
$$;

revoke all on function public.is_chat_member(text) from public;
grant execute on function public.is_chat_member(text) to anon, authenticated;

create or replace function public.can_manage_chat(chat_record_id text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select auth.uid() is not null and exists (
    select 1
    from public.platform_records chat
    where chat.record_type = 'chats'
      and chat.record_id = chat_record_id
      and (
        (
          chat.data ->> 'type' = 'direct'
          and (
            chat.data -> 'participants' ? auth.uid()::text
            or chat.data -> 'members' ? auth.uid()::text
          )
        )
        or chat.data -> 'admin_ids' ? auth.uid()::text
      )
  );
$$;

revoke all on function public.can_manage_chat(text) from public;
grant execute on function public.can_manage_chat(text) to anon, authenticated;

create or replace function public.is_public_post(post_record_id text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.platform_records post
    join public.profiles author on author.id::text = post.data ->> 'author_id'
    where post.record_type = 'posts'
      and post.record_id = post_record_id
      and post.data ->> 'status' = 'published'
      and coalesce(author.privacy_settings ->> 'public_posts', 'true') = 'true'
  );
$$;

revoke all on function public.is_public_post(text) from public;
grant execute on function public.is_public_post(text) to anon, authenticated;

create or replace function public.record_actor_matches_user(
  candidate_type text,
  candidate_data jsonb
)
returns boolean
language sql
stable
set search_path = ''
as $$
  select case candidate_type
    when 'posts' then candidate_data ->> 'author_id' = auth.uid()::text
    when 'comments' then candidate_data ->> 'author_id' = auth.uid()::text
    when 'reactions' then candidate_data ->> 'user_id' = auth.uid()::text
    when 'events' then candidate_data ->> 'organiser_id' = auth.uid()::text
    when 'event_rsvps' then candidate_data ->> 'user_id' = auth.uid()::text
    when 'saved_posts' then candidate_data ->> 'user_id' = auth.uid()::text
    when 'notifications' then candidate_data ->> 'actor_id' = auth.uid()::text
    when 'reports' then candidate_data ->> 'reporter_id' = auth.uid()::text
    when 'news' then candidate_data ->> 'author_id' = auth.uid()::text
    when 'chats' then (
      candidate_data ->> 'created_by' = auth.uid()::text
      or candidate_data -> 'participants' ? auth.uid()::text
    )
    when 'messages' then candidate_data ->> 'sender_id' = auth.uid()::text
    when 'shops' then candidate_data ->> 'owner_id' = auth.uid()::text
    when 'products' then candidate_data ->> 'owner_id' = auth.uid()::text
    when 'orders' then candidate_data ->> 'customer_id' = auth.uid()::text
    when 'reviews' then candidate_data ->> 'user_id' = auth.uid()::text
    else false
  end;
$$;

revoke all on function public.record_actor_matches_user(text, jsonb) from public;
grant execute on function public.record_actor_matches_user(text, jsonb) to authenticated;

create or replace function public.is_marketplace_shop_owner(shop_record_id text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select auth.uid() is not null and exists (
    select 1
    from public.platform_records shop
    where shop.record_type = 'shops'
      and shop.record_id = shop_record_id
      and shop.owner_id = auth.uid()
  );
$$;

revoke all on function public.is_marketplace_shop_owner(text) from public;
grant execute on function public.is_marketplace_shop_owner(text) to anon, authenticated;

create or replace function public.create_marketplace_orders(order_records jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  order_row jsonb;
  item_row jsonb;
  shop_data jsonb;
  product_data jsonb;
  quantity integer;
  stock integer;
  product_price numeric;
  expected_subtotal numeric;
  expected_line_total numeric;
  delivery_fee numeric;
begin
  if auth.uid() is null then
    raise exception 'Sign in before placing an order.';
  end if;
  if order_records is null or jsonb_typeof(order_records) is distinct from 'array' then
    raise exception 'At least one order is required.';
  end if;
  if jsonb_array_length(order_records) = 0 then
    raise exception 'At least one order is required.';
  end if;

  for order_row in select value from jsonb_array_elements(order_records)
  loop
    if order_row ->> 'customer_id' is distinct from auth.uid()::text
      or nullif(btrim(order_row ->> 'id'), '') is null
      or nullif(btrim(order_row ->> 'customer_name'), '') is null
      or nullif(btrim(order_row ->> 'customer_phone'), '') is null then
      raise exception 'Invalid customer or order details.';
    end if;
    if jsonb_typeof(order_row -> 'items') is distinct from 'array' then
      raise exception 'Order items must be an array.';
    end if;
    if jsonb_array_length(order_row -> 'items') = 0 then
      raise exception 'An order must contain at least one item.';
    end if;

    select shop.data into shop_data
    from public.platform_records shop
    where shop.record_type = 'shops'
      and shop.record_id = order_row ->> 'shop_id'
      and coalesce(shop.data ->> 'status', 'open') in ('open', 'active', 'published');
    if not found then
      raise exception 'The selected shop is unavailable.';
    end if;

    expected_subtotal := 0;
    for item_row in select value from jsonb_array_elements(order_row -> 'items')
    loop
      quantity := nullif(item_row ->> 'quantity', '')::integer;
      if quantity is null or quantity < 1 then
        raise exception 'Order quantities must be positive whole numbers.';
      end if;

      select product.data into product_data
      from public.platform_records product
      where product.record_type = 'products'
        and product.record_id = item_row ->> 'product_id'
        and product.data ->> 'shop_id' = order_row ->> 'shop_id'
        and product.data ->> 'status' = 'published'
      for update;
      if not found then
        raise exception 'A product in this order is no longer available.';
      end if;

      stock := nullif(product_data ->> 'stock_quantity', '')::integer;
      product_price := nullif(product_data ->> 'price', '')::numeric;
      if stock is null or product_price is null or stock < quantity then
        raise exception 'A product does not have enough stock.';
      end if;

      expected_line_total := product_price * quantity;
      if item_row ->> 'product_name' is distinct from product_data ->> 'name'
        or nullif(item_row ->> 'unit_price', '')::numeric is distinct from product_price
        or nullif(item_row ->> 'line_total', '')::numeric is distinct from expected_line_total then
        raise exception 'Product prices changed. Refresh the marketplace and try again.';
      end if;
      expected_subtotal := expected_subtotal + expected_line_total;

      update public.platform_records product
      set data = jsonb_set(
        product.data,
        '{stock_quantity}',
        to_jsonb(stock - quantity),
        true
      )
      where product.record_type = 'products'
        and product.record_id = item_row ->> 'product_id';
    end loop;

    delivery_fee := case
      when order_row ->> 'delivery_method' = 'pickup' then 0
      when order_row ->> 'delivery_method' = 'delivery'
        and nullif(btrim(order_row ->> 'delivery_address'), '') is not null then 100
      else null
    end;
    if delivery_fee is null
      or nullif(order_row ->> 'subtotal', '')::numeric is distinct from expected_subtotal
      or nullif(order_row ->> 'delivery_fee', '')::numeric is distinct from delivery_fee
      or nullif(order_row ->> 'total_amount', '')::numeric is distinct from expected_subtotal + delivery_fee
      or order_row ->> 'order_status' is distinct from 'pending_confirmation'
      or (
        order_row ->> 'payment_method' is distinct from 'mpesa'
        and order_row ->> 'payment_method' is distinct from 'cash'
      )
      or order_row ->> 'payment_status' is distinct from (case order_row ->> 'payment_method'
        when 'mpesa' then 'pending_mpesa_verification'
        when 'cash' then 'pay_on_collection'
        else null
      end) then
      raise exception 'Order totals or payment details are invalid.';
    end if;

    insert into public.platform_records (record_type, record_id, owner_id, data)
    values ('orders', order_row ->> 'id', auth.uid(), order_row);
  end loop;
end;
$$;

revoke all on function public.create_marketplace_orders(jsonb) from public;
grant execute on function public.create_marketplace_orders(jsonb) to authenticated;

create or replace function public.update_marketplace_order_status(
  order_record_id text,
  new_status text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new_status is null or new_status not in (
    'pending_confirmation', 'preparing', 'ready_for_pickup', 'delivered', 'cancelled'
  ) then
    raise exception 'Invalid marketplace order status.';
  end if;

  update public.platform_records order_record
  set data = jsonb_set(order_record.data, '{order_status}', to_jsonb(new_status), true),
      updated_at = now()
  where order_record.record_type = 'orders'
    and order_record.record_id = order_record_id
    and public.is_marketplace_shop_owner(order_record.data ->> 'shop_id');

  if not found then
    raise exception 'Order not found or you do not manage its shop.';
  end if;
end;
$$;

revoke all on function public.update_marketplace_order_status(text, text) from public;
grant execute on function public.update_marketplace_order_status(text, text) to authenticated;

create or replace function public.guard_platform_record_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.record_type <> old.record_type
    or new.record_id <> old.record_id
    or new.owner_id <> old.owner_id then
    raise exception 'Platform record identity cannot be changed.';
  end if;

  if old.record_type = 'chats' then
    if (
      old.data -> 'participants' is distinct from new.data -> 'participants'
      or old.data -> 'members' is distinct from new.data -> 'members'
      or old.data -> 'admin_ids' is distinct from new.data -> 'admin_ids'
    ) and old.data ->> 'created_by' <> auth.uid()::text
      and not (old.data -> 'admin_ids' ? auth.uid()::text) then
      raise exception 'Only a group administrator can change chat membership.';
    end if;

    if old.data ->> 'type' = 'direct'
      and (
        old.data -> 'participants' is distinct from new.data -> 'participants'
        or old.data -> 'members' is distinct from new.data -> 'members'
        or old.data -> 'admin_ids' is distinct from new.data -> 'admin_ids'
      ) then
      raise exception 'Direct chat participants cannot be changed.';
    end if;

    if old.data ->> 'type' = 'group'
      and old.data ->> 'created_by' <> auth.uid()::text
      and not (old.data -> 'admin_ids' ? auth.uid()::text)
      and (
        old.data - array['last_message', 'last_message_at', 'last_sender_id', 'last_sender_username', 'updated_at']
      ) is distinct from (
        new.data - array['last_message', 'last_message_at', 'last_sender_id', 'last_sender_username', 'updated_at']
      ) then
      raise exception 'Group members may only update the latest-message details.';
    end if;
  end if;

  if old.record_type = 'messages' and old.owner_id <> auth.uid() then
    if (old.data - 'read_by') is distinct from (new.data - 'read_by')
      or not public.is_chat_member(old.data ->> 'chat_id') then
      raise exception 'Only chat members may update message read state.';
    end if;
    new.data := (old.data - 'read_by') || jsonb_build_object(
      'read_by',
      coalesce(old.data -> 'read_by', '[]'::jsonb) || jsonb_build_array(auth.uid()::text)
    );
  end if;

  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists guard_platform_record_update on public.platform_records;
create trigger guard_platform_record_update
  before update on public.platform_records
  for each row execute procedure public.guard_platform_record_update();

drop policy if exists "Public content and related private records are readable" on public.platform_records;
create policy "Public content and related private records are readable"
  on public.platform_records for select
  using (
    (
      record_type = 'posts'
      and public.is_public_post(record_id)
    )
    or (
      record_type in ('comments', 'reactions')
      and public.is_public_post(data ->> 'post_id')
    )
    or (
      record_type = 'events'
      and data ->> 'status' = 'published'
    )
    or (
      record_type = 'news'
      and data ->> 'status' = 'published'
    )
    or (
      record_type = 'shops'
      and coalesce(data ->> 'status', 'open') in ('open', 'active', 'published')
    )
    or (
      record_type = 'products'
      and data ->> 'status' = 'published'
    )
    or (
      record_type = 'reviews'
      and data ->> 'status' = 'published'
    )
    or owner_id = auth.uid()
    or (record_type = 'notifications' and data ->> 'recipient_id' = auth.uid()::text)
    or (record_type = 'reports' and public.is_platform_moderator())
    or (record_type = 'news' and public.is_platform_moderator())
    or (record_type = 'chats' and public.is_chat_member(record_id))
    or (record_type = 'messages' and public.is_chat_member(data ->> 'chat_id'))
    or (
      record_type = 'orders'
      and public.is_marketplace_shop_owner(data ->> 'shop_id')
    )
  );

drop policy if exists "Users can create owned platform records" on public.platform_records;
create policy "Users can create owned platform records"
  on public.platform_records for insert
  to authenticated
  with check (
    owner_id = auth.uid()
    and public.record_actor_matches_user(record_type, data)
  );

drop policy if exists "Users can update owned platform records" on public.platform_records;
create policy "Users can update owned platform records"
  on public.platform_records for update
  to authenticated
  using (
    owner_id = auth.uid()
    or (record_type = 'chats' and public.is_chat_member(record_id))
    or (record_type = 'messages' and public.is_chat_member(data ->> 'chat_id'))
    or (record_type = 'notifications' and data ->> 'recipient_id' = auth.uid()::text)
    or public.is_platform_moderator()
  )
  with check (
    (
      (
        owner_id = auth.uid()
        and public.record_actor_matches_user(record_type, data)
      )
      or (
        record_type = 'chats'
        and public.is_chat_member(record_id)
      )
      or (
        record_type = 'messages'
        and public.is_chat_member(data ->> 'chat_id')
      )
      or (
        record_type = 'notifications'
        and data ->> 'recipient_id' = auth.uid()::text
      )
      or public.is_platform_moderator()
    )
    and (
      record_type <> 'news'
      or data ->> 'status' <> 'published'
      or owner_id <> auth.uid()
      or public.is_platform_moderator()
    )
  );

drop policy if exists "Users can delete owned platform records" on public.platform_records;
create policy "Users can delete owned platform records"
  on public.platform_records for delete
  to authenticated
  using (
    owner_id = auth.uid()
    or (record_type = 'chats' and public.can_manage_chat(record_id))
    or (record_type = 'notifications' and data ->> 'recipient_id' = auth.uid()::text)
    or public.is_platform_moderator()
  );

create or replace view public.public_event_rsvp_counts
with (security_invoker = false)
as
select
  event.record_id as event_id,
  (count(rsvp.record_id) filter (where rsvp.data ->> 'response' = 'going'))::integer as going_count
from public.platform_records event
left join public.platform_records rsvp
  on rsvp.record_type = 'event_rsvps'
  and rsvp.data ->> 'event_id' = event.record_id
where event.record_type = 'events'
  and event.data ->> 'status' = 'published'
group by event.record_id;

grant select on public.public_event_rsvp_counts to anon, authenticated;