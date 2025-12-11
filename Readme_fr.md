# PharmaXcess

## Présentation

Notre idée est de créer un distributeur intégré à la devanture de la pharmacie (similaire aux bancomats dans les banques) accompagné d'une application complémentaire.

Ces distributeurs auront deux objectifs. Une fois connectés au système de distribution de médicaments, ils pourront délivrer des médicaments avec ou sans ordonnance :

- Sans ordonnance : Les clients peuvent sélectionner les médicaments souhaités et les acheter directement.
- Avec ordonnance : Les clients peuvent scanner leur ordonnance, carte vitale et carte d'identité. L'ordonnance sera traitée, et les médicaments listés seront délivrés.

L'application fournira plusieurs fonctionnalités, incluant :

- Localiser les distributeurs à proximité
- Commander des médicaments via click-and-collect
- Valider des ordonnances
- Suivre les traitements
- Recevoir des alertes pour les prises de médicaments
- Et maintenir un dossier de santé patient

## Backend

Vous pouvez trouver toutes les informations **Backend** [dans ce readme](backend/Readme_fr.md)

## Frontend Distributeur (Dispenser Frontend)

Vous pouvez trouver toutes les informations **Dispenser Frontend** [dans ce readme](dispenser_frontend/README_fr.md)

## App

Vous pouvez trouver toutes les informations **App** [dans ce readme](pharmaXcess_app/README.md)

## Commun

### Documentation

Vous pouvez trouver toutes les informations **Documentation** [dans ce readme](docs/Readme_fr.md)

### Lancement (Launch)

Vous pouvez trouver toutes les informations **Lancement** [dans ce readme](Launch_Readme_fr.md)

### Pre-commit

#### Installation

Installez tout pour pre-commit avec cette ligne de commande :

```bash
bash backend/scripts/pre-commit/install_pre-commit.sh
```

Vous n'avez besoin d'exécuter cette commande qu'une seule fois

#### Essayer

Essayez pre-commit avec cette ligne de commande :

```bash
pre-commit run --all-files
```

Vous pouvez exécuter cette commande autant de fois que vous le souhaitez

## Plan de Test Bêta

Vous pouvez trouver notre **Plan de Test Bêta** [dans ce readme](beta_test_plan.md)

## Contact

Contactez l'équipe : <contact.pharmaxcess@gmail.com>
