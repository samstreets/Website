// Toggle section expansion
function toggleSection(sectionId) {
    const content = document.getElementById(sectionId);
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
}

// Initialize sections from localStorage
document.addEventListener('DOMContentLoaded', function() {
    // Get all section contents
    const sections = document.querySelectorAll('.section-content');
    
    sections.forEach(section => {
        const sectionId = section.id;
        const savedState = localStorage.getItem(sectionId);
        
        // If there's no saved state, keep default (about section open by default)
        if (savedState === null) {
            return;
        }
        
        // Apply saved state
        if (savedState === 'true') {
            section.classList.add('active');
            section.previousElementSibling.classList.remove('collapsed');
        } else {
            section.classList.remove('active');
            section.previousElementSibling.classList.add('collapsed');
        }
    });
    
    // Smooth scroll for navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                // Expand the section if it's collapsed
                const sectionContent = targetSection.querySelector('.section-content');
                if (sectionContent && !sectionContent.classList.contains('active')) {
                    const contentId = sectionContent.id;
                    toggleSection(contentId);
                }
                
                // Scroll to section
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

// Add keyboard accessibility
document.addEventListener('keydown', function(e) {
    if (e.target.classList.contains('section-header')) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            e.target.click();
        }
    }
});

// Make section headers focusable for accessibility
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.section-header').forEach(header => {
        header.setAttribute('tabindex', '0');
        header.setAttribute('role', 'button');
        header.setAttribute('aria-expanded', 'false');
        
        // Update aria-expanded when toggled
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.attributeName === 'class') {
                    const isCollapsed = header.classList.contains('collapsed');
                    header.setAttribute('aria-expanded', !isCollapsed);
                }
            });
        });
        
        observer.observe(header, { attributes: true });
    });
});

// Utility function for animations
function animateElement(element, animationClass = 'animate') {
    if (!element) return;
    element.classList.remove(animationClass);
    void element.offsetWidth; // Trigger reflow
    element.classList.add(animationClass);
}
