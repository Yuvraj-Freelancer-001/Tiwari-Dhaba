// Single source of truth for Tiwari Dhaba's real-world business details.
// Update these values here when the owner confirms a change — every page
// that mentions the address, directions link, or review link reads from
// this file instead of hardcoding its own copy.

export const BUSINESS_NAME = "Tiwari Dhaba";

export const BUSINESS_ADDRESS = {
  line1: "NH 19, Bhautipratappur",
  line2: "Near Bhaunti",
  locality: "Kanpur",
  region: "Uttar Pradesh",
  postalCode: "209305",
  country: "IN",
} as const;

export const BUSINESS_ADDRESS_FULL =
  "Tiwari Dhaba, NH 19, Bhautipratappur, near Bhaunti, Kanpur, Uttar Pradesh 209305";

// Verified Google Maps place link (owner-supplied) — used for every
// "Get Directions" / "Open in Google Maps" action across the site.
export const GOOGLE_MAPS_URL = "https://maps.app.goo.gl/TcJkJSTgZrZQ2Qn39";

// Verified Google "write a review" link (owner-supplied) — used by the
// review funnel and any "Rate Your Experience" entry point.
export const GOOGLE_REVIEW_URL =
  "https://www.google.com/searchviewer/43?sca_esv=0870488b18ab7d11&output=search&hl=en-IN&gl=in&svid=CAESxQEKuQEStgEKd0FERGJXZVoxZWhNRGtpTkhfdFNyaVRCR0RXbEZyTEVqRzJiUjFlTXZ5aEpjUmdNQmM2SzhWbFloc1p2b3ZvRjNJX2FlWkdiMXBzd1RrZlFzTm1YWkp4Vkp2U2dxV3c0emhWeEJIU3RjQXgwanZkZHpETExfR0swEhd0OTd1YXJQRUhabnFrdlFQMnFQcTJBZxoiQUhOMEU3R2tyM2RHSzU0TWNwZzhyQzFSU1JaVlh6VEtCURIEODA1MRoBMxgr";
