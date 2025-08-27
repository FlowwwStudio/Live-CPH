let splitType = new SplitType(".slider_cms_title", {
    types: "words", // Split into words
    tagName: "span"
});

$(".slider_wrap").each(function () {
    let childArrow = $(this).find(".slider_btn");
    let childItems = $(this).find(".slider_cms_item").not('.w-condition-invisible').hide();
    let childDots = $(this).find(".slider_dot_item").not('.w-condition-invisible');
    let totalSlides = childItems.length;
    let activeIndex = 0;

    // Early return if no slides or dots found
    if (totalSlides === 0 || childDots.length === 0) {
        console.warn("Slider: No slides or dots found, skipping initialization");
        return;
    }

    childItems.first().css("display", "flex");
    
    // Safe GSAP set with element check
    let firstDotLine = childDots.eq(0).find(".slider_dot_line");
    if (firstDotLine.length > 0) {
        gsap.set(firstDotLine, { x: "0%" });
    }

    // DOT LINES
    let tl2 = gsap.timeline({ repeat: -1 });
    childDots.each(function (index) {
        let dotLine = $(this).find(".slider_dot_line");
        if (dotLine.length > 0) {
            tl2.addLabel(`step${index}`);
            tl2.to(dotLine, {
                scaleX: "1.0",
                ease: "none",
                duration: 5,
                onComplete: () => {
                    goNext(index + 1);
                }
            });
        }
    });

    // MAIN SLIDER CODE
    function moveSlide(nextIndex, forwards) {
        // Validate indices
        if (nextIndex < 0 || nextIndex >= totalSlides) {
            console.warn(`Slider: Invalid slide index ${nextIndex}`);
            return;
        }

        let tl3 = gsap.timeline();
        
        // Safe dot line animations
        let nextDotLine = childDots.eq(nextIndex).find(".slider_dot_line");
        let activeDotLine = childDots.eq(activeIndex).find(".slider_dot_line");
        
        if (nextDotLine.length > 0) {
            tl3.set(nextDotLine, { x: "0%" });
        }
        if (activeDotLine.length > 0) {
            tl3.fromTo(activeDotLine, { x: "0%" }, { x: "100%" });
        }

        tl2.seek(`step${nextIndex}`);

        let titleFrom = -100;
        let titleDelay = "<";
        if (forwards) {
            titleFrom = 100;
            titleDelay = "<50%";
        }
        
        childItems.hide();
        let prevItem = childItems.eq(activeIndex).css("display", "flex");
        let nextItem = childItems.eq(nextIndex).css("display", "flex");
        
        // Check if items exist before animating
        if (!prevItem.length || !nextItem.length) {
            console.warn("Slider: Slide items not found");
            return;
        }
        
        let tl = gsap.timeline({ defaults: { duration: 1, ease: "power2.inOut" } });
        
        if (forwards) {
            tl.fromTo(nextItem, { clipPath: "polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)" }, { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, -30% 100%)" });
            tl.fromTo(prevItem, { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)" }, { clipPath: "polygon(0% 0%, 0% 0%, -30% 100%, 0% 100%)" }, "<");
        } else {
            tl.fromTo(nextItem, { clipPath: "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)" }, { clipPath: "polygon(0% 0%, 100% 0%, 130% 100%, 0% 100%)" });
            tl.fromTo(prevItem, { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)" }, { clipPath: "polygon(100% 0%, 100% 0%, 100% 100%, 130% 100%)" }, "<");
        }
        
        // Safe title animation with element check
        let titleWords = nextItem.find(".slider_cms_title .word");
        if (titleWords.length > 0) {
            tl.fromTo(titleWords, { yPercent: titleFrom }, { yPercent: 0, duration: 0.5, ease: "power1.inOut", stagger: { amount: 0.05 } }, titleDelay);
        }

        activeIndex = nextIndex;
    }

    // ARROWS
    function goNext(num) {
        let nextIndex = num;
        if (nextIndex > totalSlides - 1) nextIndex = 0;
        moveSlide(nextIndex, true);
    }
    
    // go next
    childArrow.filter(".is-next").on("click", function () {
        goNext(activeIndex + 1);
    });
    
    // go prev
    childArrow.filter(".is-prev").on("click", function () {
        let nextIndex = activeIndex - 1;
        if (nextIndex < 0) nextIndex = totalSlides - 1;
        moveSlide(nextIndex, false);
    });

    // CLICK OF DOTS
    childDots.on("click", function () {
        let dotIndex = $(this).index();
        if (activeIndex > dotIndex) {
            moveSlide(dotIndex, false);
        } else if (activeIndex < dotIndex) {
            moveSlide(dotIndex, true);
        }
    });
});