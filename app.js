/**
 * Streets Services - Main JavaScript
 * Consolidated and optimized functionality
 */

// ============================================
// Utility Functions
// ============================================

/**
 * Debounce function to limit function calls
 */
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

/**
 * Get random item from array
 */
function getRandomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}

/**
 * Animate element with pulse effect
 */
function animateElement(element, animationClass = 'animate') {
    if (!element) return;
    
    element.classList.remove(animationClass);
    void element.offsetWidth; // Trigger reflow
    element.classList.add(animationClass);
}

// ============================================
// Section Toggle Functionality
// ============================================

/**
 * Toggle section expansion/collapse
 */
function toggleSection(sectionId) {
    const content = document.getElementById(sectionId);
    if (!content) return;
    
    const header = content.previousElementSibling;
    
    // Toggle the active class
    content.classList.toggle('active');
    header.classList.toggle('collapsed');
    
    // Store state in localStorage
    const isActive = content.classList.contains('active');
    try {
        localStorage.setItem(sectionId, isActive);
    } catch (e) {
        console.warn('localStorage not available:', e);
    }
    
    // Update ARIA attributes for accessibility
    header.setAttribute('aria-expanded', isActive);
}

/**
 * Initialize sections from localStorage
 */
function initializeSections() {
    const sections = document.querySelectorAll('.section-content');
    
    sections.forEach(section => {
        const sectionId = section.id;
        let savedState = null;
        
        try {
            savedState = localStorage.getItem(sectionId);
        } catch (e) {
            console.warn('localStorage not available:', e);
        }
        
        // If there's no saved state, keep default
        if (savedState === null) return;
        
        // Apply saved state
        const header = section.previousElementSibling;
        if (savedState === 'true') {
            section.classList.add('active');
            header.classList.remove('collapsed');
            header.setAttribute('aria-expanded', 'true');
        } else {
            section.classList.remove('active');
            header.classList.add('collapsed');
            header.setAttribute('aria-expanded', 'false');
        }
    });
}

/**
 * Setup section headers for accessibility
 */
function setupAccessibility() {
    document.querySelectorAll('.section-header').forEach(header => {
        header.setAttribute('tabindex', '0');
        header.setAttribute('role', 'button');
        
        const isCollapsed = header.classList.contains('collapsed');
        header.setAttribute('aria-expanded', !isCollapsed);
    });
}

// ============================================
// Navigation Functionality
// ============================================

/**
 * Smooth scroll to section
 */
function scrollToSection(sectionId) {
    const targetSection = document.getElementById(sectionId);
    if (!targetSection) return;
    
    // Expand the section if it's collapsed
    const sectionContent = targetSection.querySelector('.section-content');
    if (sectionContent && !sectionContent.classList.contains('active')) {
        const contentId = sectionContent.id;
        toggleSection(contentId);
    }
    
    // Smooth scroll to section
    targetSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

/**
 * Setup navigation links
 */
function setupNavigation() {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            scrollToSection(targetId);
        });
    });
}

// ============================================
// Keyboard Navigation
// ============================================

/**
 * Handle keyboard events for accessibility
 */
function setupKeyboardNavigation() {
    document.addEventListener('keydown', function(e) {
        if (e.target.classList.contains('section-header')) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.target.click();
            }
        }
    });
}

// ============================================
// Food Generator Functions
// ============================================

const FOOD_DATA = {
    lunch: [
        "Wraps", "Cheesy Wraps", "Toast", "Noodles", "Pate on Toast",
        "Sandwiches", "Bacon Sandwiches", "Warm Rolls", "Beans on Toast",
        "Fried Egg Sandwich", "Go Out"
    ],
    dinner: [
        "Burgers", "Pizza", "Homemade Pizza", "Korma", "Butter Chicken",
        "Spaghetti Bolognese", "Chilli Con Carne", "Cheesy Bacon Pasta",
        "Honey Sesame Chicken", "Chicken Nuggets & Chips", "Lasagna",
        "Pasta Bake", "Meatloaf", "Fish & Chips", "Stuffed Garlic Baguettes",
        "Go Out"
    ],
    mealDeal: [
        "Sausage & Mash", "Chicken Korma", "Meatballs & Pasta"
    ],
    out: [
        "McDonald's", "Subway", "KFC", "Nandos", "Green King", "Weatherspoon's"
    ]
};

/**
 * Generate random food selection
 */
function generateFood(category, resultElementId) {
    const resultElement = document.getElementById(resultElementId);
    if (!resultElement || !FOOD_DATA[category]) return;
    
    const randomFood = getRandomItem(FOOD_DATA[category]);
    resultElement.textContent = randomFood;
    animateElement(resultElement);
}

// Individual generator functions for backwards compatibility
function generateLunch() {
    generateFood('lunch', 'lunch-result');
}

function generateDinner() {
    generateFood('dinner', 'dinner-result');
}

function generateMealDeal() {
    generateFood('mealDeal', 'meal-deal-result');
}

function generateOut() {
    generateFood('out', 'out-result');
}

// ============================================
// Price Calculator Functions
// ============================================

/**
 * Calculate price per TB
 */
function calculatePricePerTB() {
    const priceInput = document.getElementById("price");
    const sizeInput = document.getElementById("size");
    const resultBox = document.getElementById("result");

    if (!priceInput || !sizeInput || !resultBox) return;

    const price = parseFloat(priceInput.value);
    const size = parseFloat(sizeInput.value);

    // Validation
    if (!price || !size) {
        showResult(resultBox, "⚠️ Please enter both values", "");
        return;
    }

    if (price <= 0 || size <= 0) {
        showResult(resultBox, "⚠️ Values must be greater than 0", "");
        return;
    }

    const pricePerTB = (price / size).toFixed(2);
    const { rating, emoji } = getRatingForPrice(pricePerTB);

    showResult(
        resultBox,
        `£${pricePerTB} per TB ${emoji}`,
        rating
    );
}

/**
 * Get value rating based on price
 */
function getRatingForPrice(pricePerTB) {
    if (pricePerTB < 15) {
        return { rating: "Excellent Value!", emoji: "🌟" };
    } else if (pricePerTB < 20) {
        return { rating: "Good Value", emoji: "✅" };
    } else if (pricePerTB < 30) {
        return { rating: "Fair Value", emoji: "👍" };
    } else {
        return { rating: "Consider Other Options", emoji: "💭" };
    }
}

/**
 * Display result in result box
 */
function showResult(resultBox, mainText, subText) {
    resultBox.innerHTML = `
        <div>
            <div class="result-text">${mainText}</div>
            ${subText ? `<div class="result-subtext">${subText}</div>` : ''}
        </div>
    `;
    resultBox.classList.add('show');
}

/**
 * Setup calculator enter key handling
 */
function setupCalculatorKeys() {
    const priceInput = document.getElementById("price");
    const sizeInput = document.getElementById("size");

    if (priceInput) {
        priceInput.addEventListener("keypress", function(event) {
            if (event.key === "Enter") {
                calculatePricePerTB();
            }
        });
    }

    if (sizeInput) {
        sizeInput.addEventListener("keypress", function(event) {
            if (event.key === "Enter") {
                calculatePricePerTB();
            }
        });
    }
}

// ============================================
// Performance Optimizations
// ============================================

/**
 * Lazy load images
 */
function setupLazyLoading() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        observer.unobserve(img);
                    }
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
}

/**
 * Prefetch navigation targets
 */
function setupPrefetch() {
    document.querySelectorAll('a[href^="/"], a[href^="./"]').forEach(link => {
        link.addEventListener('mouseenter', function() {
            const href = this.getAttribute('href');
            if (href && !document.querySelector(`link[href="${href}"]`)) {
                const prefetch = document.createElement('link');
                prefetch.rel = 'prefetch';
                prefetch.href = href;
                document.head.appendChild(prefetch);
            }
        }, { once: true });
    });
}

// ============================================
// Initialization
// ============================================

/**
 * Initialize all functionality when DOM is ready
 */
document.addEventListener('DOMContentLoaded', function() {
    // Core functionality
    initializeSections();
    setupAccessibility();
    setupNavigation();
    setupKeyboardNavigation();
    
    // Page-specific functionality
    setupCalculatorKeys();
    
    // Performance optimizations
    setupLazyLoading();
    setupPrefetch();
    
    console.log('Streets Services initialized successfully');
});

// ============================================
// Error Handling
// ============================================

/**
 * Global error handler
 */
window.addEventListener('error', function(e) {
    console.error('Error occurred:', e.error);
    // Could add user notification here if needed
});

/**
 * Handle unhandled promise rejections
 */
window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled promise rejection:', e.reason);
});
