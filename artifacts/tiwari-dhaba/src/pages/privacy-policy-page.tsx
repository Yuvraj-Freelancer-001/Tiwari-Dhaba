import { Link } from 'wouter';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <article className="policy-page">
      <Link href="/" className="text-link" data-testid="link-policy-back"><ArrowLeft size={15} /> Back to Tiwari Dhaba</Link>
      <div className="policy-heading">
        <span className="standalone-icon"><ShieldCheck size={22} /></span>
        <p className="eyebrow">Privacy information</p>
        <h1 className="serif">Your information,<br /><em>handled with care.</em></h1>
        <p className="standalone-copy">Last reviewed: October 2026. This page describes the current site flows; the owner should confirm contact and data-retention details before publication.</p>
      </div>
      <div className="policy-content">
        <section>
          <h2>Information used for orders and room requests</h2>
          <p>When you submit an order or a room request, the site asks for your name and mobile number. Orders also include the selected menu items and fulfilment choice. Room requests include dates, guest count, and room type. This information is used to process and manage your request.</p>
        </section>
        <section>
          <h2>Online payments</h2>
          <p>If online payment is enabled, checkout is provided by Razorpay. The site records payment status and a payment reference after the server verifies the payment. The site does not ask you to enter card details into its own forms.</p>
        </section>
        <section>
          <h2>Owner login and photos</h2>
          <p>The owner area uses a session cookie to keep the owner signed in. Photos uploaded by the owner for the menu, rooms, or gallery are made public on this website.</p>
        </section>
        <section>
          <h2>Analytics</h2>
          <p>When the owner configures a Google Analytics 4 measurement ID, the site records page views and events such as order submissions and room requests. Analytics is not loaded while that ID is unset. Event parameters do not include customer names, mobile numbers, or order contents.</p>
        </section>
        <section>
          <h2>External services</h2>
          <p>Google Maps, Google reviews, Razorpay, and WhatsApp may process information under their own privacy policies when you follow those links or use their services.</p>
        </section>
        <section>
          <h2>Contact and retention</h2>
          <p>The owner has not yet provided a privacy contact or data-retention schedule for this page. Please confirm those details with Tiwari Dhaba before relying on this page as a complete policy.</p>
        </section>
      </div>
    </article>
  );
}
