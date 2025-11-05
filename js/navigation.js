/* jshint esversion: 11 */

import { getKnowledgeBaseFiles, initKnowledgeBase } from './knowledge-base.js';

const sidebarEl = document.getElementById('sidebar');

const NAV = [
	{ title: 'Start Here', path: 'Pages/start-here.html', icon: 'fas fa-play-circle' },
    { title: 'Introduction to Modding', path: 'Pages/Introduction/index.html', icon: 'fas fa-book-open' },
    { title: 'Mod Manager', path: 'Pages/mod-manager.html', icon: 'fas fa-cog' },
    { title: 'Host a Server', path: 'Pages/host-server.html', icon: 'fas fa-server' },
    { title: 'Upload Mod', path: 'Pages/upload-mod.html', icon: 'fas fa-upload' },
    { title: 'Knowledge Base', path: 'KnowledgeBase/index.html', icon: 'fas fa-database' },
    { title: 'Credits', path: 'Pages/credits.html', icon: 'fas fa-users' },
];

export async function buildSidebar() {
    if (!sidebarEl) return;

    const inner = document.createElement('div');
    inner.className = 'sidebar-inner';

    const section = document.createElement('div');
    section.className = 'nav-section';
    section.id = 'main-sections';
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
    inner.appendChild(section);

    // Add Knowledge Base subsection with collapsible functionality
    await initKnowledgeBase();
    const kbFiles = await getKnowledgeBaseFiles();
    if (kbFiles.length > 0) {
        const kbSection = document.createElement('div');
        kbSection.className = 'nav-section';
        kbSection.id = 'kb-section';
        
        // Create collapsible header
        const kbTitleWrapper = document.createElement('div');
        kbTitleWrapper.className = 'kb-section-header';
        kbTitleWrapper.style.cursor = 'pointer';
        
        const kbTitle = document.createElement('div');
        kbTitle.className = 'nav-title';
        kbTitle.textContent = 'Knowledge Base';
        kbTitleWrapper.appendChild(kbTitle);
        
        const collapseIcon = document.createElement('i');
        collapseIcon.className = 'fas fa-chevron-down kb-collapse-icon';
        kbTitleWrapper.appendChild(collapseIcon);
        
        // Create collapsible content
        const kbContent = document.createElement('div');
        kbContent.className = 'kb-section-content';
        kbContent.id = 'kb-section-content';
        kbContent.style.display = 'block'; // Default to expanded
        
        kbFiles.forEach(file => {
            const displayName = file.replace(/^\d+_/, '').replace(/\.md$/, '').replace(/_/g, ' ');
            const a = document.createElement('a');
            a.className = 'nav-link';
            a.href = `#KnowledgeBase/${file}`;
            
            const text = document.createElement('span');
            text.textContent = displayName;
            a.appendChild(text);

            kbContent.appendChild(a);
        });
        
        // Toggle functionality
        kbTitleWrapper.addEventListener('click', () => {
            const isExpanded = kbContent.style.display === 'block';
            kbContent.style.display = isExpanded ? 'none' : 'block';
            kbTitleWrapper.classList.toggle('collapsed', !isExpanded);
            collapseIcon.style.transform = isExpanded ? 'rotate(0deg)' : 'rotate(180deg)';
        });
        
        kbSection.appendChild(kbTitleWrapper);
        kbSection.appendChild(kbContent);
        
        inner.appendChild(kbSection);
    }

    inner.appendChild(createDiscussionSection());

    inner.appendChild(createFooterSection());
    
    sidebarEl.appendChild(inner);
}

export function setActiveLink() {
    if (!sidebarEl) return;
    
    let hash = location.hash;
    while(hash.startsWith('#')) { hash = hash.slice(1); }
    const target = decodeURIComponent(hash || 'Pages/home.html');

    // Check if we're on a Knowledge Base page
    const isKBPage = target.startsWith('KnowledgeBase/');
    const mainSections = document.getElementById('main-sections');
    const kbSection = document.getElementById('kb-section');
    
    // Show/hide sections based on current page
    if (mainSections) {
        mainSections.style.display = isKBPage ? 'none' : 'block';
    }
    if (kbSection) {
        kbSection.style.display = isKBPage ? 'block' : 'none';
        // Expand KB section when on KB page
        if (isKBPage) {
            const kbContent = document.getElementById('kb-section-content');
            const kbHeader = kbSection.querySelector('.kb-section-header');
            if (kbContent && kbHeader) {
                // Expand and show on KB pages
                kbContent.style.display = 'block';
                kbHeader.classList.remove('collapsed');
                const collapseIcon = kbHeader.querySelector('.kb-collapse-icon');
                if (collapseIcon) {
                    collapseIcon.style.transform = 'rotate(180deg)';
                }
            }
        }
    }

    sidebarEl.querySelectorAll('.nav-link').forEach(link => {
        const linkTarget = link.getAttribute('href').slice(1);
        // Match exact path
        if (linkTarget === target) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

function createDiscussionSection() {
    const discussionSection = document.createElement('div');
    discussionSection.className = 'sidebar-discussion';

    const title = document.createElement('div');
    title.className = 'sidebar-section-title';
    title.textContent = 'Discussion & Help';
    discussionSection.appendChild(title);

    const askBtn = document.createElement('a');
    askBtn.href = 'https://git.urstrom.eu/vein-tools/mod-wiki-site/-/issues/new';
    askBtn.target = '_blank';
    askBtn.className = 'sidebar-discussion-btn sidebar-discussion-primary';
    
    const askIcon = document.createElement('i');
    askIcon.className = 'fas fa-plus-circle';
    askBtn.appendChild(askIcon);
    
    const askText = document.createElement('span');
    askText.textContent = 'Ask a Question';
    askBtn.appendChild(askText);
    
    discussionSection.appendChild(askBtn);

    const viewBtn = document.createElement('a');
    viewBtn.href = 'https://git.urstrom.eu/vein-tools/mod-wiki-site/-/issues';
    viewBtn.target = '_blank';
    viewBtn.className = 'sidebar-discussion-btn sidebar-discussion-secondary';
    
    const viewIcon = document.createElement('i');
    viewIcon.className = 'fas fa-list';
    viewBtn.appendChild(viewIcon);
    
    const viewText = document.createElement('span');
    viewText.textContent = 'View Discussions';
    viewBtn.appendChild(viewText);
    
    discussionSection.appendChild(viewBtn);

    return discussionSection;
}

function createFooterSection() {
    const footer = document.createElement('div');
    footer.className = 'sidebar-footer';

    const title = document.createElement('div');
    title.className = 'footer-title';
    title.textContent = 'Community';
    footer.appendChild(title);

    const socialLinks = document.createElement('div');
    socialLinks.className = 'social-links';

    const createSocialLink = (href, title, iconSrc, altText, id = null) => {
        const a = document.createElement('a');
        a.href = href;
        if (href !== '#') {
            a.target = '_blank';
            a.rel = 'noopener';
        }
        a.setAttribute('aria-label', altText);
        a.title = title;
        if (id) a.id = id;

        const img = document.createElement('img');
        img.src = iconSrc;
        img.alt = altText;
        img.className = 'social-icon';
        a.appendChild(img);
        
        return a;
    };

    socialLinks.appendChild(createSocialLink(
        'https://discord.gg/nsaPf7wAkP', 'Join our Discord', 'Media/Icons/002-discord.png', 'Discord'
    ));

    socialLinks.appendChild(createSocialLink(
        'https://store.steampowered.com/app/1857950/VEIN/', 'VEIN on Steam', 'Media/Icons/steam.png', 'Steam'
    ));
    
    socialLinks.appendChild(createSocialLink(
        '#', 'Contact us via Email', 'Media/Icons/001-mail.png', 'Email', 'emailLink'
    ));

    footer.appendChild(socialLinks);
    
    return footer;
}

export function initMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('mobileOverlay');

    if (menuToggle && sidebar && overlay) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
            overlay.classList.toggle('active');
        });

        overlay.addEventListener('click', () => {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
        });

        sidebar.addEventListener('click', (e) => {
            if (e.target.classList.contains('nav-link') || e.target.closest('.nav-link')) {
                sidebar.classList.remove('active');
                overlay.classList.remove('active');
            }
        });
    }
}
