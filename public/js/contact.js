const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
const nav = document.querySelector('.nav-organic');

navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navLinks.classList.toggle('active');
});

// Close menu when clicking on a link
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navLinks.classList.remove('active');
    });
});

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    if (!nav.contains(e.target)) {
        navToggle.classList.remove('active');
        navLinks.classList.remove('active');
    }
});

// Add shadow on scroll
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }
});


document.addEventListener('DOMContentLoaded', function() {
    // Participants selector
    const participantButtons = document.querySelectorAll('.participant-btn');
    const participantsInput = document.getElementById('participants');
    
    participantButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            participantButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Update hidden input value
            participantsInput.value = this.getAttribute('data-value');
        });
    });
    
    // Set first button as active by default
    if (participantButtons.length > 0) {
        participantButtons[0].classList.add('active');
        participantsInput.value = participantButtons[0].getAttribute('data-value');
    }
    
    // Form submission
    const bookingForm = document.getElementById('bookingForm');
    const responseMessage = document.getElementById('responseMessage');
    
    // Email validation function
    function isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    // Form validation function
    function validateForm(data) {
        const errors = [];
        
        if (!data.name || data.name.trim().length < 2) {
            errors.push('Please enter your full name');
        }
        
        if (!data.email || !isValidEmail(data.email)) {
            errors.push('Please enter a valid email address');
        }
        
        if (!data.hikeMonth) {
            errors.push('Please select a hike month');
        }
        
        if (!data.accommodation) {
            errors.push('Please select accommodation preference');
        }
        
        return errors;
    }
    
    bookingForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Get form data - FIXED VERSION
        const data = {
            name: document.getElementById('name').value.trim(),
            email: document.getElementById('email').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            hikeMonth: document.getElementById('hikeMonth').value,
            participants: document.getElementById('participants').value,
            dietary: document.querySelector('input[name="dietary"]:checked')?.value || '',
            accommodation: document.getElementById('accommodation').value,
            message: document.getElementById('message').value.trim()
        };
        
        // Validate form
        const errors = validateForm(data);
        if (errors.length > 0) {
            responseMessage.textContent = errors.join('\n');
            responseMessage.className = 'response-message error';
            responseMessage.style.display = 'block';
            responseMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            return;
        }
        
        // Disable submit button and show loading
        const submitBtn = this.querySelector('.submit-btn');
        const originalText = submitBtn.innerHTML;
        const originalBg = submitBtn.style.backgroundColor;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> submitting...';
        submitBtn.disabled = true;
        
        // Clear previous messages
        responseMessage.textContent = '';
        responseMessage.className = 'response-message';
        
        try {
            // Send data to server
            const response = await fetch('/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            // Show response message
            responseMessage.textContent = result.message;
            responseMessage.className = 'response-message ' + (result.success ? 'success' : 'error');
            responseMessage.style.display = 'block';
            
            // Reset form on success
            if (result.success) {
                // Success animation
                submitBtn.innerHTML = '<i class="fas fa-check"></i> Submitted!';
                submitBtn.style.backgroundColor = '#2d5a27';
                
                setTimeout(() => {
                    submitBtn.innerHTML = originalText;
                    submitBtn.style.backgroundColor = originalBg;
                }, 2000);
                
                // Reset form
                bookingForm.reset();
                
                // Reset participants button
                participantButtons.forEach(btn => btn.classList.remove('active'));
                if (participantButtons.length > 0) {
                    participantButtons[0].classList.add('active');
                    participantsInput.value = participantButtons[0].getAttribute('data-value');
                }
                
                // Clear dietary selection
                const defaultDietary = document.querySelector('input[name="dietary"][value="No Restrictions"]');
                if (defaultDietary) {
                    defaultDietary.checked = true;
                }
            }
            
        } catch (error) {
            console.error('Submission error:', error);
            responseMessage.textContent = 'Network error. Please try again or contact us directly.';
            responseMessage.className = 'response-message error';
            responseMessage.style.display = 'block';
        } finally {
            // Re-enable submit button after delay if not success
            if (!responseMessage.className.includes('success')) {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                submitBtn.style.backgroundColor = originalBg;
            }
            
            // Scroll to response message
            responseMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            
            // Auto-hide message after 15 seconds
            setTimeout(() => {
                if (responseMessage.style.display !== 'none') {
                    responseMessage.style.opacity = '0';
                    setTimeout(() => {
                        responseMessage.style.display = 'none';
                        responseMessage.style.opacity = '1';
                    }, 500);
                }
            }, 15000);
        }
    });
    
    // Highlight current month in hikes
    const currentMonthElement = document.querySelector('.current-month');
    if (currentMonthElement) {
        setTimeout(() => {
            currentMonthElement.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center', 
                inline: 'nearest' 
            });
        }, 1000);
    }
    
    // Real-time email validation
    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.addEventListener('blur', function() {
            const email = this.value.trim();
            if (email && !isValidEmail(email)) {
                this.style.borderColor = '#e74c3c';
                showFieldError(this, 'Please enter a valid email address');
            } else {
                this.style.borderColor = '#4a7c59';
                clearFieldError(this);
            }
        });
        
        emailInput.addEventListener('input', function() {
            if (this.style.borderColor === 'rgb(231, 76, 60)') { // #e74c3c
                const email = this.value.trim();
                if (isValidEmail(email)) {
                    this.style.borderColor = '#4a7c59';
                    clearFieldError(this);
                }
            }
        });
    }
    
    // Helper functions
    function showFieldError(field, message) {
        clearFieldError(field);
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.style.color = '#e74c3c';
        errorDiv.style.fontSize = '0.85rem';
        errorDiv.style.marginTop = '5px';
        errorDiv.textContent = message;
        
        field.parentNode.appendChild(errorDiv);
    }
    
    function clearFieldError(field) {
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
    }
    
    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
});