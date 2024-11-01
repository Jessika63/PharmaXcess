import React from 'react';
import { Link } from 'react-router-dom';
import '../../App.css'

function StartingPage() {
  return (
    <div className="starting_page">
      {/* Rectangle 'médicaments sous ordonnance' */}

      <Link to="/documents-checking" style={{ textDecoration: 'none' }}>
        <div className="rectangle" style={{top: '20%', left: '50%', cursor: 'pointer'}}>
          <p style={{ fontSize: '3em' }}>
            Médicaments sous ordonnance
          </p>
        </div>
      </Link>

      {/* Rectangle 'médicaments sans ordonnance' */}

      <Link to="/non-prescription-drugs" style={{ textDecoration: 'none' }}>
      <div className="rectangle" style={{top: '35%', left: '50%'}}>
        <p style={{ fontSize: '3em' }}>
          Médicaments sans ordonnance
        </p>
      </div>
      </Link>

    </div>
  );
}

export default StartingPage;
