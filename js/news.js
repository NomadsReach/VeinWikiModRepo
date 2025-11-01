/* jshint esversion: 11 */
/* globals console */

let newsCache = null;
let newsCacheTime = 0;
const CACHE_DURATION = 600000;

/**
 * Escapes HTML special characters to prevent XSS attacks
 * @param {string} str - String to escape
 * @returns {string} - Escaped string safe for HTML insertion
 */
function escapeHTML(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/[&<>"']/g, function(match) {
        switch (match) {
            case '&': return '&amp;';
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '"': return '&quot;';
            case "'": return '&#39;';
            default: return match;
        }
    });
}

async function fetchNews() {
    const now = Date.now();
    if (newsCache && (now - newsCacheTime) < CACHE_DURATION) {
        return newsCache;
    }

    try {
        const proxyUrl = 'https://api.rss2json.com/v1/api.json?rss_url=https://news.vein.gg/rss/';
        const response = await fetch(proxyUrl);
        if (!response.ok) throw new Error(`Failed to fetch news: ${response.status}`);
        
        const data = await response.json();
        if (data.status === 'ok' && data.items) {
            newsCache = data.items.map(item => {
                let imageUrl = '';
                if (item.thumbnail) {
                    imageUrl = item.thumbnail;
                } else if (item.content) {
                    const imgMatch = item.content.match(/<img[^>]+src="([^"]+)"/);
                    if (imgMatch) imageUrl = imgMatch[1];
                } else if (item.enclosure && item.enclosure.link) {
                    imageUrl = item.enclosure.link;
                }
                
                return {
                    title: item.title,
                    url: item.link,
                    published_at: item.pubDate,
                    excerpt: item.contentSnippet || item.description || '',
                    plaintext: item.contentSnippet || item.description || '',
                    image: imageUrl
                };
            });
        } else {
            newsCache = [];
        }
        newsCacheTime = now;
        return newsCache;
    } catch (err) {
        console.error('Failed to fetch VEIN news:', err);
        return [];
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function truncateText(text, maxLength = 150) {
    if (!text) return '';
    const plainText = text.replace(/<[^>]*>/g, '');
    if (plainText.length <= maxLength) return plainText;
    return plainText.substring(0, maxLength).trim() + '...';
}

export async function renderNewsCarousel(container) {
    if (!container) return;
    
    const posts = await fetchNews();
    if (posts.length === 0) {
        container.innerHTML = '<p>Unable to load news. Please visit <a href="https://news.vein.gg/" target="_blank">news.vein.gg</a> for the latest updates.</p>';
        return;
    }

    const slides = posts.slice(0, 5).map((post, index) => {
        const excerpt = truncateText(post.excerpt, 120);
        const escapedTitle = escapeHTML(post.title);
        const escapedExcerpt = escapeHTML(excerpt);
        const escapedUrl = escapeHTML(post.url);
        const escapedImage = post.image ? escapeHTML(post.image) : '';
        
        return `
            <div class="news-slide ${index === 0 ? 'active' : ''}" data-index="${index}">
                ${post.image ? `<img src="${escapedImage}" alt="${escapedTitle}" class="news-slide-image">` : ''}
                <div class="news-slide-content">
                    <h3 class="news-slide-title">${escapedTitle}</h3>
                    <p class="news-slide-excerpt">${escapedExcerpt}</p>
                    <div class="news-slide-meta">
                        <span class="news-date">${formatDate(post.published_at)}</span>
                        <a href="${escapedUrl}" target="_blank" class="news-read-more">
                            Read More <i class="fas fa-arrow-right"></i>
                        </a>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    const indicators = posts.slice(0, 5).map((_, index) => 
        `<button class="news-indicator ${index === 0 ? 'active' : ''}" data-slide="${index}" aria-label="Go to slide ${index + 1}"></button>`
    ).join('');

    container.innerHTML = `
        <div class="news-carousel">
            <div class="news-slides-container">${slides}</div>
            <div class="news-controls">
                <button class="news-arrow news-arrow-prev" aria-label="Previous slide">
                    <i class="fas fa-chevron-left"></i>
                </button>
                <div class="news-indicators">${indicators}</div>
                <button class="news-arrow news-arrow-next" aria-label="Next slide">
                    <i class="fas fa-chevron-right"></i>
                </button>
            </div>
        </div>
    `;

    let currentSlide = 0;
    const totalSlides = posts.slice(0, 5).length;

    function showSlide(index) {
        const slides = container.querySelectorAll('.news-slide');
        const indicators = container.querySelectorAll('.news-indicator');
        
        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
        });
        indicators.forEach((indicator, i) => {
            indicator.classList.toggle('active', i === index);
        });
        
        currentSlide = index;
    }

    function nextSlide() {
        showSlide((currentSlide + 1) % totalSlides);
    }

    function prevSlide() {
        showSlide((currentSlide - 1 + totalSlides) % totalSlides);
    }

    container.querySelector('.news-arrow-next').addEventListener('click', nextSlide);
    container.querySelector('.news-arrow-prev').addEventListener('click', prevSlide);
    
    container.querySelectorAll('.news-indicator').forEach((indicator, index) => {
        indicator.addEventListener('click', () => showSlide(index));
    });

    setInterval(nextSlide, 10000);
}

export async function renderNewsPage() {
    const posts = await fetchNews();
    
    if (posts.length === 0) {
        return `
            <div class="news-page-empty">
                <h2>Latest News</h2>
                <p>Unable to load news. Please visit <a href="https://news.vein.gg/" target="_blank">news.vein.gg</a> for the latest updates.</p>
            </div>
        `;
    }

    const newsItems = posts.map((post, index) => {
        const excerpt = truncateText(post.excerpt || post.plaintext || post.custom_excerpt, 200);
        const escapedTitle = escapeHTML(post.title);
        const escapedExcerpt = escapeHTML(excerpt);
        const escapedUrl = escapeHTML(post.url);
        const escapedImage = post.image ? escapeHTML(post.image) : '';
        
        const isEven = index % 2 === 0;
        const layoutClass = isEven ? 'news-item-left' : 'news-item-right';
        
        return `
            <article class="news-item ${layoutClass}">
                ${post.image ? `<img src="${escapedImage}" alt="${escapedTitle}" class="news-item-image">` : ''}
                <div class="news-item-content">
                    <div class="news-item-header">
                        <h2 class="news-item-title"><a href="${escapedUrl}" target="_blank">${escapedTitle}</a></h2>
                        <span class="news-item-date">${formatDate(post.published_at)}</span>
                    </div>
                    <div class="news-item-excerpt">
                        <p>${escapedExcerpt}</p>
                    </div>
                    <div class="news-item-footer">
                        <a href="${escapedUrl}" target="_blank" class="news-item-link">
                            Read Full Article <i class="fas fa-external-link-alt"></i>
                        </a>
                    </div>
                </div>
            </article>
        `;
    }).join('');

    return `
        <div class="news-page">
            <h1>Latest VEIN News</h1>
            <p class="news-page-subtitle">Stay up to date with the latest updates from the VEIN development team.</p>
            <div class="news-list">
                ${newsItems}
            </div>
        </div>
    `;
}

