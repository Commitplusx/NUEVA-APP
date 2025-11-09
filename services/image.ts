import { supabase } from './supabase';

import { supabase } from './supabase';

/**
 * Generates a public URL for a Supabase Storage object with image transformations.
 * @param path The path of the image in the bucket.
 * @param width The desired width of the image.
 * @param height The desired height of the image.
 * @returns The transformed image URL.
 */
export const getTransformedImageUrl = (path: string, width: number, height: number): string => {
  if (!path) return '';

  // If the path is already a full URL, we can't transform it.
  // This handles legacy data or externally hosted images.
  if (path.startsWith('http')) {
    return path;
  }

  const { data } = supabase.storage
    .from('restaurant-images') // Make sure this is your bucket name
    .getPublicUrl(path, {
      transform: {
        width,
        height,
        resize: 'cover', // Can be 'cover', 'contain', or 'fill'
      },
    });

  return data?.publicUrl || '';
};
