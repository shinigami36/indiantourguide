// Shared enquiry-form constants used by both the inline <Contact/> form
// and the pop-up <EnquiryModal/>. Kept out of components so editing the
// list of tours / hotel options in one place updates both surfaces.

export const INDIA_TOUR_KEYS = [
  'tours.goldenTriangle.title',
  'tours.agraFullDay.title',
  'tours.jaipurDay.title',
  'tours.delhiOldHalfDay.title',
  'tours.delhiNewHalfDay.title',
  'tours.delhiFullDay.title',
  'tours.goldenTriangleMumbai.title',
  'tours.goldenTriangleVaranasi.title',
];

export const INTL_TOUR_KEYS = [
  'tours.turkishDelight9D.title',
  'tours.istanbulCappadocia7D.title',
  'tours.sevenChurches8D.title',
];

export const ALL_TOUR_KEYS = [...INDIA_TOUR_KEYS, ...INTL_TOUR_KEYS];

export const HOTEL_OPTIONS = [
  { value: '3 Star', labelKey: 'contact.hotel.3star' },
  { value: '4 Star', labelKey: 'contact.hotel.4star' },
  { value: '5 Star', labelKey: 'contact.hotel.5star' },
];

export const CATEGORY_OPTIONS = [
  { value: 'india',         label: '🇮🇳 India' },
  { value: 'international', label: '🌍 International' },
  { value: 'both',          label: '✈️ Both' },
];

export const EMPTY_FORM = {
  name: '',
  email: '',
  phone: '',
  country: '',
  startDate: '',
  endDate: '',
  noHotelRequired: false,
  hotelCategory: '',
  adults: 1,
  children: 0,
  message: '',
  // Honeypot — hidden from humans; the server silently drops any
  // submission where this is non-empty.
  website: '',
};

// Given a localised tour *title* and the i18n t() function, decide whether the
// tour belongs to the international list. Used by the modal to pre-select
// the right category when a user clicks "Enquire" on an international tour card.
export const detectCategoryFromTour = (tourName, t) => {
  if (!tourName) return '';
  const intlTitles = INTL_TOUR_KEYS.map((k) => t(k));
  return intlTitles.includes(tourName) ? 'international' : 'india';
};

// Pick which tour-key list matches the current category filter.
export const tourKeysForCategory = (category) => {
  if (category === 'india') return INDIA_TOUR_KEYS;
  if (category === 'international') return INTL_TOUR_KEYS;
  return ALL_TOUR_KEYS;
};
