# **BETA TEST PLAN – PHARMAXCESS**

## **1. Introduction**

### **1.1 Contexte du projet**
PharmaXcess, un distributeur de médicaments automatisé, est disponible en continu, 24h/24 et 7j/7, pour que les patients puissent accéder à leurs médicaments à tout moment.
Il est placé sur le mur extérieur des pharmacies, fonctionnant comme un distributeur bancaire tout en assurant la sécurité des médicaments, qui sont acheminés via un système pneumatique depuis les réserves des pharmacies.
En supplément, une application compagnon permet aux utilisateurs de suivre leur consommation de médicaments, de gérer leurs ordonnances (par exemple, dates de renouvellement), localiser les distributeurs les plus proches, utiliser un système de Click & Collect en envoyant leur ordonnance à un pharmacien, et bénéficier d'un chat en temps réel avec un professionnel de santé. 

---

### **1.2 Objectifs du beta test plan**
L'objectif de ce beta-test plan est d'évaluer la stabilité, l'efficacité et la convivialité du distributeur PharmaXcess ainsi que son application mobile. Cela permettra de repérer d'éventuelles erreurs et d'ajuster le produit avant une mise en place à grande échelle.

---

## **2. Sélection des fonctionnalités clés**

### **2.1 Distributeur**
- Scan de l'ordonnance et extraction des informations nécessaires. 
- Contrôle de l'authencité de l'ordonnance.
- Validation et autorisation de délivrance des médicaments.
- Gestion des cas où le médicament n'est pas disponible (commande ultérieure ou redirection vers une autre pharmacie). 

---

### **2.2 Application**
- Utilisation du système de Click & Collect pour prendre des photos de l'ordonnance, l'envoyer au pharmacien et recevoir un QR code. 
- Localisation des distributeurs et calcul d'itinéraires.
- Gestion des médicaments avec rappels de prise.
- Historique des ordonnances et alertes concernant leur renouvellement.
- Conversation en temps réel avec un professionnel de santé

---

## **3. Définition des scénarios de test**

### **3.1 Scénarios pour le distributeur**

| **Scénario** | **Etapes** | **Résultat attendu** |
|--------------|---------------|------------------------|
| Vérification et validation de l'ordonnance    | Insertion de l'ordonnance -> Obtention et analyse des informations -> Vérification d’authencité | L'ordonnance est considérée comme valide et reconnue si elle est authentique |
| Ordonnance non lisible    | Inclusion d'une ordonnance qui est floue ou partiellement effacée | Un message d'erreur s'affiche, avec une requête pour réessayer |
| Médicament indisponible  | L'ordonnance a été approuvée, mais le stock n'est plus disponible | Proposition de passer la commande du médicament ou de se rendre dans une autre pharmacie |
| Retrait des médicaments    | Validation de l'ordonnance -> Acheminement de médicament -> Retrait | Il est possible pour l'utilisateur de récupérer son médicament et son ordonnance |

---

### **3.2 Scénarios pour l'application**

| **Scénario** | **Etapes** | **Résultat attendu** |
|--------------|---------------|------------------------|
| Click & Collect    | Prendre une photo de l'ordonnance -> Envoi au pharmacien -> Récupération du QR code | L'analyse et la validation de l'ordonnance ont été effectuées. Un QR code a été généré |
| Localisation des distributeurs    | Recherche d'un distributeur -> Affichage des résultats -> Itinéraire proposé | La localisation du distributeur le plus proche est indiquée avec le chemin d'accès |
| Discussion avec un spécialiste   | Demande d'aide -> Réponse du professionnel | La réponse de l'utilisateur est transmise en temps réel |

---

## **4. Critères d’évaluation**

### **4.1 Critères de succès pour le distributeur**
- La numérisation et l'analyse de l'ordonnance sont effectuées avec précision.
- Vérification d'authenticité performante (aucune ordonnance frauduleuse acceptée) 
- Assurer la livraison et l'acheminement sans erreur des médicaments
- En cas d'indisponibilité, une alternative correctement proposée

---

### **4.2 Critères de succès pour l'application**
- L'ordonnance a été envoyée et validée dans un délai raisonnable.
- Un QR code a été énéré et reconnu par le distributeur.
- Interface facile à comprendre et intuitive.
- Les fonctionnalités de localisation et de chat sont opérationnelles. 

---

### **4.3 Exigences de performance et UX**
- La validation de l'ordonnance doit être effectuée en moins de 30 secondes par le distributeur et en moins de 5 minutes par le pharmacien.
- Les actions clés ne nécessitent pas plus d'une seconde de réponse de l'application.
- Le distributeur présente une marge d'erreur inférieure à 1%
- Accessibilité : compatibilité avec les personnes malvoyantes (VoiceOver/TalkBack), contrastes appropriés pour les personnes daltoniennes.

---

## **5. Organisation des test et livrables**

### **5.1 Méthodologie de test**
- Des pharmaciens et des patients volontaires seront responsables des tests.
- Les retours d'expérience peuvent être obtenus en utilisant Google Forms.
- Analyse des données pour améliorer le produit avant le lancement officiel

---

### **5.2 Dates clés**
- Début des tests : À définir 
- Fin des tests : à définir.
- Analyse des résultats et corrections : à définir  

---

## **6. Résultats attendus **
- Contrôle de la fiabilité du scan des ordonnances et du système de validation
- Evaluation des améliorations à apporter à l'interface utilisateur
- Validation de la solidité du distributeur dans des conditions réelles. 
- Assurer que le système de Click & Collect fonctionne de manière fluide et que l'expérience utilisateur est satisfaisante
- Préparation des dernières optimisations avant le lancement définitif