/* jshint esversion: 11 */
/* globals console */

let newsCache = null;
let newsCacheTime = 0;
const CACHE_DURATION = 3600000;
let carouselInterval = null;

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

/**
 * Validates and sanitizes image URL to prevent XSS
 * @param {string} url - Image URL to validate
 * @returns {string} - Sanitized URL or empty string
 */
function sanitizeImageUrl(url) {
    if (!url || typeof url !== 'string') return '';
    // Basic URL validation - must start with http:// or https://
    const trimmed = url.trim();
    if (!/^https?:\/\//i.test(trimmed)) return '';
    // Escape HTML in URL to prevent injection
    return escapeHTML(trimmed);
}

/**
 * Cleanup function to clear carousel interval
 * Should be called when navigating away from home page
 */
export function cleanupNewsCarousel() {
    if (carouselInterval) {
        clearInterval(carouselInterval);
        carouselInterval = null;
    }
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
    
    // Clear any existing carousel interval
    cleanupNewsCarousel();
    
    const posts = await fetchNews();
    if (posts.length === 0) {
        container.textContent = '';
        const p = document.createElement('p');
        p.innerHTML = 'Unable to load news. Please visit <a href="https://news.vein.gg/" target="_blank">news.vein.gg</a> for the latest updates.';
        container.appendChild(p);
        return;
    }

    // Build carousel structure using DOM methods instead of innerHTML for better XSS protection
    const carouselDiv = document.createElement('div');
    carouselDiv.className = 'news-carousel';
    
    const slidesContainer = document.createElement('div');
    slidesContainer.className = 'news-slides-container';
    
    posts.slice(0, 5).forEach((post, index) => {
        const excerpt = truncateText(post.excerpt, 120);
        const slideDiv = document.createElement('div');
        slideDiv.className = `news-slide ${index === 0 ? 'active' : ''}`;
        slideDiv.dataset.index = index;
        
        if (post.image) {
            const img = document.createElement('img');
            const sanitizedUrl = sanitizeImageUrl(post.image);
            if (sanitizedUrl) {
                img.src = sanitizedUrl;
                img.alt = escapeHTML(post.title);
                img.className = 'news-slide-image';
                slideDiv.appendChild(img);
            }
        }
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'news-slide-content';
        
        const title = document.createElement('h3');
        title.className = 'news-slide-title';
        title.textContent = post.title || '';
        contentDiv.appendChild(title);
        
        const excerptP = document.createElement('p');
        excerptP.className = 'news-slide-excerpt';
        excerptP.textContent = excerpt;
        contentDiv.appendChild(excerptP);
        
        const metaDiv = document.createElement('div');
        metaDiv.className = 'news-slide-meta';
        
        const dateSpan = document.createElement('span');
        dateSpan.className = 'news-date';
        dateSpan.textContent = formatDate(post.published_at);
        metaDiv.appendChild(dateSpan);
        
        const readMoreLink = document.createElement('a');
        readMoreLink.href = escapeHTML(post.url || '#');
        readMoreLink.target = '_blank';
        readMoreLink.className = 'news-read-more';
        readMoreLink.innerHTML = 'Read More <i class="fas fa-arrow-right"></i>';
        metaDiv.appendChild(readMoreLink);
        
        contentDiv.appendChild(metaDiv);
        slideDiv.appendChild(contentDiv);
        slidesContainer.appendChild(slideDiv);
    });
    
    carouselDiv.appendChild(slidesContainer);
    
    const controlsDiv = document.createElement('div');
    controlsDiv.className = 'news-controls';
    
    const prevButton = document.createElement('button');
    prevButton.className = 'news-arrow news-arrow-prev';
    prevButton.setAttribute('aria-label', 'Previous slide');
    prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
    controlsDiv.appendChild(prevButton);
    
    const indicatorsDiv = document.createElement('div');
    indicatorsDiv.className = 'news-indicators';
    posts.slice(0, 5).forEach((_, index) => {
        const indicator = document.createElement('button');
        indicator.className = `news-indicator ${index === 0 ? 'active' : ''}`;
        indicator.dataset.slide = index;
        indicator.setAttribute('aria-label', `Go to slide ${index + 1}`);
        indicatorsDiv.appendChild(indicator);
    });
    controlsDiv.appendChild(indicatorsDiv);
    
    const nextButton = document.createElement('button');
    nextButton.className = 'news-arrow news-arrow-next';
    nextButton.setAttribute('aria-label', 'Next slide');
    nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
    controlsDiv.appendChild(nextButton);
    
    carouselDiv.appendChild(controlsDiv);
    
    // Clear container and append new carousel
    container.innerHTML = '';
    container.appendChild(carouselDiv);

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

    carouselInterval = setInterval(nextSlide, 10000);
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

    // Featured/Hero Article (First post)
    const featuredPost = posts[0];
    const featuredExcerpt = truncateText(featuredPost.excerpt || featuredPost.plaintext || featuredPost.custom_excerpt, 250);
    const featuredTitle = escapeHTML(featuredPost.title);
    const featuredExcerptEscaped = escapeHTML(featuredExcerpt);
    const featuredUrl = escapeHTML(featuredPost.url);
    const featuredImage = featuredPost.image ? sanitizeImageUrl(featuredPost.image) : '';
    const featuredDate = formatDate(featuredPost.published_at);

    // Regular articles (Skip first post)
    const regularPosts = posts.slice(1);
    const newsItems = regularPosts.map((post, index) => {
        const excerpt = truncateText(post.excerpt || post.plaintext || post.custom_excerpt, 150);
        const escapedTitle = escapeHTML(post.title);
        const escapedExcerpt = escapeHTML(excerpt);
        const escapedUrl = escapeHTML(post.url);
        const escapedImage = post.image ? sanitizeImageUrl(post.image) : '';
        const postDate = formatDate(post.published_at);
        
        return `
            <article class="news-card fade-in-up" data-index="${index}">
                <a href="${escapedUrl}" target="_blank" class="news-card-link">
                    <div class="news-card-image-wrapper">
                        ${escapedImage ? `<img src="${escapedImage}" alt="${escapedTitle}" class="news-card-image" loading="lazy">` : '<div class="news-card-image-placeholder"><i class="fas fa-newspaper"></i></div>'}
                        <div class="news-card-image-overlay"></div>
                    </div>
                    <div class="news-card-content">
                        <div class="news-card-meta">
                            <span class="news-card-date">
                                <i class="fas fa-calendar"></i> ${postDate}
                            </span>
                        </div>
                        <h3 class="news-card-title">${escapedTitle}</h3>
                        <p class="news-card-excerpt">${escapedExcerpt}</p>
                        <div class="news-card-footer">
                            <span class="news-card-read-more">
                                Read Article <i class="fas fa-arrow-right"></i>
                            </span>
                        </div>
                    </div>
                </a>
            </article>
        `;
    }).join('');

    return `
        <div class="news-page">
            <div class="news-page-header">
                <h1 class="news-page-title">Latest VEIN News</h1>
                <p class="news-page-subtitle">Stay up to date with the latest updates from the VEIN development team.</p>
            </div>
            
            <article class="news-hero fade-in">
                <div class="news-hero-image-wrapper">
                    ${featuredImage ? `<img src="${featuredImage}" alt="${featuredTitle}" class="news-hero-image">` : '<div class="news-hero-image-placeholder"><i class="fas fa-newspaper"></i></div>'}
                    <div class="news-hero-overlay"></div>
                    <div class="news-hero-badge">
                        <i class="fas fa-star"></i> Featured
                    </div>
                </div>
                <div class="news-hero-content">
                    <h2 class="news-hero-title">
                        <a href="${featuredUrl}" target="_blank">${featuredTitle}</a>
                    </h2>
                    <p class="news-hero-excerpt">${featuredExcerptEscaped}</p>
                    <div class="news-hero-footer">
                        <span class="news-hero-date">
                            <i class="fas fa-calendar-alt"></i> ${featuredDate}
                        </span>
                        <a href="${featuredUrl}" target="_blank" class="news-hero-link">
                            Read Full Article <i class="fas fa-arrow-right"></i>
                        </a>
                    </div>
                </div>
            </article>
            
            <div class="news-list">
                ${newsItems}
            </div>
        </div>
    `;
}

