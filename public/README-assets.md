# AirSwap Visual Assets

This directory contains all visual assets for the AirSwap Growth Platform frontend.

## 📁 Directory Structure

```
public/
├── demo/              # Demo mode assets (NDVI previews, placeholder data)
├── hero/              # Hero section visuals (backgrounds, illustrations)
├── market/            # Marketplace UI elements
├── icons/             # Favicons and PWA icons
├── social/            # Social media preview images
└── assets-manifest.json  # Complete asset inventory
```

## 🎨 Asset Categories

### 1. Demo Assets (`/demo`)

**NDVI Before/After Images**
- `before.jpg` (1600×1200, 38KB) - Degraded land state with muted greens/browns
- `after.jpg` (1600×1200, 110KB) - Improved land with vibrant green heatmap
- `before.svg` / `after.svg` - Vector versions for scalable display

**Purpose**: Used in demo mode to show NDVI (Normalized Difference Vegetation Index) transformations when real satellite data isn't available.

**UI Placeholders**
- `placeholder-avatar.png` (400×400, 16KB) - Default user profile picture
- `hero-loop.gif` (800×400, 26KB) - Animated before→after transition
- `hero-loop.png` (800×400, 26KB) - Static fallback

### 2. Hero Section (`/hero`)

**Background Elements**
- `ndvi-grid.svg` (800×600, 3KB) - Grid visualization of NDVI data tiles
- `noise.svg` (1200×800, 1.3KB) - Subtle organic texture overlay
- `blur-blob-1.svg` (600×600, 643B) - Green/teal gradient accent
- `blur-blob-2.svg` (600×600, 643B) - Yellow/green gradient accent

**Main Illustration**
- `hero-illustration.png` (1200×800, 67KB) - Abstract map with data points
- `hero-illustration.svg` (2.5KB) - Vector version

**Purpose**: Create visual depth and reinforce the environmental/data theme on the landing page.

### 3. Marketplace (`/market`)

- `credit-card.png` (600×400, 22KB) - Carbon credit card preview

**Purpose**: Placeholder for marketplace listings and credit trading interface.

### 4. Icons (`/icons`)

**Favicons**
- `favicon-16x16.png` (631B) - Browser tab icon (small)
- `favicon-32x32.png` (1.2KB) - Browser tab icon (standard)

**PWA Icons**
- `icon-192x192.png` (7.3KB) - Android home screen icon
- `icon-512x512.png` (25KB) - Splash screen icon

**Purpose**: Brand consistency across browsers and when app is installed.

### 5. Social Media (`/social`)

- `social-preview.png` (1200×630, 66KB) - Open Graph image

**Purpose**: Displayed when sharing AirSwap links on Twitter, Facebook, LinkedIn, Slack, etc.

**How to use**: Add to your `_app.tsx` or page `<Head>`:
```tsx
<meta property="og:image" content="/social/social-preview.png" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:image" content="/social/social-preview.png" />
```

## 🎨 Color Palette

All assets follow the AirSwap brand color system:

| Color | Hex | Usage |
|-------|-----|-------|
| Primary Green | `#22c55e` | Main brand color, healthy vegetation |
| Dark Green | `#059669` | Accents, shadows |
| Medium Green | `#10b981` | Secondary elements |
| Lime Green | `#84cc16` | Highlights, growth indicators |
| Accent Yellow | `#fbbf24` | Call-to-action, energy |
| Stress Red | `#dc2626` | Low NDVI, warnings |

## 🔄 Updating Assets

### Replacing an Asset

1. **Keep the same filename** to avoid breaking component references
2. **Maintain aspect ratio** for layout consistency
3. **Optimize before committing**:
   ```bash
   # For PNG/JPG
   npm install -g sharp-cli
   sharp -i original.png -o optimized.png --quality 85
   
   # For SVG
   npm install -g svgo
   svgo input.svg -o output.svg
   ```

### Adding New Assets

1. Place in appropriate category folder
2. Update `assets-manifest.json` with new entry
3. Document usage in this README
4. Add references in relevant components

### Batch Regeneration

If you need to regenerate all assets:

```bash
# Regenerate base assets
node generate-assets.js

# Convert SVGs to raster formats
node convert-images.js

# Create favicons
node create-favicons.js

# Create demo GIF
node create-demo-gif.js
```

## 📊 Demo Mode vs Production

### Demo Mode (`NEXT_PUBLIC_DEMO_MODE=true`)

**When Active:**
- NDVI images show placeholder data
- `before.jpg` and `after.jpg` are displayed in MapPage
- `placeholder-avatar.png` used for contributors
- API returns static demo responses

**What to Show:**
- Use assets from `/demo` folder
- Display "Demo Mode" badge
- Show static transformation animations

### Production Mode (`NEXT_PUBLIC_DEMO_MODE=false`)

**When Active:**
- Real satellite data fetched from NDVI APIs
- Actual user avatars loaded from profile storage
- Dynamic carbon credit values
- Live marketplace listings

**What to Show:**
- Assets from `/demo` only as fallbacks when data fails to load
- Real images take precedence

### Checking Demo Mode in Components

```tsx
import { isDemo } from '@/lib/isDemo';

// In your component
const imageSrc = isDemo() 
  ? '/demo/placeholder-avatar.png' 
  : user.profileImage;
```

## 🔍 Asset Discovery

All assets are referenced in:
- **Landing page**: HeroSection.tsx (hero assets)
- **Map page**: LeafletMap.tsx, RightPanel.tsx (NDVI demo images)
- **Dashboard**: DashboardSidebar.tsx, contributor.tsx (avatars)
- **Marketplace**: MarketplaceCard.tsx (credit cards)
- **Layout**: NavBar.tsx (logo/favicon)

Use `grep` to find asset references:
```bash
grep -r "public/demo" components/ pages/
grep -r "public/hero" components/ pages/
```

## 📐 Design Guidelines

### Image Dimensions

- **Hero illustrations**: 1200×800 (3:2 ratio)
- **NDVI previews**: 1600×1200 (4:3 ratio)
- **Social previews**: 1200×630 (1.91:1 ratio, Twitter/OG standard)
- **Avatars**: 400×400 (1:1 ratio)
- **Favicons**: 16×16, 32×32, 192×192, 512×512

### File Size Targets

- **SVG**: < 5KB each
- **Hero PNG**: 50-100KB
- **NDVI JPEG**: 30-150KB (photographic content)
- **Icons PNG**: < 30KB
- **Social PNG**: 50-100KB

### Accessibility

All images should have:
- Descriptive `alt` text (see manifest)
- Appropriate ARIA labels
- Fallback content for failed loads
- Color contrast ratios meeting WCAG AA

Example:
```tsx
<img 
  src="/demo/before.jpg" 
  alt="NDVI before: muted vegetation showing low health"
  loading="lazy"
/>
```

## 🚀 Performance Tips

1. **Lazy load below-the-fold images**:
   ```tsx
   <img loading="lazy" src="/hero/hero-illustration.png" />
   ```

2. **Use Next.js Image component** for automatic optimization:
   ```tsx
   import Image from 'next/image';
   <Image src="/demo/after.jpg" width={1600} height={1200} alt="..." />
   ```

3. **Prefer SVG for graphics** - they're tiny and scale infinitely

4. **Consider WebP format** for even smaller file sizes (requires conversion)

## 📦 Asset Generation Scripts

Located in project root:

- `generate-assets.js` - Creates SVG base assets
- `convert-images.js` - Converts SVGs to PNG/JPG
- `create-favicons.js` - Generates all favicon sizes
- `create-demo-gif.js` - Creates hero loop animation

**Dependencies**: `sharp` (already in package.json)

## 🐛 Troubleshooting

### Image Not Loading

1. Check path is correct (leading slash: `/public/demo/...`)
2. Verify file exists: `ls -lh public/demo/`
3. Check browser console for 404 errors
4. Ensure demo mode matches expected usage

### Blurry Images

- Use correct dimensions (see manifest)
- Don't upscale beyond original size
- Use SVG versions when possible
- Check if Next.js Image optimization is working

### Large Bundle Size

- Run `npm run build` and check `.next/static` size
- Ensure images are in `/public`, not imported directly
- Use lazy loading for below-fold content
- Consider WebP conversion

## 📚 Additional Resources

- [Next.js Image Optimization](https://nextjs.org/docs/basic-features/image-optimization)
- [NDVI Visualization Best Practices](https://gisgeography.com/ndvi-normalized-difference-vegetation-index/)
- [Web Performance Image Guide](https://web.dev/fast/#optimize-your-images)
- [Open Graph Protocol](https://ogp.me/)

---

**Last Updated**: December 5, 2025  
**Maintained By**: AirSwap Development Team  
**Questions?** Check `assets-manifest.json` for complete asset inventory
