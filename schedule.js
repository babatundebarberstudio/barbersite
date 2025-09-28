// Shared Schedule System for Babatunde's Barber Studio
// This file manages the availability schedule that both admin and booking systems use

// Default availability schedule
let availabilitySchedule = {
    'sunday': ['19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00'],
    'monday': ['17:30', '18:00', '18:30', '19:00', '19:30'],
    'tuesday': ['11:00', '11:30'],
    'wednesday': ['15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00'],
    'thursday': ['10:00', '10:30', '11:00', '11:30', '12:00', '18:30', '19:00', '19:30'],
    'friday': [],
    'saturday': ['13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00']
};

// Load schedule from localStorage if available
function loadSchedule() {
    const savedSchedule = localStorage.getItem('barberSchedule');
    if (savedSchedule) {
        try {
            availabilitySchedule = JSON.parse(savedSchedule);
        } catch (error) {
            console.error('Error loading saved schedule:', error);
        }
    }
}

// Save schedule to localStorage
function saveScheduleToStorage() {
    localStorage.setItem('barberSchedule', JSON.stringify(availabilitySchedule));
}

// Update the schedule (called from admin panel)
function updateSchedule(newSchedule) {
    availabilitySchedule = newSchedule;
    saveScheduleToStorage();
    
    // Dispatch a custom event to notify the booking system of changes
    window.dispatchEvent(new CustomEvent('scheduleUpdated', { 
        detail: { schedule: availabilitySchedule } 
    }));
}

// Get the current schedule (called from booking system)
function getCurrentSchedule() {
    return availabilitySchedule;
}

// Initialize the schedule system
function initializeSchedule() {
    loadSchedule();
}

// Auto-initialize when the script loads
initializeSchedule();

// Export functions for use in other scripts
window.BarberSchedule = {
    getCurrentSchedule,
    updateSchedule,
    loadSchedule,
    saveScheduleToStorage
};

