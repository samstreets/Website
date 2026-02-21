/**
 * Streets Services - Main JavaScript (Consolidated)
 */

// ============================================
// Utility Functions
// ============================================

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => { clearTimeout(timeout); func(...args); };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function getRandomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function animateElement(element, animationClass = 'animate') {
    if (!element) return;
    element.classList.remove(animationClass);
    void element.offsetWidth;
    element.classList.add(animationClass);
}

// ============================================
// Section Toggle Functionality
// ============================================

function toggleSection(sectionId) {
    const content = document.getElementById(sectionId);
    if (!content) return;
    const header = content.previousElementSibling;
    content.classList.toggle('active');
    header.classList.toggle('collapsed');
    const isActive = content.classList.contains('active');
    try { localStorage.setItem(sectionId, isActive); } catch (e) { /* ignore */ }
    header.setAttribute('aria-expanded', isActive);
}

function initializeSections() {
    document.querySelectorAll('.section-content').forEach(section => {
        const sectionId = section.id;
        let savedState = null;
        try { savedState = localStorage.getItem(sectionId); } catch (e) { /* ignore */ }
        if (savedState === null) return;
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

function setupAccessibility() {
    document.querySelectorAll('.section-header').forEach(header => {
        header.setAttribute('tabindex', '0');
        header.setAttribute('role', 'button');
        const isCollapsed = header.classList.contains('collapsed');
        header.setAttribute('aria-expanded', !isCollapsed);
    });
}

// ============================================
// Navigation
// ============================================

function scrollToSection(sectionId) {
    const targetSection = document.getElementById(sectionId);
    if (!targetSection) return;
    const sectionContent = targetSection.querySelector('.section-content');
    if (sectionContent && !sectionContent.classList.contains('active')) {
        toggleSection(sectionContent.id);
    }
    targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function setupNavigation() {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            scrollToSection(targetId);
        });
    });
}

// ============================================
// Keyboard Navigation
// ============================================

function setupKeyboardNavigation() {
    document.addEventListener('keydown', function (e) {
        if (e.target.classList.contains('section-header')) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.target.click();
            }
        }
    });
}

// ============================================
// Food Generator
// ============================================

const DEFAULT_FOOD_DATA = {
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
    mealDeal: ["Sausage & Mash", "Chicken Korma", "Meatballs & Pasta"],
    out: ["McDonald's", "Subway", "KFC", "Nandos", "Green King", "Weatherspoon's"]
};

function getFoodData() {
    try {
        const saved = localStorage.getItem('foodData');
        return saved ? JSON.parse(saved) : DEFAULT_FOOD_DATA;
    } catch (e) {
        return DEFAULT_FOOD_DATA;
    }
}

function saveFoodData(data) {
    try { localStorage.setItem('foodData', JSON.stringify(data)); } catch (e) { /* ignore */ }
}

function generateFood(category, resultElementId) {
    const resultElement = document.getElementById(resultElementId);
    if (!resultElement) return;
    const data = getFoodData();
    if (!data[category] || data[category].length === 0) return;
    const randomFood = getRandomItem(data[category]);
    resultElement.textContent = randomFood;
    animateElement(resultElement);
}

function generateLunch()    { generateFood('lunch',    'lunch-result'); }
function generateDinner()   { generateFood('dinner',   'dinner-result'); }
function generateMealDeal() { generateFood('mealDeal', 'meal-deal-result'); }
function generateOut()      { generateFood('out',       'out-result'); }

// Food editor (used in food.html)
function renderFoodEditor() {
    const data = getFoodData();
    const categories = { lunch: '🥪 Lunch', dinner: '🍽️ Dinner', mealDeal: '💰 Meal Deals', out: '🏪 Go Out' };
    Object.entries(categories).forEach(([key, label]) => {
        const listEl = document.getElementById(`edit-${key}`);
        if (!listEl) return;
        listEl.innerHTML = '';
        data[key].forEach((item, idx) => {
            const li = document.createElement('li');
            li.style.cssText = 'display:flex;align-items:center;gap:0.5rem;margin-bottom:0.5rem;';
            li.innerHTML = `<span style="flex:1;color:var(--text-secondary);">${item}</span>
                <button onclick="removeFoodItem('${key}',${idx})" style="background:#ef4444;color:white;border:none;padding:0.25rem 0.6rem;border-radius:4px;cursor:pointer;font-size:0.8rem;">✕</button>`;
            listEl.appendChild(li);
        });
    });
}

function addFoodItem(category) {
    const input = document.getElementById(`add-${category}`);
    if (!input || !input.value.trim()) return;
    const data = getFoodData();
    data[category].push(input.value.trim());
    saveFoodData(data);
    input.value = '';
    renderFoodEditor();
    renderFoodLists();
}

function removeFoodItem(category, index) {
    const data = getFoodData();
    data[category].splice(index, 1);
    saveFoodData(data);
    renderFoodEditor();
    renderFoodLists();
}

function resetFoodData() {
    if (confirm('Reset all food options to defaults?')) {
        saveFoodData(DEFAULT_FOOD_DATA);
        renderFoodEditor();
        renderFoodLists();
    }
}

function renderFoodLists() {
    const data = getFoodData();
    const map = { lunch: 'options-lunch', dinner: 'options-dinner', mealDeal: 'options-mealDeal', out: 'options-out' };
    Object.entries(map).forEach(([key, elId]) => {
        const el = document.getElementById(elId);
        if (!el) return;
        el.innerHTML = data[key].map(i => `<li>${i}</li>`).join('');
    });
}

// ============================================
// Price Calculator
// ============================================

function calculatePricePerTB() {
    const priceInput = document.getElementById("price");
    const sizeInput  = document.getElementById("size");
    const resultBox  = document.getElementById("result");
    if (!priceInput || !sizeInput || !resultBox) return;
    const price = parseFloat(priceInput.value);
    const size  = parseFloat(sizeInput.value);
    if (!price || !size) { showResult(resultBox, "⚠️ Please enter both values", ""); return; }
    if (price <= 0 || size <= 0) { showResult(resultBox, "⚠️ Values must be greater than 0", ""); return; }
    const pricePerTB = (price / size).toFixed(2);
    const { rating, emoji } = getRatingForPrice(pricePerTB);
    showResult(resultBox, `£${pricePerTB} per TB ${emoji}`, rating);
}

function getRatingForPrice(pricePerTB) {
    if (pricePerTB < 15)  return { rating: "Excellent Value!", emoji: "🌟" };
    if (pricePerTB < 20)  return { rating: "Good Value",       emoji: "✅" };
    if (pricePerTB < 30)  return { rating: "Fair Value",       emoji: "👍" };
    return { rating: "Consider Other Options", emoji: "💭" };
}

function showResult(resultBox, mainText, subText) {
    resultBox.innerHTML = `<div><div class="result-text">${mainText}</div>${subText ? `<div class="result-subtext">${subText}</div>` : ''}</div>`;
    resultBox.classList.add('show');
}

function setupCalculatorKeys() {
    ['price', 'size'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener("keypress", e => { if (e.key === "Enter") calculatePricePerTB(); });
    });
}

// ============================================
// Performance Optimizations
// ============================================

function setupLazyLoading() {
    if (!('IntersectionObserver' in window)) return;
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
    document.querySelectorAll('img[data-src]').forEach(img => imageObserver.observe(img));
}

function setupPrefetch() {
    document.querySelectorAll('a[href^="/"], a[href^="./"]').forEach(link => {
        link.addEventListener('mouseenter', function () {
            const href = this.getAttribute('href');
            if (href && !document.querySelector(`link[href="${href}"]`)) {
                const prefetch = document.createElement('link');
                prefetch.rel  = 'prefetch';
                prefetch.href = href;
                document.head.appendChild(prefetch);
            }
        }, { once: true });
    });
}

// ============================================
// Initialization
// ============================================

document.addEventListener('DOMContentLoaded', function () {
    initializeSections();
    setupAccessibility();
    setupNavigation();
    setupKeyboardNavigation();
    setupCalculatorKeys();
    setupLazyLoading();
    setupPrefetch();
    setupBreadcrumb();

    // Food page init
    if (document.getElementById('edit-lunch')) {
        renderFoodEditor();
        renderFoodLists();
    }
});

// ============================================
// Error Handling
// ============================================

window.addEventListener('error', e => console.error('Error:', e.error));
window.addEventListener('unhandledrejection', e => console.error('Unhandled rejection:', e.reason));