# Station identity migration

## Current risk

The kiosk uses Supabase anonymous Auth and stores that session in browser storage. `station_id` is a user-editable label, not a durable identity. Clearing site data or changing browser origin creates a new anonymous user; existing rows remain protected by RLS but the kiosk can no longer read them.

Authentication is intentionally unchanged in this release.

## Safe additive migration

1. Add a `stations` table with a generated UUID and a separately stored display name.
2. Add a `station_members` table linking authenticated users to stations and enforce membership with RLS. Never authorize access from a client-supplied station label.
3. Add nullable `station_uuid` to `grading_records`, backfill reviewed records, then add the foreign key. Keep `station_id` during the transition so existing clients and data continue working.
4. Give each deployed kiosk a recoverable authenticated identity owned by an administrator. Migrate its current anonymous user through a controlled enrollment flow before switching ownership policies.
5. Update record and Storage RLS to station membership, verify kiosk/mobile/admin clients, then retire anonymous ownership only after every station is enrolled.

Do not embed a shared user password, service-role key, or reusable station secret in the Vite bundle.
