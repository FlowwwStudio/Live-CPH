/**
 * LiveCPH Etageplan PostMessage Listener
 * 
 * This script listens for postMessage events from the Vercel-hosted SVG viewer
 * and triggers the appropriate modal for the selected apartment.
 * Also handles modal open/close states with .is-open class.
 */

(function() {
  // Wait for DOM to be ready
  document.addEventListener('DOMContentLoaded', function() {
    
    // Function to open apartment modal
    function openApartmentModal(apartmentId) {
      console.log('🔍 Looking for apartment:', apartmentId);
      
      // Find the matching apartment container
      const apartmentContainer = document.querySelector(`[data-apartment-id="${apartmentId}"]`);
      
      if (apartmentContainer) {
        // Find the modal wrapper inside this apartment
        const modalWrapper = apartmentContainer.querySelector('.apartment_modal-wrapper');
        
        if (modalWrapper) {
          console.log('✅ Opening modal for apartment:', apartmentId);
          
          // Close any currently open modals first
          closeAllModals();
          
          // Add .is-open class to show this modal
          modalWrapper.classList.add('is-open');
        } else {
          console.error('❌ Modal wrapper not found for apartment:', apartmentId);
        }
      } else {
        console.error('❌ Apartment container not found with ID:', apartmentId);
      }
    }
    
    // Function to close all modals
    function closeAllModals() {
      const openModals = document.querySelectorAll('.apartment_modal-wrapper.is-open');
      openModals.forEach(modal => {
        modal.classList.remove('is-open');
      });
      console.log('🔒 Closed all modals');
    }
    
    // Function to close specific modal
    function closeModal(modalWrapper) {
      modalWrapper.classList.remove('is-open');
      console.log('🔒 Modal closed');
    }
    
    // Listen for messages from the SVG iframe
    window.addEventListener('message', function(event) {
      // Validate the message type
      if (event.data && event.data.type === 'openApartment') {
        const apartmentId = event.data.apartmentId;
        console.log('📨 Received apartment ID from SVG:', apartmentId);
        openApartmentModal(apartmentId);
      }
    });
    
    // Add click handlers to all modal close buttons
    function setupModalCloseHandlers() {
      const closeButtons = document.querySelectorAll('[data-apartment-modal-toggle]');
      
      closeButtons.forEach(button => {
        button.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          
          // Find the closest modal wrapper
          const modalWrapper = this.closest('.apartment_modal-wrapper');
          if (modalWrapper) {
            closeModal(modalWrapper);
          }
        });
      });
      
      console.log(`🎯 Setup ${closeButtons.length} modal close handlers`);
    }
    
    // Add click handler to modal overlays to close on background click
    function setupOverlayCloseHandlers() {
      const overlays = document.querySelectorAll('.apartment_overlay');
      
      overlays.forEach(overlay => {
        overlay.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          
          // Find the modal wrapper
          const modalWrapper = this.closest('.apartment_modal-wrapper');
          if (modalWrapper) {
            closeModal(modalWrapper);
          }
        });
      });
      
      console.log(`🎯 Setup ${overlays.length} overlay close handlers`);
    }
    
    // Close modal on Escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        closeAllModals();
      }
    });
    
    // Initialize all handlers
    setupModalCloseHandlers();
    setupOverlayCloseHandlers();
    
    console.log('✅ LiveCPH Etageplan Listener initialized with modal support');
  });
})();
