import React from "react";

function Loader() {
  return (
    <div className="loader-wrapper fss">
      <div class="spinner-border mx-3 text-primary" role="status">
        <span class="sr-only">Loading...</span>
      </div>
      <div class="spinner-border mx-3 text-secondary" role="status">
        <span class="sr-only">Loading...</span>
      </div>
      <div class="spinner-border mx-3 text-success" role="status">
        <span class="sr-only">Loading...</span>
      </div>
      <div class="spinner-border mx-3 text-danger" role="status">
        <span class="sr-only">Loading...</span>
      </div>
      <div class="spinner-border mx-3 text-warning" role="status">
        <span class="sr-only">Loading...</span>
      </div>
      <div class="spinner-border mx-3 text-info" role="status">
        <span class="sr-only">Loading...</span>
      </div>
      <div class="spinner-border mx-3 text-light" role="status">
        <span class="sr-only">Loading...</span>
      </div>
      <div class="spinner-border mx-3 text-dark" role="status">
        <span class="sr-only">Loading...</span>
      </div>
    </div>
  );
}

export default Loader;
