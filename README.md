# LiveCPH Interactive SVG Floor Plan System

This project implements an interactive SVG floor plan system for property listings with Vercel hosting and Webflow integration.

## Project Structure

```
Live-CPH/
├── vercel/               # Vercel Next.js app
│   ├── components/       # React components
│   │   └── SVGViewer.js  # SVG loading and interaction handler
│   ├── pages/            # Next.js page routes
│   │   ├── _app.js       # Global app setup
│   │   ├── index.js      # Index page listing properties
│   │   └── [property]/   # Dynamic property routes
│   │       └── [floor].js # Dynamic floor plan display
│   └── svg/              # SVG floor plan files
│       ├── strandlodsvej/
│       └── vesterbrogade/
└── webflow/              # Webflow assets and scripts
    ├── assets/           # Webflow assets
    │   └── Ejendomme/    # Property assets
    ├── js/               # JavaScript files
    │   └── etageplan-listener.js # PostMessage handler
```

## Setup Instructions

### 1. Vercel Deployment

1. Deploy the `vercel` directory as a Next.js app to Vercel:
   ```
   cd vercel
   npm install
   vercel
   ```

2. Make sure your SVG files are organized under the `public/svg/[property-name]` directory with consistent naming:
   ```
   public/svg/strandlodsvej/Etageplan_0.svg
   public/svg/strandlodsvej/Etageplan_1.svg
   ...
   ```

### 2. Webflow Setup

1. Create a CMS collection for apartments with these fields:
   - Name
   - Apartment ID (match format: "STR-1-01")
   - Floor number
   - Property reference
   - Size (m²)
   - Rooms
   - Features
   - Floor plan image

2. Add this embed script to your property detail pages:
   ```html
   <script src="https://your-domain.webflow.io/js/etageplan-listener.min.js"></script>
   ```

3. Add an iframe to display the SVG floor plan:
   ```html
   <iframe 
     src="https://your-vercel-app.vercel.app/strandlodsvej/etage-1" 
     width="100%" 
     height="500px" 
     frameborder="0"
     class="etageplan-viewer">
   </iframe>
   ```

4. Add a hidden collection list with all apartments for the current property:
   ```html
   <div class="apartments-collection" style="display: none;">
     <!-- Webflow Collection List -->
     <div class="apartment-item" data-apartment-id="{Apartment ID}">
       <!-- Add modal trigger here -->
     </div>
   </div>
   ```

## SVG File Requirements

For SVG interactivity to work correctly, apartment elements in your SVG files should:

1. Have an `id` attribute with the correct apartment ID format (e.g., "STR-1-01", "VES-2-03")
2. Follow the naming pattern: `[PROPERTY-CODE]-[FLOOR]-[APARTMENT]`

The system automatically detects elements with IDs starting with: `VES-`, `STR-`, `HER-`, `NFA-`

Example SVG element:
```svg
<rect id="STR-1-01" fill="#5dcd90" d="M10,10 L20,20..." />
<polygon id="VES-2-03" fill="#5dcd90" points="..." />
```

**Advantage:** This approach is robust against Illustrator re-exports since `id` attributes are preserved, unlike custom `data-*` attributes.

## Apartment ID Format

The system generates apartment IDs in this format:
- `STR-1-01`: Strandlodsvej, Floor 1, Apartment 01
- `VBG-2-03`: Vesterbrogade, Floor 2, Apartment 03

## Adding New Properties

To add a new property to the system, follow these steps:

### 1. Create SVG Directory Structure

Add your SVG files to the correct directory structure:

```
public/svg/
├── strandlodsvej/           ← Existing
├── vesterbrogade/           ← Existing  
└── [new-property-name]/     ← Your new property
    ├── Etageplan_0.svg      ← Ground floor (if applicable)
    ├── Etageplan_1.svg      ← 1st floor
    ├── Etageplan_2.svg      ← 2nd floor
    └── ...                  ← Additional floors
```

### 2. Naming Conventions

**Directory naming:**
- Use lowercase letters and hyphens
- ✅ `hermodsgade`
- ✅ `norre-farimagsgade`
- ❌ `Nørre-Farimagsgade` (uppercase/special characters)

**SVG file naming:**
- Format: `Etageplan_X.svg` where X is the floor number
- ✅ `Etageplan_0.svg` (ground floor)
- ✅ `Etageplan_1.svg` (1st floor)
- ✅ `Etageplan_2.svg` (2nd floor)

### 3. Update Property List

Add the new property to `pages/index.js`:

```javascript
setProperties([
  {
    name: 'Strandlodsvej',
    slug: 'strandlodsvej',
    floors: [0, 1, 2, 3, 4, 5, 6, 7]
  },
  {
    name: 'Vesterbrogade',
    slug: 'vesterbrogade', 
    floors: [1, 2, 3, 4, 5]
  },
  {
    name: 'Hermodsgade',          // ← New property
    slug: 'hermodsgade',          // ← Must match directory name
    floors: [0, 1, 2, 3, 4]       // ← Available floors
  }
]);
```

### 4. Add Apartment IDs to SVG

Ensure each apartment element in your SVG files has an `id` attribute in the correct format:

```svg
<rect id="HER-1-01" class="apartment" .../>
<rect id="HER-1-02" class="apartment" .../>
<polygon id="HER-2-01" class="apartment" .../>
```

**ID Format:** `[PROPERTY-CODE]-[FLOOR]-[APARTMENT]`

**Note:** The system uses `id` attributes instead of `data-apartment-id` for better compatibility with Illustrator exports. IDs are preserved when exporting from design tools, making the system more robust.

**Property codes:**
- Use 3-letter abbreviations
- `STR` = Strandlodsvej
- `VBG` = Vesterbrogade  
- `HER` = Hermodsvej
- `DOR` = Dortheavej
- `NFA` = Nørre Farimagsgade

**Important:** When adding new properties, you must also update the CSS selectors in `components/SVGViewer.js` to include the new property code:
```javascript
// Current selectors include:
'[id^="VES-"], [id^="STR-"], [id^="HER-"], [id^="DOR-"], [id^="NFA-"]'
```

### 5. Test Your New Property

1. Start the development server: `npm run dev`
2. Navigate to: `http://localhost:3000`
3. Click on your new property
4. Test apartment interactions and console logging

### 6. URL Structure

Your new property will be accessible at:
- `http://localhost:3000/hermodsgade/etage-1`
- `http://localhost:3000/hermodsgade/etage-2`
- etc.

## Troubleshooting

- Check browser console for error messages
- Verify the SVG elements have the correct classes
- Ensure Webflow collection items have the correct data-apartment-id attributes
- Test PostMessage communication using browser dev tools
