/* jshint esversion: 6 */

const sidebarEl = document.getElementById('sidebar');

const NAV = [
	{ title: 'Start Here', path: 'Pages/start-here.html', icon: 'fas fa-play-circle' },
    { title: 'Introduction to Modding', path: 'Pages/Introduction/index.html', icon: 'fas fa-book-open' },
    { title: 'Credits', path: 'Pages/credits.html', icon: 'fas fa-users' },
];

export function buildSidebar() {
    if (!sidebarEl) return;

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

    const discussionSection = document.createElement('div');
    discussionSection.className = 'sidebar-discussion';
    discussionSection.innerHTML = `
        <div class="sidebar-section-title">Discussion & Help</div>
        <a href="https://git.urstrom.eu/vein-tools/mod-wiki-site/-/issues/new" target="_blank" class="sidebar-discussion-btn sidebar-discussion-primary">
            <i class="fas fa-plus-circle"></i>
            <span>Ask a Question</span>
        </a>
        <a href="https://git.urstrom.eu/vein-tools/mod-wiki-site/-/issues" target="_blank" class="sidebar-discussion-btn sidebar-discussion-secondary">
            <i class="fas fa-list"></i>
            <span>View Discussions</span>
        </a>
    `;
    frag.appendChild(discussionSection);

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
            <a href="#" id="emailLink" aria-label="Email" title="Contact us via Email">
                <img src="Media/Icons/001-mail.png" alt="Email" class="social-icon">
            </a>
        </div>
    `;
    frag.appendChild(footer);
    
    sidebarEl.appendChild(frag);
}

export function setActiveLink() {
    if (!sidebarEl) return;
    
    let hash = location.hash;
    while(hash.startsWith('#')) { hash = hash.slice(1); }
    const target = decodeURIComponent(hash || 'Pages/home.html');

    sidebarEl.querySelectorAll('.nav-link').forEach(link => {
        const linkTarget = link.getAttribute('href').slice(1);
        if (linkTarget === target) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
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
