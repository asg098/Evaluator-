// ============================================================
// ASG Offline Service Worker (Same-Origin Wrapper)
// ============================================================
// This worker is served from the same origin as the web app to comply
// with browser ServiceWorker Same-Origin security policies.

try {
    importScripts('https://asgweboffline.onrender.com/sdk/asg-sw.js');
    console.log('[ASG SW] Successfully imported remote ASG Service Worker bundle.');
} catch (e) {
    console.error('[ASG SW] Failed to import remote ASG Service Worker:', e);
}
