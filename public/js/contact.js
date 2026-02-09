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
    }
    
    // Form submission
    const bookingForm = document.getElementById('bookingForm');
    const responseMessage = document.getElementById('responseMessage');
    
    bookingForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(this);
        const data = Object.fromEntries(formData);
        
        // Disable submit button and show loading
        const submitBtn = this.querySelector('.submit-btn');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Hold on...';
        submitBtn.disabled = true;
        
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
            
            // Reset form on success
            if (result.success) {
                bookingForm.reset();
                // Reset participants button
                participantButtons.forEach(btn => btn.classList.remove('active'));
                if (participantButtons.length > 0) {
                    participantButtons[0].classList.add('active');
                }
                participantsInput.value = '1';
            }
            
        } catch (error) {
            responseMessage.textContent = 'Network error. Please try again or you can contact us directly.';
            responseMessage.className = 'response-message error';
        } finally {
            // Re-enable submit button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            
            // Scroll to response message
            responseMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            
            // Hide message after 10 seconds
            setTimeout(() => {
                responseMessage.style.opacity = '0';
                setTimeout(() => {
                    responseMessage.style.display = 'none';
                    responseMessage.style.opacity = '1';
                }, 500);
            }, 10000);
        }
    });
    
    // Highlight current month in hikes
    const currentMonthElement = document.querySelector('.current-month');
    if (currentMonthElement) {
        currentMonthElement.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
    }
    
    // Form validation
    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.addEventListener('blur', function() {
            const email = this.value.trim();
            if (email && !isValidEmail(email)) {
                this.style.borderColor = '#e74c3c';
                showFieldError(this, 'Please enter a valid email address');
            } else {
                this.style.borderColor = '';
                clearFieldError(this);
            }
        });
    }
    
    // Helper functions
    function isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
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
});