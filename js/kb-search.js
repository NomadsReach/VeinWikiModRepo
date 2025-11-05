/* jshint esversion: 11 */
/* globals lunr, console */

import { getKnowledgeBaseFiles, initKnowledgeBase, loadKnowledgeBaseFile, extractTitle } from './knowledge-base.js';

let kbIndex = null;
let kbSearchData = {};

/**
 * Build search index for Knowledge Base only
 */
export async function buildKBIndex() {
    if (typeof lunr === 'undefined') {
        console.error('Lunr search library is not loaded');
        return;
    }
    
    await initKnowledgeBase();
    const files = await getKnowledgeBaseFiles();
    
    // Load all markdown files
    const texts = await Promise.all(
        files.map(async (filename) => {
            try {
                const text = await loadKnowledgeBaseFile(filename);
                return { filename, text };
            } catch (err) {
                console.warn(`Failed to load ${filename}:`, err);
                return null;
            }
        })
    );
    
    // Build search index
    kbIndex = lunr(function () {
        this.ref('filename');
        this.field('title');
        this.field('body');
        
        texts.forEach((item) => {
            if (!item) return;
            
            const title = extractTitle(item.text);
            // Remove markdown syntax for body text
            const body = item.text
                .replace(/^#+\s+/gm, '')
                .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
                .replace(/`([^`]+)`/g, '$1')
                .replace(/\*\*/g, '')
                .replace(/\*/g, '');
            
            this.add({ filename: item.filename, title, body });
            kbSearchData[item.filename] = { title };
        });
    });
}

/**
 * Perform search within Knowledge Base
 */
export function performKBSearch(query) {
    if (!kbIndex) {
        return [];
    }
    
    if (!query || query.trim().length === 0) {
        return [];
    }
    
    try {
        return kbIndex.search(query);
    } catch (err) {
        console.error('Search error:', err);
        return [];
    }
}

/**
 * Get search data for a filename
 */
export function getKBSearchData(filename) {
    return kbSearchData[filename] || { title: filename };
}

/**
 * Initialize Knowledge Base search
 */
export async function initKBSearch() {
    await buildKBIndex();
}

/**
 * Initialize Knowledge Base search UI
 */
export function initKBSearchUI() {
    const searchBox = document.getElementById('kbSearchBox');
    const resultsEl = document.getElementById('kbSearchResults');
    
    if (!searchBox || !resultsEl) return;
    
    // Clear previous event listeners by cloning
    const newSearchBox = searchBox.cloneNode(true);
    searchBox.parentNode.replaceChild(newSearchBox, searchBox);
    
    const newResultsEl = resultsEl.cloneNode(true);
    resultsEl.parentNode.replaceChild(newResultsEl, resultsEl);
    
    newSearchBox.addEventListener('input', (e) => {
        performKBSearchUI(e.target.value, newResultsEl);
    });
    
    newSearchBox.addEventListener('focus', () => {
        if (newSearchBox.value) {
            newResultsEl.hidden = false;
        }
    });
    
    document.addEventListener('click', (e) => {
        if (!newResultsEl.contains(e.target) && e.target !== newSearchBox) {
            newResultsEl.hidden = true;
        }
    });
    
    newResultsEl.addEventListener('click', (e) => {
        const item = e.target.closest('.kb-search-item');
        if (item && item.dataset.filename) {
            location.hash = '#KnowledgeBase/' + item.dataset.filename;
            newResultsEl.hidden = true;
            newSearchBox.value = '';
        }
    });
}

/**
 * Perform search and display results in UI
 */
function performKBSearchUI(query, resultsEl) {
    if (!query || query.trim().length === 0) {
        resultsEl.hidden = true;
        return;
    }
    
    const results = performKBSearch(query);
    
    if (results.length === 0) {
        resultsEl.innerHTML = `<div class="kb-search-item">No results found</div>`;
        resultsEl.hidden = false;
        return;
    }
    
    const frag = document.createDocumentFragment();
    results.slice(0, 10).forEach(result => {
        const filename = result.ref;
        const data = getKBSearchData(filename);
        const item = document.createElement('div');
        item.className = 'kb-search-item';
        item.textContent = data.title;
        item.dataset.filename = filename;
        frag.appendChild(item);
    });
    
    resultsEl.innerHTML = '';
    resultsEl.appendChild(frag);
    resultsEl.hidden = false;
}
