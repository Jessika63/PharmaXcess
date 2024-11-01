import React from 'react';
import { Link } from 'react-router-dom';
import './css/documents_checking.css'

function DocumentsChecking() {
  return (
    <div className="dc_App">

        {/* header container */}
        <div className="dc_header_container">

            {/* Rectangle 'go back rectangle' */}
            <Link to="/" style={{ textDecoration: 'none' }}>
                <div className="rectangle dc_back_button" style={{cursor: 'pointer'}}>
                    <p style={{ fontSize: '2.5em' }}>Retour</p>
                </div>
            </Link>

            {/* logo container */}
            <div className="dc_logo_container">
                {/* logo PharmaXcess */}
                <img
                    src={require('./../../assets/logo.png')}
                    alt="Logo PharmaXcess"
                    className="logo"
                />
            </div>

        </div>

        <div className='dc_body_page'>

            {/* Rectangle 'main rectangle' */}
            <div className="rectangle" style={{top: '20%', left: '50%'}}>
                <p style={{ fontSize: '3em', textAlign: 'center' }}>
                Veuillez insérer les documents <br/>
                suivants : ordonnance, carte vitale <br/>
                et carte d’identité
                </p>
            </div>

            {/* insertion buttons group */}
            <div style={{position: 'relative', top: '10%'
                , width: '100%', height: '45%', display: 'flex'}}>

                {/* Rectangle 'Ordonnance' */}
                <div className="rectangle" style={{position: 'relative', height: '50%'
                    , width: '22%', top: '50%', left: '17%'}}>
                    <p style={{ fontSize: '3em' }}>
                        Ordonnance
                    </p>
                </div>

                {/* Rectangle 'Carte Vitale' */}
                <div className="rectangle" style={{position: 'relative', height: '50%'
                    , width: '25%', top: '50%', left: '28%'}}>
                    <p style={{ fontSize: '3em' }}>
                        Carte Vitale
                    </p>
                </div>

                {/* Rectangle 'Carte d'Identité' */}
                <div className="rectangle" style={{position: 'relative', height: '50%'
                    , width: '20%', top: '50%', left: '35%'}}>
                    <p style={{ fontSize: '3em', textAlign: 'center'}}>
                        Carte <br/>
                        d'Identité
                    </p>
                </div>

            </div>

        </div>

    </div>
  );
}

export default DocumentsChecking;
