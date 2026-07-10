// Log execution order
window.__debugLog = [];

function logDebug(msg) {
  const timestamp = performance.now().toFixed(2);
  const entry = `[${timestamp}ms] ${msg}`;
  window.__debugLog.push(entry);
  console.log(entry);
}

// Capture DOMContentLoaded event
document.addEventListener('DOMContentLoaded', function() {
  logDebug('DOMContentLoaded fired');
  logDebug(`Slider elements: ${document.querySelectorAll('.slider').length}`);
});

// Capture load event
window.addEventListener('load', function() {
  logDebug('load event fired');
  logDebug(`Slider elements: ${document.querySelectorAll('.slider').length}`);
});

logDebug('Script started, DOM state: ' + document.readyState);
logDebug(`Initial slider elements: ${document.querySelectorAll('.slider').length}`);
