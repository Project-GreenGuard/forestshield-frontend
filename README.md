# ForestShield Frontend

React Progressive Web App (PWA) for visualizing wildfire sensor data and risk maps.

## Overview

Real-time dashboard displaying:

- Sensor locations and readings
- Risk heatmap overlay
- NASA FIRMS wildfire data
- Interactive map with React Leaflet

## Tech Stack

- React 19
- React Leaflet (maps)
- TailwindCSS (to be added)
- Progressive Web App capabilities

## Getting Started

### Prerequisites

- Node.js >= 16
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm start
```

Runs the app at http://localhost:3000

### Build

```bash
npm run build
```

Builds for production to the `build` folder.

## Configuration

### API Endpoint

Create `.env` file:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

For production, use API Gateway endpoint from `forestshield-infrastructure` Terraform output.

### Environment Variables

- `REACT_APP_API_URL` - Backend API endpoint

## Project Structure

```
src/
├── components/
│   ├── Sidebar.js
│   ├── Topbar.js
│   ├── MapArea.js
│   └── DataPanel.js
├── App.js
├── App.css
├── index.js
└── index.css
```

## Features

- Real-time sensor data visualization
- Interactive map with Leaflet
- Risk heatmap overlay (in progress)
- NASA FIRMS overlays (in progress)
- Charts and analytics (planned)

## Future Enhancements

- [ ] TypeScript migration
- [ ] TailwindCSS styling
- [ ] Service worker for offline support
- [ ] Push notifications
- [ ] Real-time WebSocket updates
- [ ] Dark mode

## Related Repositories

- **forestshield-backend** - API endpoints
- **forestshield-infrastructure** - API Gateway configuration
- **forestshield-iot-firmware** - Data source

## License

See LICENSE file
