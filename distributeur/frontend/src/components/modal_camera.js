import React from 'react';

const ModalCamera = ({ children, onClose }) => {
    return (
        <div>
            {/* Darkening overlay covering the whole page*/}
            <div
                style={{
                    position: 'fixed',
                    top: '-50%',
                    left: '-20%',
                    width: '135%',
                    height: '145%',
                    backgroundColor: 'rgba(0, 0, 0, 0.2)',
                    zIndex: 1000,
                }}
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div
                style={{
                    position: 'fixed',
                    top: '-30%',
                    left: '50%',
                    transform: 'translate(-50%, 0)',
                    width: '100%',
                    height: '105%',
                    // #e06a7d, #f5b1b7
                    // background: '#e06a7d',
                    background: 'linear-gradient(to bottom, #d96a7a, #e8a0a8)',
                    color: '#333333',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: '30px',
                    boxShadow: '0px 0px 60px 60px rgba(0, 0, 0, 0.5)',
                    zIndex: 1001,
                    padding: '20px',
                }}
            >
                {children} {/* div content => camera display etc */}
            </div>
        </div>
    );
};

export default ModalCamera;
