const axios = require('axios');

/**
 * Send a WhatsApp message via Meta Cloud API.
 * @param {Object} enquiry - The enquiry object from the DB.
 * @returns {Promise<{sent: boolean, skipped?: boolean, reason?: string, response?: any}>}
 */
const sendWhatsApp = async (enquiry) => {
  const token = (process.env.WHATSAPP_TOKEN || '').trim();
  const phoneId = (process.env.WHATSAPP_PHONE_ID || '').trim();
  const to = (process.env.WHATSAPP_TO || '').replace(/\D/g, '');

  if (!token || !phoneId || !to) {
    return { sent: false, skipped: true, reason: 'WhatsApp env vars not configured' };
  }

  const selectedTours = enquiry.tourPackages?.length
    ? enquiry.tourPackages.join(', ')
    : enquiry.tourName || 'General enquiry';

  const hotelPreference = enquiry.noHotelRequired
    ? 'No Hotel Required'
    : (enquiry.hotelCategory || 'Not selected');

  const travelDates = (enquiry.startDate && enquiry.endDate)
    ? `${enquiry.startDate} to ${enquiry.endDate}`
    : 'Not provided';

  const body = [
    'New Travel Enquiry',
    '',
    `Name: ${enquiry.name || 'N/A'}`,
    `Email: ${enquiry.email || 'N/A'}`,
    `Country: ${enquiry.country || 'Not provided'}`,
    `Phone: ${enquiry.phone || 'N/A'}`,
    `Travel Dates: ${travelDates}`,
    `Hotel Preference: ${hotelPreference}`,
    `Adults: ${enquiry.adults ?? 1}`,
    `Children: ${enquiry.children ?? 0}`,
    `Tour: ${selectedTours}`,
    `Message: ${enquiry.message || 'No message provided'}`,
  ].join('\n');

  const url = `https://graph.facebook.com/v22.0/${phoneId}/messages`;

  const response = await axios.post(
    url,
    {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'text',
      text: { preview_url: false, body },
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000, // 10 s — don't hang the enquiry response indefinitely
    }
  );

  return { sent: true, response: response.data };
};

module.exports = sendWhatsApp;
