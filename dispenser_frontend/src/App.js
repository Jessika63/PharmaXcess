import './App.css';
import StartingPage from './components/pages/starting_page';
import { useCORSRegistration } from './hooks/useCORSRegistration';
import config from './config';

function App() {
  const { isRegistered, isLoading, error, retryRegistration } = useCORSRegistration();

  // Afficher un message de chargement pendant l'enregistrement CORS
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{backgroundColor: config.backgroundColors.default}}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-800 mx-auto mb-4"></div>
          <p className="text-gray-800 text-xl">
            Initialisation de la connexion...
          </p>
        </div>
      </div>
    );
  }

  // Afficher un message d'erreur si l'enregistrement CORS échoue
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{backgroundColor: config.backgroundColors.default}}>
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Erreur de connexion</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <button
            onClick={retryRegistration}
            className={config.buttonStyles.primary}
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* starting page */}
      <StartingPage />
    </div>
  );
}

export default App;
