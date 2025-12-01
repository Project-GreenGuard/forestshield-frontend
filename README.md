# ForestShield Frontend

React Progressive Web App (PWA) for visualizing wildfire sensor data and risk maps.

## Overview

Real-time dashboard displaying:

- Sensor locations and readings on interactive Leaflet map
- Risk heatmap overlay
- NASA FIRMS wildfire data integration
- Real-time data updates via polling

## Tech Stack

- React 19
- React Leaflet (maps)
- Leaflet (mapping library)
- Progressive Web App capabilities

## Getting Started

### Prerequisites

- Node.js >= 16
- npm or yarn
- Backend API running (see forestshield-backend README)

### Installation

```bash
npm install
```

### Environment Configuration

Create `.env` file in the root directory:

```env
REACT_APP_API_URL=http://localhost:5001/api
```

For production, use your API Gateway endpoint:

```env
REACT_APP_API_URL=https://your-api-gateway-url.amazonaws.com/api
```

### Development

```bash
npm start
```

Runs the app at http://localhost:3000

The app will automatically:

- Poll `/api/sensors` every 10 seconds
- Poll `/api/risk-map` every 30 seconds
- Display sensor markers on the map
- Show real-time sensor data in the data panel

### Build

```bash
npm run build
```

Builds for production to the `build` folder.

## Project Structure

```
src/
├── components/
│   ├── Sidebar.js          # Navigation sidebar
│   ├── Topbar.js           # Header bar
│   ├── MapArea.js          # Leaflet map with sensor markers
│   └── DataPanel.js        # Sensor data display
├── services/
│   └── api.js              # API client for backend communication
├── App.js                  # Main app component with state management
├── App.css                 # Dashboard layout styles
├── index.js                # Entry point
└── index.css               # Global styles
```

## Features

- Real-time sensor data visualization
- Interactive map with Leaflet
- Sensor markers with risk-based coloring
- Risk heatmap overlay
- Automatic data polling
- Responsive design

## API Integration

The frontend connects to the backend API at the URL specified in `.env`:

- `GET /api/sensors` - List all sensors with latest data
- `GET /api/sensor/{id}` - Get specific sensor data
- `GET /api/risk-map` - Get risk map data points

## Map Features

- **Sensor Markers**: Color-coded by risk score
  - Red: High risk (61-100)
  - Orange: Medium risk (31-60)
  - Green: Low risk (0-30)
- **Risk Heatmap**: Visual overlay showing risk zones
- **Interactive Popups**: Click markers to see sensor details

## Future Enhancements

- TypeScript migration
- TailwindCSS styling
- Service worker for offline support
- Push notifications
- Real-time WebSocket updates
- Dark mode toggle
- Historical data charts

## Related Repositories

- **forestshield-backend** - API endpoints
- **forestshield-infrastructure** - API Gateway configuration
- **forestshield-iot-firmware** - Data source

## License

See LICENSE file
