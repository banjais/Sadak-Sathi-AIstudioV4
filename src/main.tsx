import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

const App = () => {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Sadak-Sathi Minimal Working Page</h1>
      <p>Firebase Hosting is now working!</p>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
