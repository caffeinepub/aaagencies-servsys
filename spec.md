# AAAgencies SerVSys™ — Phase 2B-ii: Membership Tier Pricing Cards

## Current State
- `PublicLandingPage.tsx` has: sticky nav, hero, portal cards, services showcase (AI Agents / SerVSys™ / FinFracFran™), lead capture form, footer.
- No pricing/membership tier section exists on the landing page.
- Four plan tiers are already defined in the backend (Free, Starter, Professional, Enterprise) and used on org badges, but not shown publicly.

## Requested Changes (Diff)

### Add
- **Membership Tier Pricing Section** on `PublicLandingPage.tsx`, inserted between the Services Showcase and the Lead Capture (Early Access) section.
- Four tier cards: Free, Starter, Professional, Enterprise.
- Each card: tier name, price (Free=$0, Starter=$29/mo, Professional=$99/mo, Enterprise=Contact Us), feature bullet list, CTA button.
- Professional tier highlighted as "Recommended" with a visual accent ring.
- Free and Starter CTAs scroll to the lead form (#lead-capture anchor). Enterprise CTA opens portal entry B (agency dashboard).
- Section heading: "Plans for Every Scale" with a "Pricing" eyebrow badge.
- `PRICING_TIERS` data array co-located in the file.
- Footer "Pricing" link updated to anchor `#pricing`.

### Modify
- `PublicLandingPage.tsx`: insert `<PricingSection />` component (defined in the same file) between Services and Lead Capture sections.
- Footer "Pricing" `<button>` replaced with `<a href="#pricing">` for smooth scroll.

### Remove
- Nothing removed.

## Implementation Plan
1. Define `PRICING_TIERS` array with tier name, price, period, feature list, CTA label, CTA action, accent color, and `isRecommended` flag.
2. Add `id="pricing"` anchor to the section.
3. Render a responsive 4-column grid on lg (2-col md, 1-col sm).
4. Recommended card gets a glowing border accent (`#21C7B7`) and a "Recommended" badge chip above the card header.
5. CTA buttons: Free/Starter scroll to `#lead-capture`; Professional scrolls to `#lead-capture`; Enterprise links to `/portal/b`.
6. Update footer Pricing link to `href="#pricing"`.
7. Add `id="lead-capture"` to the Lead Capture section (currently has no id).
