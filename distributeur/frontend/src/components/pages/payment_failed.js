import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../../App.css'

function PaymentFailed() {

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
                Le paiement a échoué, voulez-vous réessayer ou annuler la transaction ?
            </p>
          </div>

          {/* Rectangle 'médicaments sous ordonnance' */}

          {/* <Link to="/payment-failed/#" style={{ textDecoration: 'none' }}> */}
            <div className="rectangle" style={{top: '20%', left: '50%', cursor: 'pointer'}}
            onClick={() => navigate('/' + (location.state.from || '/#'))}>
              <p style={{ fontSize: '3em', textAlign: 'center' }}>
                Réessayer le paiement
              </p>
            </div>
          {/* </Link> */}

          {/* Rectangle 'médicaments sans ordonnance' */}

          <Link to="/#" style={{ textDecoration: 'none' }}>
          <div className="rectangle" style={{top: '30%', left: '50%'}}>
            <p style={{ fontSize: '3em', textAlign: 'center' }}>
              Annuler la commande
            </p>
          </div>
          </Link>

        </div>
      </div>
  );
}

export default PaymentFailed;
