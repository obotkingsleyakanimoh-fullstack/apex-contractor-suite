-- Zitso Energy: blog / articles
create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content_html text not null default '',
  cover_image_url text,
  author_name text,
  category text,
  tags text[] not null default '{}',
  seo_title text,
  seo_description text,
  og_image_url text,
  published boolean not null default false,
  featured boolean not null default false,
  published_at timestamptz,
  reading_time_minutes integer,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists blog_posts_published_idx on public.blog_posts (published, published_at desc);
create index if not exists blog_posts_category_idx on public.blog_posts (category);
create index if not exists blog_posts_featured_idx on public.blog_posts (featured, sort_order);

create or replace function public.set_blog_post_published_at()
returns trigger
language plpgsql
as $$
begin
  if new.published = true and old.published = false and new.published_at is null then
    new.published_at = now();
  elsif new.published = false then
    new.published_at = null;
  end if;
  return new;
end;
$$;

drop trigger if exists t_blog_post_published_at on public.blog_posts;
create trigger t_blog_post_published_at
before insert or update on public.blog_posts
for each row execute function public.set_blog_post_published_at();

drop trigger if exists t_blog_posts_updated on public.blog_posts;
create trigger t_blog_posts_updated
before update on public.blog_posts
for each row execute function public.set_updated_at();

grant select on public.blog_posts to anon, authenticated;
grant insert, update, delete on public.blog_posts to authenticated;
grant all on public.blog_posts to service_role;

alter table public.blog_posts enable row level security;
drop policy if exists "blog public read published" on public.blog_posts;
create policy "blog public read published" on public.blog_posts
for select to anon, authenticated
using (published = true or public.is_staff(auth.uid()));

drop policy if exists "blog staff write" on public.blog_posts;
create policy "blog staff write" on public.blog_posts
for all to authenticated
using (public.is_staff(auth.uid()))
with check (public.is_staff(auth.uid()));
