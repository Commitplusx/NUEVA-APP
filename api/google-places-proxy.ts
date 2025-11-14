import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { lat, lng } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ error: 'Missing lat or lng parameters' });
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    console.error('GOOGLE_PLACES_API_KEY is not set');
    return res.status(500).json({ error: 'Server configuration error: API key missing' });
  }

  try {
    const placesApiUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=1500&type=restaurant&key=${apiKey}`;
    const apiResponse = await fetch(placesApiUrl);
    const data = await apiResponse.json();

    if (!apiResponse.ok) {
      console.error('Google Places API error:', data);
      return res.status(apiResponse.status).json(data);
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Error in Google Places proxy:', error);
    res.status(500).json({ error: 'Failed to fetch from Google Places API' });
  }
}
