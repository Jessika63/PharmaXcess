import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../../App.css'

const drug_shops = [
  { id: 1, label: 'Pharmacie 1' },
  { id: 2, label: 'Pharmacie 2' },
  { id: 3, label: 'Pharmacie 3' },
  { id: 4, label: 'Pharmacie 4' },
  { id: 5, label: 'Pharmacie 5' },
  { id: 6, label: 'Pharmacie 6' },
  { id: 7, label: 'Pharmacie 7' },
  { id: 8, label: 'Pharmacie 8' },
  { id: 9, label: 'Pharmacie 9' },
];

function DrugStoresAvailable() {

    const navigate = useNavigate()
    const location = useLocation()

  return (
    <div className="npd_App">

        {/* header container */}
        <div className="npd_header_container">

            {/* Rectangle 'go back rectangle' */}
            <Link to={'/' + location.state.from} style={{ textDecoration: 'none' }}>
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
                Voici la liste des pharmacies disposant du médicament souhaité:
                </p>
            </div>

            {/* drugs list */}
            <div
                style={{
                    display: 'grid',
                    position: 'relative',
                    //top: '0%',
                    width: '100%',
                    height: '55%',
                    overflowY: 'auto',
                    paddingTop: '6%',
                    paddingLeft: '50%',
                    boxSizing: 'border-box',
                }}
            >
                {drug_shops.map((item) => (
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
                            textAlign: 'center',
                            cursor: 'pointer'
                        }}
                        // onClick={() => openModal(item)}
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

export default DrugStoresAvailable;
