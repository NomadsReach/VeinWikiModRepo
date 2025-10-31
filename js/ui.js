/* jshint esversion: 6 */

export function initEmailModal() {
    const emailLink = document.getElementById('emailLink');
    const emailModal = document.getElementById('emailModal');
    const modalClose = document.querySelector('.modal-close');
    const copyEmailBtn = document.querySelector('.modal-btn-primary');

    if (emailLink && emailModal && modalClose && copyEmailBtn) {
        emailLink.addEventListener('click', (e) => {
            e.preventDefault();
            emailModal.style.display = 'flex';
        });

        modalClose.addEventListener('click', () => {
            emailModal.style.display = 'none';
        });

        emailModal.addEventListener('click', (e) => {
            if (e.target.id === 'emailModal') {
                emailModal.style.display = 'none';
            }
        });
        
        copyEmailBtn.addEventListener('click', () => {
			navigator.clipboard.writeText('veinmodding@protonmail.com').then(() => {
				const originalText = copyEmailBtn.innerHTML;
				copyEmailBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
				setTimeout(() => {
					copyEmailBtn.innerHTML = originalText;
				}, 2000);
			});
		});
    }
}

export function initDiscordWidget() {
    const discordWidgetBtn = document.getElementById('discordWidgetBtn');
    const discordWidget = document.getElementById('discordWidget');
    const discordWidgetClose = document.querySelector('.discord-widget-close');

    if (discordWidgetBtn && discordWidget && discordWidgetClose) {
        discordWidgetBtn.addEventListener('click', () => {
            discordWidget.style.display = 'flex';
        });

        discordWidgetClose.addEventListener('click', () => {
            discordWidget.style.display = 'none';
        });
    }
}

export function initOrientationBanner() {
    const rotateBanner = document.getElementById('rotateBanner');
    const rotateDismiss = document.querySelector('.rotate-dismiss');

    if (rotateBanner && rotateDismiss) {
        rotateDismiss.addEventListener('click', () => {
            rotateBanner.style.display = 'none';
        });
    }
}

export function initCollapsibleSections() {
    window.toggleCollapse = function(element) {
        const header = element.closest('.collapsible-header');
        const content = header.nextElementSibling;
        
        header.classList.toggle('active');
        content.style.display = content.style.display === 'block' ? 'none' : 'block';
    };
}

export function addCopyButtons() {
    document.querySelectorAll('pre').forEach(pre => {
        if (pre.querySelector('.copy-btn')) return;

        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-btn';
        copyBtn.textContent = 'Copy';
        pre.style.position = 'relative';
        pre.appendChild(copyBtn);

        copyBtn.addEventListener('click', () => {
            const code = pre.querySelector('code').innerText;
            navigator.clipboard.writeText(code).then(() => {
                copyBtn.textContent = 'Copied!';
                copyBtn.classList.add('copied');
                setTimeout(() => {
                    copyBtn.textContent = 'Copy';
                    copyBtn.classList.remove('copied');
                }, 2000);
            });
        });
    });
}
