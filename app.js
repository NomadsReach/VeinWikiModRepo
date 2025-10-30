/* jshint esversion: 11 */
/* global marked, lunr, Mark */
const contentEl = document.getElementById('content');
const sidebarEl = document.getElementById('sidebar');
const pageTocEl = document.getElementById('page-toc');

const NAV = [
	{ title: 'Start Here', path: 'Pages/start-here.html', icon: 'fas fa-play-circle' },
	{ title: 'Introduction to Modding', path: 'Pages/Introduction.html', icon: 'fas fa-book-open' },
	{ title: 'Core Fundamentals', path: 'Pages/TheBasics_index.html', icon: 'fas fa-book' },
	{ title: 'Beginner Mods', path: 'Pages/BasicModding_index.html', icon: 'fas fa-hammer' },
	{ title: 'Intermediate Mods', path: 'Pages/IntermediateModding_index.html', icon: 'fas fa-level-up-alt' },
	{ title: 'Blueprint Mods', path: 'Pages/BPModding_index.html', icon: 'fas fa-cube' },
	{ title: 'Advanced Topics', path: 'Pages/AdvancedModding_index.html', icon: 'fas fa-cogs' },
	{ title: 'Expert Topics', path: 'Pages/ExpertModding_index.html', icon: 'fas fa-brain' },
	{ title: 'Memory Hacking', path: 'Pages/GameMemory_index.html', icon: 'fas fa-microchip' },
	{ title: 'Game Notes', path: 'Pages/GameSpecific_index.html', icon: 'fas fa-gamepad' },
	{ title: 'Tools & Extras', path: 'Pages/Misc_index.html', icon: 'fas fa-tools' },
	{ title: 'Credits', path: 'Pages/credits.html', icon: 'fas fa-heart' }
];

function buildSidebar(){
	const frag = document.createDocumentFragment();
	const section = document.createElement('div');
	section.className = 'nav-section';
	const title = document.createElement('div');
	title.className = 'nav-title';
	title.textContent = 'Sections';
	section.appendChild(title);
	NAV.forEach(item => {
		const a = document.createElement('a');
		a.className = 'nav-link';
		a.href = `#${item.path}`;
		
		const icon = document.createElement('i');
		icon.className = `${item.icon} nav-icon`;
		a.appendChild(icon);
		
		const text = document.createElement('span');
		text.textContent = item.title;
		a.appendChild(text);

		section.appendChild(a);
	});
	frag.appendChild(section);
	
	// Add social media footer
	const footer = document.createElement('div');
	footer.className = 'sidebar-footer';
	footer.innerHTML = `
		<div class="footer-title">Community</div>
		<div class="social-links">
		<a href="https://discord.gg/nsaPf7wAkP" target="_blank" rel="noopener" aria-label="Discord" title="Join our Discord">
			<img src="Media/Icons/002-discord.png" alt="Discord" class="social-icon">
		</a>
		<a href="https://store.steampowered.com/app/1857950/VEIN/" target="_blank" rel="noopener" aria-label="Steam" title="VEIN on Steam">
			<img src="Media/Icons/steam.png" alt="Steam" class="social-icon">
		</a>
		<a href="mailto:veinmodding@protonmail.com" aria-label="Email" title="Contact us via Email">
			<img src="Media/Icons/001-mail.png" alt="Email" class="social-icon">
		</a>
		</div>
		<div class="footer-resources" style="margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border);">
			<a href="https://github.com/Buckminsterfullerene02/UE-Modding-Tools" target="_blank" rel="noopener" style="display: flex; align-items: center; gap: 6px; font-size: 0.85em; color: var(--muted); text-decoration: none; padding: 4px 0;">
				<i class="fab fa-github"></i>
				<span>UE Modding Tools</span>
			</a>
		</div>
	`;
	frag.appendChild(footer);
	
	sidebarEl.appendChild(frag);
}

function setActiveLink(){
	const hash = location.hash;
	document.querySelectorAll('.nav-link').forEach(a => {
		a.classList.toggle('active', a.getAttribute('href') === hash);
	});
}

let currentBase = 'Pages/';

async function loadPage(path){
	try{
		const res = await fetch('./' + path);
		if(!res.ok) throw new Error(`Failed to load ${path}`);
		const text = await res.text();
		currentBase = path.substring(0, path.lastIndexOf('/') + 1);
		
		// Find the markdown container and render the markdown
		const markdownContainer = document.createElement('div');
		markdownContainer.innerHTML = text;
		const markdownBody = markdownContainer.querySelector('.markdown-body');
		
		if (markdownBody) {
			markdownBody.innerHTML = marked.parse(markdownBody.textContent || '');
			contentEl.innerHTML = markdownContainer.innerHTML;
		}else{
			// Fallback: try to fetch and render the matching Markdown from Resources
			const mdPath = path
				.replace(/^Pages\//, 'Resources/')
				.replace(/\.html$/i, '.md')
				.replace(/GameSpecific\//, 'GameSpecific/')
				.replace(/TheBasics\//, 'TheBasics/');
			try{
				const mdRes = await fetch(mdPath);
				if(mdRes.ok){
					const md = await mdRes.text();
					contentEl.innerHTML = `<div class="markdown-body">${marked.parse(md)}</div>`;
				}else{
					contentEl.innerHTML = text;
				}
			}catch{
				contentEl.innerHTML = text;
			}
		}
		
		buildToc();
		addCopyButtons();
		if(window.hljs){ window.hljs.highlightAll(); }
		applySearchHighlight();
	}catch(err){
		contentEl.innerHTML = `<p>Could not load page.</p>`;
		console.error(err);
	}
}

function resolveRelative(href){
	try{
		return new URL(href, location.origin + '/' + currentBase.replace(/^\.?\/?/, 'HTML%20Site/../') ).pathname.replace('/../','/');
	}catch{
		if(href.startsWith('http')) return href;
		return currentBase + href;
	}
}

function interceptLinks(){
	contentEl.addEventListener('click', (e) => {
		const a = e.target.closest('a');
		if (!a) return;
		const href = a.getAttribute('href') || '';
		// Handle our hash links directly
		if (href.startsWith('#Pages/')) {
			e.preventDefault();
			location.hash = href;
			return;
		}
		// Intercept any relative .html links inside content
		const isRelativeHtml = (href.endsWith('.html') || href.includes('.html#')) && !/^https?:/i.test(href);
		const isDotRelative = href.startsWith('./') || href.startsWith('../');
		if (isRelativeHtml || isDotRelative) {
			e.preventDefault();
			let resolved = href;
			try{
				// Resolve relative to currentBase (which is a Pages/ path)
				const u = new URL(href, location.origin + '/' + currentBase);
				resolved = u.pathname.replace(/^\//,'');
			}catch{}
			// Ensure it points to Pages/ since our files live there
			if(!resolved.startsWith('Pages/')){
				resolved = 'Pages/' + resolved.split('/').pop();
			}
			location.hash = encodeURIComponent(resolved);
		}
	});
}

function styleCallouts() {
    contentEl.querySelectorAll('p').forEach(p => {
        let text = p.innerHTML.trim();
        const patterns = {
            tip: /^\s*\[!TIP\]\s*|^\s*\[TIP\]\s*/,
            note: /^\s*\[!NOTE\]\s*|^\s*\[NOTE\]\s*|^\s*\[NOTES\]\s*/,
            important: /^\s*\[!IMPORTANT\]\s*/
        };

        for (const type in patterns) {
            if (patterns.hasOwnProperty(type)) {
                const match = text.match(patterns[type]);
                if (match) {
                    p.classList.add('callout', type);
                    p.innerHTML = text.substring(match[0].length);
                    return; 
                }
            }
        }
    });
}

function onHashChange(){
	let hash = location.hash;
	while(hash.startsWith('#')) { hash = hash.slice(1); }
	const target = decodeURIComponent(hash || '');
	const path = target || 'Pages/start-here.html';
	loadPage(path);
	setActiveLink();
}

buildSidebar();
interceptLinks();
window.addEventListener('hashchange', onHashChange);
onHashChange();

// Build right sticky TOC from h2/h3
function buildToc(){
	if(!pageTocEl) return;
	// Check if page uses collapsible sections (Introduction page)
	const hasCollapsible = contentEl.querySelector('.collapsible-section');
	if(hasCollapsible){
		pageTocEl.innerHTML=''; 
		pageTocEl.style.display = 'none';
		document.querySelector('.layout').classList.add('no-toc');
		return;
	}
	const headings = contentEl.querySelectorAll('h2, h3');
	if(!headings.length){ 
		pageTocEl.innerHTML=''; 
		pageTocEl.style.display = 'none';
		document.querySelector('.layout').classList.add('no-toc');
		return; 
	}
	pageTocEl.style.display = 'block';
	document.querySelector('.layout').classList.remove('no-toc');
	let html = '<h3>On this page</h3>';
	headings.forEach(h => {
		if(!h.id){ h.id = h.textContent.trim().toLowerCase().replace(/[^a-z0-9]+/g,'-'); }
		const indent = h.tagName === 'H3' ? '&nbsp;&nbsp;' : '';
		html += `${indent}<a href="#${h.id}" class="toc-link">${h.textContent}</a>`;
	});
	pageTocEl.innerHTML = html;
	// Add click handlers for smooth scrolling to sections on the same page
	pageTocEl.querySelectorAll('a.toc-link').forEach(link => {
		link.addEventListener('click', (e) => {
			e.preventDefault();
			const targetId = link.getAttribute('href').slice(1);
			const targetElement = document.getElementById(targetId);
			if(targetElement){
				targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
				// Update the URL hash without triggering navigation
				history.replaceState(null, null, location.pathname + location.hash.split('#')[0] + '#' + targetId);
			}
		});
	});
	// highlight current section on scroll
	const links = Array.from(pageTocEl.querySelectorAll('a'));
	const map = new Map(links.map(a => [a.getAttribute('href').slice(1), a]));
	const observer = new IntersectionObserver((entries)=>{
		entries.forEach(entry=>{
			if(entry.isIntersecting){
				links.forEach(l=>l.classList.remove('active'));
				const link = map.get(entry.target.id);
				if(link) link.classList.add('active');
			}
		});
	},{root: contentEl, threshold: 0.1});
	headings.forEach(h=>observer.observe(h));
}

// Copy buttons for code blocks
function addCopyButtons(){
	contentEl.querySelectorAll('pre code').forEach(code => {
		const pre = code.parentElement;
		if(pre.querySelector('.copy-btn')) return;
		const btn = document.createElement('button');
		btn.className = 'copy-btn theme-toggle';
		btn.textContent = 'Copy';
		btn.style.float = 'right';
		btn.style.margin = '4px';
		btn.addEventListener('click', async () => {
			try{ await navigator.clipboard.writeText(code.innerText); btn.textContent='Copied'; setTimeout(()=>btn.textContent='Copy',1200);}catch{}
		});
		pre.prepend(btn);
	});
}

// Theme toggle
const themeToggle = document.getElementById('themeToggle');
const prefer = localStorage.getItem('theme');
if(prefer === 'light') document.documentElement.classList.add('light');
themeToggle.addEventListener('click', () => {
	document.documentElement.classList.toggle('light');
	localStorage.setItem('theme', document.documentElement.classList.contains('light') ? 'light' : 'dark');
});

// Client-side search with lunr
const searchBox = document.getElementById('searchBox');
const resultsEl = document.getElementById('searchResults');

// List of pages to index
const PAGES = [
	'Pages/start-here.html',
	'Pages/TheBasics_index.html',
	'Pages/UsingFModel.html',
	'Pages/ExportingFModel.html',
	'Pages/ExportingUModel.html',
	'Pages/UModelAnimations.html',
	'Pages/AesKey.html',
	'Pages/ExtractingCooked.html',
	'Pages/ExtractingIoStore.html',
	'Pages/Extractingusmap.html',
	'Pages/BasicModding_index.html',
	'Pages/UAssetGUI.html',
	'Pages/HexEditing.html',
	'Pages/EditingUmaps.html',
	'Pages/DisablingObjects.html',
	'Pages/UnrealPak.html',
	'Pages/IoStorePacking.html',
	'Pages/example1.html',
	'Pages/IntermediateModding_index.html',
	'Pages/CreatingProject.html',
	'Pages/CookingContent.html',
	'Pages/ChangingTextures.html',
	'Pages/ChangingSM.html',
	'Pages/ChangingSK.html',
	'Pages/MergingSK.html',
	'Pages/ReplacingFonts.html',
	'Pages/TranslationMod.html',
	'Pages/BPModding_index.html',
	'Pages/ConfigVariables.html',
	'Pages/CreateWidget.html',
	'Pages/CustomLogger.html',
	'Pages/GameSaves.html',
	'Pages/Hotkeys.html',
	'Pages/ModActorLifeCycle.html',
	'Pages/AdvancedModding_index.html',
	'Pages/BpModsIntro.html',
	'Pages/BpReplication.html',
	'Pages/CustomAnimations.html',
	'Pages/ReplicatingMI.html',
	'Pages/ExpertModding_index.html',
	'Pages/GameMenus.html',
	'Pages/GeneratingUHT.html',
	'Pages/GameMemory_index.html',
	'Pages/GameSpecific_index.html',
	'Pages/gameSpecificGuides.html',
	'Pages/RNA_Celshaded_MI.html',
	'Pages/RNA_colorpicker.html',
	'Pages/RNA_Outfitmanager.html',
	'Pages/Misc_index.html',
	'Pages/BlenderImportModels.html',
	'Pages/BlenderImportAnimations.html',
	'Pages/BlenderImportTextures.html',
	'Pages/SubstanceImportTextures.html'
];

let idx = null; let docs = {};
(async function buildIndex(){
	const builder = new lunr.Builder();
	builder.field('title');
	builder.field('body');
	builder.ref('path');
	await Promise.all(PAGES.map(async p => {
		try{
			const res = await fetch(p);
			if(!res.ok) return;
			const html = await res.text();
			const tmp = document.createElement('div');
			tmp.innerHTML = html;
			const titleEl = tmp.querySelector('h1, h2');
			const title = titleEl ? titleEl.textContent.trim() : p.split('/').pop().replace('.html','');
			docs[p] = { title, body: tmp.textContent || '' };
			builder.add({ title, body: docs[p].body, path: p });
		}catch{}
	}));
	idx = builder.build();
})();

searchBox.addEventListener('input', () => {
	const q = searchBox.value.trim();
	if(!q || !idx){
		resultsEl.hidden = true;
		resultsEl.innerHTML='';
		sessionStorage.removeItem('lastQuery');
		const markInstance = new Mark(contentEl);
		markInstance.unmark();
		return;
	}
	const hits = idx.search(q).slice(0, 12);
	resultsEl.innerHTML = hits.map(h => {
		const d = docs[h.ref];
		return `<div class="search-item" data-path="${h.ref}"><strong>${d?.title||h.ref}</strong></div>`;
	}).join('');
	resultsEl.hidden = false;
});

resultsEl.addEventListener('click', (e) => {
	const item = e.target.closest('.search-item');
	if(!item) return;
	const path = item.getAttribute('data-path');
	location.hash = encodeURIComponent(path);
	resultsEl.hidden = true;
	resultsEl.innerHTML = '';
	// store query for highlight
	sessionStorage.setItem('lastQuery', searchBox.value.trim());
});

function applySearchHighlight(){
	const q = sessionStorage.getItem('lastQuery');
	if(!q) return;
	const markInstance = new Mark(contentEl);
	markInstance.unmark({ done: () => markInstance.mark(q) });
}

// Collapsible section toggle function (for Introduction page)
window.toggleCollapse = function(header) {
	const content = header.nextElementSibling;
	const isActive = header.classList.contains('active');
	
	if (isActive) {
		header.classList.remove('active');
		content.classList.remove('active');
	} else {
		header.classList.add('active');
		content.classList.add('active');
	}
};
