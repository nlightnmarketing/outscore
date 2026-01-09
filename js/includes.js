// Header and Footer Include Script
(function() {
    'use strict';

    // Determine the root path based on current page location
    function getRootPath() {
        const path = window.location.pathname;
        // Remove leading/trailing slashes and filter out empty segments
        const segments = path.split('/').filter(p => p && !p.endsWith('.html'));
        const depth = segments.length;
        
        if (depth === 0 || (depth === 1 && (segments[0] === 'index' || segments[0] === ''))) {
            // Root level (e.g., / or /index)
            return '';
        } else if (depth === 1) {
            // One level deep (e.g., /notes, /about)
            return '../';
        } else if (depth >= 2) {
            // Two or more levels deep (e.g., /notes/10th-grade, /notes/10th-grade/arithmetic-progressions-introduction)
            return '../'.repeat(depth);
        }
        return '';
    }

    // Determine which page we're on for active link
    function getCurrentPage() {
        const path = window.location.pathname;
        // Remove leading/trailing slashes and filter out empty segments
        const segments = path.split('/').filter(p => p && !p.endsWith('.html'));
        const filename = segments[segments.length - 1] || '';
        
        // Check if we're at root or index page
        if (filename === '' || filename === 'index' || path === '/' || path.endsWith('/')) {
            return 'index';
        } 
        // Check if path contains /notes/ or filename is notes
        else if (path.includes('/notes/') || filename === 'notes' || segments.includes('notes')) {
            return 'notes';
        } 
        // Check for about page
        else if (filename === 'about' || segments.includes('about')) {
            return 'about';
        } 
        // Check for contact page
        else if (filename === 'contact' || segments.includes('contact')) {
            return 'contact';
        }
        // Check for partnerships pages
        else if (filename === 'schools' || segments.includes('schools')) {
            return 'schools';
        }
        else if (filename === 'tuition' || segments.includes('tuition')) {
            return 'tuition';
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

                    // Handle mobile dropdown toggle
                    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
                    dropdownToggles.forEach(toggle => {
                        if (!toggle.hasAttribute('data-dropdown-listener')) {
                            toggle.setAttribute('data-dropdown-listener', 'true');
                            toggle.addEventListener('click', function(e) {
                                if (window.innerWidth <= 768) {
                                    e.preventDefault();
                                    const dropdown = this.closest('.nav-dropdown');
                                    dropdown.classList.toggle('active');
                                }
                            });
                        }
                    });

                    // Close mobile menu when clicking on dropdown links
                    const dropdownLinks = document.querySelectorAll('.dropdown-link');
                    dropdownLinks.forEach(link => {
                        if (!link.hasAttribute('data-close-listener')) {
                            link.setAttribute('data-close-listener', 'true');
                            link.addEventListener('click', function() {
                                if (window.innerWidth <= 768 && navMenu) {
                                    navMenu.classList.remove('active');
                                    const spans = navToggle?.querySelectorAll('span');
                                    if (spans) {
                                        spans[0].style.transform = 'none';
                                        spans[1].style.opacity = '1';
                                        spans[2].style.transform = 'none';
                                    }
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

