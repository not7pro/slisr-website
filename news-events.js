import { db, ref, onValue, query, orderByChild } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    const newsGrid = document.getElementById('newsGrid');
    const filterBtns = document.querySelectorAll('.filter-btn');
    let allNews = [];
    let activeFilter = 'all';

    // ── Category config ──────────────────────────────────────────
    const CATEGORY_CONFIG = {
        'Academic':    { tag: 'tag-academic',    stripe: 'stripe-academic',    icon: '📚' },
        'Event':       { tag: 'tag-event',        stripe: 'stripe-event',        icon: '🎉' },
        'Update':      { tag: 'tag-update',       stripe: 'stripe-update',       icon: '📢' },
        'Achievement': { tag: 'tag-achievement',  stripe: 'stripe-achievement',  icon: '🏆' },
        'Holiday':     { tag: 'tag-holiday',      stripe: 'stripe-holiday',      icon: '📅' },
    };

    function getCategoryConfig(cat) {
        return CATEGORY_CONFIG[cat] || { tag: 'tag-update', stripe: 'stripe-update', icon: '📌' };
    }

    // ── Real-time Firebase listener ───────────────────────────────
    function fetchNews() {
        newsGrid.innerHTML = `
            <div class="news-loading">
                <div class="spinner"></div>
                <p>Fetching latest updates…</p>
            </div>`;

        const q = query(ref(db, 'news'), orderByChild('timestamp'));

        onValue(q, (snapshot) => {
            allNews = [];
            snapshot.forEach((doc) => {
                allNews.push({ id: doc.key, ...doc.val() });
            });
            // Newest first
            allNews.reverse();
            renderNews(activeFilter);
        }, (error) => {
            console.error('Firebase read failed:', error);
            newsGrid.innerHTML = `
                <div class="news-empty">
                    <i class="fas fa-wifi"></i>
                    <h3>Could not load posts</h3>
                    <p>Please check your connection and try again.</p>
                </div>`;
        });
    }

    // ── Render cards ─────────────────────────────────────────────
    function renderNews(filter) {
        if (!newsGrid) return;

        const filtered = filter === 'all'
            ? allNews
            : allNews.filter(item => item.category === filter);

        if (filtered.length === 0) {
            newsGrid.innerHTML = `
                <div class="news-empty">
                    <i class="fas fa-newspaper"></i>
                    <h3>No posts yet</h3>
                    <p>${filter === 'all' ? 'Check back soon for the latest school news and events.' : `No ${filter} posts yet.`}</p>
                </div>`;
            return;
        }

        newsGrid.innerHTML = filtered.map((item, index) => {
            const cfg = getCategoryConfig(item.category);

            // Format publish date
            const publishDate = item.publishedAt
                ? new Date(item.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
                : 'Recent';

            // Format event date (if set separately)
            const eventDateHtml = item.eventDate
                ? `<div class="event-date-badge"><i class="fas fa-calendar-check"></i> ${new Date(item.eventDate + 'T00:00:00').toLocaleDateString('en-US', { weekday:'short', day:'numeric', month:'long', year:'numeric' })}</div>`
                : '';

            // Image or coloured stripe
            const imageHtml = item.image
                ? `<div class="news-card-image-wrap">
                       <img class="news-card-image" src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}" loading="lazy" onerror="this.parentElement.style.display='none'">
                   </div>`
                : `<span class="news-card-no-image ${cfg.stripe}"></span>`;

            const preview = item.description
                ? item.description.substring(0, 160) + (item.description.length > 160 ? '…' : '')
                : '';

            return `
                <article class="news-card" style="animation-delay:${index * 0.07}s;" onclick="openPost('${item.id}')" role="button" tabindex="0" aria-label="Read: ${escapeHtml(item.title)}">
                    ${imageHtml}
                    <div class="news-card-content">
                        <div class="news-card-meta">
                            <span class="news-tag ${cfg.tag}">${cfg.icon} ${item.category}</span>
                            <span class="news-date"><i class="far fa-clock"></i> ${publishDate}</span>
                        </div>
                        <h2>${escapeHtml(item.title)}</h2>
                        <p class="news-preview">${escapeHtml(preview)}</p>
                        ${eventDateHtml}
                        <span class="news-read-more">Read more <i class="fas fa-arrow-right"></i></span>
                    </div>
                </article>
            `;
        }).join('');
    }

    // ── Full post modal ──────────────────────────────────────────
    window.openPost = function(postId) {
        const item = allNews.find(n => n.id === postId);
        if (!item) return;

        const cfg = getCategoryConfig(item.category);
        const publishDate = item.publishedAt
            ? new Date(item.publishedAt).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
            : '';

        const eventDateHtml = item.eventDate
            ? `<div class="event-date-badge" style="margin-bottom:16px;"><i class="fas fa-calendar-check"></i> Event on: ${new Date(item.eventDate + 'T00:00:00').toLocaleDateString('en-US', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}</div>`
            : '';

        const imgHtml = item.image
            ? `<div class="post-modal-header"><img class="post-modal-img" src="${escapeHtml(item.image)}" alt="">
               <button class="post-modal-close" onclick="closePost()" aria-label="Close">&times;</button></div>`
            : `<div class="post-modal-header" style="padding:24px 40px 0;position:relative;">
               <button class="post-modal-close" onclick="closePost()" aria-label="Close" style="position:static;margin-left:auto;display:flex;">&times;</button></div>`;

        const overlay = document.createElement('div');
        overlay.className = 'post-modal-overlay';
        overlay.id = 'postModalOverlay';
        overlay.innerHTML = `
            <div class="post-modal" role="dialog" aria-modal="true">
                ${imgHtml}
                <div class="post-modal-body">
                    <div class="post-modal-meta">
                        <span class="news-tag ${cfg.tag}">${cfg.icon} ${item.category}</span>
                        ${publishDate ? `<span class="news-date"><i class="far fa-clock"></i> ${publishDate}</span>` : ''}
                    </div>
                    <h2 class="post-modal-title">${escapeHtml(item.title)}</h2>
                    ${eventDateHtml}
                    <p class="post-modal-desc">${escapeHtml(item.description || '')}</p>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
        document.body.style.overflow = 'hidden';

        // Close on overlay backdrop click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closePost();
        });

        // Close on Escape key
        document.addEventListener('keydown', handleEsc);
    };

    function handleEsc(e) {
        if (e.key === 'Escape') closePost();
    }

    window.closePost = function() {
        const overlay = document.getElementById('postModalOverlay');
        if (overlay) overlay.remove();
        document.body.style.overflow = '';
        document.removeEventListener('keydown', handleEsc);
    };

    // ── Filter buttons ────────────────────────────────────────────
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeFilter = btn.getAttribute('data-filter');
            renderNews(activeFilter);
        });
    });

    // ── Keyboard nav on cards ─────────────────────────────────────
    newsGrid.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.target.classList.contains('news-card')) {
            e.target.click();
        }
    });

    // ── Utility ──────────────────────────────────────────────────
    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    // ── Boot ─────────────────────────────────────────────────────
    fetchNews();
});
