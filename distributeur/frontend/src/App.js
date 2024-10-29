import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
      </header>

      {/* logo PharmaXcess */}

      <img src={require("./assets/logo.png")} alt="Logo PharmaXcess" className="logo"></img>

      {/* page de garde */}
      <div>
        {/* rectangle medicaments sous ordonnance */}
        <div class="rectangle" style={{top: '30%', left: '50%'}}>
          <p style={{fontSize: '2.5em'}}>
            Médicaments sous ordonnance
          </p>
        </div>

        {/* rectangle medicaments sans ordonnance */}
        <div class="rectangle" style={{top: '60%', left: '50%'}}>
          <p style={{fontSize: '2.5em'}}>
            Médicaments sans ordonnance
          </p>
        </div>

      </div>
    </div>
  );
}

export default App;
