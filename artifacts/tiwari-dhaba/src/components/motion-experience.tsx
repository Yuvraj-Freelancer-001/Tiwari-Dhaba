import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion';
import { Flame } from 'lucide-react';
import { useLocation } from 'wouter';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

gsap.registerPlugin(ScrollTrigger);

function GoogleAnalytics() {
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID?.trim();
  const [path] = useLocation();

  useEffect(() => {
    if (!measurementId || !/^G-[A-Z0-9]+$/i.test(measurementId)) return;
    window.dataLayer = window.dataLayer || [];
    window.gtag = (...args: unknown[]) => window.dataLayer?.push(args);
    window.gtag('js', new Date());
    window.gtag('config', measurementId, { send_page_view: false });

    if (!document.getElementById('tiwari-ga4-script')) {
      const script = document.createElement('script');
      script.id = 'tiwari-ga4-script';
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
      document.head.appendChild(script);
    }
  }, [measurementId]);

  useEffect(() => {
    if (measurementId) {
      window.gtag?.('event', 'page_view', { page_path: path, page_title: document.title });
    }
  }, [measurementId, path]);

  return null;
}

function Preloader() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let fallbackTimer = 0;
    let exitTimer = 0;
    let active = true;
    let observer: MutationObserver | null = null;
    const imagesReady = new Promise<void>(resolve => {
      const waitForImages = () => {
        const images = Array.from(document.querySelectorAll<HTMLImageElement>('[data-hero-asset]'));
        void Promise.all(
          images.map(image =>
            image.complete
              ? Promise.resolve()
              : new Promise<void>(imageResolve => {
                  image.addEventListener('load', () => imageResolve(), { once: true });
                  image.addEventListener('error', () => imageResolve(), { once: true });
                }),
          ),
        ).then(() => resolve());
      };
      const hero = document.querySelector<HTMLElement>('[data-hero-assets-loading]');
      if (!hero || hero.dataset.heroAssetsLoading !== 'true') {
        waitForImages();
        return;
      }
      observer = new MutationObserver(() => {
        const currentHero = document.querySelector<HTMLElement>('[data-hero-assets-loading]');
        if (!currentHero || currentHero.dataset.heroAssetsLoading !== 'true') {
          observer?.disconnect();
          waitForImages();
        }
      });
      observer.observe(document.body, {
        attributes: true,
        attributeFilter: ['data-hero-assets-loading'],
        childList: true,
        subtree: true,
      });
    });
    const finish = () => {
      if (!active) return;
      active = false;
      observer?.disconnect();
      setVisible(false);
    };

    fallbackTimer = window.setTimeout(finish, 1200);
    void imagesReady.then(() => {
      window.clearTimeout(fallbackTimer);
      exitTimer = window.setTimeout(finish, 80);
    });

    return () => {
      active = false;
      observer?.disconnect();
      window.clearTimeout(fallbackTimer);
      window.clearTimeout(exitTimer);
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="site-preloader"
          initial={{ y: 0 }}
          exit={{ y: '-100%' }}
          transition={{ duration: 0.28, ease: [0.76, 0, 0.24, 1] }}
          role="status"
          aria-label="Loading Tiwari Dhaba"
          data-testid="site-preloader"
        >
          <span className="preloader-mark"><Flame size={25} strokeWidth={1.6} /></span>
          <span className="preloader-name">Tiwari Dhaba</span>
          <span className="preloader-track"><span /></span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function MagneticCursor() {
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState(false);
  const magneticTarget = useRef<HTMLElement | null>(null);
  const x = useMotionValue(-30);
  const y = useMotionValue(-30);
  const springX = useSpring(x, { stiffness: 520, damping: 38, mass: 0.45 });
  const springY = useSpring(y, { stiffness: 520, damping: 38, mass: 0.45 });

  useEffect(() => {
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!finePointer || reducedMotion) return;
    setEnabled(true);
    document.documentElement.classList.add('has-custom-cursor');

    const onMove = (event: PointerEvent) => {
      const target = event.target instanceof Element
        ? event.target.closest<HTMLElement>('a, button, [data-magnetic]')
        : null;
      const previousTarget = magneticTarget.current;
      if (previousTarget && previousTarget !== target) {
        gsap.to(previousTarget, { x: 0, y: 0, duration: 0.34, ease: 'power3.out', overwrite: 'auto' });
      }
      if (target && !target.hasAttribute('disabled')) {
        const bounds = target.getBoundingClientRect();
        x.set(event.clientX + (bounds.left + bounds.width / 2 - event.clientX) * 0.18);
        y.set(event.clientY + (bounds.top + bounds.height / 2 - event.clientY) * 0.18);
        setActive(true);
        if (target.hasAttribute('data-magnetic')) {
          gsap.to(target, {
            x: (event.clientX - (bounds.left + bounds.width / 2)) * 0.11,
            y: (event.clientY - (bounds.top + bounds.height / 2)) * 0.11,
            duration: 0.34,
            ease: 'power3.out',
            overwrite: 'auto',
          });
          magneticTarget.current = target;
        } else {
          magneticTarget.current = null;
        }
      } else {
        x.set(event.clientX);
        y.set(event.clientY);
        setActive(false);
        magneticTarget.current = null;
      }
      setVisible(true);
    };
    const onLeave = () => {
      setVisible(false);
      setActive(false);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    return () => {
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      if (magneticTarget.current) gsap.to(magneticTarget.current, { x: 0, y: 0, duration: 0.24, overwrite: 'auto' });
      document.documentElement.classList.remove('has-custom-cursor');
    };
  }, [x, y]);

  if (!enabled) return null;
  return (
    <motion.div
      className={`magnetic-cursor ${active ? 'is-active' : ''}`}
      style={{ x: springX, y: springY }}
      animate={{ opacity: visible ? 1 : 0, scale: active ? 1.75 : 1 }}
      transition={{ opacity: { duration: 0.18 }, scale: { duration: 0.22 } }}
      aria-hidden="true"
    />
  );
}

export function MotionExperience({ children }: { children: React.ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const [path] = useLocation();

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const lenis = new Lenis({ duration: 1.05, smoothWheel: true, wheelMultiplier: 0.9 });
    const tick = (time: number) => lenis.raf(time * 1000);
    lenisRef.current = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  useEffect(() => {
    const scope = rootRef.current;
    if (!scope) return;
    lenisRef.current?.scrollTo(0, { immediate: true });
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const context = gsap.context(() => {
      if (path === '/') {
        const heroCopy = gsap.utils.toArray<HTMLElement>('[data-hero-reveal]');
        if (heroCopy.length) {
          gsap.fromTo(
            heroCopy,
            { y: 34, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.78, stagger: 0.12, ease: 'power3.out', delay: 0.08 },
          );
        }
        gsap.fromTo(
          '[data-hero-art]',
          { scale: 1.1, opacity: 0.75 },
          { scale: 1, opacity: 1, duration: 1.35, ease: 'power2.out', delay: 0.12 },
        );
      }

      gsap.utils.toArray<HTMLElement>('[data-parallax]').forEach(element => {
        const distance = Number(element.dataset.depth || 20);
        gsap.to(element, {
          yPercent: -distance,
          ease: 'none',
          scrollTrigger: {
            trigger: element.parentElement || element,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        });
      });

      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach(element => {
        gsap.fromTo(
          element,
          { y: 24, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.72,
            ease: 'power2.out',
            immediateRender: false,
            scrollTrigger: { trigger: element, start: 'top 88%', once: true },
          },
        );
      });
      ScrollTrigger.refresh();
    }, scope);

    return () => context.revert();
  }, [path]);

  return (
    <div ref={rootRef} className="motion-experience">
      <Preloader />
      <MagneticCursor />
      <GoogleAnalytics />
      {children}
    </div>
  );
}
