/**
 * Sprite utility functions for optimized image loading
 */

import { SPRITE_CONFIG, SPRITE_SHEETS } from '@/constants/spriteConfig';

export interface SpriteLayout {
  columns: number;
  rows: number;
  totalWidth: number;
  totalHeight: number;
}

export interface SpriteMetrics {
  totalIcons: number;
  spriteWidth: number;
  spriteHeight: number;
  fileSize: number; // in KB
  compressionRatio: number;
}

interface IconDefinition {
  name: string;
  index: number;
}

interface IconSize {
  width: number;
  height: number;
}

// Cache for loaded sprite sheets
const loadedSprites = new Set<string>();
const loadingPromises = new Map<string, Promise<boolean>>();

/**
 * Preload sprite sheets for faster rendering
 */
export async function preloadSpriteSheets(sheets: string[]): Promise<boolean[]> {
  const promises = sheets.map(sheet => preloadSingleSprite(sheet));
  return Promise.all(promises);
}

/**
 * Preload a single sprite sheet
 */
async function preloadSingleSprite(sheet: string): Promise<boolean> {
  // Check if already loaded
  if (loadedSprites.has(sheet)) {
    return true;
  }

  // Check if already loading
  if (loadingPromises.has(sheet)) {
    return loadingPromises.get(sheet)!;
  }

  // Start loading
  const promise = new Promise<boolean>((resolve) => {
    const img = new Image();
    const url = SPRITE_SHEETS[sheet as keyof typeof SPRITE_SHEETS];
    
    if (!url) {
      console.error(`Sprite sheet ${sheet} not found`);
      resolve(false);
      return;
    }

    img.onload = () => {
      loadedSprites.add(sheet);
      loadingPromises.delete(sheet);
      resolve(true);
    };

    img.onerror = () => {
      console.error(`Failed to load sprite sheet: ${url}`);
      loadingPromises.delete(sheet);
      resolve(false);
    };

    img.src = url;
  });

  loadingPromises.set(sheet, promise);
  return promise;
}

/**
 * Check if a sprite sheet is loaded
 */
export function isSpriteLoaded(sheet: string): boolean {
  return loadedSprites.has(sheet);
}

/**
 * Clear sprite cache
 */
export function clearSpriteCache(): void {
  loadedSprites.clear();
  loadingPromises.clear();
}

/**
 * Calculate optimal layout for icons
 */
export function calculateOptimalLayout(
  iconCount: number,
  iconSize: IconSize,
  maxWidth = 4096
): SpriteLayout {
  if (iconCount === 0) {
    return { columns: 0, rows: 0, totalWidth: 0, totalHeight: 0 };
  }

  // Calculate maximum columns based on width constraint
  const maxColumns = Math.floor(maxWidth / iconSize.width);
  
  // Find optimal grid that's as square as possible
  let columns = Math.ceil(Math.sqrt(iconCount));
  columns = Math.min(columns, maxColumns);
  
  const rows = Math.ceil(iconCount / columns);
  
  return {
    columns,
    rows,
    totalWidth: columns * iconSize.width,
    totalHeight: rows * iconSize.height,
  };
}

/**
 * Optimize sprite dimensions to power of 2 for GPU efficiency
 */
export function optimizeSpriteSize(width: number, height: number): IconSize {
  const nextPowerOf2 = (n: number) => {
    if (n <= 0) return 1;
    if ((n & (n - 1)) === 0) return n; // Already power of 2
    
    let power = 1;
    while (power < n && power < 4096) {
      power *= 2;
    }
    return Math.min(power, 4096);
  };

  return {
    width: nextPowerOf2(width),
    height: nextPowerOf2(height),
  };
}

/**
 * Get sprite metrics for analysis
 */
export function getSpriteMetrics(type: string): SpriteMetrics {
  const config = SPRITE_CONFIG[type as keyof typeof SPRITE_CONFIG];
  if (!config) {
    throw new Error(`Invalid sprite type: ${type}`);
  }

  const totalIcons = Object.keys(config.icons).length;
  const rows = Math.ceil(totalIcons / config.columns);
  const spriteWidth = config.columns * config.iconSize.width;
  const spriteHeight = rows * config.iconSize.height;
  
  // Estimate file size (rough calculation)
  // Assuming 4 bytes per pixel (RGBA) with compression
  const uncompressedSize = spriteWidth * spriteHeight * 4;
  const compressionRatio = 0.15; // Typical PNG compression ratio
  const fileSize = Math.round(uncompressedSize * compressionRatio / 1024); // KB

  return {
    totalIcons,
    spriteWidth,
    spriteHeight,
    fileSize,
    compressionRatio,
  };
}

/**
 * Generate CSS for sprite sheet
 */
export function generateSpriteSheet(
  icons: IconDefinition[],
  iconSize: IconSize,
  layout: SpriteLayout,
  spriteName: string,
  includeRetina = false
): string {
  let css = '';
  
  // Base class
  css += `.sprite-${spriteName} {\n`;
  css += `  display: inline-block;\n`;
  css += `  width: ${iconSize.width}px;\n`;
  css += `  height: ${iconSize.height}px;\n`;
  css += `  background-image: url('/sprites/${spriteName}.png');\n`;
  css += `  background-repeat: no-repeat;\n`;
  css += `}\n\n`;

  // Individual icon positions
  icons.forEach(icon => {
    const col = icon.index % layout.columns;
    const row = Math.floor(icon.index / layout.columns);
    const x = -col * iconSize.width;
    const y = -row * iconSize.height;
    
    css += `.sprite-${spriteName}-${icon.name} {\n`;
    css += `  background-position: ${x}px ${y}px;\n`;
    css += `}\n`;
  });

  // Retina support
  if (includeRetina) {
    css += `\n@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {\n`;
    css += `  .sprite-${spriteName} {\n`;
    css += `    background-image: url('/sprites/${spriteName}@2x.png');\n`;
    css += `    background-size: ${layout.totalWidth}px ${layout.totalHeight}px;\n`;
    css += `  }\n`;
    css += `}\n`;
  }

  return css;
}

/**
 * Create sprite sheet from individual images (for build process)
 */
export async function createSpriteFromImages(
  images: { name: string; url: string }[],
  iconSize: IconSize,
  outputPath: string
): Promise<{ css: string; layout: SpriteLayout }> {
  const layout = calculateOptimalLayout(images.length, iconSize);
  
  // This would typically be handled by a build tool like webpack-spritesmith
  // or a Node.js script using sharp/jimp
  console.log(`Creating sprite sheet with ${images.length} images`);
  console.log(`Layout: ${layout.columns}x${layout.rows}`);
  console.log(`Output: ${outputPath}`);
  
  const icons = images.map((img, index) => ({
    name: img.name,
    index,
  }));
  
  const css = generateSpriteSheet(
    icons,
    iconSize,
    layout,
    outputPath.replace(/\.(png|jpg|svg)$/, ''),
    true
  );
  
  return { css, layout };
}

/**
 * Estimate network savings from sprite usage
 */
export function calculateNetworkSavings(
  iconCount: number,
  averageIconSize = 2, // KB
  spriteSize = 50 // KB
): { requests: number; bandwidth: number; percentage: number } {
  const individualRequests = iconCount;
  const spriteRequests = 1;
  const requestsSaved = individualRequests - spriteRequests;
  
  const individualBandwidth = iconCount * averageIconSize;
  const spriteBandwidth = spriteSize;
  const bandwidthSaved = individualBandwidth - spriteBandwidth;
  const savingsPercentage = (bandwidthSaved / individualBandwidth) * 100;
  
  return {
    requests: requestsSaved,
    bandwidth: bandwidthSaved,
    percentage: Math.round(savingsPercentage),
  };
}