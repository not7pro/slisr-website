// analytics.js - Real Visitor Tracking for SLISR Website
// Uses Firebase Realtime DB to safely increment per unique session
import { db, ref, runTransaction } from './firebase-config.js';

(function trackVisit() {
    // Only count once per browser session to prevent inflation on refresh
    if (sessionStorage.getItem('slisr_visit_counted')) return;

    const visitorRef = ref(db, 'stats/total_visitors');

    // Atomically increment the counter
    runTransaction(visitorRef, (currentVal) => {
        return (currentVal || 0) + 1;
    }).then(() => {
        sessionStorage.setItem('slisr_visit_counted', 'true');
    }).catch((err) => {
        // Silently fail - analytics should never break the user experience
        console.warn('Analytics write failed (non-critical):', err.message);
    });
})();
