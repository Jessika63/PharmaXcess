
# Frontend

## Prerequisites

You need to install:

- Docker: 27.2.0
- Docker Compose: v2.29.2

### Installation

You can install all prerequisites with [this script](./prerequisites/install_prerequisites.sh) or follow [this readme](./prerequisites/Prerequisites.md)

## Launching

### [STEP 1] install packages

To install all dependencies in package.json you need to use this command:

```bash
npm install
```

### [STEP 2] run docker

To run the front-end you need to use this command:

```bash
docker-compose up --build
```

#### If you encounter that kind of error

```bash
react-app-distributeur@0.1.0 start /app
> react-scripts start
sh: 1: react-scripts: not found
```

here is how to solve:

```bash
rm -rf node_modules package-lock.json
npm install
docker-compose down
docker-compose up --build
```

### finished

your app should be running, 'happy dev!'

## Back to general **distributeur** documentation

The general **distributeur** documentation is available at [here](../Readme.md)


## Code configuration

### /pages directory

Every screens from the app is organized inside the 'page'

- documents_checking.js => on this page will be gathered the scanning of the 3 documents: id, insurance card, and prescription. It uses camera_component and also modal_camera as displaying
- non_prescription_drugs.js => lists all the drugs fetched from the backend API. It uses modal_standard for the display of the drugs.
- payment_failed.js => Payment failed page.
- drug_unavailable.js => When a drug is not available ; Give choice of action between going back to non_prescription_drugs page, or the checking of the nearby pharmacies (drug_stores_available).
- drug_stores_available.js => page used for the displaying of all the pharmacies around. It calls the informations from backend directly.

### /components directory

The 'components' directory is used to store every feature wich will be used inside of a page (for example camera component)

- camera_component.js => used for displaying and using the user's device's camera, including taking a photo with possibility of retake + graphical displaying
- modal_standard.js => creates a modal and is mainly used for drugs displaying (in non_prescription_drugs.js)
- modal_camera.js => modal created for camera displaying only

### Styles

There is a css folder for main global styles such as buttons ;
BUT tailwind is mainly used inside of this project