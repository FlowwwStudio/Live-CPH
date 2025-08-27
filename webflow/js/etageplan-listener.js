/**
 * LiveCPH Etageplan PostMessage Listener
 * 
 * This script listens for postMessage events from the Vercel-hosted SVG viewer
 * and triggers the appropriate modal for the selected apartment.
 */

(function() {
  // Wait for DOM to be ready
  document.addEventListener('DOMContentLoaded', function() {
    // Listen for messages from the iframe
    window.addEventListener('message', function(event) {
      // Validate the message type
      if (event.data && event.data.type === 'openApartment') {
        const apartmentId = event.data.apartmentId;
        console.log('Received apartment ID:', apartmentId);
        
        // Find the matching apartment in the collection
        const apartmentTrigger = document.querySelector(`[data-apartment-id="${apartmentId}"]`);
        
        if (apartmentTrigger) {
          console.log('Found apartment trigger, opening modal...');
          // Trigger the modal
          apartmentTrigger.click();
        } else {
          console.error('Apartment not found with ID:', apartmentId);
        }
      }
    });
    
    console.log('LiveCPH Etageplan Listener initialized');
  });
})();
