import React from 'react';
import ReactDOM from 'react-dom/client'; // Importing ReactDOM's createRoot API
import './index.css'; // Import global styles
import App from './App'; // Import the main App component
import reportWebVitals from './reportWebVitals'; // For performance measurement (optional)

// Create the root element for rendering the React app
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render the App component wrapped in React.StrictMode for highlighting potential problems
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Measure app performance (optional)
// You can replace console.log with your analytics endpoint if needed
reportWebVitals(console.log);
