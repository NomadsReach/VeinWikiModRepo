/* jshint esversion: 6 */
/* globals console */

import { initTheme } from './js/theme.js';
import { buildSidebar, initMobileMenu } from './js/navigation.js';
import { initLoader } from './js/loader.js';
import { initSearch } from './js/search.js';
import { 
    initEmailModal, 
    initDiscordWidget, 
    initOrientationBanner, 
    initCollapsibleSections 
} from './js/ui.js';

document.addEventListener('DOMContentLoaded', () => {
    
    initTheme();
    buildSidebar();
    initMobileMenu();
    initSearch();

    initEmailModal();
    initDiscordWidget();
    initOrientationBanner();
    initCollapsibleSections();

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
