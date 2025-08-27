import { useEffect, useRef } from 'react';

export default function SVGViewer({ property, floor }) {
  const svgContainerRef = useRef(null);

  useEffect(() => {
    const loadSVG = async () => {
      try {
        const response = await fetch(`/svg/${property}/${floor}.svg`);
        if (!response.ok) throw new Error('Failed to load SVG');
        
        const svgText = await response.text();
        if (svgContainerRef.current) {
          svgContainerRef.current.innerHTML = svgText;
          
          // Process the SVG after it's loaded
          enhanceSVG(property, floor);
        }
      } catch (error) {
        console.error('Error loading SVG:', error);
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
    // Normalized property name for ID formatting
    const normalizedProperty = property.toLowerCase();
    const floorNum = parseInt(floor.replace(/\D/g, ''), 10);
    
    // Find all apartment elements in SVG
    // Look for elements with class names containing 'appartment', 'apartment', 'lejlighed'
    const apartmentElements = svgContainerRef.current.querySelectorAll('[class*="appartment"], [class*="apartment"], [class*="lejlighed"]');
    
    apartmentElements.forEach(element => {
      // Extract apartment ID
      const apartmentId = extractApartmentId(element, normalizedProperty, floorNum);
      
      if (apartmentId) {
        // Store the ID as a data attribute
        element.setAttribute('data-apartment-id', apartmentId);
        
        // Add click handler
        element.addEventListener('click', () => {
          sendApartmentMessage(apartmentId);
        });
        
        // Add hover effects via class
        element.classList.add('interactive-apartment');
      }
    });

    // Apply CSS for interactivity
    const style = document.createElement('style');
    style.textContent = `
      .interactive-apartment {
        cursor: pointer;
        transition: fill-opacity 0.3s ease;
      }
      .interactive-apartment:hover {
        fill-opacity: 0.7;
      }
    `;
    svgContainerRef.current.appendChild(style);
  };

  // Extract apartment ID from SVG element
  const extractApartmentId = (svgElement, property, floor) => {
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
        
        return `${propertyPrefix}-${floor}-${apartmentNum}`;
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
        
        return `${propertyPrefix}-${floor}-${apartmentNum}`;
      }
    }
    
    return null;
  };

  // Send message to Webflow
  const sendApartmentMessage = (apartmentId) => {
    window.parent.postMessage({
      type: 'openApartment',
      apartmentId: apartmentId
    }, '*');
  };

  return <div ref={svgContainerRef} className="svg-container"></div>;
}
