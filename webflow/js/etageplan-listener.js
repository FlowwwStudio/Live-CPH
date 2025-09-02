
/**
 * LiveCPH Etageplan PostMessage Listener
 * 
 * This script listens for postMessage events from the Vercel-hosted SVG viewer
 * and triggers the appropriate modal for the selected apartment.
 * Also handles modal open/close states with .is-open class.
 */

(function() {
  console.log('🚀 Etageplan Listener script loaded');
  
  // Wait for DOM to be ready
  document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM ready, initializing etageplan listener');
    
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
          
          // Close any currently open modals first (but don't enable scroll yet)
          closeAllModalsOnly();
          
          // Disable scroll when opening modal
          disableScroll();
          
          // Add .is-open class to show this modal
          modalWrapper.classList.add('is-open');
        } else {
          console.error('❌ Modal wrapper not found for apartment:', apartmentId);
        }
      } else {
        console.error('❌ Apartment container not found with ID:', apartmentId);
      }
    }
    
     // Function to disable scroll on body (works with Lenis)
    function disableScroll() {
      // Check if Lenis is available
      if (window.lenis) {
        window.lenis.stop();
        // Allow scroll within modals by re-enabling Lenis for modal content
        setTimeout(() => {
          const openModal = document.querySelector('.apartment_modal-wrapper.is-open');
          if (openModal) {
            const modalContent = openModal.querySelector('.apartment_modal-content, .modal-content, [data-modal-content]');
            if (modalContent) {
              // Temporarily enable Lenis for modal content
              window.lenis.start();
              // Stop Lenis again but allow modal to scroll
              setTimeout(() => {
                window.lenis.stop();
                // Add wheel event listener to modal for manual scroll
                modalContent.addEventListener('wheel', handleModalScroll, { passive: false });
              }, 10);
            }
          }
        }, 50);
        console.log('🚫 Lenis scroll disabled');
      } else {
        // Fallback for normal scroll
        document.body.style.overflow = 'hidden';
        document.body.style.paddingRight = getScrollbarWidth() + 'px';
        console.log('🚫 Normal scroll disabled');
      }
    }
    
    // Function to handle scroll within modal
    function handleModalScroll(e) {
      const modalContent = e.currentTarget;
      const scrollTop = modalContent.scrollTop;
      const scrollHeight = modalContent.scrollHeight;
      const clientHeight = modalContent.clientHeight;
      
      // Allow scroll if there's content to scroll
      if (scrollHeight > clientHeight) {
        // Check if we're at the top or bottom
        if ((scrollTop <= 0 && e.deltaY < 0) || 
            (scrollTop >= scrollHeight - clientHeight && e.deltaY > 0)) {
          e.preventDefault();
        }
      } else {
        e.preventDefault();
      }
    }
    
    // Function to enable scroll on body (works with Lenis)
    function enableScroll() {
      // Remove modal scroll event listeners
      const modalContents = document.querySelectorAll('.apartment_modal-content, .modal-content, [data-modal-content]');
      modalContents.forEach(modalContent => {
        modalContent.removeEventListener('wheel', handleModalScroll);
      });
      
      // Check if Lenis is available
      if (window.lenis) {
        window.lenis.start();
        console.log('✅ Lenis scroll enabled');
      } else {
        // Fallback for normal scroll
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        console.log('✅ Normal scroll enabled');
      }
    }
    
    // Function to get scrollbar width to prevent layout shift
    function getScrollbarWidth() {
      const outer = document.createElement('div');
      outer.style.visibility = 'hidden';
      outer.style.overflow = 'scroll';
      outer.style.msOverflowStyle = 'scrollbar';
      document.body.appendChild(outer);
      
      const inner = document.createElement('div');
      outer.appendChild(inner);
      
      const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;
      outer.parentNode.removeChild(outer);
      
      return scrollbarWidth;
    }
    
    // Function to close all modals
    function closeAllModals() {
      const openModals = document.querySelectorAll('.apartment_modal-wrapper.is-open');
      openModals.forEach(modal => {
        modal.classList.remove('is-open');
      });
      
      // Enable scroll when closing all modals
      enableScroll();
      console.log('🔒 Closed all modals');
    }
    
    // Function to close all modals without enabling scroll (for internal use)
    function closeAllModalsOnly() {
      const openModals = document.querySelectorAll('.apartment_modal-wrapper.is-open');
      openModals.forEach(modal => {
        modal.classList.remove('is-open');
      });
      console.log('🔒 Closed all modals (scroll unchanged)');
    }
    
    // Function to close specific modal
    function closeModal(modalWrapper) {
      modalWrapper.classList.remove('is-open');
      
      // Enable scroll when closing modal
      enableScroll();
      console.log('🔒 Modal closed');
    }
    
    // Listen for messages from the SVG iframe
    window.addEventListener('message', function(event) {
      console.log('📨 Received postMessage:', event.data);
      
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
