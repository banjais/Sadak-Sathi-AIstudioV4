import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

function App() {
  return (
    <div>
      <h1>Sadak-Sathi: Your Road Companion</h1>
      <p>Firebase Hosting & GitHub Actions Test Page</p>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(<App />);
