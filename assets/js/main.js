// PRIME Website - Main JavaScript
// Handles navigation, animations, and dynamic content

// Global variables
let currentSection = 'home';
let isTransitioning = false;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeAnimations();
    loadDynamicContent();
    setupScrollEffects();
    
    console.log('PRIME Website initialized');
});

// Navigation Management
function showSection(sectionId) {
    if (isTransitioning || sectionId === currentSection) return;
    
    isTransitioning = true;
    
    // Hide current section
    const currentEl = document.getElementById(currentSection);
    const targetEl = document.getElementById(sectionId);
    
    if (currentEl && targetEl) {
        // Add fade out effect
        currentEl.style.opacity = '0';
        
        setTimeout(() => {
            currentEl.classList.remove('active');
            targetEl.classList.add('active');
            targetEl.style.opacity = '0';
            
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
            // Fade in new section
            setTimeout(() => {
                targetEl.style.opacity = '1';
                isTransitioning = false;
            }, 100);
            
        }, 300);
    }
    
    // Update navigation
    updateNavigation(sectionId);
    currentSection = sectionId;
    
    // Update URL without page reload
    history.pushState({section: sectionId}, '', `#${sectionId}`);
}

function updateNavigation(activeSection) {
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('onclick').includes(activeSection)) {
            link.classList.add('active');
        }
    });
}

function initializeNavigation() {
    // Handle browser back/forward buttons
    window.addEventListener('popstate', function(event) {
        if (event.state && event.state.section) {
            showSection(event.state.section);
        }
    });
    
    // Set initial state
    const hash = window.location.hash.substring(1);
    if (hash && document.getElementById(hash)) {
        showSection(hash);
    } else {
        history.replaceState({section: 'home'}, '', '#home');
    }
}

// Animation Management
function initializeAnimations() {
    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observe all cards and sections
    document.querySelectorAll('.card, .timeline-item, .news-item').forEach(el => {
        observer.observe(el);
    });
}

function setupScrollEffects() {
    let ticking = false;
    
    function updateScrollEffects() {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        
        // Parallax effect for hero background
        const hero = document.querySelector('.hero');
        if (hero) {
            hero.style.transform = `translateY(${rate}px)`;
        }
        
        // Navigation background opacity
        const nav = document.querySelector('nav');
        if (nav) {
            const opacity = Math.min(scrolled / 100, 1);
            nav.style.background = `rgba(15, 23, 42, ${0.95 * opacity})`;
        }
    }
    
    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(updateScrollEffects);
            ticking = true;
            setTimeout(() => { ticking = false; }, 16);
        }
    }
    
    window.addEventListener('scroll', requestTick);
}

// Dynamic Content Management
async function loadDynamicContent() {
    try {
        // Load news data
        const newsData = await loadJSONData('news');
        if (newsData) {
            updateNewsSection(newsData);
        }
        
        // Load timeline data
        const timelineData = await loadJSONData('timeline');
        if (timelineData) {
            updateTimelineSection(timelineData);
        }
        
        // Load consortium data
        const consortiumData = await loadJSONData('consortium');
        if (consortiumData) {
            updateConsortiumSection(consortiumData);
        }
        
    } catch (error) {
        console.warn('Dynamic content loading failed:', error);
        // Fallback to static content
    }
}

async function loadJSONData(filename) {
    try {
        const response = await fetch(`data/${filename}.json`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.warn(`Failed to load ${filename}.json:`, error);
        return null;
    }
}

function updateNewsSection(newsData) {
    const newsContainer = document.querySelector('#news .container');
    if (!newsContainer || !newsData.articles) return;
    
    let newsHTML = '<h2>Latest News & Updates</h2>';
    
    newsData.articles.forEach(article => {
        newsHTML += `
            <div class="news-item">
                <div class="date">${formatDate(article.date)}</div>
                <h3>${article.title}</h3>
                <p>${article.content}</p>
            </div>
        `;
    });
    
    newsContainer.innerHTML = newsHTML;
}

function updateTimelineSection(timelineData) {
    const timelineContainer = document.querySelector('.timeline-content');
    if (!timelineContainer || !timelineData.milestones) return;
    
    let timelineHTML = '';
    
    timelineData.milestones.forEach(milestone => {
        const markerClass = milestone.status === 'completed' ? 'completed' : 
                           milestone.status === 'current' ? 'current' : '';
        const icon = milestone.status === 'completed' ? '✓' : 
                    milestone.status === 'current' ? '⚙️' : milestone.icon;
        
        timelineHTML += `
            <div class="timeline-item">
                <div class="timeline-marker ${markerClass}">${icon}</div>
                <div class="timeline-content-item">
                    <h4>${milestone.title}</h4>
                    <div class="date">${milestone.timeframe}</div>
                    <p>${milestone.description}</p>
                </div>
            </div>
        `;
    });
    
    timelineContainer.innerHTML = timelineHTML;
}

function updateConsortiumSection(consortiumData) {
    // Implementation for consortium member data
    console.log('Consortium data loaded:', consortiumData);
}

// Utility Functions
function formatDate(dateString) {
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Performance monitoring
function logPerformance() {
    if (typeof performance !== 'undefined' && performance.timing) {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        console.log(`Page load time: ${loadTime}ms`);
    }
}

// Call performance logging after load
window.addEventListener('load', logPerformance);

// Export functions for use in HTML onclick handlers
window.showSection = showSection;
