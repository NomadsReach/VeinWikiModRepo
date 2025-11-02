/* jshint esversion: 11 */
/* globals console */

import { initTheme } from './js/theme.js';
import { buildSidebar, initMobileMenu } from './js/navigation.js';
import { initLoader } from './js/loader.js';
import { initSearch } from './js/search.js';
import { 
    initEmailModal, 
    initDiscordWidget, 
    initOrientationBanner, 
    initCollapsibleSections,
    initEasterEgg
} from './js/ui.js';
import { renderNewsCarousel, renderNewsPage } from './js/news.js';

document.addEventListener('DOMContentLoaded', () => {
    
    initTheme();
    buildSidebar();
    initMobileMenu();
    initSearch();

    initEmailModal();
    initDiscordWidget();
    initOrientationBanner();
    initCollapsibleSections();
    initEasterEgg();

    initLoader();

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(function(registrations) {
            for(let registration of registrations) {
                registration.unregister();
            }
        }).catch(function(err) {
            console.log('Service Worker unregistration failed: ', err);
});
    }
});
