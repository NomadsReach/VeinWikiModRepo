/* jshint esversion: 11 */
/* globals console */

import { setActiveLink } from './navigation.js';
import { addCopyButtons } from './ui.js';
import { renderNewsCarousel, renderNewsPage } from './news.js';

const contentEl = document.getElementById('content');
let currentBase = 'Pages/';

async function loadPage(path) {
    try {
        if (path === 'Pages/mod-showcase.html') {
            window.location.href = 'https://www.nexusmods.com/games/vein/mods?timeRange=7&sort=endorsements';
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
        } else if (path === 'Pages/news.html') {
            layout.classList.add('hide-sidebar');
            body.classList.remove('is-home-page');
        } else {
            layout.classList.remove('hide-sidebar');
            body.classList.remove('is-home-page');
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
