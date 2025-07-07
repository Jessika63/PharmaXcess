
# **BETA TEST PLAN – PHARMAXCESS**

## **1. Introduction**

### **1.1 Contexte du projet**

PharmaXcess, un distributeur automatique de médicaments, est disponible sans interruption, 24h/24 et 7j/7, pour permettre aux patients d'accéder à leurs médicaments à tout moment. Il est installé à l'extérieur des pharmacies, fonctionne comme un distributeur automatique de billets tout en garantissant la sécurité des médicaments, qui sont acheminés via un système pneumatique depuis les réserves des pharmacies. En supplément, une application compagnon permet aux utilisateurs de suivre leur consommation de médicaments, de gérer leurs ordonnances (par exemple, dates de renouvellement), localiser les distributeurs les plus proches, utiliser un système de Click & Collect en envoyant leur ordonnance à un pharmacien, et bénéficier d'un chat en temps réel avec un professionnel de santé.

---

### **1.2 Objectifs du beta test plan**

Ce beta-test plan vise à évaluer la stabilité, l'efficacité et la convivialité du distributeur PharmaXcess ainsi que son application mobile. Cela facilitera la détection d'éventuelles erreurs et l'adaptation du produit avant sa mise en place à grande échelle. 

---

## **2. Contexte et chiffres clés**
La France continue de faire face à une inégalité d'accès aux médicaments, en particulier en dehors des heures d'ouverture habituelles et dans les zones rurales. Voici quelques données importantes qui illustrent cette observation : 

--- 

### **2.1 Fermetures et accès limité**
- Le nombre de pharmacies d'officine en France a chuté de manière constante depuis plusieurs années, atteignant 19 966 en 2023. 
- Chaque année, il y a environ 210 phaemacies qui ferment, dont 236 en 2023. Les fermetures touchent surtout les régions rurales, ce qui fait que certains villages ne sont pas munis de pharmacies. 
- Environ 5% des communes françaises, soit environ 1 701, ne possèdent pas de pharmacie, même si leur population est assez importante pour en avoir une.
- Environ 30% des pharmacies sont fermées le samedi après-midi, et seules quelques pharmacies de garde sont ouvertes la nuit ou les jours fériés. 

---

### **2.2 Accessibilité géographique**
- En zone rurale, il est courant d'avoir une distance moyenne de 15 à 20 km entre deux pharmacies.
- Sur l'ensemble du territoire, la distance moyenne à parcourir pour se rendre à une pharmacie s'élève à 3,8km. 
- Il arrive que certains résidents soient contraints de faire des trajets aller-retour de plus de 40km pour se rendre à une pharmacie de garde.
- Il peut arriver que certaines structures hospitalières rurales soient éloignées des pharmacies de garde, ce qui oblige les patients à effectuer de longs déplacements après une hospitalisation pour récupérer leurs médicaments. 

---

### **2.3 Conséquences pour les patients** 
- Environ un Français sur cinq a décidé de ne pas récupérer un médicament en raison de la fermeture ou de l'éloignement d'une pharmacie. 
- Cette situation a un impact particulièrement négatif sur : 
    - Les personnes âgées,
    - Celles qui ne disposent pas de moyen de transport, 
    - Et les situations urgentes en dehors des heures de travail habituelles.

Ces chiffres renforcent l'intérêt d'une solution comme PharmaXcess, qui propose un accès aux médicaments 24h/24 et 7j/7 via des distributeurs connectés installés directement sur les façades de pharmacie, combinés à une application mobile permettant la géolocalisation, la gestion des ordonnances et le suivi personnalisé.

--- 

## **3. Sélection des fonctionnalités clés**

### **3.1 Distributeur**
- Extraction des informations nécessaires à partir du scan de l'ordonnance. 
- Vérification de l'authenticité de l'ordonnance.
- Validation et autorisation pour la distribution des médicaments.
- Prise en charge des situations où le médicament n'est pas disponible (commande ultérieure ou transfert vers une autre pharmacie). 

---

### **3.2 Application**
- Utilisation du système de Click & Collect pour prendre des photos de l'ordonnance, l'envoyer au pharmacien et recevoir un QR code.
- Localisation des distributeurs et calcul d'itinéraires.
- Assurer la gestion des médicaments en fournissant des rappels de prise.
- Historique des ordonnances et alertes relatives à leur renouvellement. 
- Discussion en temps réel avec un professionnel de santé.

---

## **4. Couverture des parcours utilisateurs clés**

### **4.1 Parcours n°1 : Utilisateur patient**
- Ouvre l'application PharmaXcess. 
- Prendre une photo de son ordonnance en utilisant l'option Click & Collect. 
- Transfère l'image au pharmacien.
- Reçoit une validation par notification et un QR code. 
- Se déplace jusqu'au distributeur le plus proche. 
- Scanne son QR code.
- Récupère les médicaments.

L'objectif est de vérifier que l'utilisateur est capable d'effectuer tout le processus de manière fluide et sans assistance. 
Cas particulies couverts :

- Ordonnance floue -> une nouvelle photo est demandée.
- Ordonnance non reconnue -> notification d'alerte et contact du pharmacien. 
- Médicament non disponible -> redirection vers la pharmacie ou commande différée.

---

### **4.2 Parcours n°2 : Pharmacien**
- Reçoit une ordonnance via l'application. 
- Vérification de l'authenticité de l'ordonnance.
- La demande peut être acceptée ou refusée.
- Laisse un commentaire si elle est refusée. 
- Valide l'envoi de médicaments via le distributeur.

L'objectif est de s'assurer que la validation se déroule rapidement, de manière sécurisée et de manière traçable. 

---

### **4.3 Cas d'erreur (ordonnance illisble)**
- Une ordonnance floue est utilisée par l'utilisateur. 
- L'image est refusée par le système qui demande une nouvelle tentative. 
- En cas de difficulté à lire l'ordonnance après plusieurs essais, une alerte est envoyée au pharmacien.

L'objectif est de s'assurer que les erreurs de l'utilisateur sont gérées de manière claire et rassurante.

---

### **4.4 Parcours n°4 : Médicament non remboursé ou à paiement requis**
- L'utilisateur procède au scan d'une ordonnance incluant un médicament non remboursé, ou sélectionne un médicament sans ordonnance.
- L'application/le distributeur lui indique le montant à régler. 
- Un système de paiement sécurisé est intégré sur le distributeur. 
- Récupération des médicaments au distributeur après validation du paiement.

L'objectif est de vérifier que le processus d'information, de paiement et de retrait d'un médicament non remboursé est fluide, clair et sécurisé, qu'une ordonnance soit présente ou non. Il est essentiel que l'utilisateur comprenne facilement qu'un paiement est requis, puisse le faire sans assistance, et puisse obtenir un QR code pour finaliser le retrait au distributeur.

--- 

## **5. Définition des scénarios de test**

### **5.1 Scénarios pour le distributeur**
| **Scénario** | **Etapes** | **Résultat attendu** |
|--------------|---------------|------------------------|
| Vérification et validation de l'ordonnance    | Insertion de l'ordonnance -> scan -> vérification OCR + authenticité  | Si l'ordonnance est authentique, elle est considérée comme valide et reconnue |
| Ordonnance non lisible    | Ordonnance floue ou endommagée | Un message d'erreur se présente, accompagné d'une requête pour réessayer  |
| Médicament indisponible  | Ordonnance valide mais stock épuisé  | Il est recommandé de passer la commande du médicament ou de se rendre dans une autre pharmacie  |
| Retrait des médicaments    | QR code scanné -> délivrance | L'utilisateur à la possibilité de récupérer son médicament et son ordonnance  |
| Affichage de conseils | Reconnaissance médicament -> affichage d'un message d'accompagnement | Conseil affiché automatiquement, approuvé par un professionnel de santé | 

---

### **5.2 Scénarios pour l'application**
| **Scénario** | **Etapes** | **Résultat attendu** |
|--------------|---------------|------------------------|
| Click & Collect  | Prise de photo -> envoi au pharmacien -> QR code | L'ordonnance a été analysée et validée. Un QR code a été généré |
| Ordonnance floue | Photo floue -> rejet  | Nouvelle tentative demandée   |
| Localisation des distributeurs | Recherche -> affichage -> itinéraire  | La localisation du distributeur le plus proche est indiquée en indiquant le chemin d'accès  |
| Discussion avec un spécialiste  | Message envoyé -> réponse reçue | La réponse de l'utilisateur est transmise instantanément  |
| Paiement d'un médicament | Ordonnance reçue -> médicament non remboursée -> paiement | Le paiement a été approuvé |

---

## **6. Critères d'évaluation**

### **6.1 Critères de succès pour le distributeur**
- La numérisation et l'analyse de l'ordonnance sont effectuées avec une précision remarquable. 
- La vérification d'authenticité est extrêmement efficace (aucune ordonnance frauduleuse n'a été acceptée). 
- Garantir la livraison et l'acheminement sans erreur des médicaments. 
- En cas d'indisponibilité, une solution de remplacement adéquate est suggérée.

--- 

### **6.2 Critères de succès pour l'application** 
- L'ordonnance a été envoyée et approuvée dans un délai convenable. 
- Le distributeur a reconnu le QR code qui a été généré.
- Interface simple à appréhender et intuitive. 
- Les fonctionnalités de localisation et de chat sont fonctionnelles. 

--- 

## **7. Nos métriques de performance et de qualité**
Afin de mesurer la robustesse et la réactivité du système, nous avons mis en place plusieurs critères de référence.

--- 

### **7.1 Temps de traitement** 
- Dans 95% des cas, le distributeur doit respecter un délai de traitement de 5 minutes pour l'analyse OCR et la validation logicielle. 
- Il n'est pas possible de contraindre la validation d'une ordonnance à un temps de traitement humain (par exemple pharmacien). Nous ne nous engageons donc pas à respecter un délai strict pour cette partie, mais à suivre la durée moyenne pour l'analyse. 

--- 

### **7.2 Réactivité logicielle**
- Il est nécessaire que les actions des utilisateurs dans l'application se déroulent en moins de 500 millisecondes. 
- L'ouverture des principales fonctionnalités (Click & Collect, Chat, Historique) doit ête instantanée (<1 seconde).

--- 

### **7.3 Marge d'erreur acceptable (bêta)**
- Il est permis de faire une marge d'erreur maximale de 10% pendant la phase bêta. 
- Parmi les éléments inclus dans cette marge, on peut citer :
    - Les erreurs commises lors de la lecture OCR, 
    - Les ordonnances non reconnues en raison de leur incomplétude ou de leur non-conformité, 
    - De même que les rejets automatiques de documents non conformes.

--- 

## **8. Accessibilité et design inclusif**
Nous nous engageons à respecter les recommandations du RGAA (Référentiel Général d'Amélioration de l'Accessibilité) pour créer une expérience inclusive pour tous les utilisateurs, en concevant l'application et l'interface du dispositif physique.
Les handicaps visés et les mesures qui y sont liées sont les suivants : 

--- 

### **8.1 Déficiences visuelles** 
- Compatibilité requise pour VoiceOver (iOS) et TalkBack (Android). 
- Les boutons sont accompagnés d'une navigation vocale et d'un retour audio. 
- Textes descriptifs alternatifs pour les icônes. 

--- 

### **8.2 Daltonisme et troubles de la vision des couleurs** 
- Les contrastes ont été renforcés et testés en utilisant des simulateurs.
- Les couleurs ne sont pas utilisées comme seule source d'information. 

--- 

### **8.3 Dyslexie et troubles DYS** 
- Utilisation de polices qui sont facilement lisibles et adaptées. 
- Eviction des polices scriptes, italique ou compactes. 

--- 

### **8.4 Déficiences motrices**
- Utilisation d'un clavier et de commandes vocales pour une navigation optimisée. 
- Les zones tactiles sont larges et bien espacées.

--- 

### **8.5 Pourquoi c'est essentiel ?** 
En France, 12 millions de personnes sont touchées par un handicap permanent ou temporaire. Pour ces usagers, il est crucial de pouvoir se procurer des médicaments de manière autonome et sans discrimination, car cela concerne la santé publique. PharmaXcess est accessible à tous, dans toutes les situations.

--- 

## **9. Conformité légale et confidentialité** 
PharmaXcess a été élaboré pour respecter les exigences réglementaires françaises et européennes en ce qui concerne la délivrance de médicaments sur ordonnance, tout en intégrant des innovations technologiques pour rendre le processus plus fluide.

--- 

### **9.1 Délivrance automatisée via OCR** 
- En France, il est obligatoire d'obtenir l'approbation d'un pharmacien avant de délivrer des médicaments sur ordonnance.
- Afin de respecter cette contrainte avec l'automatisation, PharmaXcess a recours à un système OCR (Reconnaissance Optique de Caractères), développé à partir de données validées par des pharmaciens agréés. 
- De cette manière, le logiciel du distributeur peut vérifier l'authenticité, la conformité et la validité des ordonnances de manière autonome, sans avoir à contacter un pharmacien en personne à chaque livraison.
- Cette approche est en accord avec l'obligation de validation a priori, tout en assurant un service disponible 24h/24.

--- 

### **9.2 Conseil client automatisé**
- En cas de besoin d'assistance ou d'information, des recommandations sur l'utilisation appropriée des médicaments sont affichées directement sur l'interface du distributeur, après avoir reconnu l'ordonnance.
- Les messages sont générés automatiquement en fonction du médicament délivré et sont préalablement approuvés par des pharmaciens.
- Grâce à ce système, il est possible d'obtenir une information claire et vérifiée, même sans être en contact direct avec des personnes. 

--- 

### **9.3 Sécurité et confidentialité (RGPD)** 
- Le respect du Réglement Général sur la Protection des Données (RGPD) est une obligation pour toutes les données de santé.
- Le chiffrement, le stockage sécurisé et la confidentialité des ordonnances et données personnelles sont des précautions indispensables pour éviter toute transmission sans consentement explicite de l'utilisateur. 
- Chaque interaction est suivie de manière fiable grâce à une traçabilité assurée, offrant ainsi un historique clair et sécurisé en cas de contrôle ou de suivi.

--- 

## **10. Compatibilité des systèmes de distribution**
Environ 92% des pharmacies en France ont recours à des systèmes de distribution internes tels que des pneumatiques ou des toboggans. Afin de garantir une intégration simple et rapide, notre solution a été spécialement conçue pour s'interfacer avec ces deux systèmes.
Il n'est pas prévu que nous prenions en charge les autres systèmes moins courants à ce stade.

--- 

## **11. Veille réglementaire et interopérabilité logicielle** 
Nous avons commencé une surveillance active des logiciels de gestion utilisés par les pharmacies pour garantir leur compatibilité avec ntre solution. Concernant les aspects légaux, nous envisageons de nous rapprocher d'associations spécialisées (telles que "60 millions de consommateurs" ou "que choisir") ou de juristes experts en droit de la santé, pour sécuriser juridiquement notre démarche de distribution automatisée de médicaments. Il est crucial de bénéficier de l'accompagnement de professionnels car le droit médical est spécifique et complexe.

--- 

## **12. Considérations financières et matérielles**
Pour mettre en place le prototype, il faut prévoir un investissement initial modéré. Le système de test prévu pour l'été 2025 fonctionne avec une solution Raspberry Pi avec écran intégra, installée à l'intérieur de la pharmacie, sans nécessiter de modifications structurelles du bâtiment (par exemple perçage de mur). En utilisant cette approche, nous pourrons prouver la validité du concept dans des conditions réelles, tout en respectant les contraintes techniques et réglementaires.

--- 

### **12.1 Côuts estimés :** 
- Le prix pour un Raspberry Pi avec écran et boîtier est de 120€.
- Travail de développement logiciel interne au sein de l'équipe. 
- Le coût de l'affichage et du support est de 30€. 
- La connexion sécurisée entre l'application et le serveur de la pharmacie est sujette à des variations selon le système logiciel utilisé (à améliorer après la phase de veille).

--- 

## **13. Mise en place du test en pharmacie**
Notre phase de test bêta respose en grande partie sur la pharmacie. 
Pour le démarrage de la phase de test bêta, il est impératif : 

- Il est nécessaire d'obtenir l'accord d'une pharmacie pour héberger le système de démonstration, comprenant un écran et un Raspberry.
- Posséder un prototype logiciel en état de marche sur la Raspberry. 
- Même si le distributeur physique n'est pas encore là, il est essentiel de pouvoir montrer une validation réelle de l'ordonnance sur l'interface.

Il est prévu de mettre en place un plan d'installation simple, sans perçage de mur, dans le but de démontrer pleinement la fonctionnalité à partir de l'été 2025.

--- 

## **14. Recrutement des testeurs bêta**
Deux axes seront suivis pour recruter des bêta-testeurs : 

- Obtenir un accord de principe avec une ou plusieurs pharmacies partenaires. Cela est essentiel car la pharmacie est au coeur de notre phase de test. 
- Recruter des patients intéressés par le projet via des publications locales, réseaux sociaux ou en partenariat avec les pharmacies elles-mêmes.

Ces testeurs permettront de valider aussi bien le logiciel embarqué que l'application mobile en conditions réelles.

--- 

## **15. Etude de cas utilisateur (scénario fictif)**

### **15.1 Etude de cas fictive - Julie, 74 ans** 
Julie vit dans un petit village, à 18km de la pharmacie la plus proche. Elle se sert de PharmaXcess pour envoyer l'ordonnance de son médicament contre l'hypertension. Julie reçoit un QR code après que le pharmacien ait validé la prescription. Le soir venu, elle effectue le scan du QR code sur le distributeur qui est situé sur la façade de la pharmacie de son village. Elle peut récupérer son traitement sans attendre, sans se déplacer longtemps et sans ressentir de stress. 

--- 

### **15.2 Etude de cas fictive 2 - Nicolas, 33 ans, salarié**
Nicolas est un employé du secteur de la restauration et achève habituellement ses journées après 21h, c'est-à-dire après la fermeture des pharmacies.Jusqu'à présent, il avait la possibilité de se dépêcher d'y aller pendant ses pauses ou d'attendre jusqu'au samedi matin. Grâce à PharmaXcess, il est maintenant en mesure de récupérer ses médicaments à la sortie du travail, sans stress ni contraintes horaires. 

Les études de cas fictives permettent d'illustrer de manière concrète l'impact concret que le projet peut avoir sur la vie quotidienne des utilisateurs, y compris les populations vulnérables ou isolées.

--- 

## **16. Organisation des tests et livrables**

### **Méthodologie de test**
- La responsabilité des tests sera assumée par des pharmaciens et des
patients volontaires.
- Il est possible d'obtenir des retours d'expérience en utilisant Google Form.
- Avant le lancement oƯiciel, il est important d'analyser les données pour
améliorer le produit.

--- 

### **Dates clés**
- Début des essais prévu pour l'été 2025.
- Les tests seront terminés d'ici la fin de l'année 2025.
- Analyse des résultats et corrections : pendant toutes les phases de test.

--- 

## **17. Résultats attendus**
- Vérification de la fiabilité du scan des ordonnances et du système de
validation.
- Évaluation des améliorations à eƯectuer sur l'interface utilisateur.
- Évaluation de la solidité du distributeur dans des conditions réelles.
- S'assurer que le système de Click & Collect fonctionne correctement et
que l'expérience utilisateur est satisfaisante.
- Préparation des dernières optimisations avant le démarrage définitif.

---
