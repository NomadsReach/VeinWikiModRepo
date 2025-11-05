/* jshint esversion: 11 */
/* globals console */

import { setActiveLink } from './navigation.js';
import { addCopyButtons } from './ui.js';
import { renderNewsCarousel, renderNewsPage } from './news.js';
import { renderKnowledgeBaseIndex, renderKnowledgeBaseArticle, initKnowledgeBase } from './knowledge-base.js';

const contentEl = document.getElementById('content');
let currentBase = 'Pages/';

async function loadPage(path) {
    try {
        // Initialize knowledge base on first load
        await initKnowledgeBase();
        
        if (path === 'Pages/mod-showcase.html') {
            window.location.href = 'https://www.nexusmods.com/games/vein/mods?timeRange=7&sort=endorsements';
            return;
        }
        
        // Handle Knowledge Base routes
        if (path.startsWith('KnowledgeBase/')) {
            const layout = document.querySelector('.layout');
            layout.classList.remove('hide-sidebar');
            document.body.classList.remove('is-home-page');
            document.body.classList.remove('is-news-page');
            document.body.classList.remove('is-upload-mod-page');
            
            // Update sidebar visibility
            setActiveLink();
            
            if (path === 'KnowledgeBase/index.html' || path === 'KnowledgeBase/') {
                const content = await renderKnowledgeBaseIndex();
                contentEl.innerHTML = content;
                // Initialize KB search after rendering
                const kbSearchModule = await import('./kb-search.js');
                await kbSearchModule.initKBSearch();
                kbSearchModule.initKBSearchUI();
            } else {
                // Extract filename from path (e.g., "KnowledgeBase/01_Items_System.md")
                const filename = path.replace('KnowledgeBase/', '');
                const result = await renderKnowledgeBaseArticle(filename);
                contentEl.innerHTML = result.html;
                // Update page title if possible
                if (result.title && document.querySelector('title')) {
                    document.querySelector('title').textContent = `${result.title} - VEIN Modding`;
                }
                // Initialize KB search after rendering
                const kbSearchModule = await import('./kb-search.js');
                await kbSearchModule.initKBSearch();
                kbSearchModule.initKBSearchUI();
            }
            
            addCopyButtons();
            if (window.hljs) {
                window.hljs.highlightAll();
            }
            // setActiveLink is already called above for KB pages
            if (!path.startsWith('KnowledgeBase/')) {
                setActiveLink();
            }
            return;
        }
        
        if (path === 'Pages/host-server.html' || path === 'Pages/upload-mod.html') {
            const layout = document.querySelector('.layout');
            layout.classList.add('hide-sidebar');
            document.body.classList.remove('is-home-page');
            document.body.classList.remove('is-news-page');
            document.body.classList.remove('is-upload-mod-page');
            
            contentEl.innerHTML = `
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh; text-align: center; padding: 40px 20px;">
                    <i class="fas fa-clock" style="font-size: 64px; color: var(--accent-color); margin-bottom: 24px;"></i>
                    <h1 style="font-size: 36px; margin-bottom: 16px; color: var(--text-primary);">Coming Soon</h1>
                    <p style="font-size: 18px; color: var(--text-secondary); max-width: 600px; line-height: 1.6;">
                        This feature is currently under development and will be available soon. Thank you for your patience!
                    </p>
                </div>
            `;
            setActiveLink();
            return;
        }
        
        const res = await fetch('./' + path);
        if (!res.ok) throw new Error(`Failed to load ${path}`);
        
        const text = await res.text();
        currentBase = path.substring(0, path.lastIndexOf('/') + 1);

        const layout = document.querySelector('.layout');
        const body = document.body;
        if (path === 'Pages/home.html') {
            layout.classList.add('hide-sidebar');
            body.classList.add('is-home-page');
            body.classList.remove('is-news-page');
            body.classList.remove('is-upload-mod-page');
        } else if (path === 'Pages/news.html') {
            layout.classList.add('hide-sidebar');
            body.classList.remove('is-home-page');
            body.classList.add('is-news-page');
            body.classList.remove('is-upload-mod-page');
        } else if (path === 'Pages/upload-mod.html') {
            layout.classList.add('hide-sidebar');
            body.classList.remove('is-home-page');
            body.classList.remove('is-news-page');
            body.classList.add('is-upload-mod-page');
        } else {
            layout.classList.remove('hide-sidebar');
            body.classList.remove('is-home-page');
            body.classList.remove('is-news-page');
            body.classList.remove('is-upload-mod-page');
        }

        if (path === 'Pages/news.html') {
            const newsContent = await renderNewsPage();
            contentEl.innerHTML = newsContent;
        } else {
            const parser = new DOMParser();
            const doc = parser.parseFromString(text, 'text/html');
            const bodyContent = doc.body?.innerHTML || text;
            
            contentEl.innerHTML = bodyContent;

            if (path === 'Pages/home.html') {
                const carouselContainer = document.getElementById('newsCarousel');
                if (carouselContainer) {
                    await renderNewsCarousel(carouselContainer);
                }
            }
            
            if (path === 'Pages/upload-mod.html') {
                // Load upload-mod.js dynamically
                if (typeof window !== 'undefined' && !document.querySelector('script[src*="upload-mod.js"]')) {
                    const script = document.createElement('script');
                    script.type = 'module';
                    script.src = 'js/upload-mod.js';
                    document.head.appendChild(script);
                }
            }
        }

        addCopyButtons();
        if (window.hljs) {
            window.hljs.highlightAll();
        }
        
    } catch (err) {
        contentEl.innerHTML = `<p>Could not load page.</p>`;
        console.error(err);
    }
}

function onHashChange() {
    let hash = location.hash;
    while (hash.startsWith('#')) {
        hash = hash.slice(1);
    }
    const target = decodeURIComponent(hash || '');
    const path = target || 'Pages/home.html';
    
    loadPage(path);
    setActiveLink();
}

function interceptLinks() {
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (link && link.getAttribute('href')?.startsWith('#')) {
            const targetHash = link.getAttribute('href');
            if (location.hash !== targetHash) {
            }
        }
    });
}

export function initLoader() {
    interceptLinks();
    window.addEventListener('hashchange', onHashChange);
    onHashChange();
}
