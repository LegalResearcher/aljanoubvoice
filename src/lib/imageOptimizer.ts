/**
 * Optimizes Supabase storage image URLs by adding transformation parameters
 * This uses Supabase's built-in image transformation feature
 */

interface ImageOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'origin';
}

export function optimizeImageUrl(
  url: string | null | undefined,
  options: ImageOptions = {}
): string {
  if (!url) return '';
  
  // Only transform Supabase storage URLs
  if (!url.includes('supabase.co/storage/v1/object/public')) {
    return url;
  }

  const { width, height, quality = 80, format = 'webp' } = options;
  
  // Build transformation parameters
  const params = new URLSearchParams();
  
  if (width) params.set('width', width.toString());
  if (height) params.set('height', height.toString());
  params.set('quality', quality.toString());
  if (format !== 'origin') params.set('format', format);
  
  // Replace /object/public with /render/image/public for transformations
  const transformUrl = url.replace(
    '/storage/v1/object/public',
    '/storage/v1/render/image/public'
  );
  
  return `${transformUrl}?${params.toString()}`;
}

// Preset image sizes for different use cases
export const imageSizes = {
  thumbnail: { width: 150, height: 150 },
  card: { width: 400, height: 300 },
  cardSmall: { width: 200, height: 150 },
  hero: { width: 1200, height: 800 },
  slider: { width: 1400, height: 800 },
  avatar: { width: 100, height: 100 },
  sidebar: { width: 120, height: 120 },
  list: { width: 300, height: 200 },
} as const;

// Helper functions for common image types
export const getOptimizedImage = {
  thumbnail: (url: string | null | undefined) => 
    optimizeImageUrl(url, imageSizes.thumbnail),
  card: (url: string | null | undefined) => 
    optimizeImageUrl(url, imageSizes.card),
  cardSmall: (url: string | null | undefined) => 
    optimizeImageUrl(url, imageSizes.cardSmall),
  hero: (url: string | null | undefined) => 
    optimizeImageUrl(url, imageSizes.hero),
  slider: (url: string | null | undefined) => 
    optimizeImageUrl(url, imageSizes.slider),
  avatar: (url: string | null | undefined) => 
    optimizeImageUrl(url, imageSizes.avatar),
  sidebar: (url: string | null | undefined) => 
    optimizeImageUrl(url, imageSizes.sidebar),
  list: (url: string | null | undefined) => 
    optimizeImageUrl(url, imageSizes.list),
};
