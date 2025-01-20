import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../../App.css'

function DrugUnavailable() {

  const navigate = useNavigate()
  const location = useLocation()

  return (
    <div className="App">

      {/* logo container */}
      <div className="logo_container">
        {/* logo PharmaXcess */}
        <img src={require("./../../assets/logo.png")} alt="Logo PharmaXcess" className="logo" />
      </div>

      {/* starting page */}
      <div className="starting_page">

        {/* Rectangle message d'information */}
        <div>
          <p style={{fontSize: '3em', textAlign: 'center', color: '#333333'}}>
              Le médicament que vous voulez n'est plus disponible.<br />
              Voici nos propositions pour résoudre ce problème:
          </p>
        </div>

        {/* Rectangle 'médicaments sous ordonnance' */}

        <Link to="/#" style={{ textDecoration: 'none' }}>
          <div className="rectangle" style={{top: '20%', left: '50%', cursor: 'pointer'}}>
            <p style={{ fontSize: '3em', textAlign: 'center' }}>
              Commander le médicament et le récupérer plus tard
            </p>
          </div>
        </Link>

        {/* Rectangle 'médicaments sans ordonnance' */}

        {/* <Link to="/drug-stores-available" style={{ textDecoration: 'none' }}> */}
        <div className="rectangle" style={{top: '30%', left: '50%'}}
        onClick={() => navigate('/drug-stores-available', {state: {from: 'drug-unavailable'}})}>
          <p style={{ fontSize: '3em', textAlign: 'center' }}>
            Liste des pharmacies possédant le médicament
          </p>
        </div>
        {/* </Link> */}

      </div>
    </div>
  );
}

export default DrugUnavailable;
