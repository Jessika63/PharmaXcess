import React from 'react';
import '../../App.css'

function StartingPage() {
  return (
    <div className="starting_page">
      {/* Rectangle 'médicaments sous ordonnance' */}
      <div className="rectangle" style={{top: '20%', left: '50%'}}>
        <p style={{ fontSize: '3em' }}>
          Médicaments sous ordonnance
        </p>
      </div>

      {/* Rectangle 'médicaments sans ordonnance' */}
      <div className="rectangle" style={{top: '35%', left: '50%'}}>
        <p style={{ fontSize: '3em' }}>
          Médicaments sans ordonnance
        </p>
      </div>
    </div>
  );
}

export default StartingPage;
