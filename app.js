/* jshint esversion: 11 */
/* globals console */

import { buildSidebar, initMobileMenu } from './js/navigation.js';
import { initLoader } from './js/loader.js';
import { initSearch } from './js/search.js';
import { 
    initEmailModal, 
    initDiscordWidget, 
    initOrientationBanner, 
    initCollapsibleSections,
    initEasterEgg,
    initKBDropdown
} from './js/ui.js';
import { renderNewsCarousel, renderNewsPage } from './js/news.js';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        await buildSidebar();
    } catch (err) {
        console.error('Error building sidebar:', err);
    }
    
    try {
        initMobileMenu();
        initSearch();
            initEmailModal();
    initDiscordWidget();
    initOrientationBanner();
    initCollapsibleSections();
    initEasterEgg();
    await initKBDropdown();
    initLoader();
    } catch (err) {
        console.error('Error initializing components:', err);
    }

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
