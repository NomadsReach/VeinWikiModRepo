/* jshint esversion: 6 */

export function initTheme() {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.classList.toggle('light', savedTheme === 'light');
    }

    themeToggle.addEventListener('click', () => {
        const isLight = document.documentElement.classList.toggle('light');
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
    });
}
