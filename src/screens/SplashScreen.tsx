import React from 'react';

const AppIcon = () => (
    <svg width="128" height="128" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="splash-logo" aria-label="Sadak Sathi App Icon">
        <g className="wave-container">
          <circle className="wave" cx="12" cy="12" r="9" />
          <circle className="wave" cx="12" cy="12" r="9" />
        </g>
        <g className="geological-icon">
            <path d="M16 3.13a1 1 0 0 1 0 1.74l-2 1.15a1 1 0 0 0-.5.87v4.22a1 1 0 0 0 .5.87l2 1.15a1 1 0 0 1 0 1.74l-8 4.62a1 1 0 0 1-1 0l-8-4.62a1 1 0 0 1 0-1.74l2-1.15a1 1 0 0 0 .5-.87V7.89a1 1 0 0 0-.5-.87L1 5.87a1 1 0 0 1 0-1.74l8-4.62a1 1 0 0 1 1 0l8 4.62z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M5 17.13v-4.24a1 1 0 0 1 .5-.87l2-1.15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </g>
    </svg>
);


const SplashScreen = () => {
  return (
    <div className="splash-screen" role="alert" aria-busy="true">
      <AppIcon />
      <h1 className="splash-title">Sadak Sathi</h1>
      <p className="splash-subtitle">Your Road Companion</p>
    </div>
  );
};

export default SplashScreen;