# LiveCPH Webflow Integration Guide

This guide explains how to integrate the interactive SVG floor plans into your Webflow site.

## 1. Setup Webflow Collection

### Create Apartment Collection

1. Create a new collection called "Apartments"
2. Add the following fields:
   - Name (Text)
   - Apartment ID (Text) - Format: "STR-1-01"
   - Property (Reference) - Link to Properties collection
   - Floor (Number)
   - Size (Number) - m²
   - Rooms (Number)
   - Features (Multi-reference)
   - Floor Plan Image (Image)
   - Status (Option) - Available/Reserved/Sold

### Create Property Collection

1. Create a new collection called "Properties"
2. Add the following fields:
   - Name (Text)
   - Slug (Text) - e.g., "strandlodsvej"
   - Address (Text)
   - Description (Rich Text)
   - Featured Image (Image)
   - Floor Count (Number)

## 2. Add JavaScript to Webflow

### Add Script in Site Settings

1. Go to Site Settings > Custom Code > Footer Code
2. Add the following script tag:

```html
<script src="https://cdn.jsdelivr.net/gh/yourusername/live-cph@main/webflow/js/etageplan-listener.min.js"></script>
```

Or upload the script to Webflow and reference it directly.

## 3. Property Page Setup

### Add SVG Viewer iframe

Add an iframe element to your property page template:

```html
<iframe 
  src="https://your-vercel-app.vercel.app/{{wf {&quot;path&quot;:&quot;slug&quot;,&quot;type&quot;:&quot;PlainText&quot;\} }}/etage-1" 
  width="100%" 
  height="500px" 
  frameborder="0"
  class="etageplan-viewer">
</iframe>
```

### Dynamic Webflow Links

Du kan nu lave dynamiske links i Webflow ved hjælp af Collection data:

```html
<!-- For en ejendom med slug og etage-nummer fra CMS -->
<iframe 
  src="https://your-vercel-app.vercel.app/{{wf {&quot;path&quot;:&quot;ejendom-slug&quot;,&quot;type&quot;:&quot;PlainText&quot;\} }}/etage-{{wf {&quot;path&quot;:&quot;etage-nummer&quot;,&quot;type&quot;:&quot;Number&quot;\} }}" 
  class="etageplan-viewer">
</iframe>
```

### Add Floor Selector

Create a floor selector to switch between floors:

```html
<div class="floor-selector">
  <div class="floor-buttons">
    <!-- Dynamic floor buttons from property's floor count -->
    <div class="floor-button" data-floor="0">0</div>
    <div class="floor-button" data-floor="1">1</div>
    <!-- etc -->
  </div>
</div>
```

Add this script to handle floor selection:

```html
<script>
document.addEventListener('DOMContentLoaded', function() {
  const floorButtons = document.querySelectorAll('.floor-button');
  const iframe = document.querySelector('.etageplan-viewer');
  const baseUrl = iframe.src.split('/').slice(0, -1).join('/');
  
  floorButtons.forEach(button => {
    button.addEventListener('click', function() {
      const floor = this.getAttribute('data-floor');
      iframe.src = `${baseUrl}/etage-${floor}`;
      
      // Update active state
      floorButtons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
    });
  });
});
</script>
```

### Add Hidden Apartment Collection

Add a collection list with all apartments for the current property:

```html
<div class="apartments-collection" style="display: none;">
  <!-- Webflow Collection List Filter: Property = Current Property -->
  <div class="w-dyn-list">
    <div class="w-dyn-items">
      <div class="apartment-item w-dyn-item" data-apartment-id="{{wf {&quot;path&quot;:&quot;apartment-id&quot;,&quot;type&quot;:&quot;PlainText&quot;\} }}">
        <div class="apartment-modal-trigger" data-wf-element-id="modal-trigger">
          <div class="apartment-data">
            <h3>{{wf {&quot;path&quot;:&quot;name&quot;,&quot;type&quot;:&quot;PlainText&quot;\} }}</h3>
            <p>{{wf {&quot;path&quot;:&quot;size&quot;,&quot;type&quot;:&quot;Number&quot;\} }} m²</p>
            <p>{{wf {&quot;path&quot;:&quot;rooms&quot;,&quot;type&quot;:&quot;Number&quot;\} }} værelser</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

## 4. Add Modal for Apartment Details

Create a modal for displaying apartment details:

```html
<!-- Modal Container -->
<div class="apartment-modal">
  <div class="modal-bg"></div>
  <div class="modal-content">
    <div class="modal-close">×</div>
    
    <div class="modal-header">
      <h2 class="modal-title">{{wf {&quot;path&quot;:&quot;name&quot;,&quot;type&quot;:&quot;PlainText&quot;\} }}</h2>
      <div class="modal-status">{{wf {&quot;path&quot;:&quot;status&quot;,&quot;type&quot;:&quot;Option&quot;\} }}</div>
    </div>
    
    <div class="modal-body">
      <div class="modal-details">
        <div class="detail-item">
          <div class="detail-label">Size</div>
          <div class="detail-value">{{wf {&quot;path&quot;:&quot;size&quot;,&quot;type&quot;:&quot;Number&quot;\} }} m²</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Værelser</div>
          <div class="detail-value">{{wf {&quot;path&quot;:&quot;rooms&quot;,&quot;type&quot;:&quot;Number&quot;\} }}</div>
        </div>
      </div>
      
      <div class="modal-image">
        <img src="{{wf {&quot;path&quot;:&quot;floor-plan-image&quot;,&quot;type&quot;:&quot;Image&quot;\} }}" alt="Floor plan" />
      </div>
    </div>
    
    <div class="modal-footer">
      <a href="/contact" class="cta-button">Contact us</a>
    </div>
  </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
  const modalTriggers = document.querySelectorAll('.apartment-modal-trigger');
  const modal = document.querySelector('.apartment-modal');
  const modalBg = document.querySelector('.modal-bg');
  const modalClose = document.querySelector('.modal-close');
  
  modalTriggers.forEach(trigger => {
    trigger.addEventListener('click', function() {
      modal.classList.add('active');
    });
  });
  
  [modalBg, modalClose].forEach(el => {
    el.addEventListener('click', function() {
      modal.classList.remove('active');
    });
  });
});
</script>
```

## 5. CSS for Styling

Add this CSS in your Webflow Designer:

```css
/* Modal Styling */
.apartment-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: none;
  z-index: 1000;
}

.apartment-modal.active {
  display: block;
}

.modal-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}

.modal-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  background-color: white;
  border-radius: 8px;
  padding: 30px;
}

.modal-close {
  position: absolute;
  top: 15px;
  right: 15px;
  font-size: 24px;
  cursor: pointer;
}

/* Floor Selector */
.floor-selector {
  margin-bottom: 20px;
}

.floor-buttons {
  display: flex;
}

.floor-button {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
  background-color: #f0f0f0;
  cursor: pointer;
  border-radius: 4px;
}

.floor-button.active {
  background-color: #333;
  color: white;
}

/* SVG Viewer */
.etageplan-viewer {
  width: 100%;
  height: 500px;
  border: none;
  background-color: #f5f5f5;
}
```

## 6. Testing Integration

1. Deploy your Vercel app
2. Add all apartment data to your Webflow CMS
3. Publish your Webflow site
4. Test the interaction between the SVG floor plans and apartment modals

## 7. Troubleshooting

If apartments aren't opening when clicked:

1. Open browser console to check for errors
2. Verify apartment IDs match between SVG elements and Webflow collection
3. Check if the iframe is loading properly
4. Test PostMessage communication with this code in console:
   ```js
   window.postMessage({type: 'openApartment', apartmentId: 'STR-1-01'}, '*');
   ```
