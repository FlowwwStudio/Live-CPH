$(document).ready(function() {
  const wfIx = Webflow.require("ix3");
  
  // Opening animation (on load)
  wfIx.emit("transition enter");
  
  // Click animation (on link click)
  $("a:not(.excluded-class)").on("click", function (e) {
    const url = $(this).attr("href");
    
    // Link-kontrol
    if (
      $(this).prop("hostname") === window.location.hostname &&
      !url.includes("#") &&
      $(this).attr("target") !== "_blank"
    ) {
      e.preventDefault();
      
      // Start leave animation
      wfIx.emit("transition leave");
      
      // Navigate after animation duration (adjust timing as needed)
      setTimeout(() => {
        window.location.href = url;
      }, 800); // Juster dette tal til din animations varighed i ms
    }
  });
  
  // Handle back/forward navigation
  window.onpageshow = function (event) {
    if (event.persisted) window.location.reload();
  };
});