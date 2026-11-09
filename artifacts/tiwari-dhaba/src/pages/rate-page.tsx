import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUpRight, Check, Sparkles, X } from 'lucide-react';
import QRCode from 'qrcode';
import { GOOGLE_REVIEW_URL } from '../lib/business';

// Keep phrasing consistent with what guests can actually select below —
// these are not pre-written opinions, only sentence scaffolding around the
// options a guest chooses for themselves.
const OPENINGS = [
  'I visited Tiwari Dhaba in Kanpur and my experience stood out for',
  'At Tiwari Dhaba in Kanpur, I particularly appreciated',
  'My visit to Tiwari Dhaba in Kanpur was notable for',
];
const CLOSINGS = [
  'Overall, these were the highlights of my visit.',
  'These are the things I genuinely appreciated during my visit.',
  'That is what stood out to me about this visit.',
];

const GROUPS: { title: string; icon: string; category: 'food' | 'service' | 'value'; tags: string[] }[] = [
  {
    title: 'Popular food delights',
    icon: '😋',
    category: 'food',
    tags: [
      'Kadhai Paneer', 'Paneer Pakora & chutney', 'Special Thali',
      'Crispy tandoori roti', 'Pure veg food', 'Special chai',
    ],
  },
  {
    title: 'Service & ambience',
    icon: '⚡',
    category: 'service',
    tags: ['Fast service', 'Polite and helpful staff', 'Clean washrooms & parking', 'Great place for family'],
  },
  {
    title: 'Overall value',
    icon: '💎',
    category: 'value',
    tags: ['Affordable price', 'Value for money', 'Highly recommended'],
  },
];

function buildReview(tags: string[]): string {
  if (!tags.length) return '';
  const byCategory = (category: string) =>
    GROUPS.find(g => g.category === category)?.tags.filter(t => tags.includes(t)) ?? [];
  const food = byCategory('food');
  const service = byCategory('service');
  const value = byCategory('value');
  const parts: string[] = [];
  if (food.length) parts.push(`the food, including ${food.join(', ')}`);
  if (service.length) parts.push(`the service and ambience, especially ${service.join(', ')}`);
  if (value.length) parts.push(`overall value, including ${value.join(', ')}`);
  const opening = OPENINGS[Math.floor(Math.random() * OPENINGS.length)];
  const closing = CLOSINGS[Math.floor(Math.random() * CLOSINGS.length)];
  return `${opening} ${parts.join('; ')}. ${closing}`;
}

async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through to legacy path */
  }
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  let copied = false;
  try { copied = document.execCommand('copy'); } catch { copied = false; }
  textarea.remove();
  return copied;
}

export default function RatePage() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showWarning, setShowWarning] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>();

  const review = useMemo(() => buildReview([...selected]), [selected]);

  useEffect(() => {
    if (typeof window === 'undefined' || window.location.hostname === 'localhost') return;
    QRCode.toDataURL(window.location.href.split('#')[0], { width: 220, margin: 1, color: { dark: '#281a14', light: '#f8f5ec' } })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(null));
  }, []);

  function toggle(tag: string) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag); else next.add(tag);
      return next;
    });
  }

  function showToast(message: string) {
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }

  async function handleContinue() {
    if (!review) { setShowWarning(true); return; }
    setSubmitting(true);
    const copied = await copyText(review);
    if (copied) {
      showToast('Review copied! Opening Google...');
      window.setTimeout(() => { window.location.href = GOOGLE_REVIEW_URL; }, 1400);
    } else {
      showToast('Could not copy automatically — please copy the text above.');
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl px-1 py-2">
      <header className="mb-7 text-center">
        <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl border border-[var(--rust)]/25 bg-[var(--rust)]/10 text-[var(--rust)]">
          <Sparkles size={26} strokeWidth={1.6} />
        </div>
        <p className="mb-2 text-[11px] font-bold uppercase tracking-[.26em] text-[var(--rust)]">A taste of Kanpur</p>
        <h1 className="serif text-3xl font-bold text-[var(--ink)] sm:text-4xl">Rate your experience</h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[var(--ink-soft)]">Aapka experience kaisa raha? Jo baat achhi lagi wo select karein.</p>
      </header>

      <section aria-labelledby="experience-title" className="rounded-[1.7rem] border border-[#e0d7c6] bg-[var(--card,#fff)] bg-white p-4 shadow-[var(--shadow-warm)] sm:p-6">
        <div className="mb-5 flex items-start gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[var(--saffron)]/20 text-lg" aria-hidden="true">✨</span>
          <div>
            <h2 id="experience-title" className="font-bold text-[var(--ink)]">What stood out to you?</h2>
            <p className="mt-1 text-xs leading-5 text-[var(--ink-soft)]">Select every option that genuinely matches your visit.</p>
          </div>
        </div>

        <div className="space-y-5">
          {GROUPS.map(group => (
            <section key={group.category}>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-[var(--ink)]">
                <span aria-hidden="true">{group.icon}</span> {group.title}
              </h3>
              <div className="flex flex-wrap gap-2">
                {group.tags.map(tag => {
                  const active = selected.has(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggle(tag)}
                      aria-pressed={active}
                      className={`inline-flex min-h-10 items-center gap-2 rounded-full border px-3.5 py-2 text-left text-xs font-medium transition ${
                        active
                          ? 'border-[var(--rust)] bg-[var(--rust)]/12 text-[var(--rust)] shadow-[0_0_0_1px_rgba(158,70,40,.12)_inset]'
                          : 'border-[#e0d7c6] bg-[#faf4e7] text-[var(--ink)] hover:border-[var(--rust)]/40'
                      }`}
                    >
                      <span>{tag}</span>
                      {active && <Check size={13} />}
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-[#e0d7c6] bg-[#faf4e7] p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-sm font-bold text-[var(--rust)]">Your ready-made review</h2>
            <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-[var(--ink-soft)]">{selected.size} selected</span>
          </div>
          <p aria-live="polite" className="min-h-24 text-sm leading-7 text-[var(--ink)]">
            {review || 'Choose the options that match your visit and your review will appear here.'}
          </p>
          <p className="mt-3 border-t border-[#e0d7c6] pt-3 text-[11px] leading-5 text-[var(--ink-soft)]">
            Please read the preview before posting. You can choose not to post if it doesn't accurately describe your experience.
          </p>
        </div>

        <button
          type="button"
          onClick={handleContinue}
          disabled={submitting}
          className="mt-5 flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--rust)] px-5 py-4 text-sm font-extrabold text-[var(--paper)] transition hover:brightness-110 active:scale-[.99] disabled:opacity-70"
        >
          <ArrowUpRight size={18} />
          Copy review & go to Google
        </button>
        <p className="mt-3 text-center text-[10px] leading-5 text-[var(--ink-soft)]">Your review is optional. Please share only feedback that reflects your actual visit.</p>
      </section>

      <section aria-labelledby="qr-title" className="mt-5 rounded-[1.7rem] border border-[#e0d7c6] bg-white p-5 text-center shadow-[var(--shadow-warm)] sm:p-6">
        <p className="mb-2 text-[11px] font-bold uppercase tracking-[.22em] text-[var(--rust)]">Scan to share your experience</p>
        <h2 id="qr-title" className="serif text-xl font-bold text-[var(--ink)]">Tiwari Dhaba review</h2>
        <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-[var(--ink-soft)]">Print this at a table — scanning opens this page, then Google.</p>
        <div className="mx-auto mt-4 inline-block rounded-2xl bg-white p-3 shadow-[var(--shadow-warm)]">
          {qrDataUrl
            ? <img src={qrDataUrl} alt="QR code linking to this review page" width={190} height={190} />
            : <div className="grid h-[190px] w-[190px] place-items-center text-center text-xs text-[var(--ink-soft)]">QR appears once the page is live online.</div>}
        </div>
      </section>

      {toast && (
        <div role="status" aria-live="polite" className="fixed bottom-24 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 items-center gap-3 rounded-2xl border border-[var(--rust)]/25 bg-[#2b1a14] px-4 py-3.5 text-white shadow-2xl sm:bottom-5">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-emerald-400/20 text-emerald-300"><Check size={16} /></span>
          <span className="text-sm font-semibold">{toast}</span>
        </div>
      )}

      {showWarning && (
        <div role="dialog" aria-modal="true" aria-labelledby="warning-title" className="fixed inset-0 z-[60] grid place-items-center bg-black/60 p-5 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-[1.7rem] border border-[#e0d7c6] bg-white p-6 text-center shadow-2xl">
            <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-[var(--saffron)]/20 text-2xl" aria-hidden="true">☝️</div>
            <h2 id="warning-title" className="text-lg font-bold text-[var(--ink)]">One quick step</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">Please select at least one option before continuing.</p>
            <button
              type="button"
              onClick={() => setShowWarning(false)}
              className="mt-5 flex min-h-11 w-full items-center justify-center gap-1 rounded-xl bg-[var(--rust)] px-4 py-3 text-sm font-bold text-[var(--paper)]"
            >
              <X size={14} /> Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
