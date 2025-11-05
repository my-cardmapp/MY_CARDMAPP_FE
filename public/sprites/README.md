# Sprite Sheets

This directory contains optimized sprite sheets for icons used throughout the application.

## Sprite Files

- `cards-sprite@2x.png` - Card type icons (48x48 per icon, retina)
- `categories-sprite@2x.png` - Category icons (32x32 per icon, retina)
- `ui-sprite@2x.png` - UI icons (24x24 per icon, retina)

## Generating Sprites

To generate sprite sheets from individual icons:

1. Place individual icon files in `src/assets/icons/[type]/`
2. Run the sprite generation script: `npm run generate-sprites`
3. The optimized sprite sheets will be created in this directory

## Icon Guidelines

- Card icons: 48x48px base size
- Category icons: 32x32px base size
- UI icons: 24x24px base size
- All sprites should be @2x for retina displays
- Use PNG format with transparency
- Optimize with tools like TinyPNG before deployment

## Usage

Use the `SpriteIcon` component to display icons from these sprite sheets:

```tsx
import { SpriteIcon } from '@/components/common/SpriteIcon';

<SpriteIcon type="cards" name="CHILD_MEAL" size={48} />
<SpriteIcon type="categories" name="restaurant" size={32} />
<SpriteIcon type="ui" name="search" size={24} />
```