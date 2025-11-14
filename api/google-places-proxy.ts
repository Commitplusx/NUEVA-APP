import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { lat, lng } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ error: 'Missing lat or lng parameters' });
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY; // Use GOOGLE_MAPS_API_KEY for Geocoding API
  if (!apiKey) {
    console.error('GOOGLE_MAPS_API_KEY is not set');
    return res.status(500).json({ error: 'Server configuration error: API key missing' });
  }

  try {
    // Use Google Geocoding API for reverse geocoding
    const geocodingApiUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}&language=es`;
    const apiResponse = await fetch(geocodingApiUrl);
    const data = await apiResponse.json();

    if (!apiResponse.ok) {
      console.error('Google Geocoding API error:', data);
      return res.status(apiResponse.status).json(data);
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Error in Google Geocoding proxy:', error);
    res.status(500).json({ error: 'Failed to fetch from Google Geocoding API' });
  }
}
