/**
 * Sprite sheet configuration for optimized icon loading
 */

export type SpriteType = 'cards' | 'categories' | 'ui';
export type IconName = string;

interface IconSize {
  width: number;
  height: number;
}

interface SpriteSheetConfig {
  sheet: string;
  iconSize: IconSize;
  columns: number;
  icons: Record<string, number>;
}

interface SpritePosition {
  x: number;
  y: number;
}

/**
 * Sprite sheet URLs with retina support
 */
export const SPRITE_SHEETS: Record<SpriteType, string> = {
  cards: '/sprites/cards-sprite@2x.png',
  categories: '/sprites/categories-sprite@2x.png',
  ui: '/sprites/ui-sprite@2x.png',
};

/**
 * Sprite configuration for each sprite type
 */
export const SPRITE_CONFIG: Record<SpriteType, SpriteSheetConfig> = {
  cards: {
    sheet: 'cards',
    iconSize: { width: 48, height: 48 },
    columns: 10,
    icons: {
      // Card type icons
      'CHILD_MEAL': 0,
      'CULTURE_NURI': 1,
      'LOCAL_LOVE': 2,
      'ZERO_PAY': 3,
      'NATIONAL_VOUCHER': 4,
      'SENIOR_PASS': 5,
      'YOUTH_CARD': 6,
      'DISABLED_CARD': 7,
      'VETERAN_CARD': 8,
      'DEFAULT_CARD': 9,
      // Additional card types
      'STUDENT_MEAL': 10,
      'DREAM_CARD': 11,
      'HOPE_CARD': 12,
      'WELFARE_POINT': 13,
      'FAMILY_CARE': 14,
    },
  },
  categories: {
    sheet: 'categories',
    iconSize: { width: 32, height: 32 },
    columns: 10,
    icons: {
      // Category icons
      'restaurant': 0,
      'convenience': 1,
      'cafe': 2,
      'bakery': 3,
      'mart': 4,
      'pharmacy': 5,
      'bookstore': 6,
      'stationery': 7,
      'sports': 8,
      'clothing': 9,
      // Additional categories
      'fastfood': 10,
      'delivery': 11,
      'entertainment': 12,
      'education': 13,
      'hospital': 14,
      'beauty': 15,
      'electronics': 16,
      'furniture': 17,
      'travel': 18,
      'default': 19,
    },
  },
  ui: {
    sheet: 'ui',
    iconSize: { width: 24, height: 24 },
    columns: 20,
    icons: {
      // UI icons
      'close': 0,
      'search': 1,
      'location': 2,
      'filter': 3,
      'menu': 4,
      'arrow-up': 5,
      'arrow-down': 6,
      'arrow-left': 7,
      'arrow-right': 8,
      'check': 9,
      'plus': 10,
      'minus': 11,
      'star': 12,
      'star-filled': 13,
      'heart': 14,
      'heart-filled': 15,
      'share': 16,
      'info': 17,
      'warning': 18,
      'error': 19,
      // Additional UI icons
      'map': 20,
      'list': 21,
      'grid': 22,
      'settings': 23,
      'user': 24,
      'calendar': 25,
      'clock': 26,
      'phone': 27,
      'email': 28,
      'link': 29,
      'download': 30,
      'upload': 31,
      'refresh': 32,
      'expand': 33,
      'collapse': 34,
      'fullscreen': 35,
      'minimize': 36,
      'maximize': 37,
      'pin': 38,
      'unpin': 39,
    },
  },
};

/**
 * Get sprite position for an icon
 */
export function getSpritePosition(
  type: SpriteType,
  iconName: IconName
): SpritePosition {
  const config = SPRITE_CONFIG[type];
  const index = config.icons[iconName];

  if (index === undefined) {
    throw new Error(`Icon ${iconName} not found in ${type} sprite`);
  }

  const row = Math.floor(index / config.columns);
  const col = index % config.columns;

  return {
    x: -col * config.iconSize.width,
    y: -row * config.iconSize.height,
  };
}

/**
 * Get sprite sheet URL
 */
export function getSpriteUrl(type: SpriteType): string {
  return SPRITE_SHEETS[type];
}

/**
 * Get complete background CSS for sprite icon
 */
export function getSpriteBackground(
  type: SpriteType,
  iconName: IconName,
  includeSize = false,
  customSize?: IconSize
): string {
  const position = getSpritePosition(type, iconName);
  const url = getSpriteUrl(type);
  const config = SPRITE_CONFIG[type];
  
  let css = `url(${url}) ${position.x}px ${position.y}px no-repeat`;
  
  if (includeSize) {
    const size = customSize || config.iconSize;
    const totalColumns = config.columns;
    const totalRows = Math.ceil(Object.keys(config.icons).length / config.columns);
    const sheetWidth = totalColumns * config.iconSize.width;
    const sheetHeight = totalRows * config.iconSize.height;
    
    // Calculate background-size for retina displays
    const scaleX = size.width / config.iconSize.width;
    const backgroundWidth = sheetWidth * scaleX;
    const backgroundHeight = sheetHeight * scaleX;
    
    css += `; background-size: ${backgroundWidth}px ${backgroundHeight}px`;
  }
  
  return css;
}

/**
 * Get all icon names for a sprite type
 */
export function getIconNames(type: SpriteType): string[] {
  return Object.keys(SPRITE_CONFIG[type].icons);
}

/**
 * Check if an icon exists in a sprite
 */
export function hasIcon(type: SpriteType, iconName: IconName): boolean {
  return iconName in SPRITE_CONFIG[type].icons;
}

/**
 * Get icon size for a sprite type
 */
export function getIconSize(type: SpriteType): IconSize {
  return SPRITE_CONFIG[type].iconSize;
}

/**
 * Generate CSS classes for all icons in a sprite
 */
export function generateSpriteCSS(type: SpriteType): string {
  const config = SPRITE_CONFIG[type];
  const url = getSpriteUrl(type);
  const { width, height } = config.iconSize;
  
  let css = `.sprite-${type} {\n`;
  css += `  display: inline-block;\n`;
  css += `  width: ${width}px;\n`;
  css += `  height: ${height}px;\n`;
  css += `  background-image: url(${url});\n`;
  css += `  background-repeat: no-repeat;\n`;
  css += `}\n\n`;
  
  // Generate individual icon classes
  for (const [iconName, index] of Object.entries(config.icons)) {
    const position = getSpritePosition(type, iconName);
    css += `.sprite-${type}-${iconName.toLowerCase().replace(/_/g, '-')} {\n`;
    css += `  background-position: ${position.x}px ${position.y}px;\n`;
    css += `}\n`;
  }
  
  // Add retina support
  css += `\n@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {\n`;
  css += `  .sprite-${type} {\n`;
  css += `    background-size: ${config.columns * width}px auto;\n`;
  css += `  }\n`;
  css += `}\n`;
  
  return css;
}