// Header and Footer Include Script
(function() {
    'use strict';

    // Determine the root path based on current page location
    function getRootPath() {
        const path = window.location.pathname;
        const depth = path.split('/').filter(p => p && !p.endsWith('.html')).length;
        
        if (depth === 0) {
            // Root level (e.g., /index.html)
            return '';
        } else if (depth === 1) {
            // One level deep (e.g., /notes/10th-grade.html)
            return '../';
        } else if (depth >= 2) {
            // Two or more levels deep (e.g., /notes/10th-grade/arithmetic-progressions-introduction.html)
            return '../'.repeat(depth);
        }
        return '';
    }

    // Determine which page we're on for active link
    function getCurrentPage() {
        const path = window.location.pathname;
        const filename = path.split('/').pop() || 'index.html';
        
        if (filename === 'index.html' || filename === '' || path.endsWith('/')) {
            return 'index';
        } else if (filename.includes('notes') || path.includes('/notes/')) {
            return 'notes';
        } else if (filename.includes('about')) {
            return 'about';
        } else if (filename.includes('contact')) {
            return 'contact';
        }
        return null;
    }

    // Replace __ROOT__ placeholders with actual root path
    function replaceRootPaths(html, rootPath) {
        return html.replace(/__ROOT__/g, rootPath);
    }

    // Set active navigation link
    function setActiveNavLink(currentPage) {
        if (!currentPage) return;
        
        const navLinks = document.querySelectorAll('[data-nav-link]');
        navLinks.forEach(link => {
            const linkPage = link.getAttribute('data-nav-link');
            if (linkPage === currentPage) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    // Load and insert component
    async function loadComponent(componentName, placeholderId) {
        const rootPath = getRootPath();
        const componentPath = `${rootPath}components/${componentName}.html`;
        const placeholder = document.getElementById(placeholderId);
        
        if (!placeholder) {
            console.warn(`Placeholder element #${placeholderId} not found`);
            return;
        }

        try {
            const response = await fetch(componentPath);
            if (!response.ok) {
                throw new Error(`Failed to load ${componentName}: ${response.statusText}`);
            }
            
            let html = await response.text();
            html = replaceRootPaths(html, rootPath);
            
            // Insert the HTML
            placeholder.innerHTML = html;
            
            // If this is the header, set active link and initialize nav toggle
            if (componentName === 'header') {
                const currentPage = getCurrentPage();
                setActiveNavLink(currentPage);
                
                // Initialize navigation toggle if script.js hasn't loaded yet
                // The existing script.js will handle this, but we ensure it works
                setTimeout(() => {
                    const navToggle = document.getElementById('navToggle');
                    const navMenu = document.getElementById('navMenu');
                    const navLinks = document.querySelectorAll('.nav-link');
                    
                    if (navToggle && navMenu) {
                        // Only add listener if not already added
                        if (!navToggle.hasAttribute('data-listener-added')) {
                            navToggle.setAttribute('data-listener-added', 'true');
                            navToggle.addEventListener('click', function() {
                                navMenu.classList.toggle('active');
                                
                                // Animate hamburger icon
                                const spans = navToggle.querySelectorAll('span');
                                if (navMenu.classList.contains('active')) {
                                    spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                                    spans[1].style.opacity = '0';
                                    spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
                                } else {
                                    spans[0].style.transform = 'none';
                                    spans[1].style.opacity = '1';
                                    spans[2].style.transform = 'none';
                                }
                            });
                        }
                    }
                    
                    // Close mobile menu when clicking on a link
                    navLinks.forEach(link => {
                        if (!link.hasAttribute('data-close-listener')) {
                            link.setAttribute('data-close-listener', 'true');
                            link.addEventListener('click', function() {
                                if (navMenu) navMenu.classList.remove('active');
                                const spans = navToggle?.querySelectorAll('span');
                                if (spans) {
                                    spans[0].style.transform = 'none';
                                    spans[1].style.opacity = '1';
                                    spans[2].style.transform = 'none';
                                }
                            });
                        }
                    });
                }, 100);
            }
        } catch (error) {
            console.error(`Error loading ${componentName}:`, error);
            placeholder.innerHTML = `<!-- Error loading ${componentName} -->`;
        }
    }

    // Load components when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            loadComponent('header', 'header-placeholder');
            loadComponent('footer', 'footer-placeholder');
        });
    } else {
        // DOM already loaded
        loadComponent('header', 'header-placeholder');
        loadComponent('footer', 'footer-placeholder');
    }
})();

