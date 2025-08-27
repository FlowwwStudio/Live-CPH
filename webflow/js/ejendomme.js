
$(".scroll_horizontal_wrap").each(function (index) {
  let wrap = $(this);
  let inner = $(this).find(".scroll_horizontal_inner");
  let track = $(this).find(".scroll_horizontal_track");

  // set section height
  function setScrollDistance() {
    wrap.css("height", "calc(" + track.outerWidth() + "px + 100vh)");
  }
  setScrollDistance();
  ScrollTrigger.refresh();
  window.addEventListener("resize", setScrollDistance);

  // create main horizontal scroll timeline
  let tl = gsap.timeline({
    scrollTrigger: {
      trigger: wrap,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
    },
    defaults: { ease: "none" },
  });
  tl.to(track, { xPercent: -100 });

  // get container left position
  function containerLeft() {
    return inner.offset().left + "px";
  }
  // get container right position
  function containerRight() {
    return (inner.offset().left + inner.innerWidth()) + "px";
  }

  //
  let tl2 = gsap.timeline({
    scrollTrigger: {
      trigger: $(this).find(".scroll_horizontal_hero_wrap"),
      containerAnimation: tl,
      start: "left " + containerLeft(),
      end: "right " + containerLeft(),
      scrub: true,
      // markers: true,
    },
    defaults: { ease: "none" },
  });

  //
  let tl3 = gsap.timeline({
    scrollTrigger: {
      trigger: $(this).find(".scroll_horizontal_pin_wrap"),
      containerAnimation: tl,
      start: "left " + containerLeft(),
      end: "right " + containerRight(),
      scrub: true,
      // markers: true,
    },
    defaults: { ease: "none" },
  });
  tl3.to($(this).find(".scroll_horizontal_pin_element"), { xPercent: 100 });
  // section each loop end
});



// GSAP Slider with Tab Fix

  gsap.registerPlugin(Draggable, InertiaPlugin);

  function initBasicGSAPSlider() {
    document.querySelectorAll('[data-gsap-slider-init]').forEach(root => {
      if (root._sliderDraggable) root._sliderDraggable.kill();

      const collection = root.querySelector('[data-gsap-slider-collection]');
      const track      = root.querySelector('[data-gsap-slider-list]');
      const items      = Array.from(root.querySelectorAll('[data-gsap-slider-item]'));
      const controls   = Array.from(root.querySelectorAll('[data-gsap-slider-control]'));

      // Inject ARIA attributes
      root.setAttribute('role','region');
      root.setAttribute('aria-roledescription','carousel');
      root.setAttribute('aria-label','Slider');
      collection.setAttribute('role','group');
      collection.setAttribute('aria-roledescription','Slides List');
      collection.setAttribute('aria-label','Slides');
      items.forEach((slide,i) => {
        slide.setAttribute('role','group');
        slide.setAttribute('aria-roledescription','Slide');
        slide.setAttribute('aria-label',`Slide ${i+1} of ${items.length}`);
        slide.setAttribute('aria-hidden','true');
        slide.setAttribute('aria-selected','false');
        slide.setAttribute('tabindex','-1');
      });
      controls.forEach(btn => {
        const dir = btn.getAttribute('data-gsap-slider-control');
        btn.setAttribute('role','button');
        btn.setAttribute('aria-label', dir==='prev' ? 'Previous Slide' : 'Next Slide');
        btn.disabled = true;
        btn.setAttribute('aria-disabled','true');
      });

      // Determine if slider runs
      const styles      = getComputedStyle(root);
      const statusVar   = styles.getPropertyValue('--slider-status').trim();
      let   spvVar      = parseFloat(styles.getPropertyValue('--slider-spv'));
      const rect        = items[0].getBoundingClientRect();
      const marginRight = parseFloat(getComputedStyle(items[0]).marginRight);
      const slideW      = rect.width + marginRight;
      if (isNaN(spvVar)) {
        spvVar = collection.clientWidth / slideW;
      }
      const spv = Math.max(1, Math.min(spvVar, items.length));
      const sliderEnabled = statusVar==='on' && spv < items.length;
      root.setAttribute('data-gsap-slider-status', sliderEnabled ? 'active' : 'not-active');

      if (!sliderEnabled) {
        track.removeAttribute('style');
        track.onmouseenter = null;
        track.onmouseleave = null;
        items.forEach(slide => {
          slide.removeAttribute('role');
          slide.removeAttribute('aria-roledescription');
          slide.removeAttribute('aria-label');
          slide.removeAttribute('aria-hidden');
          slide.removeAttribute('aria-selected');
          slide.removeAttribute('tabindex');
          slide.removeAttribute('data-gsap-slider-item-status');
        });
        controls.forEach(btn => {
          btn.disabled = false;
          btn.removeAttribute('role');
          btn.removeAttribute('aria-label');
          btn.removeAttribute('aria-disabled');
          btn.removeAttribute('data-gsap-slider-control-status');
        });
        return;
      }

      // Hover state
      track.onmouseenter = () => track.setAttribute('data-gsap-slider-list-status','grab');
      track.onmouseleave = () => track.removeAttribute('data-gsap-slider-list-status');

      // Calculate bounds & snap points
      const vw        = collection.clientWidth;
      const tw        = track.scrollWidth;
      const maxScroll = Math.max(tw - vw, 0);
      const minX      = -maxScroll;
      const maxX      = 0;
      const maxIndex  = maxScroll / slideW;
      const full      = Math.floor(maxIndex);
      const snapPoints = [];
      for (let i = 0; i <= full; i++) snapPoints.push(-i * slideW);
      if (full < maxIndex) snapPoints.push(-maxIndex * slideW);

      let activeIndex    = 0;
      const setX         = gsap.quickSetter(track,'x','px');
      let collectionRect = collection.getBoundingClientRect();

      function updateStatus(x) {
        if (x > maxX || x < minX) return;

        const calcX = Math.max(minX, Math.min(maxX, x));
        let closest = snapPoints.reduce((prev, curr) =>
          Math.abs(curr - calcX) < Math.abs(prev - calcX) ? curr : prev
        );
        activeIndex = snapPoints.indexOf(closest);

        items.forEach((slide,i) => {
          const r           = slide.getBoundingClientRect();
          const leftEdge    = r.left - collectionRect.left;
          const slideCenter = leftEdge + r.width/2;
          const inView      = slideCenter > 0 && slideCenter < collectionRect.width;
          const status      = i === activeIndex ? 'active' : inView ? 'inview' : 'not-active';

          slide.setAttribute('data-gsap-slider-item-status', status);
          slide.setAttribute('aria-selected', i === activeIndex ? 'true' : 'false');
          slide.setAttribute('aria-hidden', inView ? 'false' : 'true');
          slide.setAttribute('tabindex', i === activeIndex ? '0' : '-1');
        });

        controls.forEach(btn => {
          const dir = btn.getAttribute('data-gsap-slider-control');
          const can = dir === 'prev' ? activeIndex > 0 : activeIndex < snapPoints.length - 1;
          btn.disabled = !can;
          btn.setAttribute('aria-disabled', can ? 'false' : 'true');
          btn.setAttribute('data-gsap-slider-control-status', can ? 'active' : 'not-active');
        });
      }

      controls.forEach(btn => {
        const dir = btn.getAttribute('data-gsap-slider-control');
        btn.addEventListener('click', () => {
          if (btn.disabled) return;
          const target = activeIndex + (dir === 'next' ? 1 : -1);
          gsap.to(track, {
            duration: 0.4,
            x: snapPoints[target],
            onUpdate: () => updateStatus(gsap.getProperty(track,'x'))
          });
        });
      });

      // Init Draggable
      root._sliderDraggable = Draggable.create(track, {
        type: 'x',
        inertia: true,
        bounds: {minX, maxX},
        throwResistance: 2000,
        dragResistance: 0.05,
        maxDuration: 0.6,
        minDuration: 0.2,
        edgeResistance: 0.75,
        snap: {x: snapPoints, duration: 0.4},
        onPress() {
          track.setAttribute('data-gsap-slider-list-status','grabbing');
          collectionRect = collection.getBoundingClientRect();
        },
        onDrag() {
          setX(this.x);
          updateStatus(this.x);
        },
        onThrowUpdate() {
          setX(this.x);
          updateStatus(this.x);
        },
        onThrowComplete() {
          setX(this.endX);
          updateStatus(this.endX);
          track.setAttribute('data-gsap-slider-list-status','grab');
        },
        onRelease() {
          setX(this.x);
          updateStatus(this.x);
          track.setAttribute('data-gsap-slider-list-status','grab');
        }
      })[0];

      // Initial state
      setX(0);
      updateStatus(0);
    });
  }

  // Reinit on resize
  function debounceOnWidthChange(fn, ms) {
    let last = innerWidth, timer;
    return function(...args) {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (innerWidth !== last) {
          last = innerWidth;
          fn.apply(this, args);
        }
      }, ms);
    };
  }

  window.addEventListener('resize', debounceOnWidthChange(initBasicGSAPSlider, 200));

  // Init on DOM ready
  document.addEventListener('DOMContentLoaded', function() {
    initBasicGSAPSlider();
  });

  // ✅ Fix: Reinit on tab click (Webflow Tabs)
  document.querySelectorAll('.w-tab-link').forEach(tab => {
    tab.addEventListener('click', () => {
      setTimeout(() => {
        initBasicGSAPSlider();
      }, 50); // slight delay for DOM render
    });
  });


  document.querySelectorAll('.w-tab-link').forEach(tab => {
    tab.addEventListener('click', () => {
      setTimeout(() => {
        document.querySelectorAll('[data-gsap-slider-init]').forEach(el => {
          if (!el.classList.contains('gsap-slider-initialized')) {
            window.gsapTabsSlider.init(el);
          }
        });
      }, 300); // Wait for Webflow tab to become visible
    });
  });



function initTabSystem() {
  const wrappers = document.querySelectorAll('[data-tabs="wrapper"]');
  
  wrappers.forEach((wrapper) => {
    const contentItems = wrapper.querySelectorAll('[data-tabs="content-item"]');
    const visualItems = wrapper.querySelectorAll('[data-tabs="visual-item"]');
    
    const autoplay = wrapper.dataset.tabsAutoplay === "true";
    const autoplayDuration = parseInt(wrapper.dataset.tabsAutoplayDuration) || 5000;
    
    let activeContent = null; // keep track of active item/link
    let activeVisual = null;
    let isAnimating = false;
    let progressBarTween = null; // to stop/start the progress bar

    function startProgressBar(index) {
      if (progressBarTween) progressBarTween.kill();
      const bar = contentItems[index].querySelector('[data-tabs="item-progress"]');
      if (!bar) return;
      
      gsap.set(bar, { scaleX: 0, transformOrigin: "left center" });
      progressBarTween = gsap.to(bar, {
        scaleX: 1,
        duration: autoplayDuration / 1000,
        ease: "power1.inOut",
        onComplete: () => {
          if (!isAnimating) {
            const nextIndex = (index + 1) % contentItems.length;
            switchTab(nextIndex); // once bar is full, set next to active – this is important
          }
        },
      });
    }

    function switchTab(index) {
      if (isAnimating || contentItems[index] === activeContent) return;
      
      isAnimating = true;
      if (progressBarTween) progressBarTween.kill(); // Stop any running progress bar here
      
      const outgoingContent = activeContent;
      const outgoingVisual = activeVisual;
      const outgoingBar = outgoingContent?.querySelector('[data-tabs="item-progress"]');
      
      const incomingContent = contentItems[index];
      const incomingVisual = visualItems[index];
      const incomingBar = incomingContent.querySelector('[data-tabs="item-progress"]');
      
      outgoingContent?.classList.remove("active");
      outgoingVisual?.classList.remove("active");
      incomingContent.classList.add("active");
      incomingVisual.classList.add("active");
      
      const tl = gsap.timeline({
        defaults: { duration: 0.65, ease: "power3" },
        onComplete: () => {
          activeContent = incomingContent;
          activeVisual = incomingVisual;
          isAnimating = false;
          if (autoplay) startProgressBar(index); // Start autoplay bar here
        },
      });
      
      // Wrap 'outgoing' in a check to prevent warnings on first run of the function
      // Of course, during first run (on page load), there's no 'outgoing' tab yet!
      if (outgoingContent) {
        outgoingContent.classList.remove("active");
        outgoingVisual?.classList.remove("active");
        tl.set(outgoingBar, { transformOrigin: "right center" })
          .to(outgoingBar, { scaleX: 0, duration: 0.3 }, 0)
          .to(outgoingVisual, { autoAlpha: 0, xPercent: 3 }, 0)
          .to(outgoingContent.querySelector('[data-tabs="item-details"]'), { height: 0 }, 0);
      }

      incomingContent.classList.add("active");
      incomingVisual.classList.add("active");
      tl.fromTo(incomingVisual, { autoAlpha: 0, xPercent: 3 }, { autoAlpha: 1, xPercent: 0 }, 0.3)
        .fromTo( incomingContent.querySelector('[data-tabs="item-details"]'),{ height: 0 },{ height: "auto" },0)
        .set(incomingBar, { scaleX: 0, transformOrigin: "left center" }, 0);
    }

    // on page load, set first to active
    // idea: you could wrap this in a scrollTrigger
    // so it will only start once a user reaches this section
    switchTab(0);
    
    // switch tabs on click
    contentItems.forEach((item, i) =>
      item.addEventListener("click", () => {
        if (item === activeContent) return; // ignore click if current one is already active
        switchTab(i);
      })
    );
    
  });
}

// Initialize Tab System with Autoplay Option
document.addEventListener('DOMContentLoaded', () => {
  initTabSystem();
});

