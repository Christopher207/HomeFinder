# Rental Search Agent Implementation

## Overview
This document describes the implementation of the rental search agent feature for the HomeFinder application.

## Features Implemented

### 1. Agent Information Section
- Clearly explains what the agent does: helps users find rental properties based on their preferences
- Provides brief instructions on how to use the agent form to filter properties

### 2. Interactive Form
The search agent form includes the following input fields:
- **🏠 Type**: Dropdown to select property type (apartment, house, etc.)
- **📝 Contract**: Dropdown to select contract type (rental, sale, etc.)
- **📍 Location**: Text input for district or zone
- **💰 Estimated Budget**: Number input for maximum price

### 3. Property Filtering Logic
- Accesses the local `properties.json` database
- Filters results based on user input (Type, Contract, Location, and Price)
- Implements proper price parsing to handle various currency formats

### 4. Results Display
Properties are displayed with the following fields:
- **Type**
- **Contract** 
- **Location**
- **Title**
- **Price**
- **Image**
- **Description**

### 5. Navigation Integration
- Added "Agente de Búsqueda" button to the navigation bar
- Positioned between "Mapa de Oportunidades" and "Tasar una Propiedad" buttons
- Maintains the same visual style as other navigation buttons

## Technical Implementation

### Files Created
- `search-agent.html`: Main page for the rental search agent
- Updated CSS in `styles.css` for new components

### Files Modified
- `index.html`
- `opportunity-map.html`
- `appraise.html`
- `notifications.html`
- `styles.css`

### Key JavaScript Functions
- `handleSearchAgentSubmit()`: Handles form submission and property filtering
- `extractPriceValue()`: Safely extracts numeric values from price strings with various formats
- `displaySearchResults()`: Renders filtered properties in a grid layout

## How to Use
1. Navigate to the "Agente de Búsqueda" section via the main navigation
2. Complete the search form with your preferences
3. Click "Buscar Propiedades" to see filtered results
4. Results will be displayed in order from lowest to highest price

## Dependencies
- The application uses the existing `properties.json` file as the data source
- All property data must have the expected fields (tipo, contrato, ubicacion, precio, titulo, imagen, descripcion) to display correctly

## Running the Application
Due to browser security restrictions (CORS policy), you may encounter issues when opening the HTML files directly in your browser with `file://` protocol. To avoid these issues, you need to serve the files through a local web server. Here are the recommended ways to run the application:

### Using Python
If you have Python installed:
- For Python 3.x: `python -m http.server 8000`
- Navigate to `http://localhost:8000` in your browser

### Using Node.js
If you have Node.js installed:
- Install a simple server: `npx http-server`
- Navigate to the URL shown in the terminal output

### Using Live Server in VS Code
- Install the "Live Server" extension
- Right-click on any HTML file and select "Open with Live Server"

This will allow the JavaScript to properly fetch the `properties.json` file.