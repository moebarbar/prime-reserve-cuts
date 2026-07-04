# Verifying subscription billing sync (Stripe test mode)

The customer dashboard re-prices the live Stripe subscription when a member edits
their cuts/quantities, and cancels the subscription when they cancel. The DB is
always authoritative; Stripe is synced best-effort and the API reports whether it
succeeded (`billingSynced`). Use this checklist to confirm the Stripe side in
**test mode** before relying on it.

## Setup
1. Ensure the app is pointed at **Stripe test keys** (`STRIPE_SECRET_KEY=sk_test_…`,
   `STRIPE_WEBHOOK_SECRET=whsec_…` from a test-mode webhook endpoint).
2. Run `scripts/customer-accounts.sql` against the database first.
3. (Optional) Set `STRIPE_WEEKLY_PRODUCT_ID` to a test-mode Product id to avoid
   creating an ad-hoc "Weekly local beef order" product on the first edit.

## Happy path
1. Complete a **weekly subscription** checkout with card `4242 4242 4242 4242`.
   Create a username + password at the details step.
2. Confirm the webhook created the order: it should be `active` with a
   `stripe_subscription_id` (check the DB or admin → Orders).
3. Sign in at `/account/login` → the dashboard shows the subscription.
4. **Edit quantities** (e.g. bump Ribeye from 2→4 lb), click **Save changes**.
   - Expect the toast: "Updated — your next weekly invoice reflects the change."
   - In the Stripe **test** dashboard → Subscriptions → this subscription:
     the item price should now equal the new weekly total, and the **upcoming
     invoice** should match the dashboard's weekly total.
5. **Add / remove a cut**, Save, and re-check the upcoming invoice total.
6. **Skip next week** → the dashboard's next-delivery date advances 7 days.
   (Skip is a delivery-schedule change only; it does not change Stripe billing.)
7. **Pause / Resume** → order status flips in the DB and the manifest; billing is
   unaffected (pause is our delivery pause, not a Stripe pause).
8. **Cancel** → the Stripe subscription moves to `canceled` in the test dashboard
   and the order becomes `cancelled` (leaves the delivery manifest).

## Failure handling to verify
- Temporarily break the Stripe key and edit an order: Save should still succeed
  (DB updates) and show a warning that billing didn't sync. Nothing is corrupted.
- Editing a **one-time** order is blocked (it's already paid) — the dashboard
  shows it read-only with a "contact us" note.

## Notes
- Quantity edits use `proration_behavior: 'none'`, so the new amount applies from
  the **next** weekly invoice, not as an immediate proration.
- Edits collapse the subscription to a single weekly line item billing the correct
  total; the per-cut breakdown lives in our DB (and on the delivery manifest).
