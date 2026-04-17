import { db, ref, onValue, query, orderByChild } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    const newsGrid = document.getElementById('newsGrid');
    const filterBtns = document.querySelectorAll('.filter-btn');
    let allNews = [];

    // Real-time listener for News collection
    function fetchNews() {
        const q = query(ref(db, 'news'), orderByChild('timestamp'));
        
        onValue(q, (snapshot) => {
            allNews = [];
            snapshot.forEach((doc) => {
                allNews.push({ id: doc.key, ...doc.val() });
            });
            renderNews('all');
        });
    }

    function renderNews(filter) {
        if (!newsGrid) return;

        const filtered = filter === 'all' 
            ? allNews 
            : allNews.filter(item => item.category === filter);

        if (filtered.length === 0) {
            newsGrid.innerHTML = `
                <div class="news-loading">
                    <p>No news items found in this category.</p>
                </div>
            `;
            return;
        }

        let html = '';
        filtered.forEach(item => {
            const date = item.timestamp 
                ? new Date(item.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) 
                : 'Recent';
            
            const tagClass = `tag-${item.category.toLowerCase()}`;

            html += `
                <div class="news-card" data-aos="fade-up">
                    <div class="news-card-content">
                        <span class="news-tag ${tagClass}">${item.category}</span>
                        <span class="news-date"><i class="far fa-calendar-alt"></i> ${date}</span>
                        <h2>${item.title}</h2>
                        <p class="news-preview">${item.description}</p>
                    </div>
                </div>
            `;
        });

        newsGrid.innerHTML = html;
    }

    // Filter Logic
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderNews(btn.getAttribute('data-filter'));
        });
    });

    // Start fetching
    fetchNews();
});
