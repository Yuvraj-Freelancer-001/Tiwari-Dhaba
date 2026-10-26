import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowDown, ArrowRight, ArrowUpRight, BedDouble, Clock3, Images, Leaf, MapPin,
  Star, Waves,
} from 'lucide-react';
import { Link } from 'wouter';
import { useGetBusiness, useListGallery, useListMenu } from '../_vendor/api-client-react';
import type { GalleryImage, MenuItem } from '../_vendor/api-client-react';

const menuCategories = ['Breakfast', 'Lunch', 'Dinner', 'Coffee', 'Sweets'];
const proofSlides = [
  { label: 'Google rating', value: 'rating' },
  { label: 'Guest reviews', value: 'reviews' },
  { label: 'Every day, every hour', value: 'hours' },
] as const;

function OwnerPhotoPlaceholder({ title, className = '' }: { title: string; className?: string }) {
  return (
    <div className={`owner-photo-placeholder grain ${className}`} role="img" aria-label={`${title}; owner-supplied photo not added yet`}>
      <span className="placeholder-symbol"><Images size={20} strokeWidth={1.5} /></span>
      <span className="placeholder-title">{title}</span>
      <span className="placeholder-caption">Owner-supplied photo coming soon</span>
    </div>
  );
}

function MenuSpotlightCard({ item }: { item: MenuItem }) {
  const [objectPosition, setObjectPosition] = useState('50% 50%');
  return (
    <article className="menu-spotlight-card" data-testid={`spotlight-menu-${item.id}`}>
      <Link href="/menu" className="menu-spotlight-image group" aria-label={`View ${item.name} on the full menu`}>
        {item.imagePath ? (
          <img
            src={item.imagePath}
            alt={`${item.name}, a vegetarian menu item offered at Tiwari Dhaba in Kanpur`}
            width={720}
            height={540}
            loading="lazy"
            onPointerMove={event => {
              if (event.pointerType !== 'mouse') return;
              const bounds = event.currentTarget.getBoundingClientRect();
              const x = ((event.clientX - bounds.left) / bounds.width) * 100;
              const y = ((event.clientY - bounds.top) / bounds.height) * 100;
              setObjectPosition(`${x}% ${y}%`);
            }}
            style={{ objectPosition }}
            className="menu-image-track"
          />
        ) : (
          <OwnerPhotoPlaceholder title={`${item.name} photo`} className="h-full" />
        )}
        <span className="image-arrow"><ArrowUpRight size={18} /></span>
      </Link>
      <div className="menu-spotlight-copy">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow">{item.category}</p>
            <h3 className="serif mt-2 text-2xl font-semibold">{item.name}</h3>
          </div>
          <span className="price-pill">{item.priceIsPlaceholder ? 'Ask at counter' : `₹${item.price.toLocaleString('en-IN')}`}</span>
        </div>
        {item.description && <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">{item.description}</p>}
        <span className="mt-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[.12em] text-[var(--olive)]">
          <Leaf size={14} /> Pure vegetarian
        </span>
      </div>
    </article>
  );
}

function MapsSearchLink() {
  return (
    <a
      className="button button-light magnetic"
      href="https://www.google.com/maps/search/?api=1&query=Tiwari+Dhaba+Kanpur"
      target="_blank"
      rel="noopener noreferrer"
      data-testid="link-directions"
      data-magnetic
    >
      Search in Google Maps <ArrowUpRight size={17} />
    </a>
  );
}

export default function LandingPage() {
  const business = useGetBusiness();
  const menuQuery = useListMenu();
  const galleryQuery = useListGallery();
  const [category, setCategory] = useState('All');
  const [proofIndex, setProofIndex] = useState(0);
  const [proofPaused, setProofPaused] = useState(false);
  const menuItems = menuQuery.data || [];
  const galleryItems = galleryQuery.data || [];
  const rating = business.data?.rating ?? 0;
  const reviewCount = business.data?.reviewCount ?? 'Google listing not connected';
  const heroImage = menuItems.find(item => item.available && item.imagePath)?.imagePath
    || galleryItems.find(item => item.imagePath)?.imagePath
    || '/tiwari-dhaba-feast.webp';
  const spotlightItems = menuItems
    .filter(item => item.available && (category === 'All' || item.category === category))
    .slice(0, 3);
  const eventPhotos = galleryItems.filter(item => item.section === 'Lawn/Events').slice(0, 2);
  const ambiencePhotos = galleryItems.filter(item => item.section !== 'Lawn/Events').slice(0, 4);

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion || proofPaused) return;
    const interval = window.setInterval(() => {
      setProofIndex(index => (index + 1) % proofSlides.length);
    }, 4600);
    return () => window.clearInterval(interval);
  }, [proofPaused]);

  const proofValue = proofSlides[proofIndex].value === 'rating'
    ? (rating > 0 ? `${rating} / 5` : 'View Google listing')
    : proofSlides[proofIndex].value === 'reviews'
      ? (rating > 0 ? `${reviewCount} on Google` : 'Read verified reviews')
      : 'Open 24 hours';

  return (
    <div className="landing-page">
      <section className="hero-stage" aria-labelledby="hero-title">
        <div className="hero-grain" aria-hidden="true" />
        <div className="hero-content site-container">
          <div className="hero-copy">
            <p className="hero-kicker" data-hero-reveal><span /> KANPUR · PURE VEGETARIAN</p>
            <h1 id="hero-title" className="hero-title serif">
              <span data-hero-reveal>A good meal.</span>
              <span className="hero-title-accent" data-hero-reveal>Any hour.</span>
            </h1>
            <p className="hero-description" data-hero-reveal>
              Tiwari Dhaba welcomes you for pure vegetarian food in Kanpur, open 24 hours every day.
            </p>
            <div className="hero-actions" data-hero-reveal>
              <Link href="/menu" className="button button-primary magnetic" data-testid="cta-menu" data-magnetic>
                Explore the menu <ArrowRight size={17} />
              </Link>
              <Link href="/rooms" className="button button-outline magnetic" data-testid="cta-rooms" data-magnetic>
                Rooms & pool <Waves size={16} />
              </Link>
            </div>
            <div className="hero-facts" data-hero-reveal>
              <span><Clock3 size={15} /> 24 hours · every day</span>
              <span><MapPin size={15} /> Kanpur, Uttar Pradesh</span>
            </div>
          </div>

          <div
            className="hero-art-wrap"
            data-hero-art
            data-hero-assets-loading={business.isLoading || menuQuery.isLoading || galleryQuery.isLoading ? 'true' : 'false'}
          >
            {heroImage ? (
              <img
                src={heroImage}
                alt="Illustrative Indian vegetarian feast with paneer curry, dal, rice, naan and lassi for Tiwari Dhaba’s menu"
                width={920}
                height={1120}
                loading="eager"
                fetchPriority="high"
                data-hero-asset
                className="hero-owner-image"
              />
            ) : (
              <div className="hero-art" aria-label="Abstract decorative artwork; not a photograph of the dhaba">
                <div className="hero-art-orbit orbit-one" />
                <div className="hero-art-orbit orbit-two" />
                <div className="hero-art-sun" />
                <div className="hero-art-leaf"><Leaf size={72} strokeWidth={0.85} /></div>
                <span className="hero-art-caption">An owner-supplied photo or video can be added here</span>
              </div>
            )}
            <a className="hero-rating-card" data-testid="text-google-rating" href="https://www.google.com/maps/search/?api=1&query=Tiwari+Dhaba+Kanpur" target="_blank" rel="noopener noreferrer" aria-label={rating > 0 ? `${rating} out of 5 on Google; open Google listing` : 'Open Tiwari Dhaba Google listing to view current rating and reviews'}>
              {rating > 0 ? <><div className="rating-stars"><Star size={14} fill="currentColor" /><span>{rating} / 5</span></div><span>{reviewCount} Google reviews</span></> : <><div className="rating-stars"><MapPin size={14}/><span>Find us on Google</span></div><span>View current rating & reviews ↗</span></>}
            </a>
            <span className="hero-side-note">KANPUR · OPEN 24 / 7</span>
          </div>
          <a href="#story" className="hero-scroll-hint" aria-label="Scroll to the Tiwari Dhaba story">
            Scroll to discover <ArrowDown size={15} />
          </a>
        </div>
        <div className="hero-bottom-rule" aria-hidden="true" />
      </section>

      <div className="marquee-strip" aria-label="Pure vegetarian food in Kanpur, open 24 hours">
        <div className="marquee-track" aria-hidden="true">
          {Array.from({ length: 4 }, (_, index) => (
            <span key={index}>PURE VEGETARIAN <i>✳</i> KANPUR <i>✳</i> OPEN 24 HOURS <i>✳</i> A GOOD MEAL, ANY HOUR <i>✳</i></span>
          ))}
        </div>
      </div>

      <section id="story" className="story-section site-container" aria-labelledby="story-title">
        <div className="story-visual" data-reveal>
          <div className="story-frame">
            <div className="story-photo-layer" data-parallax data-depth="20">
              <OwnerPhotoPlaceholder title="Tiwari Dhaba team" className="h-full min-h-[400px]" />
            </div>
            <span className="image-index">01 / KANPUR</span>
          </div>
          <div className="story-stamp" aria-hidden="true"><Leaf size={22} /><span>PURE<br />VEG</span></div>
        </div>
        <div className="story-copy" data-reveal>
          <p className="eyebrow">A welcome, any hour</p>
          <h2 id="story-title" className="section-title serif">A dependable stop<br /><em>on every kind of day.</em></h2>
          <p className="body-copy">
            Tiwari Dhaba is a pure vegetarian stop in Kanpur, open around the clock. Come in for a meal, stay a little longer, or make room for a gathering on the lawn.
          </p>
          <p className="story-quote serif">A good meal. Any hour.</p>
          <p className="fine-print">The owners’ story and team portrait will be added when they provide the approved copy and photo.</p>
          <Link href="/rooms" className="text-link" data-testid="link-story-rooms">Stay a little longer <ArrowRight size={16} /></Link>
        </div>
      </section>

      <section className="menu-section" id="menu" aria-labelledby="menu-title">
        <div className="site-container">
          <div className="section-heading" data-reveal>
            <div>
              <p className="eyebrow">From the kitchen</p>
              <h2 id="menu-title" className="section-title serif">The menu, <em>at your pace.</em></h2>
            </div>
            <Link href="/menu" className="text-link menu-all-link" data-testid="link-full-menu">See the full menu <ArrowUpRight size={17} /></Link>
          </div>
          <div className="menu-tabs" role="tablist" aria-label="Filter menu highlights">
            {['All', ...menuCategories].map(item => (
              <button
                key={item}
                type="button"
                role="tab"
                aria-selected={category === item}
                className={`menu-tab ${category === item ? 'is-active' : ''}`}
                onClick={() => setCategory(item)}
                data-testid={`filter-home-${item.toLowerCase()}`}
              >
                {item}
              </button>
            ))}
          </div>
          {menuQuery.isLoading ? (
            <div className="menu-card-grid" aria-label="Loading menu highlights">
              {[1, 2, 3].map(item => <div key={item} className="menu-skeleton" />)}
            </div>
          ) : menuQuery.isError ? (
            <div className="menu-inline-state" role="status">
              <p>The menu could not load just now.</p>
              <button onClick={() => void menuQuery.refetch()} className="text-link">Try again <ArrowRight size={15} /></button>
            </div>
          ) : spotlightItems.length ? (
            <motion.div layout className="menu-card-grid">
              <AnimatePresence mode="popLayout">
                {spotlightItems.map(item => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 12 }}
                    transition={{ duration: 0.32, ease: 'easeOut' }}
                  >
                    <MenuSpotlightCard item={item} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <div className="menu-inline-state">
              <p>Menu items will appear here when the owner publishes the current menu.</p>
            </div>
          )}
          <p className="menu-price-note">Prices are still being confirmed by the owner. Unconfirmed prices are not charged online.</p>
        </div>
      </section>

      <section className="events-section site-container" id="events" aria-labelledby="events-title">
        <div className="events-heading" data-reveal>
          <div>
            <p className="eyebrow">Gather together</p>
            <h2 id="events-title" className="section-title serif">Make room<br /><em>for a celebration.</em></h2>
          </div>
          <p className="body-copy">The event lawn welcomes gatherings. Ask the owner to confirm space, dates, and arrangements before making plans.</p>
        </div>
        <div className="event-photo-grid">
          {eventPhotos.length ? eventPhotos.map((photo, index) => (
            <EventPhoto key={photo.id} photo={photo} index={index} />
          )) : (
            <>
              <OwnerPhotoPlaceholder title="Event lawn" className="event-photo event-photo-tall" />
              <OwnerPhotoPlaceholder title="Gatherings at Tiwari Dhaba" className="event-photo event-photo-wide" />
            </>
          )}
          <div className="event-note" data-reveal>
            <span className="event-number">02</span>
            <p className="serif">A lawn for<br /><em>the moments that matter.</em></p>
            <Link href="/gallery" className="text-link" data-testid="link-event-gallery">Explore the spaces <ArrowRight size={15} /></Link>
            {business.data?.whatsappNumber ? (
              <a
                href={`https://wa.me/${business.data.whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent('Hello Tiwari Dhaba, I would like to ask about event lawn availability and arrangements.')}`}
                className="text-link mt-3"
                target="_blank"
                rel="noopener noreferrer"
                data-testid="link-event-enquiry"
              >Ask about event availability <ArrowUpRight size={15} /></a>
            ) : (
              <p className="event-owner-note">Event enquiries will be enabled once the owner’s WhatsApp number is added.</p>
            )}
          </div>
        </div>
        <p className="fine-print event-disclaimer">Event photos and response-time information have not been supplied yet. No response-time promise is made here.</p>
      </section>

      <section className="ambience-section" aria-labelledby="ambience-title">
        <div className="site-container">
          <div className="section-heading" data-reveal>
            <div>
              <p className="eyebrow">A look around</p>
              <h2 id="ambience-title" className="section-title serif">The spaces at <em>Tiwari Dhaba.</em></h2>
            </div>
            <Link href="/gallery" className="text-link" data-testid="link-gallery">Open the gallery <ArrowUpRight size={17} /></Link>
          </div>
          <div className="ambience-grid">
            {(ambiencePhotos.length ? ambiencePhotos : [null, null, null, null]).map((photo, index) => (
              <AmbienceTile key={photo?.id ?? `placeholder-${index}`} photo={photo} index={index} />
            ))}
          </div>
          <p className="fine-print mt-5">Photos appear here only after they are supplied by the owner.</p>
        </div>
      </section>

      <section className="proof-section site-container" aria-labelledby="proof-title">
        <div className="proof-intro" data-reveal>
          <p className="eyebrow">What’s confirmed</p>
          <h2 id="proof-title" className="section-title serif">Good to know.<br /><em>Nothing made up.</em></h2>
          <p className="body-copy">The public details below are based on the current business listing. We do not publish unverified guest quotes.</p>
        </div>
        <div
          className="proof-stage"
          data-reveal
          onMouseEnter={() => setProofPaused(true)}
          onMouseLeave={() => setProofPaused(false)}
          onFocusCapture={() => setProofPaused(true)}
          onBlurCapture={() => setProofPaused(false)}
        >
          <div className="proof-card-label"><span className="proof-dot" /> GOOGLE LISTING</div>
          <AnimatePresence mode="wait">
            <motion.div
              key={proofIndex}
              className="proof-card-content"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.34 }}
              aria-live="polite"
              data-testid="text-proof-stat"
            >
              <span className="proof-card-overline">{proofSlides[proofIndex].label}</span>
              <strong className="serif">{proofValue}</strong>
            </motion.div>
          </AnimatePresence>
          <div className="proof-controls" aria-label="Google listing facts">
            {proofSlides.map((slide, index) => (
              <button
                key={slide.value}
                type="button"
                aria-label={`Show ${slide.label}`}
                aria-pressed={proofIndex === index}
                className={`proof-control ${proofIndex === index ? 'is-active' : ''}`}
                onClick={() => setProofIndex(index)}
                data-testid={`button-proof-${slide.value}`}
              />
            ))}
          </div>
          <a
            className="proof-google-link"
            href="https://www.google.com/search?q=Tiwari+Dhaba+Kanpur"
            target="_blank"
            rel="noopener noreferrer"
            data-testid="link-google-reviews"
          >
            View Google listing <ArrowUpRight size={16} />
          </a>
        </div>
      </section>

      <section className="visit-section site-container" id="visit" aria-labelledby="visit-title">
        <div className="visit-map" data-reveal aria-label="Decorative map graphic for Kanpur, not a precise address pin">
          <div className="map-grid-lines" />
          <div className="map-river" />
          <div className="map-label map-label-city">KANPUR</div>
          <div className="map-marker"><span /><span /></div>
          <div className="map-label map-label-dhaba">TIWARI DHABA<br /><small>SEARCH LISTING</small></div>
          <span className="map-caption">Illustrative map · not to scale</span>
        </div>
        <div className="visit-copy" data-reveal>
          <p className="eyebrow">Find your way</p>
          <h2 id="visit-title" className="section-title serif">A stop in <em>Kanpur.</em></h2>
          <p className="body-copy">Tiwari Dhaba, Kanpur, Uttar Pradesh, India. Use the Google Maps search to check the current listing and route; an exact street address has not been provided.</p>
          <div className="visit-details">
            <div><Clock3 size={17} /><span><strong>Open 24 hours</strong><small>Every day</small></span></div>
            <div><Leaf size={17} /><span><strong>Pure vegetarian</strong><small>₹1–200 per menu item</small></span></div>
          </div>
          <p className="fine-print">Parking details have not been confirmed.</p>
          <MapsSearchLink />
        </div>
      </section>

      <section className="faq-section site-container" aria-labelledby="faq-title">
        <div className="faq-heading" data-reveal>
          <p className="eyebrow">Before you arrive</p>
          <h2 id="faq-title" className="section-title serif">A few useful <em>answers.</em></h2>
        </div>
        <div className="faq-list" data-reveal>
          <details className="faq-item">
            <summary>Is Tiwari Dhaba fully vegetarian?<span>+</span></summary>
            <p>Yes. Tiwari Dhaba is a pure vegetarian business.</p>
          </details>
          <details className="faq-item">
            <summary>When is the dhaba open?<span>+</span></summary>
            <p>It is open 24 hours every day.</p>
          </details>
          <details className="faq-item">
            <summary>Can I book a room?<span>+</span></summary>
            <p>Room requests for Premium AC and Non-AC rooms can be submitted online. Availability and prices are confirmed by the owner.</p>
          </details>
          <details className="faq-item">
            <summary>Can I reserve a table or check parking?<span>+</span></summary>
            <p>Table reservations and parking details have not been confirmed online. Please check the Google listing before travelling.</p>
          </details>
          <details className="faq-item">
            <summary>Can the team accommodate dietary requests or large groups?<span>+</span></summary>
            <p>The dhaba is pure vegetarian and has an event lawn. Specific dietary accommodations and event arrangements should be confirmed with the owner.</p>
          </details>
        </div>
      </section>

      <section className="last-call site-container" data-reveal>
        <div>
          <p className="eyebrow">Here whenever you are</p>
          <h2 className="serif">The next stop<br /><em>starts here.</em></h2>
        </div>
        <div className="last-call-actions">
          <Link href="/menu" className="button button-primary magnetic" data-testid="cta-final-menu" data-magnetic>Order food <ArrowRight size={17} /></Link>
          <Link href="/rooms" className="button button-outline magnetic" data-testid="cta-final-rooms" data-magnetic>Explore rooms <BedDouble size={17} /></Link>
        </div>
      </section>
    </div>
  );
}

function EventPhoto({ photo, index }: { photo: GalleryImage; index: number }) {
  return (
    <div className={`event-photo ${index === 0 ? 'event-photo-tall' : 'event-photo-wide'}`} data-reveal>
      {photo.imagePath ? (
        <img src={photo.imagePath} alt={photo.caption || `Owner-supplied photo of Tiwari Dhaba event space ${index + 1}`} width={900} height={700} loading="lazy" />
      ) : (
        <OwnerPhotoPlaceholder title={photo.caption || 'Event lawn'} className="h-full" />
      )}
      <span className="photo-caption">{photo.caption || 'Owner-supplied event photo'}</span>
    </div>
  );
}

function AmbienceTile({ photo, index }: { photo: GalleryImage | null; index: number }) {
  const title = photo?.caption || photo?.section || ['Dining space', 'Rooms', 'Swimming pool', 'Lawn events'][index] || 'Dhaba space';
  return (
    <Link href="/gallery" className={`ambience-tile ambience-tile-${index + 1}`} data-testid={`tile-gallery-${index + 1}`}>
      {photo?.imagePath ? (
        <img src={photo.imagePath} alt={`Owner-supplied photo of ${title} at Tiwari Dhaba`} width={720} height={900} loading="lazy" />
      ) : (
        <OwnerPhotoPlaceholder title={title} className="h-full" />
      )}
      <span className="ambience-tile-label">{title}<ArrowUpRight size={15} /></span>
    </Link>
  );
}
