import { useEffect } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { Link, useLocation } from 'wouter';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export default function ThankYouPage() {
  const [location] = useLocation();
  const kind = new URLSearchParams(location.split('?')[1] || '').get('kind') || 'visit';

  useEffect(() => {
    window.gtag?.('event', 'thank_you_view', { kind });
  }, [kind]);

  return (
    <section className="standalone-message" aria-labelledby="thank-you-title">
      <span className="standalone-icon"><Check size={24} /></span>
      <p className="eyebrow">Thank you for stopping by</p>
      <h1 id="thank-you-title" className="serif">Your next meal<br /><em>is just around the corner.</em></h1>
      <p className="standalone-copy">For order or room requests, use the confirmation shown after submitting the form. This page is also ready for a configured GA4 thank-you event.</p>
      <Link className="button button-primary magnetic" href="/" data-testid="link-thank-you-home" data-magnetic>Back to Tiwari Dhaba <ArrowRight size={17} /></Link>
    </section>
  );
}
