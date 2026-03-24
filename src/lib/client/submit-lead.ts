/**
 * Shared lead submission — sends form data to Google Apps Script web app
 * which appends to a Google Sheet and sends email notification via Resend.
 */

const SHEET_URL = import.meta.env.PUBLIC_LEAD_WEBHOOK_URL || '';

export interface LeadData {
  form_type: 'signup' | 'contact';
  order_ref?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  provider?: string;
  plan?: string;
  need?: string;
  dob?: string;
  install_date?: string;
  ssn?: string;
  requested_provider?: string;
  requested_provider_slug?: string;
  subject?: string;
  message?: string;
  page_url?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ZIP_RE = /^\d{5}$/;
const MAX_FIELD_LEN = 500;

function sanitize(val: unknown): string {
  if (typeof val !== 'string') return '';
  return val.trim().slice(0, MAX_FIELD_LEN);
}

function validateLead(data: LeadData): string | null {
  if (!data.form_type || !['signup', 'contact'].includes(data.form_type)) {
    return 'Invalid form type';
  }
  if (data.email && !EMAIL_RE.test(data.email)) return 'Invalid email';
  if (data.zip && !ZIP_RE.test(data.zip)) return 'Invalid ZIP code';
  return null;
}

export async function submitLead(data: LeadData): Promise<boolean> {
  // Sanitize all string fields
  const clean: LeadData = {
    form_type: data.form_type,
    page_url: sanitize(data.page_url) || window.location.href,
  };
  const stringKeys: (keyof LeadData)[] = [
    'order_ref', 'first_name', 'last_name', 'phone', 'email', 'address', 'city', 'state', 'zip',
    'provider', 'plan', 'need', 'dob', 'install_date', 'ssn', 'requested_provider', 'requested_provider_slug', 'subject', 'message',
  ];
  for (const key of stringKeys) {
    const val = sanitize(data[key]);
    if (val) (clean as Record<string, string>)[key] = val;
  }

  const error = validateLead(clean);
  if (error) {
    console.error('[Lead] Validation failed:', error);
    return false;
  }

  if (!SHEET_URL) {
    console.error('[Lead] PUBLIC_LEAD_WEBHOOK_URL not configured — lead lost');
    return false;
  }

  try {
    await fetch(SHEET_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' }, // avoid CORS preflight
      body: JSON.stringify(clean),
      mode: 'no-cors', // Google Apps Script doesn't return CORS headers; response is opaque but request succeeds
    });
    // With no-cors the response is opaque (status 0) — treat any non-exception as success
    return true;
  } catch {
    return false;
  }
}
