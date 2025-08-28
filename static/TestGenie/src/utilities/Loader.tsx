import React from "react";
import "../assets/styles/Loader.css"; // Ensure to create a separate CSS file for styling

const Loader = () => (
  <div id="loader">
    <div className="loading-spinner"></div>
    <p>Loading, please wait...</p>
  </div>
);

export default Loader;
