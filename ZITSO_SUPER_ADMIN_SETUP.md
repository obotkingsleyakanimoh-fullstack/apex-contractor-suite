# Zitso Energy — additional Super Admin access

This update adds a one-time, email-verified Super Admin bootstrap for the approved operations mailbox `zitsoglobal@gmail.com`.

## Security design

- No password is embedded in the source tree, SQL migration, or ZIP package.
- The bootstrap is limited to the exact approved email address.
- The role is granted only after Supabase Auth marks that email as verified.
- The one-time allowlist entry is deleted after the role is granted, so a later account cannot reuse the bootstrap.
- The account receives the existing `super_admin` role and therefore inherits the current admin dashboard permissions and role-management controls.
- The existing RLS policies and `set_user_role` RPC remain the mechanism for ongoing staff-role management.

## Apply the update to the live Supabase project

1. Open the Supabase project used by the Zitso Energy website.
2. Open **SQL Editor**.
3. Run `drizzle/migrations/0008_bootstrap_zitso_global_super_admin.sql` in the same project that contains `public.profiles`, `public.user_roles`, and the `public.app_role` enum.
4. In Supabase, open **Authentication → Users**.
5. Use the supported **Invite user** flow for `zitsoglobal@gmail.com` (recommended), or create the account there. The invited user should complete email verification and set their own password.
6. After verification, the database trigger grants the `super_admin` role automatically. If the account already existed and was verified when the migration ran, it is promoted during the migration.
7. Sign in at `https://zitsoenergy.com/auth` using that account's own credentials.
8. Confirm access to `https://zitsoenergy.com/admin`, then open **Admin users & roles** and verify that the account is labelled `super_admin`.

## Password handling

A password was supplied in chat for this request, so it is not copied into project files or SQL. Treat that password as exposed and do not reuse it. Have the account owner set a fresh, unique password through the Supabase invitation/password setup flow. If the account was already created with the shared password, change it immediately after the first sign-in and enable MFA in Supabase Auth where available.

## Important deployment notes

- This SQL must be applied to the actual Supabase project used in production; adding the file to the ZIP alone does not change the live database.
- If Cloudflare/Lovable still reports missing Supabase configuration, fix the correct public Supabase URL and publishable key separately. Do not use a `service_role` or secret key in browser-visible variables.
- The frontend sign-in form is for existing staff accounts. It does not create new Auth users, so use Supabase Authentication to invite/create the new account.
- Do not remove the existing Super Admin account or change the role bootstrap logic unless another trusted Super Admin has been established.
