# Tiwari Dhaba — launch and SEO checklist

## Included in this update
- English-language menu data based on the supplied printed menus, with the listed prices and descriptive menu copy.
- Existing owner/admin panel and order/room booking flows retained.
- A generated illustrative food hero image in WebP format, with descriptive alt text. It is illustrative, not a photo of the actual premises or a guaranteed representation of the served dish.
- Improved image alt text on uploaded menu, room and gallery photos.
- Removed hard-coded Google rating/review-count claims from the public-facing rating display; the public page links to Google until a verified source is configured.
- Corrected room/menu SEO descriptions, allowed mobile zoom, and added robots.txt.
- Sitemap generation during build when `SITE_URL` is configured.

## Before publishing
1. Verify every printed-menu price, spelling and preparation with the owner. The unusual printed label “Fried Rice Chowmein” is retained as a provisional English translation and should be confirmed.
2. In the deployment environment, set `SITE_URL` to the real canonical HTTPS origin (for example `https://your-real-domain.com`). The build script then creates absolute URLs in `dist/public/sitemap.xml`.
3. Confirm the actual street address, telephone, WhatsApp number, operating hours, room prices, room availability, pool access and event-lawn details. Do not publish unverified details as facts.
4. Replace illustrative food imagery with genuine, high-quality photos of the dishes actually served and photos of the real rooms, dining area, entrance, pool and lawn. Upload them through the existing admin panel wherever supported.
5. Create/verify the Google Business Profile, make its name/address/phone/hours consistent with the site, then submit the deployed sitemap in Google Search Console.
6. Test the deployed website on Android and desktop; test order creation, room requests, owner login, image uploads, payment verification, keyboard navigation and reduced-motion settings.

## SEO and AI search visibility
No code or schema guarantees a #1 Google ranking or an AI Overview citation. Improve eligibility with useful, original pages; accurate business facts; genuine photographs and descriptive alt text; crawlable page content; fast mobile performance; trustworthy reviews; and consistent business details. Add FAQ answers only when the business can answer them accurately. Structured data must match visible page content and should not include invented ratings, reviews, prices or amenities.
