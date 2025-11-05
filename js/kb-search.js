/* jshint esversion: 11 */
/* globals lunr, console */

import { getKnowledgeBaseFiles, initKnowledgeBase, loadKnowledgeBaseFile, extractTitle } from './knowledge-base.js';

let kbIndex = null;
let kbSearchData = {};
let kbSearchClickHandler = null;
let kbSearchElements = null; // Track current search elements to avoid multiple handlers
let kbSearchAbortController = null; // Use AbortController for clean event listener management

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
 * Single global click handler for all KB search instances
 * Uses event delegation to work with dynamically created elements
 */
function handleGlobalKBClick(e) {
    // Only handle if KB search elements exist
    if (!kbSearchElements || !kbSearchElements.searchBox || !kbSearchElements.resultsEl) {
        return;
    }
    
    const { searchBox, resultsEl } = kbSearchElements;
    
    // Hide results if click is outside search box and results
    if (!resultsEl.contains(e.target) && e.target !== searchBox) {
        resultsEl.hidden = true;
    }
}

/**
 * Initialize Knowledge Base search UI
 */
export function initKBSearchUI() {
    const searchBox = document.getElementById('kbSearchBox');
    const resultsEl = document.getElementById('kbSearchResults');
    
    if (!searchBox || !resultsEl) {
        // Clear tracked elements if search UI doesn't exist
        kbSearchElements = null;
        return;
    }
    
    // Abort any existing event listeners from previous initialization
    if (kbSearchAbortController) {
        kbSearchAbortController.abort();
    }
    
    // Create new AbortController for this initialization
    kbSearchAbortController = new AbortController();
    const signal = kbSearchAbortController.signal;
    
    // Track current search elements
    kbSearchElements = { searchBox, resultsEl };
    
    // Set up global click handler only once
    if (!kbSearchClickHandler) {
        kbSearchClickHandler = handleGlobalKBClick;
        document.addEventListener('click', kbSearchClickHandler, true); // Use capture phase
    }
    
    // Add event listeners with abort signal for clean removal
    searchBox.addEventListener('input', (e) => {
        performKBSearchUI(e.target.value, resultsEl);
    }, { signal });
    
    searchBox.addEventListener('focus', () => {
        if (searchBox.value) {
            resultsEl.hidden = false;
        }
    }, { signal });
    
    resultsEl.addEventListener('click', (e) => {
        const item = e.target.closest('.kb-search-item');
        if (item && item.dataset.filename) {
            location.hash = '#KnowledgeBase/' + item.dataset.filename;
            resultsEl.hidden = true;
            searchBox.value = '';
        }
    }, { signal });
}

/**
 * Cleanup function to remove global event listener
 * Should be called when KB search is no longer needed
 */
export function cleanupKBSearchUI() {
    // Abort all event listeners tied to the current search UI
    if (kbSearchAbortController) {
        kbSearchAbortController.abort();
        kbSearchAbortController = null;
    }
    
    // Remove global click handler
    if (kbSearchClickHandler) {
        document.removeEventListener('click', kbSearchClickHandler, true);
        kbSearchClickHandler = null;
    }
    
    kbSearchElements = null;
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
