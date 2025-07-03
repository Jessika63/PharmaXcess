# Frontend

## Prerequisites

You need to install:

- Docker: 27.2.0
- Docker Compose: v2.29.2

### Installation

You can install all prerequisites with [this script](./prerequisites/install_prerequisites.sh) or follow [this readme](./prerequisites/Prerequisites.md)

## Launching

### [STEP 1] install packages

To install all dependencies in package.json you need to use this command:

```bash
npm install
```

### [STEP 2] run docker

To run the front-end you need to use this command:

```bash
docker-compose up --build
```

#### If you encounter that kind of error

```bash
react-app-distributeur@0.1.0 start /app
> react-scripts start
sh: 1: react-scripts: not found
```

here is how to solve:

```bash
rm -rf node_modules package-lock.json
npm install
docker-compose down
docker-compose up --build
```

### finished

your app should be running, 'happy dev!'

## Back to general **distributeur** documentation

The general **distributeur** documentation is available at here : [distributeur readme](../Readme.md)

## Code configuration

### /pages directory

Every screen from the app is organized inside the 'pages' directory:

- **starting_page.js** => Main landing page with the PharmaXcess logo and navigation options
- **documents_checking.js** => Page for scanning the 3 required documents: ID, insurance card, and prescription. Uses camera_component and modal_camera for display
- **non_prescription_drugs.js** => Lists all drugs fetched from the backend API with filtering options. Uses modal_standard for drug display and payment processing
- **insufficient_stock.js** => Handles cases when drug stock is insufficient. Provides options to preorder or find nearby pharmacies with transport mode selection
- **drug_stores_available.js** => Displays all pharmacies around the user's location with distance calculations
- **DirectionsMapPage.js** => Interactive map showing route to selected pharmacy with different transport modes (walking, cycling, transit, car)
- **preorder.js** => Page for preordering medications when stock is insufficient

### /components directory

The 'components' directory contains reusable UI components:

- **camera_component.js** => Camera interface for document scanning with photo capture, retake functionality, and graphical display
- **modal_standard.js** => Standard modal component used for drug display and general popups
- **modal_camera.js** => Specialized modal for camera display only
- **ErrorPage.js** => Error display component for handling application errors

### /utils directory

Utility functions and hooks:

- **fetchWithTimeout.js** => Enhanced fetch function with timeout handling
- **useInactivityRedirect.js** => React hook for detecting user inactivity and redirecting to home page

### Styles

- **Tailwind CSS** is the primary styling framework used throughout the project
- **CSS files** in `/components/pages/css/` contain specific styles for individual pages
- **Global styles** are defined in `App.css` and `index.css`

### Key Features

- **Keyboard Navigation**: Full keyboard accessibility with arrow key navigation and Enter key selection
- **Responsive Design**: Mobile-first design with touch-friendly interface
- **Real-time Location**: GPS integration for finding nearby pharmacies
- **Interactive Maps**: Leaflet.js integration for route visualization
- **Document Scanning**: Camera integration for document verification
- **Payment Processing**: Simulated payment flow with stock validation
- **Inactivity Detection**: Automatic redirect to home page after inactivity

### Dependencies

- **React 18.3.1** - Main framework
- **React Router DOM 6.27.0** - Client-side routing
- **React Icons 5.5.0** - Icon library
- **Leaflet 1.9.4** - Interactive maps
- **React Leaflet 4.2.1** - React wrapper for Leaflet
- **Tailwind CSS 3.3.0** - Utility-first CSS framework

## Configuration

### Main Configuration File

- **`src/config.js`** - Central configuration file containing:
  - **Backend URL**: API endpoint configuration (`backendUrl: 'http://localhost:5000'`)
  - **UI Styling**: Colors, fonts, button styles, shadows, and transitions
  - **Icons**: All React Icons used throughout the application
  - **Layout Classes**: Common layout and spacing configurations
  - **Modal Styles**: Overlay and content styling for modals
  - **Component Styles**: Predefined button and component style combinations

### Build Configuration

- **`tailwind.config.js`** - Tailwind CSS configuration for custom styling
- **`postcss.config.js`** - PostCSS processing configuration
- **`package.json`** - Project dependencies and scripts configuration

### Environment Configuration

- **`docker-compose.yml`** - Docker container configuration with environment variables
- **`Dockerfile`** - Container build configuration

The `config.js` file is imported throughout the application to maintain consistent styling and configuration across all components.
