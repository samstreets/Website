/**
 * Streets Services — app.js
 * Handles all interactivity across index.html, home-lab.html, contact.html.
 */

(function () {
  'use strict';

  /* ============================================
     Index — Active nav on scroll + smooth scroll
     ============================================ */
  var indexNav = document.querySelectorAll('.nav-links a[href^="#"]');
  if (indexNav.length) {
    var sectionIds = ['about', 'tools', 'resources'];
    var sections = sectionIds.map(function (id) { return document.getElementById(id); }).filter(Boolean);

    window.addEventListener('scroll', function () {
      var current = '';
      sections.forEach(function (s) {
        if (window.scrollY >= s.offsetTop - 90) current = s.id;
      });
      indexNav.forEach(function (a) {
        a.classList.toggle('active', a.getAttribute('href') === '#' + current);
      });
    }, { passive: true });

    indexNav.forEach(function (a) {
      a.addEventListener('click', function (e) {
        var href = a.getAttribute('href');
        if (href && href.startsWith('#')) {
          e.preventDefault();
          var target = document.getElementById(href.slice(1));
          if (target) target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  /* ============================================
     Contact — Form submission
     ============================================ */
  var contactForm = document.getElementById('contact-form');
  if (contactForm) {
    var FORMSPREE_URL = 'https://formspree.io/f/YOUR_FORM_ID';
    var USE_FORMSPREE = FORMSPREE_URL.indexOf('YOUR_FORM_ID') === -1;

    function showStatus(type, msg) {
      var el = document.getElementById('status-msg');
      if (!el) return;
      el.className = 'status-msg ' + type;
      el.textContent = msg;
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      setTimeout(function () {
        el.className = 'status-msg';
        el.textContent = '';
      }, 7000);
    }

    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = document.getElementById('submit-btn');
      if (!contactForm.checkValidity()) {
        showStatus('error', 'Please fill in all required fields.');
        return;
      }

      var data = Object.fromEntries(new FormData(contactForm));
      btn.disabled = true;
      btn.textContent = 'Sending…';

      if (USE_FORMSPREE) {
        fetch(FORMSPREE_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(data)
        })
          .then(function (res) {
            if (res.ok) {
              showStatus('success', 'Message sent — I will get back to you soon.');
              contactForm.reset();
            } else {
              throw new Error('Non-OK response');
            }
          })
          .catch(function () {
            showStatus('error', 'Something went wrong. Please email directly.');
          })
          .finally(function () {
            btn.disabled = false;
            btn.textContent = 'Send Message';
          });
      } else {
        var sub  = encodeURIComponent('Contact: ' + data.subject);
        var body = encodeURIComponent(
          'Name: '  + data.firstName + ' ' + data.lastName +
          '\nEmail: ' + data.email +
          '\nPhone: ' + (data.phone || 'Not provided') +
          '\n\n'    + data.message
        );
        window.location.href = 'mailto:sam@streetsservices.co.uk?subject=' + sub + '&body=' + body;
        setTimeout(function () {
          showStatus('success', 'Email client opened. If not, email sam@streetsservices.co.uk directly.');
          contactForm.reset();
          btn.disabled = false;
          btn.textContent = 'Send Message';
        }, 500);
      }
    });
  }

})();