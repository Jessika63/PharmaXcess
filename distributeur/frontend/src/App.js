import './App.css';
import StartingPage from './components/pages/starting_page';

function App() {
  return (
    <div className="App">

      {/* logo container */}
      <div className="logo_container">
        {/* logo PharmaXcess */}
        <img src={require("./assets/logo.png")} alt="Logo PharmaXcess" className="logo" />
      </div>

      {/* starting page */}
      <StartingPage />
    </div>
  );
}

export default App;
