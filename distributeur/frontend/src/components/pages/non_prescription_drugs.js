import React from 'react';
import { Link } from 'react-router-dom';
import './css/non_prescription_drugs.css'

const drugs_items = [
    { id: 1, label: 'Dafalgan' },
    { id: 2, label: 'Gaviscon' },
    { id: 3, label: 'Nurofen' },
    { id: 4, label: 'Physiomer' },
    { id: 5, label: 'Zyrtec' },
    { id: 6, label: 'Coryzalia' },
    { id: 7, label: 'Ibuprofen' },
    { id: 8, label: 'Doliprane' },
    { id: 9, label: 'L52' },
    { id: 10, label: 'Toplexil' },
    { id: 11, label: 'Vitascorbol' },
    { id: 12, label: 'Hexaspray' },
    { id: 13, label: 'Voltaren' },
    { id: 14, label: 'Smecta' },
    { id: 15, label: 'Synthol' },
    { id: 16, label: 'Strepsil' },
    { id: 17, label: 'Dafalgan 2' },
    { id: 18, label: 'Gaviscon 2' },
    { id: 19, label: 'Nurofen 2' },
    { id: 20, label: 'Physiomer 2' },
    { id: 21, label: 'Zyrtec 2' },
    { id: 22, label: 'Coryzalia 2' },
    { id: 23, label: 'Ibuprofen 2' },
    { id: 24, label: 'Doliprane 2' },
    { id: 25, label: 'L52 2' },
    { id: 26, label: 'Toplexil 2' },
    { id: 27, label: 'Vitascorbol 2' },
    { id: 28, label: 'Hexaspray 2' },
    { id: 29, label: 'Voltaren 2' },
    { id: 30, label: 'Smecta 2' },
    { id: 31, label: 'Synthol 2' },
    { id: 32, label: 'Strepsil 2' }
];

function NonPrescriptionDrugs() {
  return (
    <div className="npd_App">

        {/* header container */}
        <div className="npd_header_container">

            {/* Rectangle 'go back rectangle' */}
            <Link to="/" style={{ textDecoration: 'none' }}>
                <div className="rectangle npd_back_button" style={{cursor: 'pointer'}}>
                    <p style={{ fontSize: '2.5em' }}>Retour</p>
                </div>
            </Link>

            {/* logo container */}
            <div className="npd_logo_container">
                {/* logo PharmaXcess */}
                <img
                    src={require('./../../assets/logo.png')}
                    alt="Logo PharmaXcess"
                    className="logo"
                />
            </div>

        </div>

        <div className='npd_body_page'>

            {/* Rectangle 'main rectangle' */}
            <div className="rectangle" style={{top: '5%', left: '50%', width: '60%'
                , display: 'flex', flexDirection: 'column', overflowY: 'auto'
            }}>
                <p style={{ fontSize: '3em', textAlign: 'center' }}>
                Voici la liste des médicaments <br/>
                diponibles à la vente :
                </p>
            </div>

            {/* drugs list */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(24%, 1fr))',
                    gridGap: '1.3%',
                    position: 'relative',
                    //top: '0%',
                    width: '100%',
                    height: '60%',
                    overflowY: 'auto',
                    paddingTop: '6%',
                    paddingLeft: '17.5%',
                    boxSizing: 'border-box',
                }}
            >
                {drugs_items.map((item) => (
                    <div
                        key={item.id}
                        className="rectangle"
                        style={{
                            height: '80%',
                            width: '85%',
                            borderRadius: '30px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textAlign: 'center'
                        }}
                    >
                        <p style={{ fontSize: '2.5em', textAlign: 'center' }}>
                            {item.label}
                        </p>
                    </div>
                ))}
            </div>

        </div>

    </div>
  );
}

export default NonPrescriptionDrugs;
