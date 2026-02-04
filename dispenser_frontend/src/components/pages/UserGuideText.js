import React from 'react';
import { useNavigate } from 'react-router-dom';
import config from '../../config';

function UserGuideText() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background_color flex flex-col relative">
      {/* Logo en haut à droite */}
      <div className="absolute top-4 right-8">
        <img src={config.icons.logo} alt="Logo PharmaXcess" className="w-48 h-auto" />
      </div>
      {/* Header retour + titre */}
      <div className="w-full flex items-center mb-8 mt-8 px-8">
        <button
          className="flex items-center space-x-2 bg-transparent hover:bg-gray-100 rounded-xl px-2 py-1 transition-transform duration-300"
          onClick={() => navigate(-1)}
        >
          <config.icons.arrowLeft className="text-2xl text-black" />
        </button>
        <h1 className="ml-2 text-3xl font-bold text-black tracking-tight">Guide utilisateur</h1>
      </div>
      <div className="flex justify-center w-full">
        <div className="bg-white p-6 md:p-12 rounded-3xl shadow-xl w-full max-w-3xl mb-8">
          <p className="text-lg text-gray-700 text-center mb-8">Ce guide décrit les fonctionnalités disponibles sur l'interface du distributeur automatique de médicaments PharmaXcess.</p>

        {/* Sommaire */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-pink-600 mb-4">Sommaire</h2>
          <ul className="list-none text-gray-800 space-y-2">
            <li className="font-bold">1. Achat libre de médicaments
              <ul className="ml-6 list-none space-y-1">
                <li>1.1 Achat avec paiement réussi</li>
                <li>1.2 Achat avec paiement échoué</li>
                <li>1.3 Options en cas de rupture de stock</li>
              </ul>
            </li>
            <li className="font-bold">2. Traitement d'une ordonnance médicale
              <ul className="ml-6 list-none space-y-1">
                <li>2.1 Scanner une ordonnance papier</li>
                <li>2.2 Utiliser un QR Code (Application)</li>
              </ul>
            </li>
            <li className="font-bold">3. Support utilisateur et accessibilité</li>
          </ul>
        </div>

        {/* Section 1 */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-pink-600 mb-2">1. Achat Libre de Médicaments</h2>
          <p className="mb-4 text-gray-700">Processus d'achat de médicaments en libre-service sans ordonnance.</p>
          <div className="mb-4">
            <h3 className="font-semibold text-gray-900 mb-2">1.1 Achat avec paiement réussi</h3>
            <ol className="ml-4 list-decimal list-inside space-y-1 text-gray-800">
              <li>Sélectionnez <span className="font-bold">"Médicaments sans ordonnances"</span> dans le menu principal.</li>
              <li>Choisissez un ou des médicament(s) disponibles en stock.</li>
              <li>Appuyez sur <span className="font-bold">"Ajouter au panier"</span>.</li>
              <li>Ouvrez votre panier via l'icône <span className="font-bold">"Panier"</span> en haut à droite.</li>
              <li>Appuyez sur <span className="font-bold">"Procéder au paiement"</span>.</li>
              <li>Insérez votre carte ou choisissez une méthode de paiement.</li>
              <li>Confirmez le paiement.</li>
            </ol>
            <div className="mt-2 text-green-700 font-medium">Si le paiement est validé, le(s) médicament(s) sont distribués.</div>
          </div>
          <div className="mb-4">
            <h3 className="font-semibold text-gray-900 mb-2">1.2 Achat avec paiement échoué</h3>
            <ol className="ml-4 list-decimal list-inside space-y-1 text-gray-800">
              <li>Suivez les étapes 1 à 6 ci-dessus.</li>
              <li>Tentez de confirmer le paiement.</li>
            </ol>
            <div className="mt-2 text-red-600 font-medium">En cas d'échec, le(s) médicament(s) ne seront pas distribués.</div>
          </div>
          <div className="mb-4">
            <h3 className="font-semibold text-gray-900 mb-2">1.3 Options en cas de Rupture de Stock</h3>
            <div className="mb-2">
              <h4 className="font-bold text-gray-800 mb-1">Commander pour retrait ultérieur</h4>
              <p className="mb-2 text-gray-700">Vous pouvez passer commande pour venir retirer le(s) médicament(s) plus tard :</p>
              <ol className="list-decimal list-inside space-y-1 text-gray-800 ml-4">
                <li>Sélectionnez <span className="font-bold">"Médicaments sans ordonnances"</span> du menu.</li>
                <li>Choisissez un ou des médicament(s) actuellement en rupture de stock.</li>
                <li>Appuyez sur le bouton <span className="font-bold">"Voir les options disponibles"</span>.</li>
                <li>Appuyez sur le bouton <span className="font-bold">"Commander"</span>.</li>
                <li>Appuyez de nouveau sur le bouton <span className="font-bold">"Commander"</span> dans l'écran du panier.</li>
                <li>Scannez le QR code de votre profil utilisateur pour transmettre vos informations de contact.</li>
                <li>Appuyez sur le bouton <span className="font-bold">"Terminer"</span>.</li>
              </ol>
              <div className="mt-2 text-gray-700">Vous serez contacté grâce aux informations de contact récupérées via le QR code lorsque votre commande sera prête.</div>
            </div>
            <div className="mb-2">
              <h4 className="font-bold text-gray-800 mb-1">Trouver une pharmacie à proximité</h4>
              <p className="mb-2 text-gray-700">Vous pouvez rechercher une pharmacie qui a le(s) médicament(s) en stock :</p>
              <ol className="list-decimal list-inside space-y-1 text-gray-800 ml-4">
                <li>Sélectionnez <span className="font-bold">"Médicaments sans ordonnances"</span> du menu.</li>
                <li>Choisissez un ou des médicament(s) en rupture de stock.</li>
                <li>Appuyez sur le bouton <span className="font-bold">"Voir les options disponibles"</span>.</li>
                <li>Appuyez sur le bouton <span className="font-bold">"Voir les pharmacies"</span>.</li>
                <li>Sélectionnez une pharmacie disponible dans la liste.</li>
                <li>Choisissez votre mode de transport.</li>
              </ol>
              <div className="mt-2 text-gray-700">L'itinéraire pour vous rendre à la pharmacie sélectionnée sera affiché via un QR Code permettant d’accéder à l’itinéraire depuis l’application.</div>
            </div>
          </div>
        </section>

        {/* Section 2 */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-pink-600 mb-2">2. Traitement d'une Ordonnance Médicale</h2>
          <p className="mb-4 text-gray-700">Obtenez vos médicaments prescrits via une ordonnance papier ou un QR code généré par l'application PharmaXcess.</p>
          <div className="mb-4">
            <h3 className="font-semibold text-gray-900 mb-2">2.1 Scanner une ordonnance papier</h3>
            <ol className="ml-4 list-decimal list-inside space-y-1 text-gray-800">
              <li>Sélectionnez l'option de traitement d'ordonnance sur l'accueil.</li>
              <li>Appuyez sur <span className="font-bold">"Commencer les vérifications"</span>.</li>
              <li>Sélectionnez <span className="font-bold">"Scanner une ordonnance"</span>, placez l'ordonnance dans le scanner, puis continuez.</li>
              <li>Insérez votre Carte Vitale, puis continuez.</li>
              <li>Si nécessaire, insérez votre pièce d'identité, puis continuez.</li>
            </ol>
            <ul className="list-disc list-inside mt-2 space-y-1 text-gray-800">
              <li><span className="font-bold text-green-700">Remboursement intégral :</span> Appuyez sur "Terminer" pour recevoir vos médicaments.</li>
              <li><span className="font-bold text-green-700">Paiement requis avec succès :</span> Procédez au paiement, puis appuyez sur "Terminer" pour recevoir vos médicaments.</li>
              <li><span className="font-bold text-red-600">Paiement requis avec échec :</span> Les médicaments ne seront pas distribués.</li>
            </ul>
            <div className="mt-2 text-gray-700">En cas de rupture de stock, suivez les options de commande ou de recherche de pharmacie comme ci-dessus.</div>
            <div className="mt-2 text-red-600">Documents ou ordonnances incorrects : un message d'erreur s'affichera.</div>
          </div>
          <div className="mb-4">
            <h3 className="font-semibold text-gray-900 mb-2">2.2 Utiliser un QR Code (Application)</h3>
            <ol className="ml-4 list-decimal list-inside space-y-1 text-gray-800">
              <li>Sélectionnez l'option de traitement d'ordonnance sur l'accueil.</li>
              <li>Appuyez sur <span className="font-bold">"Commencer les vérifications"</span>.</li>
              <li>Sélectionnez <span className="font-bold">"QR code"</span>, scannez le QR code généré par l'application, puis continuez.</li>
              <li>Insérez votre Carte Vitale, puis continuez.</li>
            </ol>
            <ul className="list-disc list-inside mt-2 space-y-1 text-gray-800">
              <li><span className="font-bold text-green-700">Remboursement intégral :</span> Appuyez sur "Terminer" pour recevoir vos médicaments.</li>
              <li><span className="font-bold text-green-700">Paiement requis avec succès :</span> Procédez au paiement, puis appuyez sur "Terminer" pour recevoir vos médicaments.</li>
              <li><span className="font-bold text-red-600">Paiement requis avec échec :</span> Les médicaments ne seront pas distribués.</li>
            </ul>
            <div className="mt-2 text-gray-700">En cas de rupture de stock, suivez les options de commande ou de recherche de pharmacie comme pour la partie d'achat libre de médicaments.</div>
          </div>
        </section>

        {/* Section 3 */}
        <section className="mb-4">
          <h2 className="text-xl font-bold text-pink-600 mb-2">3. Support Utilisateur et Accessibilité</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-800 mb-2">
            <li>Accédez à l'aide via le bouton <span className="font-bold">Aide</span> (icône "?").</li>
            <li>Guide textuel : instructions détaillées.</li>
            <li>Guide vidéo : tutoriel accessible via QR code.</li>
            <li>Accessibilité VoiceOver : audio-guidage disponible si activé.</li>
            <li>Navigation tactile ou boutons physiques, les deux sont pris en charge.</li>
          </ul>
        </section>
      </div>
      </div>
    </div>
  );
}

export default UserGuideText;
