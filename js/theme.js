import { CONFIG } from './config.js';
import { DOM } from './dom.js';

export function applyTheme(theme) {
    const themeLink = document.getElementById('theme-stylesheet');
    if (theme === 'classic') {
        themeLink.href = 'css/theme-classic.css';
    } else {
        themeLink.href = 'css/theme-modern.css';
    }
}

export function updateLogo(logoParam) {
    const logoUrl = CONFIG.LOGO_MAP[logoParam];
    if (logoUrl) {
        DOM.overlayImage.src = logoUrl;
        DOM.overlayImage.style.display = 'block';
    } else {
        DOM.overlayImage.style.display = 'none';
    }
}
