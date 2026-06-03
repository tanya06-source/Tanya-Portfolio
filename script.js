document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // 1. Preloader Hide
    // ==========================================
    const preloader = document.getElementById('preloader');
    window.addEventListener('load', () => {
        setTimeout(() => {
            preloader.style.opacity = '0';
            preloader.style.visibility = 'hidden';
            
            // Trigger skill bars animation on load if they are already visible
            triggerSkillProgress();
        }, 800);
    });

    // Fallback: If window load event doesn't fire, hide preloader after 3 seconds
    setTimeout(() => {
        if (preloader.style.visibility !== 'hidden') {
            preloader.style.opacity = '0';
            preloader.style.visibility = 'hidden';
        }
    }, 3000);

    // ==========================================
    // 2. Custom Cursor
    // ==========================================
    const cursorDot = document.querySelector('.custom-cursor-dot');
    const cursorOutline = document.querySelector('.custom-cursor-outline');
    let mouseX = 0, mouseY = 0;
    let outlineX = 0, outlineY = 0;
    const speed = 0.15; // Delay speed for outline cursor

    if (cursorDot && cursorOutline && window.innerWidth > 768) {
        document.addEventListener('mousemove', (e) => {
            // Show cursor components on first move
            cursorDot.style.opacity = '1';
            cursorOutline.style.opacity = '1';
            
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            cursorDot.style.left = `${mouseX}px`;
            cursorDot.style.top = `${mouseY}px`;
        });

        // Frame update for smooth lagging outline cursor
        const updateOutline = () => {
            outlineX += (mouseX - outlineX) * speed;
            outlineY += (mouseY - outlineY) * speed;
            
            cursorOutline.style.left = `${outlineX}px`;
            cursorOutline.style.top = `${outlineY}px`;
            
            requestAnimationFrame(updateOutline);
        };
        requestAnimationFrame(updateOutline);

        // Add hover effects on interactive elements
        const hoverTargets = 'a, button, input, textarea, select, .btn, .social-circle, .glass-card, .contact-item, .mobile-toggle';
        document.addEventListener('mouseover', (e) => {
            if (e.target.closest(hoverTargets)) {
                document.body.classList.add('custom-cursor-hover');
            }
        });
        
        document.addEventListener('mouseout', (e) => {
            if (e.target.closest(hoverTargets)) {
                document.body.classList.remove('custom-cursor-hover');
            }
        });

        // Hide cursor when leaving window
        document.addEventListener('mouseleave', () => {
            cursorDot.style.opacity = '0';
            cursorOutline.style.opacity = '0';
        });
    }

    // ==========================================
    // 3. Theme Toggle & Persistence
    // ==========================================
    const themeToggleBtn = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;
    
    // Check saved theme or default to system theme
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    let currentTheme = 'dark'; // Default
    if (savedTheme) {
        currentTheme = savedTheme;
    } else if (!systemPrefersDark) {
        currentTheme = 'light';
    }
    
    htmlElement.setAttribute('data-theme', currentTheme);

    themeToggleBtn.addEventListener('click', () => {
        const activeTheme = htmlElement.getAttribute('data-theme');
        let newTheme = 'dark';
        if (activeTheme === 'dark') {
            newTheme = 'light';
        }
        
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        currentTheme = newTheme;
        
        // Update particle canvas properties if canvas is running
        if (typeof updateParticleTheme === 'function') {
            updateParticleTheme(newTheme);
        }
    });

    // ==========================================
    // 4. Mobile Menu Navigation
    // ==========================================
    const mobileToggle = document.getElementById('mobile-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    mobileToggle.addEventListener('click', () => {
        mobileToggle.classList.toggle('open');
        navMenu.classList.toggle('open');
    });

    // Close menu when link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileToggle.classList.remove('open');
            navMenu.classList.remove('open');
        });
    });

    // Close menu when clicking outside of menu
    document.addEventListener('click', (e) => {
        if (!navMenu.contains(e.target) && !mobileToggle.contains(e.target) && navMenu.classList.contains('open')) {
            mobileToggle.classList.remove('open');
            navMenu.classList.remove('open');
        }
    });

    // ==========================================
    // 5. Canvas Particles Background
    // ==========================================
    const canvas = document.getElementById('bg-canvas');
    let ctx = null;
    let particlesArray = [];
    let particleColor = 'rgba(124, 58, 237, 0.18)'; // Purple default
    let lineColor = 'rgba(6, 182, 212, 0.08)'; // Cyan default
    
    const updateThemeColors = (theme) => {
        if (theme === 'light') {
            particleColor = 'rgba(99, 102, 241, 0.2)'; // Indigo
            lineColor = 'rgba(14, 165, 233, 0.1)'; // Sky blue
        } else {
            particleColor = 'rgba(124, 58, 237, 0.18)'; // Violet
            lineColor = 'rgba(6, 182, 212, 0.08)'; // Cyan
        }
    };
    
    updateThemeColors(currentTheme);
    window.updateParticleTheme = updateThemeColors;

    if (canvas) {
        ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initParticles();
        });

        class Particle {
            constructor(x, y) {
                this.x = x;
                this.y = y;
                this.size = Math.random() * 2 + 1;
                // Speeds
                this.speedX = Math.random() * 0.6 - 0.3;
                this.speedY = Math.random() * 0.6 - 0.3;
            }
            update() {
                this.x += this.speedX;
                this.y += this.speedY;

                // Screen boundaries bounce/wrap
                if (this.x > canvas.width) this.x = 0;
                else if (this.x < 0) this.x = canvas.width;
                if (this.y > canvas.height) this.y = 0;
                else if (this.y < 0) this.y = canvas.height;
            }
            draw() {
                ctx.fillStyle = particleColor;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        function initParticles() {
            particlesArray = [];
            // Determine density
            let numberOfParticles = (canvas.width * canvas.height) / 11000;
            if (window.innerWidth < 768) numberOfParticles = numberOfParticles / 2; // Fewer particles on mobile
            
            for (let i = 0; i < numberOfParticles; i++) {
                let x = Math.random() * canvas.width;
                let y = Math.random() * canvas.height;
                particlesArray.push(new Particle(x, y));
            }
        }

        function connectParticles() {
            let maxDistance = 110;
            for (let a = 0; a < particlesArray.length; a++) {
                for (let b = a; b < particlesArray.length; b++) {
                    let dx = particlesArray[a].x - particlesArray[b].x;
                    let dy = particlesArray[a].y - particlesArray[b].y;
                    let distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < maxDistance) {
                        let opacity = (1 - (distance / maxDistance)) * 0.6;
                        ctx.strokeStyle = lineColor.replace('0.', `${(opacity * 0.15).toFixed(2)}`);
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                        ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                        ctx.stroke();
                    }
                }
            }
        }

        function animateParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < particlesArray.length; i++) {
                particlesArray[i].update();
                particlesArray[i].draw();
            }
            connectParticles();
            requestAnimationFrame(animateParticles);
        }

        initParticles();
        animateParticles();
    }

    // ==========================================
    // 6. Typwriter Typing Effect
    // ==========================================
    const typingSpan = document.querySelector('.typing-container');
    if (typingSpan) {
        const words = ["AI Enthusiast", "Web Developer", "Tech Explorer", "Future Builder"];
        let wordIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        let typeSpeed = 100;

        function typeEffect() {
            const currentWord = words[wordIndex];
            
            if (isDeleting) {
                typingSpan.textContent = currentWord.substring(0, charIndex - 1);
                charIndex--;
                typeSpeed = 40; // Faster deleting speed
            } else {
                typingSpan.textContent = currentWord.substring(0, charIndex + 1);
                charIndex++;
                typeSpeed = 100; // Normal typing speed
            }

            if (!isDeleting && charIndex === currentWord.length) {
                typeSpeed = 2000; // Pause at the end of word
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                wordIndex = (wordIndex + 1) % words.length;
                typeSpeed = 400; // Pause before typing next word
            }

            setTimeout(typeEffect, typeSpeed);
        }
        
        // Start after preloader fades out
        setTimeout(typeEffect, 1200);
    }

    // ==========================================
    // 7. Scroll Reveal & Skill Progress Trigger
    // ==========================================
    const revealElements = document.querySelectorAll('.reveal');
    
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                
                // If it's the skills section, animate progress bars
                if (entry.target.id === 'skills' || entry.target.querySelector('.skill-progress')) {
                    triggerSkillProgress();
                }
                
                // If it's the stats section, animate counts
                if (entry.target.classList.contains('stats-grid') || entry.target.querySelector('.stat-number')) {
                    triggerStatsCounter(entry.target);
                }
                
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(element => {
        revealObserver.observe(element);
    });

    function triggerSkillProgress() {
        const skillProgresses = document.querySelectorAll('.skill-progress');
        skillProgresses.forEach(progress => {
            const val = progress.getAttribute('data-value');
            progress.style.width = `${val}%`;
        });
    }

    // ==========================================
    // 8. Stats Counter Animation
    // ==========================================
    let statsAnimated = false;
    
    function triggerStatsCounter(container) {
        if (statsAnimated) return;
        statsAnimated = true;
        
        const statNumbers = container.querySelectorAll('.stat-number');
        statNumbers.forEach(stat => {
            const targetStr = stat.getAttribute('data-count');
            const hasPlus = targetStr.includes('+');
            const hasPercent = targetStr.includes('%');
            const targetVal = parseInt(targetStr, 10);
            
            let currentVal = 0;
            const duration = 2000; // Total duration in ms
            const stepTime = Math.max(Math.floor(duration / targetVal), 15);
            
            // Special casing for large numbers (like 2028)
            const increment = targetVal > 1000 ? Math.ceil(targetVal / 100) : 1;
            
            const timer = setInterval(() => {
                currentVal += increment;
                if (currentVal >= targetVal) {
                    currentVal = targetVal;
                    clearInterval(timer);
                }
                
                let output = currentVal;
                if (hasPlus) output += '+';
                if (hasPercent) output += '%';
                
                stat.textContent = output;
            }, stepTime);
        });
    }

    // ==========================================
    // 9. Active Nav Scroll Highlighter
    // ==========================================
    const sections = document.querySelectorAll('section');
    
    window.addEventListener('scroll', () => {
        let scrollY = window.pageYOffset;
        
        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 120; // Offset for header height
            const sectionId = section.getAttribute('id');
            
            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                document.querySelector(`.nav-menu a[href*=${sectionId}]`)?.classList.add('active');
            } else {
                document.querySelector(`.nav-menu a[href*=${sectionId}]`)?.classList.remove('active');
            }
        });
    });

    // ==========================================
    // 10. Contact Form Validation & Feedback
    // ==========================================
    const contactForm = document.getElementById('contact-form');
    const formAlert = document.getElementById('form-alert');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const subject = document.getElementById('subject').value.trim();
            const message = document.getElementById('message').value.trim();
            
            if (!name || !email || !subject || !message) {
                showAlert('Please fill in all fields before sending.', 'error');
                return;
            }
            
            if (!validateEmail(email)) {
                showAlert('Please enter a valid email address.', 'error');
                return;
            }

            // Send message via EmailJS
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span>Sending Message...</span>';
            
            const templateParams = {
                from_name: name,
                from_email: email,
                subject: subject,
                message: message
            };

            emailjs.send('service_908zehc', 'template_9r78quf', templateParams)
                .then(() => {
                    showAlert('Thank you, your message has been sent successfully!', 'success');
                    contactForm.reset();
                })
                .catch((err) => {
                    console.error('EmailJS Error:', err);
                    showAlert('Oops! Something went wrong. Please try emailing directly.', 'error');
                })
                .finally(() => {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnText;
                });
        });
    }

    function validateEmail(email) {
        const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return re.test(String(email).toLowerCase());
    }

    function showAlert(msg, type) {
        if (!formAlert) return;
        
        formAlert.textContent = msg;
        formAlert.className = `form-alert ${type}`;
        formAlert.style.display = 'block';
        
        // Auto scroll to alert
        formAlert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
        // Hide after 5 seconds
        setTimeout(() => {
            formAlert.style.display = 'none';
        }, 5000);
    }
});
