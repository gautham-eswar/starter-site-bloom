
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeApp } from './services/appInitializer';

// Initialize the app
initializeApp().catch(console.error);

createRoot(document.getElementById("root")!).render(<App />);
