/* jshint esversion: 11 */
/* globals marked, console */

/**
 * Knowledge Base Module
 * Handles loading and rendering markdown files from the KnowledgeBase directory
 */

// List of all knowledge base files (will be populated dynamically)
let knowledgeBaseFiles = [];

/**
 * Get list of all markdown files in KnowledgeBase
 */
export async function getKnowledgeBaseFiles() {
    if (knowledgeBaseFiles.length > 0) {
        return knowledgeBaseFiles;
    }
    
    try {
        // Try to fetch a manifest file first, or scan the directory
        const response = await fetch('./KnowledgeBase/manifest.json');
        if (response.ok) {
            const manifest = await response.json();
            knowledgeBaseFiles = manifest.files || [];
            return knowledgeBaseFiles;
        }
    } catch (err) {
        console.warn('Could not load manifest, will use default list');
    }
    
    // Default list - will be generated from actual files
    return knowledgeBaseFiles;
}

/**
 * Load a markdown file from KnowledgeBase
 */
export async function loadKnowledgeBaseFile(filename) {
    try {
        const response = await fetch(`./KnowledgeBase/${filename}`);
        if (!response.ok) {
            throw new Error(`Failed to load ${filename}`);
        }
        return await response.text();
    } catch (err) {
        console.error(`Error loading knowledge base file ${filename}:`, err);
        throw err;
    }
}

/**
 * Render markdown content to HTML
 */
export function renderMarkdown(markdown) {
    if (typeof marked === 'undefined') {
        console.error('Marked.js is not loaded');
        return '<p>Markdown renderer not available.</p>';
    }
    
    try {
        return marked.parse(markdown);
    } catch (err) {
        console.error('Error rendering markdown:', err);
        return '<p>Error rendering markdown content.</p>';
    }
}

/**
 * Extract title from markdown content
 */
export function extractTitle(markdown) {
    const match = markdown.match(/^#\s+(.+)$/m);
    if (match) {
        return match[1].trim();
    }
    // Fallback: use filename
    return 'Untitled';
}

/**
 * Generate knowledge base index page HTML
 */
export async function renderKnowledgeBaseIndex() {
    const files = await getKnowledgeBaseFiles();
    
    if (files.length === 0) {
        return `
            <h1>Knowledge Base</h1>
            <p>No knowledge base articles found.</p>
        `;
    }
    
    let html = '<div class="knowledge-base-header">';
    html += '<h1>Knowledge Base</h1>';
    html += '<p class="callout note">Community knowledge base containing detailed information about VEIN game systems, items, mechanics, and technical references.</p>';
    html += '</div>';
    
    // Add Knowledge Base search bar
    html += '<div class="kb-search-container">';
    html += '<div class="kb-search-wrapper">';
    html += '<i class="fas fa-search kb-search-icon"></i>';
    html += '<input type="search" id="kbSearchBox" class="kb-search-input" placeholder="Search Knowledge Base..." aria-label="Search Knowledge Base">';
    html += '<div id="kbSearchResults" class="kb-search-results" hidden></div>';
    html += '</div>';
    html += '</div>';
    
    // If there's a master index, show it first
    if (files.includes('00_MASTER_INDEX.md')) {
        html += `<div class="knowledge-base-master-index">
            <a href="#KnowledgeBase/00_MASTER_INDEX.md" class="start-button">View Master Index</a>
        </div>`;
    }
    
    // Sort files and exclude master index from main list
    const sortedFiles = files
        .filter(file => file !== '00_MASTER_INDEX.md')
        .sort((a, b) => {
            // Extract numbers for sorting
            const numA = parseInt(a.match(/^(\d+)_/)?.[1] || '999');
            const numB = parseInt(b.match(/^(\d+)_/)?.[1] || '999');
            return numA - numB;
        });
    
    // Render all articles in a single list
    html += '<div class="knowledge-base-categories">';
    html += '<div class="knowledge-base-category">';
    html += '<h2>Articles</h2>';
    html += '<ul class="knowledge-base-list" id="kbArticleList">';
    sortedFiles.forEach(file => {
        const displayName = file.replace(/^\d+_/, '').replace(/\.md$/, '').replace(/_/g, ' ');
        html += `<li data-filename="${file}"><a href="#KnowledgeBase/${file}">${displayName}</a></li>`;
    });
    html += '</ul></div></div>';
    
    return html;
}

/**
 * Render a knowledge base article
 */
export async function renderKnowledgeBaseArticle(filename) {
    try {
        const markdown = await loadKnowledgeBaseFile(filename);
        const html = renderMarkdown(markdown);
        const title = extractTitle(markdown);
        
        // Add search bar to article pages too
        let articleHtml = '<div class="kb-search-container">';
        articleHtml += '<div class="kb-search-wrapper">';
        articleHtml += '<i class="fas fa-search kb-search-icon"></i>';
        articleHtml += '<input type="search" id="kbSearchBox" class="kb-search-input" placeholder="Search Knowledge Base..." aria-label="Search Knowledge Base">';
        articleHtml += '<div id="kbSearchResults" class="kb-search-results" hidden></div>';
        articleHtml += '</div>';
        articleHtml += '</div>';
        articleHtml += `<div class="knowledge-base-article">${html}</div>`;
        
        return {
            html: articleHtml,
            title: title
        };
    } catch (err) {
        return {
            html: `<div class="callout warning"><p><strong>Error:</strong> Could not load knowledge base article "${filename}".</p></div>`,
            title: 'Error'
        };
    }
}

/**
 * Initialize knowledge base by fetching file list
 */
export async function initKnowledgeBase() {
    // This can be expanded to fetch actual file list from a manifest or API
    // For now, we'll use a static list that matches the files found
    knowledgeBaseFiles = [
        '00_MASTER_INDEX.md',
        '01_Items_System.md',
        '02_Recipes_And_Crafting.md',
        '03_Weapons_And_Combat.md',
        '04_Medical_And_Survival.md',
        '05_Architecture_And_Buildings.md',
        '06_Consumables_And_Food.md',
        '07_Animals_And_Creatures.md',
        '08_Vehicles_And_Transportation.md',
        '09_World_And_Environment.md',
        '10_Audio_System.md',
        '11_Materials_And_Meshes.md',
        '12_Effects_And_VFX.md',
        '13_Game_Systems.md',
        '14_Spawning_And_Loot.md',
        '15_Technical_Reference.md',
        '16_Pakchunk_Structure.md'
    ];
}
