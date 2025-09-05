import { useEffect, useRef } from 'react';

export default function SVGViewer({ property, floor }) {
  const svgContainerRef = useRef(null);

  useEffect(() => {
    const loadSVG = async () => {
      try {
        console.log(`🔄 Loading SVG: /svg/${property}/${floor}.svg`);
        const response = await fetch(`/svg/${property}/${floor}.svg`);
        if (!response.ok) throw new Error('Failed to load SVG');
        
        const svgText = await response.text();
        console.log('📄 SVG loaded successfully, length:', svgText.length);
        
        if (svgContainerRef.current) {
          svgContainerRef.current.innerHTML = svgText;
          console.log('🎨 SVG inserted into DOM');
          
          // Small delay to ensure DOM is ready
          setTimeout(() => {
            enhanceSVG(property, floor);
          }, 100);
        }
      } catch (error) {
        console.error('❌ Error loading SVG:', error);
      }
    };

    if (property && floor) {
      loadSVG();
    }

    return () => {
      if (svgContainerRef.current) {
        svgContainerRef.current.innerHTML = '';
      }
    };
  }, [property, floor]);

  // Function to enhance SVG with interactivity
  const enhanceSVG = (property, floor) => {
    console.log('🎯 Enhancing SVG for:', property, floor);
    
    // Find all apartment elements with ID matching apartment pattern
    const apartmentElements = svgContainerRef.current.querySelectorAll('[id^="VES-"], [id^="STR-"], [id^="HER-"], [id^="DOR-"], [id^="NFA-"]');
    
    console.log('📍 Found apartment elements:', apartmentElements.length);
    
    apartmentElements.forEach((element, index) => {
      // Get apartment ID from element ID attribute (e.g., id="VES-1-01")
      const apartmentId = element.getAttribute('id');
      
      console.log(`🏠 Setting up apartment ${index + 1}:`, apartmentId);
      
      if (apartmentId && /^(VES|STR|HER|DOR|NFA)-\d+-\d+$/.test(apartmentId)) {
        // Add click handler
        element.addEventListener('click', (e) => {
          e.preventDefault();
          console.log('🖱️ Apartment clicked:', apartmentId);
          sendApartmentMessage(apartmentId);
        });
        
        // Add hover handlers for console logging only
        element.addEventListener('mouseenter', () => {
          console.log('🐭 Mouse enter:', apartmentId);
        });
        
        element.addEventListener('mouseleave', () => {
          console.log('🐭 Mouse leave:', apartmentId);
        });
        
        // Add interactive class for CSS styling
        element.classList.add('interactive-apartment');
      }
    });

    // Apply CSS for interactivity based on ID selectors  
    const style = document.createElement('style');
    style.textContent = `
      /* Make all apartments interactive using ID selectors - override SVG CSS */
      svg [id^="VES-"], svg [id^="STR-"], svg [id^="HER-"], svg [id^="DOR-"], svg [id^="NFA-"] {
        pointer-events: all !important;
        cursor: pointer !important;
        transition: opacity 0.3s ease !important;
        opacity: 0 !important;
        fill-opacity: 0 !important;
      }
      
      /* apartments hover effect - higher specificity to beat SVG internal CSS */
      svg [id^="VES-"]:hover, svg [id^="STR-"]:hover, svg [id^="HER-"]:hover, svg [id^="DOR-"]:hover, svg [id^="NFA-"]:hover {
        opacity: 0.5 !important; /* This should now work */
        fill-opacity: 1 !important;
      }
      
      /* General styling for interactive elements */
      .interactive-apartment {
        cursor: pointer !important;
      }
    `;
    svgContainerRef.current.appendChild(style);
    
    console.log('✅ SVG enhancement complete!');
  };

  // Extract apartment ID from SVG element
  const extractApartmentId = (svgElement, property, floorNum) => {
    // Option 1: From data-apartment-id attribute
    if (svgElement.dataset.apartmentId) {
      return svgElement.dataset.apartmentId;
    }
    
    // Option 2: From class name (appartment-1 → parse to apartment ID)
    const classMatch = Array.from(svgElement.classList).find(className => 
      /appartment-\d+|apartment-\d+|lejlighed-\d+/i.test(className)
    );
    
    if (classMatch) {
      const numMatch = classMatch.match(/\d+/);
      if (numMatch) {
        const apartmentNum = numMatch[0].padStart(2, '0');
        // Format: STR-1-01 (Property abbreviation, floor, apartment number)
        let propertyPrefix = '';
        
        switch(property) {
          case 'strandlodsvej':
            propertyPrefix = 'STR';
            break;
          case 'vesterbrogade':
            propertyPrefix = 'VBG';
            break;
          default:
            propertyPrefix = property.substring(0, 3).toUpperCase();
        }
        
        return `${propertyPrefix}-${floorNum}-${apartmentNum}`;
      }
    }
    
    // Option 3: From element ID if it exists
    if (svgElement.id && /\d+/.test(svgElement.id)) {
      const numMatch = svgElement.id.match(/\d+/);
      if (numMatch) {
        const apartmentNum = numMatch[0].padStart(2, '0');
        let propertyPrefix = '';
        
        switch(property) {
          case 'strandlodsvej':
            propertyPrefix = 'STR';
            break;
          case 'vesterbrogade':
            propertyPrefix = 'VBG';
            break;
          default:
            propertyPrefix = property.substring(0, 3).toUpperCase();
        }
        
        return `${propertyPrefix}-${floorNum}-${apartmentNum}`;
      }
    }
    
    return null;
  };

  // Send message to Webflow
  const sendApartmentMessage = (apartmentId) => {
    console.log('📤 Sending postMessage to parent:', {
      type: 'openApartment',
      apartmentId: apartmentId
    });
    
    window.parent.postMessage({
      type: 'openApartment',
      apartmentId: apartmentId
    }, '*');
    
    // Also log to local console for easy testing
    console.log(`🎉 Apartment selected: ${apartmentId}`);
  };

  return <div ref={svgContainerRef} className="svg-container"></div>;
}
