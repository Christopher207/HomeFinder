// Global variables
let map;
let markers = [];
let propertyHistory = [];
let currentProperty = null;
let notifications = [];
let users = [];

// DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application based on the current page
    const currentPage = window.location.pathname.split('/').pop();
    
    if(currentPage === 'opportunity-map.html' || currentPage === '') {
        initializeMap();
        setupEventListeners();
        loadProperties(); // Load properties after map is initialized and event listeners are set up
    } else if(currentPage === 'appraise.html') {
        loadAppraisePage();
        setupEventListeners();
    } else if(currentPage === 'notifications.html') {
        loadNotifications();
        setupEventListeners();
    } else {
        setupEventListeners();
    }
});

// Initialize the map
function initializeMap() {
    // Create the map centered on Lima, Peru
    map = L.map('map').setView([-12.0464, -77.0428], 20);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
}

// Add mock overlays for traffic, shopping, and security
function addMockOverlays() {
    // Remove existing layers if they exist
    if (window.trafficLayer) {
        map.removeLayer(window.trafficLayer);
    }
    if (window.shoppingLayer) {
        map.removeLayer(window.shoppingLayer);
    }
    if (window.securityLayer) {
        map.removeLayer(window.securityLayer);
    }
    
    // Traffic overlay (simulated with red semi-transparent circles near property locations)
    const trafficLayer = L.layerGroup();
    
    // Create traffic visualization based on property coordinates
    if (window.properties && window.properties.length > 0) {
        window.properties.forEach(property => {
            // Create a traffic circle around each property
            const trafficCircle = L.circle(property.coords, {
                color: "#ff0000",
                fillColor: "#ff0000",
                fillOpacity: 0.1,
                radius: 300, // 300 meters radius
                weight: 1
            }).bindPopup("High Traffic Area<br>Near: " + property.titulo);
            trafficCircle.addTo(trafficLayer);
        });
    }
    
    // Shopping overlay (simulated with store icons)
    const shoppingLayer = L.layerGroup();
    const storeIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });
    
    const store1 = L.marker([-12.06, -77.04], {icon: storeIcon}).bindPopup("Shopping Center 1");
    const store2 = L.marker([-12.08, -77.02], {icon: storeIcon}).bindPopup("Shopping Center 2");
    store1.addTo(shoppingLayer);
    store2.addTo(shoppingLayer);
    
    // Security overlay (simulated with shield icons)
    const securityLayer = L.layerGroup();
    const shieldIcon = L.divIcon({
        className: 'shield-icon',
        html: '<div style="font-size: 24px;">🛡️</div>',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
    });
    
    const security1 = L.marker([-12.07, -77.03], {icon: shieldIcon}).bindPopup("Security Camera Zone");
    const security2 = L.marker([-12.09, -77.05], {icon: shieldIcon}).bindPopup("Security Patrol Zone");
    security1.addTo(securityLayer);
    security2.addTo(securityLayer);
    
    // Store layers for toggling
    window.trafficLayer = trafficLayer;
    window.shoppingLayer = shoppingLayer;
    window.securityLayer = securityLayer;
    
    // Add event listeners for the toggle buttons
    document.getElementById('trafficToggle').addEventListener('click', function() {
        if (map.hasLayer(trafficLayer)) {
            map.removeLayer(trafficLayer);
            this.classList.remove('active');
        } else {
            map.addLayer(trafficLayer);
            this.classList.add('active');
        }
    });
    
    document.getElementById('shoppingToggle').addEventListener('click', function() {
        if (map.hasLayer(shoppingLayer)) {
            map.removeLayer(shoppingLayer);
            this.classList.remove('active');
        } else {
            map.addLayer(shoppingLayer);
            this.classList.add('active');
        }
    });
    
    document.getElementById('securityToggle').addEventListener('click', function() {
        if (map.hasLayer(securityLayer)) {
            map.removeLayer(securityLayer);
            this.classList.remove('active');
        } else {
            map.addLayer(securityLayer);
            this.classList.add('active');
        }
    });
}

// Load properties from JSON file
async function loadProperties() {
    try {
        const response = await fetch('properties.json');
        const properties = await response.json();
        
        // Store properties in a global variable for filtering
        window.properties = properties;
        
        // Clear existing markers
        markers.forEach(marker => map.removeLayer(marker));
        markers = [];
        
        // Add markers for each property
        properties.forEach(property => {
            const marker = L.marker(property.coords)
                .addTo(map)
                .bindPopup(`<b>${property.titulo}</b><br>${property.precio}`);
                
            // Add click event to show property in history
            marker.on('click', function() {
                addToHistory(property);
            });
            
            markers.push(marker);
        });
        
        // Reinitialize the overlays based on the new property data
        addMockOverlays();
    } catch (error) {
        console.error('Error loading properties:', error);
    }
}

// Add property to history
function addToHistory(property) {
    // Check if property is already in history
    const existingIndex = propertyHistory.findIndex(item => item.id === property.id);
    if (existingIndex === -1) {
        // If not in history, add it
        propertyHistory.push(property);
    } else {
        // If already in history, move it to the end to maintain order
        propertyHistory = propertyHistory.filter(item => item.id !== property.id);
        propertyHistory.push(property);
    }
    
    updateHistoryDisplay();
}

// Remove property from history
function removeFromHistory(propertyId) {
    propertyHistory = propertyHistory.filter(property => property.id !== propertyId);
    updateHistoryDisplay();
}

// Update history display
function updateHistoryDisplay() {
    const historyList = document.getElementById('historyList');
    historyList.innerHTML = '';
    
    propertyHistory.forEach(property => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.innerHTML = `
            <img src="${property.imagen}" alt="${property.titulo}">
            <h3>${property.titulo}</h3>
            <p><strong>Contrato:</strong> ${property.contrato}</p>
            <p><strong>Ubicación:</strong> ${property.ubicacion}</p>
            <div class="history-actions">
                <button class="view-details-btn" onclick="showPropertyDetails('${property.id}')">Ver Detalles</button>
                <button class="create-alert-btn" onclick="openAlertModal('${property.id}')">Crear Alerta</button>
                <button class="delete-history-btn" onclick="removeFromHistory('${property.id}')">X</button>
            </div>
        `;
        historyList.appendChild(historyItem);
    });
}

// Show property details in detail view
function showPropertyDetails(propertyId) {
    const property = window.properties.find(p => p.id === propertyId);
    if (!property) return;
    
    currentProperty = property;
    
    // Create detail view content
    const detailView = document.createElement('div');
    detailView.className = 'detail-view';
    detailView.id = 'detailView';
    detailView.innerHTML = `
        <button class="back-to-history" onclick="hideDetailView()">Back to History</button>
        <div class="detail-content">
            <div class="detail-left">
                <img src="${property.imagen}" alt="${property.titulo}">
                <h2>${property.titulo}</h2>
                <p><strong>Tipo:</strong> ${property.tipo}</p>
                <p><strong>Contrato:</strong> ${property.contrato}</p>
                <p><strong>Precio:</strong> ${property.precio}</p>
                <p><strong>Ubicación:</strong> ${property.ubicacion}</p>
                <p>${property.descripcion}</p>
            </div>
            <div class="detail-right">
                <div class="detail-actions">
                    <button id="durationBtn" class="detail-action-btn">Duración</button>
                    <button id="conditionsBtn" class="detail-action-btn">Condiciones</button>
                    <button id="fairPriceBtn" class="detail-action-btn">Conoce el Precio Justo</button>
                </div>
                <div class="dynamic-content" id="dynamicContent">
                    Selecciona una opción para ver detalles
                </div>
                <div class="whatsapp-section">
                    <h3>¿Alguna otra consulta?</h3>
                    <p>Puedes contactar directamente al propietario para más detalles.</p>
                    <a href="https://wa.me/51917806967" target="_blank" class="whatsapp-btn">Contactar por WhatsApp</a>
                </div>
            </div>
        </div>
    `;
    
    // Replace the history section with the detail view
    const historySection = document.querySelector('.history-section');
    historySection.style.width = '40%';
    historySection.style.minWidth = '300px';
    historySection.innerHTML = '';
    historySection.appendChild(detailView);
    
    // Add event listeners for the detail buttons
    document.getElementById('durationBtn').addEventListener('click', function() {
        document.querySelectorAll('.detail-action-btn').forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        document.getElementById('dynamicContent').innerHTML = `
            <p>Tiempo de contrato: 1 año</p>
            <p>¿Es negociable?: Sí</p>
        `;
    });
    
    document.getElementById('conditionsBtn').addEventListener('click', function() {
        document.querySelectorAll('.detail-action-btn').forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        document.getElementById('dynamicContent').innerHTML = `
            <p>Pago inicial: 1 mes de garantía por 1 de adelanto</p>
            <p>Horas de silencio: días de semana y domingos desde las 10pm</p>
            <p>¿Se permiten mascotas?: Sí, hasta 2 perros.</p>
        `;
    });
    
    document.getElementById('fairPriceBtn').addEventListener('click', function() {
        document.querySelectorAll('.detail-action-btn').forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        // Navigate to appraise page with property data
        localStorage.setItem('selectedProperty', JSON.stringify(property));
        window.location.href = 'appraise.html';
    });
}

// Hide detail view and return to history
function hideDetailView() {
    const historySection = document.querySelector('.history-section');
    historySection.style.width = '300px';
    historySection.style.minWidth = '300px';
    
    // Revert to history list
    historySection.innerHTML = `
        <h2>Inmuebles consultados</h2>
        <div id="historyList" class="history-list">
            <!-- Property cards will be added here -->
        </div>
    `;
    
    updateHistoryDisplay();
    
    // Re-initialize the map to refresh it after returning from detail view
    reinitializeMap();
}

// Re-initialize the map to refresh it
function reinitializeMap() {
    // Clear existing markers
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
    
    // Reload properties to refresh the map
    if (window.properties) {
        window.properties.forEach(property => {
            const marker = L.marker(property.coords)
                .addTo(map)
                .bindPopup(`<b>${property.titulo}</b><br>${property.precio}`);
                
            // Add click event to show property in history
            marker.on('click', function() {
                addToHistory(property);
            });
            
            markers.push(marker);
        });
        
        // Re-add overlays after reinitializing the markers
        addMockOverlays();
    }
}

// Open alert modal
function openAlertModal(propertyId) {
    document.getElementById('alertModal').style.display = 'block';
    
    // Store the property ID for when the form is submitted
    document.getElementById('alertForm').dataset.propertyId = propertyId;
    
    // Get property name for the example
    const property = window.properties.find(p => p.id === propertyId);
    if (property) {
        document.querySelector('#alertModal h2').textContent = `Create Alert for: ${property.titulo}`;
    }
}

// Setup general event listeners
function setupEventListeners() {
    // Login button
    const loginBtn = document.getElementById('loginBtn');
    if(loginBtn) {
        loginBtn.addEventListener('click', function() {
            document.getElementById('loginModal').style.display = 'block';
        });
    }
    
    // Close modals
    const closeBtns = document.getElementsByClassName('close');
    for (let i = 0; i < closeBtns.length; i++) {
        closeBtns[i].addEventListener('click', function() {
            document.getElementById('loginModal').style.display = 'none';
        });
    }
    
    const closeAlertBtn = document.querySelector('.close-alert');
    if(closeAlertBtn) {
        closeAlertBtn.addEventListener('click', function() {
            document.getElementById('alertModal').style.display = 'none';
        });
    }
    
    const closeDetailBtn = document.querySelector('.close-detail');
    if(closeDetailBtn) {
        closeDetailBtn.addEventListener('click', function() {
            document.getElementById('detailModal').style.display = 'none';
        });
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        const loginModal = document.getElementById('loginModal');
        const alertModal = document.getElementById('alertModal');
        const detailModal = document.getElementById('detailModal');
        
        if (event.target === loginModal) {
            loginModal.style.display = 'none';
        }
        if (event.target === alertModal) {
            alertModal.style.display = 'none';
        }
        if (event.target === detailModal) {
            detailModal.style.display = 'none';
        }
    });
    
    // Switch between login and register forms
    const showRegisterLink = document.getElementById('showRegister');
    if(showRegisterLink) {
        showRegisterLink.addEventListener('click', function(e) {
            e.preventDefault();
            document.getElementById('loginFields').style.display = 'none';
            document.getElementById('registerFields').style.display = 'block';
            document.getElementById('modalTitle').textContent = 'Register';
        });
    }
    
    const showLoginLink = document.getElementById('showLogin');
    if(showLoginLink) {
        showLoginLink.addEventListener('click', function(e) {
            e.preventDefault();
            document.getElementById('registerFields').style.display = 'none';
            document.getElementById('loginFields').style.display = 'block';
            document.getElementById('modalTitle').textContent = 'Login';
        });
    }
    
    // Register form submission
    const registerSubmit = document.getElementById('registerSubmit');
    if(registerSubmit) {
        registerSubmit.addEventListener('click', function() {
            const email = document.getElementById('regEmail').value;
            const password = document.getElementById('regPassword').value;
            const terms = document.getElementById('terms').checked;
            const privacy = document.getElementById('privacy').checked;
            
            if(!terms || !privacy) {
                alert('You must agree to the terms and privacy policy');
                return;
            }
            
            // Create new user (in a real app, this would go to a server)
            const newUser = {
                email: email,
                password: password, // Note: This is insecure for demo purposes
                propertyHistory: [],
                notifications: []
            };
            
            // In a real implementation, we would save this to users.json
            alert('Registration successful! You can now login.');
            
            // Switch back to login form
            document.getElementById('registerFields').style.display = 'none';
            document.getElementById('loginFields').style.display = 'block';
            document.getElementById('modalTitle').textContent = 'Login';
            document.getElementById('email').value = email;
        });
    }
    
    // Login form submission
    const loginForm = document.getElementById('loginForm');
    if(loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            // In a real app, we would validate against a server
            // For this demo, we'll just close the modal
            document.getElementById('loginModal').style.display = 'none';
            alert(`Login successful for ${email}!`);
        });
    }
    
    // Alert form submission
    const alertForm = document.getElementById('alertForm');
    if(alertForm) {
        alertForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const alertName = document.getElementById('alertName').value;
            const frequency = document.getElementById('alertFrequency').value;
            const propertyId = this.dataset.propertyId;
            
            // Find property name
            const property = window.properties.find(p => p.id === propertyId);
            const propertyName = property ? property.titulo : 'Unknown Property';
            
            // Create alert object
            const alert = {
                id: 'alert_' + Date.now(),
                name: alertName,
                propertyId: propertyId,
                frequency: frequency,
                propertyName: propertyName
            };
            
            // Add to notifications array
            notifications.push(alert);
            
            // In a real implementation, we would save this to notifications.json
            alert('Alert created successfully!');
            
            // Close modal and reset form
            document.getElementById('alertModal').style.display = 'none';
            alertForm.reset();
        });
    }
    
    // Property type filter
    const typeFilter = document.getElementById('typeFilter');
    if(typeFilter) {
        typeFilter.addEventListener('change', function() {
            filterProperties();
        });
    }
    
    // Contract type filter
    const contractFilter = document.getElementById('contractFilter');
    if(contractFilter) {
        contractFilter.addEventListener('change', function() {
            filterProperties();
        });
    }
    
    // Search input - now triggers geocoding search
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    
    if(searchInput && searchBtn) {
        // Search when button is clicked
        searchBtn.addEventListener('click', function() {
            performLocationSearch();
        });
        
        // Also allow search when pressing Enter
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performLocationSearch();
            }
        });
    }
}

// Perform location search using geocoding
async function performLocationSearch() {
    const searchInput = document.getElementById('searchInput').value;
    if (!searchInput.trim()) return;
    
    // First check if the search matches any property location
    const matchingProperty = window.properties && 
        window.properties.find(property => 
            property.ubicacion.toLowerCase().includes(searchInput.toLowerCase()) || 
            property.titulo.toLowerCase().includes(searchInput.toLowerCase()));
    
    if (matchingProperty) {
        // If the search matches a property location, focus on that property
        // Fly to the property location
        map.flyTo(matchingProperty.coords, 15);
        
        // Add a temporary marker at the property location
        const searchMarker = L.marker(matchingProperty.coords)
            .addTo(map)
            .bindPopup(`<b>Ubicación buscada:</b><br>${matchingProperty.ubicacion}`)
            .openPopup();
            
        // Clear the temporary marker after 5 seconds
        setTimeout(() => {
            map.removeLayer(searchMarker);
        }, 5000);
    } else {
        // If not matching a property, attempt to geocode using a CORS proxy
        try {
            // Using a CORS proxy to access Nominatim API (in production, use your own proxy)
            const encodedQuery = encodeURIComponent(searchInput);
            const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://nominatim.openstreetmap.org/search?format=json&q=${encodedQuery}`)}`;
            
            const response = await fetch(proxyUrl);
            const data = await response.json();
            
            if (data && data.length > 0) {
                // Get the first result's coordinates
                const lat = parseFloat(data[0].lat);
                const lon = parseFloat(data[0].lon);
                
                // Fly to the searched location on the map
                map.flyTo([lat, lon], 15);
                
                // Add a temporary marker at the searched location
                const searchMarker = L.marker([lat, lon])
                    .addTo(map)
                    .bindPopup(`<b>Ubicación buscada:</b><br>${data[0].display_name}`)
                    .openPopup();
                    
                // Clear the temporary marker after 5 seconds
                setTimeout(() => {
                    map.removeLayer(searchMarker);
                }, 5000);
                
                console.log(`Searched for: ${searchInput}, found: ${data[0].display_name}`);
            } else {
                alert('No se encontró la ubicación buscada');
            }
        } catch (error) {
            console.error('Error searching for location:', error);
            alert('Error al buscar la ubicación. Puede que la ubicación no exista o haya problemas de conexión.');
        }
    }
}

// Filter properties based on selections only (without using search input for property filtering)
function filterProperties() {
    const typeFilter = document.getElementById('typeFilter').value;
    const contractFilter = document.getElementById('contractFilter').value;
    
    // Remove all markers from map
    markers.forEach(marker => map.removeLayer(marker));
    
    // Add only filtered markers
    window.properties.forEach(property => {
        const matchesType = !typeFilter || property.tipo === typeFilter;
        const matchesContract = !contractFilter || property.contrato === contractFilter;
        
        if (matchesType && matchesContract) {
            const marker = L.marker(property.coords)
                .addTo(map)
                .bindPopup(`<b>${property.titulo}</b><br>${property.precio}`);
                
            // Add click event to show property in history
            marker.on('click', function() {
                addToHistory(property);
            });
            
            markers.push(marker);
        }
    });
}

// Load appraise page
function loadAppraisePage() {
    // Check if a property was passed from the map page
    const selectedProperty = localStorage.getItem('selectedProperty');
    
    if(selectedProperty) {
        const property = JSON.parse(selectedProperty);
        displayPropertyOnAppraise(property);
    } else {
        // If no property was passed, use the first one from properties.json
        fetch('properties.json')
            .then(response => response.json())
            .then(properties => {
                if(properties.length > 0) {
                    displayPropertyOnAppraise(properties[0]);
                }
            })
            .catch(error => console.error('Error loading properties:', error));
    }
}

// Display property on appraise page
function displayPropertyOnAppraise(property) {
    document.getElementById('propertyImage').src = property.imagen;
    document.getElementById('propertyImage').alt = property.titulo;
    document.getElementById('propertyTitle').textContent = property.titulo;
    document.getElementById('propertyContract').textContent = property.contrato;
    document.getElementById('propertyLocation').textContent = property.ubicacion;
    document.getElementById('propertyType').textContent = property.tipo;
}

// Load notifications
function loadNotifications() {
    fetch('notifications.json')
        .then(response => response.json())
        .then(data => {
            notifications = data;
            displayNotifications();
        })
        .catch(error => console.error('Error loading notifications:', error));
}

// Display notifications
function displayNotifications() {
    const container = document.getElementById('notificationsContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (notifications.length === 0) {
        container.innerHTML = '<p>No notifications found.</p>';
        return;
    }
    
    notifications.forEach(notification => {
        const notificationCard = document.createElement('div');
        notificationCard.className = 'notification-card';
        notificationCard.innerHTML = `
            <div class="notification-info">
                <h3>${notification.name}</h3>
                <p>${notification.propertyName}</p>
            </div>
            <div class="notification-actions">
                <button class="edit-btn" onclick="editNotification('${notification.id}')">Edit</button>
                <button class="delete-btn" onclick="deleteNotification('${notification.id}')">Delete</button>
            </div>
        `;
        container.appendChild(notificationCard);
    });
}

// Edit notification
function editNotification(notificationId) {
    const notification = notifications.find(n => n.id === notificationId);
    if (!notification) return;
    
    const newFrequency = prompt('Enter new frequency (daily/weekly/monthly):', notification.frequency);
    if (newFrequency) {
        notification.frequency = newFrequency;
        displayNotifications();
        // In a real implementation, we would save to notifications.json
    }
}

// Delete notification
function deleteNotification(notificationId) {
    if (confirm('Are you sure you want to delete this notification?')) {
        notifications = notifications.filter(n => n.id !== notificationId);
        displayNotifications();
        // In a real implementation, we would save to notifications.json
    }
}