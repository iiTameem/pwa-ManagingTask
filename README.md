# ManagingTask - Progressive Web App (PWA)

## Overview
**ManagingTask** is a Progressive Web App designed to help users organize and manage their tasks efficiently. It is lightweight, responsive, and installable, ensuring a smooth user experience across all devices. You can access it live [here](https://iitameem.github.io/pwa-ManagingTask/).

## Features
- **Task Management**: Add, edit, and delete tasks to keep track of your to-dos.
- **Offline Mode**: Work on your tasks even without an internet connection. Changes sync automatically when you're back online.
- **Responsive Design**: Optimized for both desktop and mobile devices.
- **Installable**: Save it as an app on your device for quick access.
- **Data Storage**: Tasks are stored locally for seamless operation.

## Tech Stack
- **Frontend**: HTML, CSS, JavaScript
- **PWA Features**:
  - Web App Manifest for app metadata
  - Service Worker for caching and offline capabilities
- **Storage**: IndexedDB for local task storage

## Live Demo
Visit the live version of the app: [ManagingTask](https://iitameem.github.io/pwa-ManagingTask/)

## How to Use
1. Open the app in your browser.
2. Add tasks by typing into the input field and hitting the "Add" button.
3. Edit or delete tasks as needed.
4. To install the app, click on the "Install" prompt in the browser (if available) or use the "Add to Home Screen" option.

## Files and Structure
- `index.html`: The main HTML file for the app.
- `styles.css`: Contains all the styling for the app.
- `app.js`: Implements the core logic for managing tasks.
- `manifest.json`: Provides metadata for PWA installation.
- `service-worker.js`: Enables caching for offline usage.

## Getting Started Locally
1. Clone the repository:
   ```bash
   git clone https://github.com/iitameem/pwa-ManagingTask.git
