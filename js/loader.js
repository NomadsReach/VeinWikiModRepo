/* jshint esversion: 11 */
/* globals console */

import { setActiveLink } from './navigation.js';
import { addCopyButtons } from './ui.js';

const contentEl = document.getElementById('content');
let currentBase = 'Pages/';

async function loadPage(path) {
    try {
        const res = await fetch('./' + path);
        if (!res.ok) throw new Error(`Failed to load ${path}`);
        
        const text = await res.text();
        currentBase = path.substring(0, path.lastIndexOf('/') + 1);

        const layout = document.querySelector('.layout');
        const body = document.body;
        if (path === 'Pages/home.html') {
            layout.classList.add('hide-sidebar');
            body.classList.add('is-home-page');
        } else if (path === 'Pages/mod-showcase.html') {
            layout.classList.add('hide-sidebar');
            body.classList.remove('is-home-page');
        } else {
            layout.classList.remove('hide-sidebar');
            body.classList.remove('is-home-page');
        }

        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');
        
        const newContent = doc.body.innerHTML;
        
        if (newContent) {
            contentEl.innerHTML = newContent;
        } else {
            contentEl.innerHTML = text;
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
            if (location.hash === link.getAttribute('href')) {
                e.preventDefault();
                onHashChange();
            }
        }
    });
}

export function initLoader() {
    interceptLinks();
    window.addEventListener('hashchange', onHashChange);
    onHashChange();
}
