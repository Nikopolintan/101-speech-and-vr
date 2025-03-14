document.addEventListener('DOMContentLoaded', function() {
    // Screen Navigation
    const homeButton = document.getElementById('home-btn');
    const trackingButton = document.getElementById('tracking-btn');
    const vetButton = document.getElementById('vet-btn');
    
    const homeScreen = document.getElementById('home-screen');
    const trackingScreen = document.getElementById('tracking-screen');
    const vetScreen = document.getElementById('vet-screen');
    
    homeButton.addEventListener('click', function() {
        setActiveScreen(homeScreen, homeButton);
    });
    
    trackingButton.addEventListener('click', function() {
        setActiveScreen(trackingScreen, trackingButton);
        initMap();
    });
    
    vetButton.addEventListener('click', function() {
        setActiveScreen(vetScreen, vetButton);
    });
    
    function setActiveScreen(screen, button) {
        // Remove active class from all screens and buttons
        document.querySelectorAll('.app-screen').forEach(s => {
            s.classList.remove('active');
        });
        
        document.querySelectorAll('.screen-selector button').forEach(b => {
            b.classList.remove('active');
        });
        
        // Add active class to selected screen and button
        screen.classList.add('active');
        button.classList.add('active');
    }

    // Initialize Map
    let map = null;
    let petMarker = null;
    let driverMarker = null;
    let homeMarker = null;
    let vetMarker = null;
    let routePath = null;

    function initMap() {
        if (map !== null) return; // Map already initialized
        
        // Create map
        map = L.map('pet-map').setView([40.7128, -74.0060], 13);
        
        // Add tile layer (OpenStreetMap)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        
        // Custom icons
        const petIcon = L.divIcon({
            html: '<i class="fas fa-paw" style="font-size: 20px; color: #f39c12;"></i>',
            className: 'pet-icon-marker',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        });
        
        const driverIcon = L.divIcon({
            html: '<i class="fas fa-car" style="font-size: 20px; color: #3498db;"></i>',
            className: 'driver-icon-marker',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        });
        
        const homeIcon = L.divIcon({
            html: '<i class="fas fa-home" style="font-size: 20px; color: #e74c3c;"></i>',
            className: 'home-icon-marker',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        });
        
        const vetIcon = L.divIcon({
            html: '<i class="fas fa-hospital" style="font-size: 20px; color: #2ecc71;"></i>',
            className: 'vet-icon-marker',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        });

        // Define locations
        const homeLocation = [40.7128, -74.0060];
        const vetLocation = [40.7328, -73.9860];
        const currentLocation = [40.7228, -73.9960];
        
        // Add markers
        homeMarker = L.marker(homeLocation, {icon: homeIcon}).addTo(map);
        homeMarker.bindPopup('Home: 123 Home St');
        
        vetMarker = L.marker(vetLocation, {icon: vetIcon}).addTo(map);
        vetMarker.bindPopup('PetCare Clinic');
        
        // Pet and driver are at same location (in transit)
        petMarker = L.marker(currentLocation, {icon: petIcon}).addTo(map);
        petMarker.bindPopup('Buddy');
        
        driverMarker = L.marker(currentLocation, {icon: driverIcon}).addTo(map);
        driverMarker.bindPopup('John D. (Driver)');
        
        // Create a route path
        const routePoints = [
            homeLocation,
            currentLocation,
            vetLocation,
            homeLocation
        ];
        
        routePath = L.polyline(routePoints, {
            color: '#3498db',
            dashArray: '5, 10',
            weight: 3
        }).addTo(map);
        
        // Fit map to show all markers
        map.fitBounds(routePath.getBounds(), {
            padding: [30, 30]
        });
        
        // Simulate movement
        simulateMovement();
    }
    
    function simulateMovement() {
        let step = 0;
        const maxSteps = 100;
        
        const startLat = 40.7128;
        const startLng = -74.0060;
        const vetLat = 40.7328;
        const vetLng = -73.9860;
        
        // Calculate increments
        const latIncrement = (vetLat - startLat) / (maxSteps / 2);
        const lngIncrement = (vetLng - startLng) / (maxSteps / 2);
        
        const interval = setInterval(() => {
            step++;
            
            if (step <= maxSteps / 2) {
                // Moving towards vet
                const newLat = startLat + (latIncrement * step);
                const newLng = startLng + (lngIncrement * step);
                
                petMarker.setLatLng([newLat, newLng]);
                driverMarker.setLatLng([newLat, newLng]);
            } else if (step <= maxSteps) {
                // Moving back to home
                const progressBack = step - (maxSteps / 2);
                const newLat = vetLat - (latIncrement * progressBack);
                const newLng = vetLng - (lngIncrement * progressBack);
                
                petMarker.setLatLng([newLat, newLng]);
                driverMarker.setLatLng([newLat, newLng]);
            } else {
                clearInterval(interval);
            }
        }, 200);
    }

    // Form interactions for Vet Consultation
    const bookVetBtn = document.querySelector('.book-vet-btn');
    if (bookVetBtn) {
        bookVetBtn.addEventListener('click', function() {
            alert('Vet consultation booked successfully!\n\nPet: Buddy\nType: Mid-Journey Check\nDate: 12/10/2023\nTime: 11:45 AM');
        });
    }

    // Export functionality
    document.getElementById('export-app').addEventListener('click', function() {
        const element = document.querySelector('.app-screens');
        exportAsImage(element, 'PetTravel_AppScreens_v1.png');
    });

    document.getElementById('export-storyboard').addEventListener('click', function() {
        const element = document.querySelector('.storyboard');
        exportAsImage(element, 'PetTravel_Storyboard_v1.png');
    });

    document.getElementById('export-sms').addEventListener('click', function() {
        const element = document.querySelector('.sms-container');
        exportAsImage(element, 'PetTravel_SMSFlow_v1.png');
    });

    function exportAsImage(element, filename) {
        html2canvas(element, {
            scale: 2, // Higher resolution
            logging: false,
            useCORS: true,
            allowTaint: true
        }).then(canvas => {
            // Create a link and trigger download
            const link = document.createElement('a');
            link.download = filename;
            link.href = canvas.toDataURL('image/png');
            link.click();
        });
    }

    // Initialize the GPS tracking map on page load if tracking screen is visible
    if (trackingScreen.classList.contains('active')) {
        initMap();
    }
});
