/* jshint esversion: 11 */

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

export function resetEasterEgg() {
    localStorage.removeItem('easterEggCompleted');
    console.log('Easter Egg has been reset. Refresh the page to see it again.');
    initEasterEgg();
}
window.resetEasterEgg = resetEasterEgg;

export function initEasterEgg() {
    if (localStorage.getItem('easterEggCompleted') === 'true') {
        return;
    }
    
    let clickCount = 0;
    const requiredClicks = 3;
    
    function screenShake() {
        const originalTransform = document.body.style.transform;
        let shakeCount = 0;
        const shakeInterval = setInterval(() => {
            const intensity = (5 - shakeCount) * 2;
            const x = (Math.random() - 0.5) * intensity;
            const y = (Math.random() - 0.5) * intensity;
            document.body.style.transform = `translate(${x}px, ${y}px)`;
            shakeCount++;
            if (shakeCount >= 10) {
                clearInterval(shakeInterval);
                document.body.style.transform = originalTransform;
            }
        }, 50);
    }
    
    function showEasterEggPrompt() {
        const modal = document.createElement('div');
        modal.className = 'easter-egg-modal-overlay';
        
        const box = document.createElement('div');
        box.className = 'easter-egg-modal-box';
        
        box.innerHTML = `
            <div class="easter-egg-modal-icon">
                <i class="fas fa-question-circle"></i>
            </div>
            <h3 class="easter-egg-modal-title">Hmm, what does this do?</h3>
            <p class="easter-egg-modal-text">You've discovered something interesting...</p>
            <div class="easter-egg-modal-actions">
                <button id="easterEggFindOut" class="easter-egg-btn-find-out">Find out!</button>
                <button id="easterEggCancel" class="easter-egg-btn-cancel">Maybe later</button>
            </div>
        `;
        
        modal.appendChild(box);
        document.body.appendChild(modal);
        
        setTimeout(() => {
            const findOutBtn = document.getElementById('easterEggFindOut');
            const cancelBtn = document.getElementById('easterEggCancel');
            
            if (findOutBtn) {
                findOutBtn.addEventListener('click', (e) => {
                    e.preventDefault();
            modal.remove();
            clickCount++;
            if (clickCount >= requiredClicks) {
                triggerEasterEgg();
            } else {
                setTimeout(() => {
                    createHiddenEasterEggTrigger();
                }, 2000);
            }
        });
            }
        
            if (cancelBtn) {
                cancelBtn.addEventListener('click', (e) => {
                    e.preventDefault();
            modal.remove();
            setTimeout(() => {
                createHiddenEasterEggTrigger();
            }, 5000);
        });
            }
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
                setTimeout(() => {
                    createHiddenEasterEggTrigger();
                }, 5000);
            }
        });
        }, 10);
    }
    
    function createHiddenEasterEggTrigger() {
        const triggers = [
            () => {
                const footer = document.querySelector('.sidebar-footer');
                if (!footer) {
                    const sidebar = document.querySelector('.sidebar');
                    if (!sidebar) return null;
                    const trigger = document.createElement('div');
                    trigger.className = 'hidden-easter-egg-trigger hidden-easter-egg-trigger-fixed';
                    
                    document.body.appendChild(trigger);
                    
                    return trigger;
                }
                
                const trigger = document.createElement('div');
                trigger.className = 'hidden-easter-egg-trigger';
                
                footer.style.position = 'relative';
                footer.appendChild(trigger);
                
                return trigger;
            },
            () => {
                const logo = document.querySelector('.logo');
                if (!logo) return null;
                const logoParent = logo.parentElement;
                if (!logoParent) return null;
                
                logoParent.classList.add('easter-egg-trigger-active');
                
                const cleanup = () => {
                    logoParent.classList.remove('easter-egg-trigger-active');
                };
                
                return { element: logoParent, cleanup };
            },
            () => {
                const headerNav = document.querySelector('.header-nav');
                if (!headerNav) return null;
                
                const clickHereBtn = document.createElement('a');
                clickHereBtn.href = '#';
                clickHereBtn.className = 'header-nav-link easter-egg-click-here-btn';
                clickHereBtn.innerHTML = '<span>Click Here</span>';
                
                headerNav.appendChild(clickHereBtn);
                
                const cleanup = () => {
                    if (clickHereBtn.parentElement) {
                        clickHereBtn.remove();
                    }
                };
                
                return { element: clickHereBtn, cleanup };
            }
        ];
        
        const triggerIndex = clickCount % triggers.length;
        const triggerResult = triggers[triggerIndex]();
        
        if (triggerResult) {
            const isObjectResult = triggerResult && typeof triggerResult === 'object' && triggerResult.element !== undefined;
            const trigger = isObjectResult ? triggerResult.element : triggerResult;
            const cleanup = isObjectResult && triggerResult.cleanup ? triggerResult.cleanup : (() => {
            });
            
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                cleanup();
                showEasterEggPrompt();
                if (!isObjectResult && trigger.remove) {
                trigger.remove();
                }
            }, { once: true });
        } else {
            setTimeout(() => {
                createHiddenEasterEggTrigger();
            }, 3000);
        }
    }
    
    setTimeout(() => {
        createHiddenEasterEggTrigger();
    }, 15000);
}

function triggerEasterEgg() {
    localStorage.setItem('easterEggCompleted', 'true');
    
    const layout = document.querySelector('.layout');
    const header = document.querySelector('.unified-header');
    const sidebar = document.querySelector('.sidebar');
    
    if (layout) layout.style.display = 'none';
    if (header) header.style.display = 'none';
    if (sidebar) sidebar.style.display = 'none';
    
    const overlay = document.createElement('div');
    overlay.className = 'easter-egg-overlay';
    
    const gif = document.createElement('img');
    gif.src = 'https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExbDd6NmtxZ2hteG9wbDE4eTJ2cjZtcW8xYWZ1NDFqOXkzcHZ2ZWxiaiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/FK44MttIgvtVcXX3ys/giphy.gif';
    gif.className = 'easter-egg-gif';
    
    gif.onerror = () => {
        console.error('Failed to load Easter Egg GIF');
    };
    
    const audioWrapper = document.createElement('div');
    audioWrapper.className = 'easter-egg-audio-wrapper';
    
    const iframe = document.createElement('iframe');
    iframe.src = 'https://www.youtube.com/embed/bRLML36HnzU?autoplay=1&start=8&mute=0';
    iframe.width = '0';
    iframe.height = '0';
    iframe.frameBorder = '0';
    iframe.setAttribute('allow', 'autoplay');
    audioWrapper.appendChild(iframe);
    
    overlay.appendChild(gif);
    overlay.appendChild(audioWrapper);
    document.body.appendChild(overlay);
    
    overlay.addEventListener('click', () => {
        audioWrapper.remove();
        overlay.remove();
        if (layout) layout.style.display = '';
        if (header) header.style.display = '';
        if (sidebar) sidebar.style.display = '';
        showEasterEggNotification();
    });
}

function showEasterEggNotification() {
    const notification = document.createElement('div');
    notification.className = 'easter-egg-notification';
    
    notification.innerHTML = `
        <div class="easter-egg-notification-content">
            <i class="fas fa-star easter-egg-notification-icon"></i>
            <span>Good job finding the easter egg!</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('slide-out');
        setTimeout(() => {
            notification.remove();
        }, 500);
    }, 4000);
}
