import { useEffect } from 'react';
import { useLocation } from 'wouter';

const pages: Record<string, { title: string; description: string; robots?: string }> = {
  '/': {
    title: 'Tiwari Dhaba | Pure Vegetarian Food in Kanpur',
    description: 'Visit Tiwari Dhaba in Kanpur for pure vegetarian food, open 24 hours every day. Browse the menu, explore rooms, and see the event lawn.',
  },
  '/menu': {
    title: 'Vegetarian Menu in Kanpur | Tiwari Dhaba',
    description: 'Explore Tiwari Dhaba’s vegetarian menu in Kanpur, including paneer curries, dal, naan, paratha, snacks, rice, thalis and refreshing drinks.',
  },
  '/rooms': {
    title: 'Rooms & Swimming Pool in Kanpur | Tiwari Dhaba',
    description: 'Explore AC and Non-AC room options and enquire about a stay at Tiwari Dhaba in Kanpur. Confirm current rates and availability directly with the owner.',
  },
  '/gallery': {
    title: 'Dhaba, Room & Event Lawn Gallery | Tiwari Dhaba',
    description: 'See the spaces at Tiwari Dhaba in Kanpur. Photos are added by the owner and remain clearly marked while awaiting real images.',
  },
  '/reviews': {
    title: 'Google Rating & Reviews | Tiwari Dhaba Kanpur',
    description: 'See the current Google rating and review count for Tiwari Dhaba in Kanpur.',
  },
  '/privacy-policy': {
    title: 'Privacy Information | Tiwari Dhaba',
    description: 'Read how Tiwari Dhaba uses information submitted through online orders, room booking requests, and owner-managed photos.',
  },
  '/thank-you': {
    title: 'Thank You | Tiwari Dhaba',
    description: 'Thank you for visiting Tiwari Dhaba online.',
  },
  '/admin': {
    title: 'Owner Access | Tiwari Dhaba',
    description: 'Secure owner access for managing the Tiwari Dhaba menu, rooms, events, orders, and booking requests.',
    robots: 'noindex, nofollow',
  },
  '/404': {
    title: 'Page Not Found | Tiwari Dhaba',
    description: 'This Tiwari Dhaba page could not be found.',
    robots: 'noindex, nofollow',
  },
};

function setMeta(selector: string, attribute: 'name' | 'property', key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.content = content;
}

export function SeoHead() {
  const [location] = useLocation();
  const path = location.split('?')[0] || '/';

  useEffect(() => {
    const page = pages[path] || pages['/404'];
    document.title = page.title;
    setMeta('meta[name="description"]', 'name', 'description', page.description);
    setMeta('meta[name="robots"]', 'name', 'robots', page.robots || 'index, follow');
    setMeta('meta[property="og:title"]', 'property', 'og:title', page.title);
    setMeta('meta[property="og:description"]', 'property', 'og:description', page.description);
    setMeta('meta[property="og:type"]', 'property', 'og:type', 'website');
    setMeta('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
    setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', page.title);
    setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', page.description);

    const base = new URL(import.meta.env.BASE_URL, window.location.origin);
    const imageUrl = new URL('og-tiwari-dhaba.svg', base).toString();
    const pageUrl = new URL(path.replace(/^\//, ''), base).toString();
    setMeta('meta[property="og:image"]', 'property', 'og:image', imageUrl);
    setMeta('meta[name="twitter:image"]', 'name', 'twitter:image', imageUrl);
    setMeta('meta[property="og:url"]', 'property', 'og:url', pageUrl);

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = pageUrl;
  }, [path]);

  return null;
}
