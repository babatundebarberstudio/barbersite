// DOM Elements
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const modal = document.getElementById('booking-modal');
const closeModal = document.querySelector('.close');
const bookingForm = document.getElementById('booking-form');
const bookButtons = document.querySelectorAll('.book-btn, .cta-button, .cta-button-large');
const availableTimesContainer = document.getElementById('available-times');
const dateInput = document.getElementById('date');

// Booking System Variables
let currentStep = 1;
let selectedService = null;
let selectedDate = null;
let selectedTime = null;
let bookingData = {
    service: null,
    additionalServices: [],
    date: null,
    time: null,
    customerInfo: {}
};

// availabilitySchedule will be initialized in DOMContentLoaded

// Service Configuration
const serviceConfig = {
    'mid-taper': { name: 'Mid Taper', price: 20, duration: 30 },
    'mid-fade': { name: 'Mid Fade', price: 20, duration: 30 },
    'low-taper': { name: 'Low Taper', price: 20, duration: 30 },
    'low-fade': { name: 'Low Fade', price: 20, duration: 30 },
    'high-taper': { name: 'High Taper', price: 20, duration: 30 },
    'high-fade': { name: 'High Fade', price: 20, duration: 30 },
    'line-up': { name: 'Line Up', price: 10, duration: 15 },
    'clean-up': { name: 'Clean Up', price: 15, duration: 20 },
    'burst-fade': { name: 'Burst Fade', price: 25, duration: 45 }
};

// Additional Services Configuration
const additionalServicesConfig = {
    'beard-lineup': { name: 'Beard Line Up', price: 0 },
    'eyebrow-lineup': { name: 'Eyebrow Line Up', price: 0 },
    'braid-gel': { name: 'Braid Gel/Oil', price: 0 },
    'goatee-lineup': { name: 'Goatee Line Up', price: 0 },
    'design-option': { name: 'Custom Design', price: 15 }
};

// Photo Gallery System
const photoGalleries = {
    'mid-taper': [
        'Mid Taper/IMG_2915.JPG',
        'Mid Taper/IMG_3600.JPEG', 
        'Mid Taper/IMG_4457.JPG',
        'Mid Taper/IMG_7674.JPG',
        'Mid Taper/IMG_8811.JPG'
    ],
    'mid-fade': [
        'Mid Fade/IMG_7183.JPG',
        'Mid Fade/IMG_0463.JPG',
        'Mid Fade/IMG_0464.JPG',
        'Mid Fade/IMG_1159.JPG',
        'Mid Fade/IMG_6729.JPG',
        'Mid Fade/IMG_6993.JPG',
        'Mid Fade/IMG_6994.JPG'
    ],
    'low-taper': [
        'Low Taper/IMG_5492.JPEG',
        'Low Taper/IMG_4300.JPG',
        'Low Taper/IMG_7675.JPG',
        'Low Taper/IMG_8429.JPG',
        'Low Taper/IMG_8732.JPG',
        'Low Taper/IMG_8733.JPG',
        'Low Taper/IMG_8797.JPEG',
        'Low Taper/IMG_8812.JPG'
    ],
    'low-fade': [
        'Low Fade/IMG_6506.JPG',
        'Low Fade/IMG_6421.JPG'
    ],
    'high-taper': [
        'High Taper/IMG_6782.JPG',
        'High Taper/IMG_6784.JPG',
        'High Taper/IMG_7081.JPG'
    ],
    'high-fade': [
        'High Fade/IMG_6726.JPG',
        'High Fade/IMG_0028.JPG',
        'High Fade/IMG_6725.JPG'
    ],
    'line-up': [
        'Line Up/IMG_3594.JPEG',
        'Line Up/IMG_3918.JPG',
        'Line Up/IMG_4466.JPG',
        'Line Up/IMG_6570.JPG',
        'Line Up/IMG_7078.JPG',
        'Line Up/IMG_9128.JPG'
    ],
    'clean-up': [
        'Cleanup/IMG_1184.PNG'
    ],
    'burst-fade': [
        'Burst Fade/IMG_3604.PNG',
        'Burst Fade/IMG_3582.JPEG'
    ]
};

const photoStates = {}; // Track current photo index for each service

// Initialize EmailJS
(function() {
    emailjs.init("B0bwe2zqFaC5Xrvir"); // Your EmailJS public key
})();

// Initialize the booking system
document.addEventListener('DOMContentLoaded', () => {
    // Load schedule from localStorage (from schedule manager)
    let availabilitySchedule = {};
    const storedSchedule = localStorage.getItem('babatundeBarberSchedule');
    
    if (storedSchedule) {
        availabilitySchedule = JSON.parse(storedSchedule);
        console.log('Schedule loaded from localStorage:', availabilitySchedule);
    } else {
        // Fallback schedule with YOUR EXACT times
        availabilitySchedule = {
            'sunday': ['17:30', '18:00', '18:30', '19:30', '20:00', '20:30', '21:00'],
            'monday': ['17:30', '18:00', '18:30'],
            'tuesday': ['11:30', '14:00', '14:30'],
            'wednesday': ['15:30', '16:00'],
            'thursday': ['10:00', '10:30', '11:00', '11:30', '14:30'],
            'friday': ['17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'],
            'saturday': ['12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00']
        };
        console.log('No schedule found in localStorage, using YOUR EXACT availability schedule');
    }
    
    // Make availabilitySchedule globally accessible
    window.availabilitySchedule = availabilitySchedule;
    
    console.log('Booking system initialized with schedule:', availabilitySchedule);
    
    initializeBookingSystem();
    setupEventListeners();
    
    // Listen for schedule updates from schedule manager
    window.addEventListener('storage', (event) => {
        if (event.key === 'babatundeBarberSchedule') {
            window.availabilitySchedule = JSON.parse(event.newValue);
            console.log('Schedule updated from localStorage:', window.availabilitySchedule);
            // Refresh the availability display if we're on step 3
            if (currentStep === 3) {
                updateAvailabilityDisplay();
            }
        }
    });
});

// Modal Functions
function openBookingModal() {
    const modal = document.getElementById('booking-modal');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        resetBookingSystem();
    }
}

function closeModalFunc() {
    const modal = document.getElementById('booking-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        resetBookingSystem();
    }
}

// Reset Booking System Function
function resetBookingSystem() {
    currentStep = 1;
    selectedService = null;
    selectedDate = null;
    selectedTime = null;
    bookingData = {
        service: null,
        additionalServices: [],
        date: null,
        time: null,
        customerInfo: {}
    };
    
    // Reset all steps
    document.querySelectorAll('.booking-step').forEach(step => {
        step.classList.remove('active');
    });
    const step1 = document.getElementById('step-1');
    if (step1) {
        step1.classList.add('active');
    }
    
    // Reset form
    const bookingForm = document.getElementById('booking-form');
    if (bookingForm) {
        bookingForm.reset();
    }
    
    // Reset checkboxes
    document.querySelectorAll('input[name="additional"]').forEach(checkbox => {
        checkbox.checked = false;
    });
    
    // Reset selections
    document.querySelectorAll('.service-card-modal').forEach(card => {
        card.classList.remove('selected');
    });
    document.querySelectorAll('.time-slot.selected').forEach(slot => {
        slot.classList.remove('selected');
    });
    
    // Reset buttons
    document.querySelectorAll('.btn-next').forEach(btn => {
        btn.disabled = true;
    });
    
    // Hide design upload
    const designUpload = document.getElementById('design-upload');
    if (designUpload) {
        designUpload.style.display = 'none';
    }
}

// Debug function to test booking button (defined early for global access)
window.testBookingButton = function() {
    console.log('Booking button clicked!');
    console.log('Checking if openBookingModal exists:', typeof openBookingModal);
    console.log('Checking if BarberSchedule exists:', typeof window.BarberSchedule);
    
    if (typeof openBookingModal === 'function') {
        console.log('Calling openBookingModal...');
        openBookingModal();
    } else {
        alert('Booking modal function not available. Check console for errors.');
    }
};

function initializeBookingSystem() {
    populateServiceGrid();
    setupDesignUploadToggle();
}

function populateServiceGrid() {
    const servicesGrid = document.querySelector('.services-grid-modal');
    if (!servicesGrid) return;
    
    servicesGrid.innerHTML = '';
    
    Object.entries(serviceConfig).forEach(([key, service]) => {
        const serviceCard = document.createElement('div');
        serviceCard.className = 'service-card-modal';
        serviceCard.dataset.service = key;
        
        serviceCard.innerHTML = `
            <div class="service-image-modal">
                <img src="${getServicePhoto(key)}" alt="${service.name}" class="service-photo-modal">
                <div class="photo-controls">
                    <button class="photo-arrow prev-arrow" onclick="changeModalPhoto(this, -1, '${key}')">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    <button class="photo-arrow next-arrow" onclick="changeModalPhoto(this, 1, '${key}')">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
                <div class="photo-indicator">
                    <span class="photo-counter">1 / ${photoGalleries[key] ? photoGalleries[key].length : 1}</span>
                </div>
            </div>
            <div class="service-content-modal">
                <h3 class="service-title-modal">${service.name}</h3>
                <p class="service-price-modal">$${service.price}.00</p>
            </div>
        `;
        
        serviceCard.addEventListener('click', () => selectService(key, serviceCard));
        servicesGrid.appendChild(serviceCard);
    });
}

function getServicePhoto(serviceKey) {
    const photos = photoGalleries[serviceKey];
    return photos ? photos[0] : 'placeholder.jpg';
}

function selectService(serviceKey, cardElement) {
    // Remove previous selection
    document.querySelectorAll('.service-card-modal').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Add selection to clicked card
    cardElement.classList.add('selected');
    selectedService = serviceKey;
    bookingData.service = serviceKey;
    
    // Enable next button
    document.querySelector('#step-1 .btn-next').disabled = false;
}

function setupDesignUploadToggle() {
    const designCheckbox = document.getElementById('design-option');
    const designUpload = document.getElementById('design-upload');
    
    if (designCheckbox && designUpload) {
        designCheckbox.addEventListener('change', (e) => {
            designUpload.style.display = e.target.checked ? 'block' : 'none';
        });
    }
    
    // Enable next button on step 2 since additional services are optional
    const step2NextBtn = document.querySelector('#step-2 .btn-next');
    if (step2NextBtn) {
        step2NextBtn.disabled = false;
    }
}

// Booking Step Navigation
function nextStep() {
    if (currentStep < 5) {
        // Validate current step before proceeding
        if (currentStep === 2) {
            // Check if custom design is selected but no photo or description provided
            const designCheckbox = document.getElementById('design-option');
            if (designCheckbox && designCheckbox.checked) {
                const designFile = document.getElementById('design-file').files[0];
                const designDescription = document.getElementById('design-description').value.trim();
                
                if (!designFile && !designDescription) {
                    showNotification('For custom designs, please provide either a photo or description (or both) before proceeding', 'error');
                    return; // Don't proceed to next step
                }
            }
        }
        
        document.getElementById(`step-${currentStep}`).classList.remove('active');
        currentStep++;
        document.getElementById(`step-${currentStep}`).classList.add('active');
        
        // Handle step-specific logic
        if (currentStep === 2) {
            // Enable next button on step 2 since additional services are optional
            const step2NextBtn = document.querySelector('#step-2 .btn-next');
            if (step2NextBtn) {
                step2NextBtn.disabled = false;
            }
        } else if (currentStep === 3) {
            updateAvailabilityDisplay();
        } else if (currentStep === 5) {
            // Show confirmation step
            showConfirmation();
        }
    }
}

function prevStep() {
    if (currentStep > 1) {
        document.getElementById(`step-${currentStep}`).classList.remove('active');
        currentStep--;
        document.getElementById(`step-${currentStep}`).classList.add('active');
    }
}

// Make navigation functions globally accessible
window.nextStep = nextStep;
window.prevStep = prevStep;

// Availability System
function isAtLeastTomorrow(date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    return date >= tomorrow;
}

function updateAvailabilityDisplay() {
    const dateInput = document.getElementById('date');
    const availableTimesContainer = document.getElementById('available-times');
    
    console.log('=== AVAILABILITY DEBUG ===');
    console.log('updateAvailabilityDisplay called');
    console.log('Current window.availabilitySchedule:', window.availabilitySchedule);
    console.log('Date input value:', dateInput ? dateInput.value : 'Date input not found');
    
    if (!dateInput.value) {
        availableTimesContainer.innerHTML = '<p class="no-date-selected">Please select a date to see available times</p>';
        return;
    }
    
    // Fix timezone issue: append time to ensure correct date parsing
    const selectedDate = new Date(dateInput.value + 'T12:00:00');
    const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    console.log('Selected date:', dateInput.value, 'Day name:', dayName);

    const normalizedSelectedDate = new Date(selectedDate);
    normalizedSelectedDate.setHours(0, 0, 0, 0);
    if (!isAtLeastTomorrow(normalizedSelectedDate)) {
        availableTimesContainer.innerHTML = '<p class="availability-message">Same-day bookings are not available. Please select a future date.</p>';
        const nextBtn = document.querySelector('#step-3 .btn-next');
        if (nextBtn) {
            nextBtn.disabled = true;
        }
        selectedTime = null;
        bookingData.time = null;
        return;
    }
    
    const availableTimes = window.availabilitySchedule[dayName] || [];
    console.log('Available times for', dayName + ':', availableTimes);
    console.log('Number of available times:', availableTimes.length);
    
    if (availableTimes.length === 0) {
        availableTimesContainer.innerHTML = '<p class="availability-message">No availability on this day</p>';
        return;
    }
    
    // Generate time slots
    availableTimesContainer.innerHTML = '';
    availableTimes.forEach(time => {
        const timeElement = document.createElement('span');
        timeElement.className = 'time-slot';
        timeElement.textContent = formatTime(time);
        timeElement.dataset.time = time;
        timeElement.addEventListener('click', () => selectTimeSlot(timeElement, time));
        availableTimesContainer.appendChild(timeElement);
    });
    
    // Add message
    const message = document.createElement('p');
    message.className = 'availability-message';
    message.textContent = `${availableTimes.length} time slots available for ${formatDate(selectedDate)}`;
    availableTimesContainer.appendChild(message);
    
    console.log('=== END AVAILABILITY DEBUG ===');
}

function selectTimeSlot(element, time) {
    // Remove previous selection
    document.querySelectorAll('.time-slot.selected').forEach(slot => {
        slot.classList.remove('selected');
    });
    
    // Add selection to clicked element
    element.classList.add('selected');
    selectedTime = time;
    bookingData.time = time;
    
    // Fix timezone issue: ensure we use the same date parsing method as updateAvailabilityDisplay
    const dateInputValue = document.getElementById('date').value;
    console.log('=== DATE DEBUG IN selectTimeSlot ===');
    console.log('Raw date input value:', dateInputValue);
    
    const selectedDate = new Date(dateInputValue + 'T12:00:00');
    console.log('Selected date object:', selectedDate);
    console.log('Selected date ISO string:', selectedDate.toISOString());
    console.log('Selected date YYYY-MM-DD:', selectedDate.toISOString().split('T')[0]);
    
    bookingData.date = selectedDate.toISOString().split('T')[0]; // Store as YYYY-MM-DD format
    console.log('Final bookingData.date:', bookingData.date);
    console.log('=== END DATE DEBUG ===');
    
    // Enable next button
    const nextBtn = document.querySelector('#step-3 .btn-next');
    if (nextBtn) {
        nextBtn.disabled = false;
    }
}

function formatTime(timeString) {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
}

function formatDate(date) {
    return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

// Modal Photo Gallery System
function changeModalPhoto(button, direction, serviceKey) {
    const serviceCard = button.closest('.service-card-modal');
    const photoImg = serviceCard.querySelector('.service-photo-modal');
    const photoCounter = serviceCard.querySelector('.photo-counter');
    
    if (!photoStates[serviceKey]) {
        photoStates[serviceKey] = 0;
    }
    
    const photos = photoGalleries[serviceKey];
    if (!photos || photos.length <= 1) return;
    
    // Clear any existing timeout for this service
    if (photoStates[serviceKey + '_timeout']) {
        clearTimeout(photoStates[serviceKey + '_timeout']);
    }
    
    photoStates[serviceKey] += direction;
    
    if (photoStates[serviceKey] < 0) {
        photoStates[serviceKey] = photos.length - 1;
    } else if (photoStates[serviceKey] >= photos.length) {
        photoStates[serviceKey] = 0;
    }
    
    // Update photo
    photoImg.src = photos[photoStates[serviceKey]];
    
    // Update counter
    if (photoCounter) {
        photoCounter.textContent = `${photoStates[serviceKey] + 1} / ${photos.length}`;
    }
    
    // Set timeout to return to cover photo after 5 seconds
    photoStates[serviceKey + '_timeout'] = setTimeout(() => {
        photoStates[serviceKey] = 0;
        photoImg.src = photos[0]; // Return to cover photo
        if (photoCounter) {
            photoCounter.textContent = `1 / ${photos.length}`;
        }
    }, 5000);
}

window.changeModalPhoto = changeModalPhoto;

// Setup Event Listeners
function setupEventListeners() {
    // Date input change
    const dateInput = document.getElementById('date');
    if (dateInput) {
        dateInput.addEventListener('change', updateAvailabilityDisplay);
        // Set minimum date to tomorrow (advance booking requirement)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        dateInput.setAttribute('min', tomorrow.toISOString().split('T')[0]);
        
        console.log('Date input setup complete. Minimum date set to:', tomorrow.toISOString().split('T')[0]);
    }
    
    // Form submission
    const bookingForm = document.getElementById('booking-form');
    if (bookingForm) {
        bookingForm.addEventListener('submit', handleBookingSubmission);
    }
}

// Handle Final Booking Submission
// Save booking to localStorage
function saveBookingToStorage(bookingData, confirmationNumber) {
    // Get service details
    const service = serviceConfig[bookingData.service];
    const additionalServices = bookingData.additionalServices.map(serviceKey => 
        additionalServicesConfig[serviceKey] || { name: serviceKey, price: 0 }
    );
    
    // Calculate total price
    const additionalServicesPrice = additionalServices.reduce((sum, service) => sum + service.price, 0);
    const totalPrice = service.price + additionalServicesPrice;
    
    // Create booking object
    const booking = {
        confirmationNumber: confirmationNumber,
        date: bookingData.date,
        time: bookingData.time,
        service: bookingData.service,
        serviceName: service.name,
        servicePrice: service.price,
        additionalServices: bookingData.additionalServices,
        additionalServicesDetails: additionalServices,
        totalPrice: totalPrice,
        customerInfo: bookingData.customerInfo,
        designFile: bookingData.designFile,
        designDescription: bookingData.designDescription,
        referencePhoto: bookingData.referencePhoto,
        bookingDate: new Date().toISOString()
    };
    
    console.log('=== SAVE BOOKING DEBUG ===');
    console.log('Booking object being saved:', booking);
    console.log('Booking date field:', booking.date);
    console.log('=== END SAVE BOOKING DEBUG ===');
    
    // Load existing bookings
    const existingBookings = JSON.parse(localStorage.getItem('babatundeBarberBookings') || '[]');
    
    // Add new booking
    existingBookings.push(booking);
    
    // Save back to localStorage
    localStorage.setItem('babatundeBarberBookings', JSON.stringify(existingBookings));
    
    console.log('Booking saved to localStorage:', booking);
}

// Remove time slot from schedule
function removeTimeSlotFromSchedule(date, time) {
    // Fix timezone issue: ensure consistent date parsing
    const dayName = new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    
    // Load current schedule
    const storedSchedule = localStorage.getItem('babatundeBarberSchedule');
    if (!storedSchedule) return;
    
    const schedule = JSON.parse(storedSchedule);
    
    // Remove the time slot if it exists
    if (schedule[dayName] && schedule[dayName].includes(time)) {
        schedule[dayName] = schedule[dayName].filter(slot => slot !== time);
        
        // Save updated schedule
        localStorage.setItem('babatundeBarberSchedule', JSON.stringify(schedule));
        
        // Update the global availability schedule
        window.availabilitySchedule = schedule;
        
        // Dispatch event to update any other open admin panels
        window.dispatchEvent(new CustomEvent('scheduleUpdated', {
            detail: { schedule }
        }));
        
        console.log(`Time slot ${time} removed from ${dayName}`, schedule[dayName]);
    }
}

async function handleBookingSubmission(e) {
    e.preventDefault();
    console.log('Form submission triggered!');
    
    // Collect additional services
    const additionalServices = [];
    document.querySelectorAll('input[name="additional"]:checked').forEach(checkbox => {
        additionalServices.push(checkbox.value);
    });
    
    // Collect customer information
    const customerInfo = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        referencePhoto: document.getElementById('reference-photo').files[0],
        notes: document.getElementById('notes').value
    };
    
    console.log('Collected customer info:', customerInfo);
    console.log('Current booking data:', bookingData);
    
    // Complete booking data
    bookingData.additionalServices = additionalServices;
    bookingData.customerInfo = customerInfo;
    
    // Validate required fields
    if (!bookingData.service || !bookingData.time || !bookingData.date) {
        console.log('Missing booking data:', { service: bookingData.service, time: bookingData.time, date: bookingData.date });
        showNotification('Please complete all required steps', 'error');
        return;
    }

    const bookingDateForValidation = new Date(bookingData.date + 'T00:00:00');
    bookingDateForValidation.setHours(0, 0, 0, 0);
    if (!isAtLeastTomorrow(bookingDateForValidation)) {
        showNotification('Same-day bookings are not allowed. Please select a future date.', 'error');
        return;
    }
    
    if (!customerInfo.name || !customerInfo.email || !customerInfo.phone) {
        console.log('Missing customer info:', customerInfo);
        showNotification('Please fill in all required information', 'error');
        return;
    }
    
    // Validate custom design requirements
    if (bookingData.additionalServices.includes('design-option')) {
        const designFile = document.getElementById('design-file').files[0];
        const designDescription = document.getElementById('design-description').value.trim();
        
        if (!designFile && !designDescription) {
            showNotification('For custom designs, please provide either a photo or description (or both)', 'error');
            return;
        }
        
        // Store design information
        bookingData.designFile = designFile;
        bookingData.designDescription = designDescription;
    }
    
    // Show loading state
    const submitButton = document.querySelector('#step-4 .submit-btn');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Processing...';
    submitButton.disabled = true;
    
    try {
        // Generate confirmation number
        const confirmationNumber = 'BB' + Date.now().toString().slice(-6);
        console.log('Generated confirmation number:', confirmationNumber);
        
        // Debug booking data before saving
        console.log('=== BOOKING SUBMISSION DEBUG ===');
        console.log('Complete bookingData:', bookingData);
        console.log('bookingData.date:', bookingData.date);
        console.log('bookingData.time:', bookingData.time);
        console.log('=== END BOOKING SUBMISSION DEBUG ===');
        
        // Save booking to localStorage
        saveBookingToStorage(bookingData, confirmationNumber);
        
        // Remove time slot from availability
        removeTimeSlotFromSchedule(bookingData.date, bookingData.time);
        
        // Send emails
        console.log('Sending emails...');
        await sendBookingEmails(bookingData, confirmationNumber);
        console.log('Emails sent successfully');
        
        // Move to confirmation step
        nextStep();
        
        // Show success notification
        showNotification('Booking confirmed! Check your email for location & directions.', 'success');
        
    } catch (error) {
        console.error('Error processing booking:', error);
        showNotification('Error processing booking. Please try again.', 'error');
    } finally {
        // Reset button
        submitButton.textContent = originalText;
        submitButton.disabled = false;
    }
}

// Show Confirmation Step
function showConfirmation() {
    // Generate confirmation number
    const confirmationNumber = 'BB' + Date.now().toString().slice(-6);
    
    // Get service details
    const service = serviceConfig[bookingData.service];
    const additionalServices = bookingData.additionalServices.map(serviceKey => 
        additionalServicesConfig[serviceKey] || { name: serviceKey, price: 0 }
    );
    
    // Calculate total price
    let totalPrice = service.price;
    additionalServices.forEach(addService => {
        totalPrice += addService.price;
    });
    
    // Format additional services text
    const additionalServicesText = additionalServices.length > 0 
        ? additionalServices.map(addService => `${addService.name}${addService.price > 0 ? ` ($${addService.price})` : ' (Free)'}`).join(', ')
        : 'None';
    
    // Populate the existing HTML elements
    document.getElementById('confirmation-number').textContent = confirmationNumber;
    // Fix timezone issue: use same parsing method as other functions
    document.getElementById('summary-date').textContent = formatDate(new Date(bookingData.date + 'T12:00:00'));
    document.getElementById('summary-time').textContent = formatTime(bookingData.time);
    document.getElementById('summary-service').textContent = `${service.name} - $${service.price}.00`;
    document.getElementById('summary-additional').textContent = additionalServicesText;
    document.getElementById('summary-total').textContent = `$${totalPrice}.00`;
    document.getElementById('summary-name').textContent = bookingData.customerInfo.name;
    document.getElementById('summary-email').textContent = bookingData.customerInfo.email;
    document.getElementById('summary-phone').textContent = bookingData.customerInfo.phone;
    
    // Add special notes if they exist
    const notesElement = document.getElementById('summary-notes');
    if (notesElement) {
        notesElement.textContent = bookingData.customerInfo.notes || 'None';
    } else if (bookingData.customerInfo.notes) {
        // Add notes section if it doesn't exist
        const customerSection = document.querySelector('#step-5 .summary-section:last-of-type');
        if (customerSection) {
            const notesItem = document.createElement('div');
            notesItem.className = 'summary-item';
            notesItem.innerHTML = `
                <span class="summary-label">Special Notes:</span>
                <span id="summary-notes">${bookingData.customerInfo.notes}</span>
            `;
            customerSection.appendChild(notesItem);
        }
    }
    
    // Add design information if custom design was selected
    if (bookingData.additionalServices.includes('design-option')) {
        const customerSection = document.querySelector('#step-5 .summary-section:last-of-type');
        if (customerSection) {
            let designInfo = '';
            if (bookingData.designFile) {
                designInfo += `📎 Photo uploaded: ${bookingData.designFile.name}`;
            }
            if (bookingData.designDescription) {
                if (designInfo) designInfo += '<br>';
                designInfo += `📝 Description: ${bookingData.designDescription}`;
            }
            
            const designItem = document.createElement('div');
            designItem.className = 'summary-item';
            designItem.innerHTML = `
                <span class="summary-label">Custom Design Details:</span>
                <span id="summary-design">${designInfo}</span>
            `;
            customerSection.appendChild(designItem);
        }
    }
    
    console.log('Confirmation screen populated with:', {
        confirmationNumber,
        service: service.name,
        additionalServices: additionalServicesText,
        totalPrice,
        customer: bookingData.customerInfo
    });
}

function generateConfirmationNumber() {
    return 'BB' + Math.random().toString(36).substr(2, 8).toUpperCase();
}

function sendBookingNotifications(bookingDetails, confirmationNumber, totalPrice) {
    // Email notification to you
    const barberEmail = {
        to: 'babatundesbarberstudio@gmail.com',
        subject: `New Booking - ${bookingDetails.customerInfo.name}`,
        body: generateEmailContent(bookingDetails, confirmationNumber, totalPrice, 'barber')
    };
    
    // Email confirmation to customer
    const customerEmail = {
        to: bookingDetails.customerInfo.email,
        subject: `Booking Confirmation - ${confirmationNumber}`,
        body: generateEmailContent(bookingDetails, confirmationNumber, totalPrice, 'customer')
    };
    
    console.log('Email notification:', barberEmail);
    console.log('Email confirmation:', customerEmail);
    
    // Send emails using EmailJS
    sendEmailJS(barberEmail);
    sendEmailJS(customerEmail);
}

function generateEmailContent(bookingDetails, confirmationNumber, totalPrice, recipient) {
    const service = serviceConfig[bookingDetails.service];
    
    // Format additional services
    let additionalServicesText = 'None';
    if (bookingDetails.additionalServices.length > 0) {
        const additionalNames = bookingDetails.additionalServices.map(service => {
            const config = additionalServicesConfig[service];
            return `• ${config.name} ${config.price === 0 ? '(FREE)' : `($${config.price}.00)`}`;
        });
        additionalServicesText = additionalNames.join('\n');
    }
    
    if (recipient === 'barber') {
        return `
NEW BOOKING ALERT! 📅✂️

Customer Information:
Name: ${bookingDetails.customerInfo.name}
Email: ${bookingDetails.customerInfo.email}
Phone: ${bookingDetails.customerInfo.phone}

Appointment Details:
Date: ${formatDate(new Date(bookingDetails.date + 'T12:00:00'))}
Time: ${formatTime(bookingDetails.time)}
Main Service: ${service.name}

Additional Services:
${additionalServicesText}

Total: $${totalPrice}.00
Confirmation Number: ${confirmationNumber}

${bookingDetails.customerInfo.notes ? `Special Requests: ${bookingDetails.customerInfo.notes}\n` : ''}

Location: 812 Gaffield Pl

---
This booking was made through your online booking system.
        `;
    } else {
        return `
BABATUNDE'S BARBER STUDIO ✂️
Booking Confirmation

Confirmation Number: ${confirmationNumber}
Booking Date: ${new Date().toLocaleDateString()}

Customer Information:
Name: ${bookingDetails.customerInfo.name}
Phone: ${bookingDetails.customerInfo.phone}
Email: ${bookingDetails.customerInfo.email}

APPOINTMENT DETAILS:
📅 Date: ${formatDate(new Date(bookingDetails.date + 'T12:00:00'))}
🕐 Time: ${formatTime(bookingDetails.time)}
✂️ Service: ${service.name}

Additional Services:
${additionalServicesText}

💰 Total: $${totalPrice}.00

IMPORTANT INFORMATION:
📍 Location: 812 Gaffield Pl
💧 Please keep your hair dry before the appointment
📞 Contact: 720-499-5415 (if anything comes up)

${bookingDetails.customerInfo.notes ? `Special Requests: ${bookingDetails.customerInfo.notes}\n` : ''}

Thank you for choosing Babatunde's Barber Studio!
We look forward to seeing you soon! 🎉

Best regards,
Babatunde's Barber Studio
        `;
    }
}

// Function to compress and convert file to base64
function compressAndConvertToBase64(file, maxWidth = 800, quality = 0.7) {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = () => {
            // Calculate new dimensions
            let { width, height } = img;
            if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
            }
            
            canvas.width = width;
            canvas.height = height;
            
            // Draw and compress
            ctx.drawImage(img, 0, 0, width, height);
            const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
            
            // Check if compressed size is reasonable (under 40KB to leave room for other variables)
            const sizeInBytes = (compressedDataUrl.length * 3) / 4;
            if (sizeInBytes > 40000) {
                // Try with lower quality
                const lowerQualityDataUrl = canvas.toDataURL('image/jpeg', 0.5);
                resolve(lowerQualityDataUrl);
    } else {
                resolve(compressedDataUrl);
            }
        };
        
        img.onerror = () => reject(new Error('Failed to load image'));
        
        const reader = new FileReader();
        reader.onload = (e) => {
            img.src = e.target.result;
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
    });
}

// Function to convert file to base64 (fallback for non-images)
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// Function to send booking emails using EmailJS
async function sendBookingEmails(bookingData, confirmationNumber) {
    const service = serviceConfig[bookingData.service];
    const additionalServices = bookingData.additionalServices.map(serviceKey => 
        additionalServicesConfig[serviceKey] || { name: serviceKey, price: 0 }
    );
    
    // Calculate total price
    let totalPrice = service.price;
    additionalServices.forEach(addService => {
        totalPrice += addService.price;
    });
    
    // Format additional services text
    let additionalServicesText = additionalServices.length > 0 
        ? additionalServices.map(addService => `- ${addService.name}${addService.price > 0 ? ` ($${addService.price})` : ' (Free)'}`).join('\n')
        : 'None';
    
    // Handle design photos and descriptions
    let designPhotoBase64 = '';
    let designPhotoName = '';
    let designDescription = '';
    let designPhotoSize = 0;
    
    if (bookingData.additionalServices.includes('design-option')) {
        let designInfo = '\n\nCustom Design Details:';
        
        if (bookingData.designFile) {
            try {
                // Try compressed version first
                designPhotoBase64 = await compressAndConvertToBase64(bookingData.designFile);
                designPhotoName = bookingData.designFile.name;
                designPhotoSize = (designPhotoBase64.length * 3) / 4; // Approximate size in bytes
                designInfo += `\n- Photo uploaded: ${bookingData.designFile.name} (${Math.round(designPhotoSize / 1024)}KB)`;
            } catch (error) {
                console.error('Error converting design photo to base64:', error);
                designInfo += `\n- Photo uploaded: ${bookingData.designFile.name} (conversion failed)`;
            }
        }
        
        if (bookingData.designDescription) {
            designDescription = bookingData.designDescription;
            designInfo += `\n- Description: ${bookingData.designDescription}`;
        }
        
        additionalServicesText += designInfo;
    }
    
    // Handle reference photo
    let referencePhotoBase64 = '';
    let referencePhotoName = '';
    let referencePhotoSize = 0;
    
    if (bookingData.customerInfo.referencePhoto) {
        try {
            // Try compressed version first
            referencePhotoBase64 = await compressAndConvertToBase64(bookingData.customerInfo.referencePhoto);
            referencePhotoName = bookingData.customerInfo.referencePhoto.name;
            referencePhotoSize = (referencePhotoBase64.length * 3) / 4; // Approximate size in bytes
        } catch (error) {
            console.error('Error converting reference photo to base64:', error);
        }
    }
    
    // Check total size and decide whether to include photos
    const totalPhotoSize = designPhotoSize + referencePhotoSize;
    const includePhotos = totalPhotoSize < 40000; // Leave room for other variables
    
    console.log('Photo sizes:', {
        designPhoto: Math.round(designPhotoSize / 1024) + 'KB',
        referencePhoto: Math.round(referencePhotoSize / 1024) + 'KB',
        total: Math.round(totalPhotoSize / 1024) + 'KB',
        includePhotos: includePhotos
    });
    
    // Prepare template parameters for customer email
    const customerTemplateParams = {
        // Try all common recipient parameter names
        to_email: bookingData.customerInfo.email,
        email: bookingData.customerInfo.email,
        to: bookingData.customerInfo.email,
        user_email: bookingData.customerInfo.email,
        recipient_email: bookingData.customerInfo.email,
        reply_to: bookingData.customerInfo.email,
        recipient: bookingData.customerInfo.email,
        // Other parameters
        to_name: bookingData.customerInfo.name,
        customer_name: bookingData.customerInfo.name,
        confirmation_number: confirmationNumber,
        appointment_date: formatDate(new Date(bookingData.date + 'T12:00:00')),
        appointment_time: formatTime(bookingData.time),
        service_name: service.name,
        service_price: service.price,
        additional_services: additionalServicesText,
        total_price: totalPrice,
        customer_phone: bookingData.customerInfo.phone,
        special_notes: bookingData.customerInfo.notes || 'None',
        location: '812 Gaffield Pl',
        contact_phone: '720-499-5415',
        // Photo data (only include if under size limit)
        design_photo: includePhotos ? designPhotoBase64 : '',
        design_photo_name: designPhotoName,
        design_description: designDescription,
        reference_photo: includePhotos ? referencePhotoBase64 : '',
        reference_photo_name: referencePhotoName,
        photos_included: includePhotos ? 'Yes' : 'No (too large for email)',
        photo_note: includePhotos ? '' : 'Photos were uploaded but are too large to include in email. Check booking system for details.'
    };
    
    // Prepare template parameters for barber email
    const barberTemplateParams = {
        // Try all common recipient parameter names
        to_email: 'babatundesbarberstudio@gmail.com',
        email: 'babatundesbarberstudio@gmail.com',
        to: 'babatundesbarberstudio@gmail.com',
        user_email: 'babatundesbarberstudio@gmail.com',
        recipient_email: 'babatundesbarberstudio@gmail.com',
        reply_to: 'babatundesbarberstudio@gmail.com',
        recipient: 'babatundesbarberstudio@gmail.com',
        // Other parameters
        to_name: 'Babatunde',
        customer_name: bookingData.customerInfo.name,
        confirmation_number: confirmationNumber,
        appointment_date: formatDate(new Date(bookingData.date + 'T12:00:00')),
        appointment_time: formatTime(bookingData.time),
        service_name: service.name,
        service_price: service.price,
        additional_services: additionalServicesText,
        total_price: totalPrice,
        customer_phone: bookingData.customerInfo.phone,
        customer_email: bookingData.customerInfo.email,
        special_notes: bookingData.customerInfo.notes || 'None',
        location: '812 Gaffield Pl',
        contact_phone: '720-499-5415',
        // Photo data (only include if under size limit)
        design_photo: includePhotos ? designPhotoBase64 : '',
        design_photo_name: designPhotoName,
        design_description: designDescription,
        reference_photo: includePhotos ? referencePhotoBase64 : '',
        reference_photo_name: referencePhotoName,
        photos_included: includePhotos ? 'Yes' : 'No (too large for email)',
        photo_note: includePhotos ? '' : 'Photos were uploaded but are too large to include in email. Check booking system for details.'
    };
    
    try {
        // Send email to customer
        console.log('Sending confirmation email to customer:', bookingData.customerInfo.email);
        console.log('Customer template params:', customerTemplateParams);
        const customerResult = await emailjs.send(
            'service_32atpco', // Your EmailJS service ID
            'template_pysusaq', // Your EmailJS template ID for customer
            customerTemplateParams
        );
        
        // Send email to barber
        console.log('Sending booking notification to barber');
        console.log('Barber template params:', barberTemplateParams);
        const barberResult = await emailjs.send(
            'service_32atpco', // Your EmailJS service ID
            'template_pysusaq', // Your EmailJS template ID for barber (you can use same template)
            barberTemplateParams
        );
        
        console.log('Both emails sent successfully');
        return { customerResult, barberResult };
        
    } catch (error) {
        console.error('Error sending emails:', error);
        console.error('Error details:', error.text);
        throw error;
    }
}

// Function to send emails using EmailJS (legacy function)
async function sendEmailJS(emailData) {
    try {
        console.log('Attempting to send email to:', emailData.to);
        
        const templateParams = {
            email: emailData.to,
            subject: emailData.subject,
            message: emailData.body
        };

        const result = await emailjs.send(
            'service_32atpco', // Your EmailJS service ID
            'template_pysusaq', // Your EmailJS template ID
            templateParams
        );
        
        console.log('Email sent successfully:', result);
        return result;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
}

// Print Confirmation
function printConfirmation() {
    window.print();
}

window.printConfirmation = printConfirmation;

// Notification System
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 3000;
        max-width: 400px;
        animation: slideInRight 0.3s ease;
    `;
    
    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        .notification-content {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 15px;
        }
        .notification-close {
            background: none;
            border: none;
            color: white;
            font-size: 1.5rem;
            cursor: pointer;
            padding: 0;
            line-height: 1;
        }
        .notification-close:hover {
            opacity: 0.8;
        }
    `;
    document.head.appendChild(style);
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.remove();
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Mobile Navigation Toggle
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Event Listeners for Modal
closeModal.addEventListener('click', closeModalFunc);

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModalFunc();
    }
});

// Book Button Click Handlers
bookButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        e.preventDefault();
        openBookingModal();
    });
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 70; // Account for fixed navbar
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Navbar scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    }
});

// Keyboard navigation for modal
document.addEventListener('keydown', (e) => {
    if (modal.style.display === 'block') {
        if (e.key === 'Escape') {
            closeModalFunc();
        }
    }
});

// Form field focus effects
document.querySelectorAll('.form-group input, .form-group select, .form-group textarea').forEach(field => {
    field.addEventListener('focus', function() {
        this.parentElement.classList.add('focused');
    });
    
    field.addEventListener('blur', function() {
        if (!this.value) {
            this.parentElement.classList.remove('focused');
        }
    });
});

// Add loading animation for page load
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

// Add CSS for loading state
const loadingStyles = document.createElement('style');
loadingStyles.textContent = `
    body:not(.loaded) {
        overflow: hidden;
    }
    
    body:not(.loaded)::before {
        content: '';
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: var(--white);
        z-index: 9999;
        animation: fadeOut 0.5s ease 1s forwards;
    }
    
    @keyframes fadeOut {
        to {
            opacity: 0;
            visibility: hidden;
        }
    }
`;
document.head.appendChild(loadingStyles);

// Function to refresh schedule from localStorage
function refreshSchedule() {
    const storedSchedule = localStorage.getItem('babatundeBarberSchedule');
    if (storedSchedule) {
        window.availabilitySchedule = JSON.parse(storedSchedule);
        console.log('Schedule refreshed from localStorage:', window.availabilitySchedule);
        
        // Refresh availability display if we're on step 3
        if (currentStep === 3) {
            updateAvailabilityDisplay();
        }
        
        return true;
    } else {
        console.log('No schedule found in localStorage');
        return false;
    }
}

// Make functions globally accessible after everything is loaded
window.openBookingModal = openBookingModal;
window.closeBookingModal = closeModalFunc;
window.refreshSchedule = refreshSchedule;