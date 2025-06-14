# 📱 Front-end Mobile Application

This repository contains the **front-end mobile part** of the project.  
It is built with **React Native** and **TypeScript**, and is responsible for the mobile user interface, navigation, internationalization, and accessibility.

---

## 🚀 Quick Start

### ✅ Prerequisites
- Node.js (Recommended version: 18.x.x or later)
- npm
- Expo CLI (if applicable)

### 🔧 Installation

#### Install project dependencies
```bash
npm install
```
### ▶️ Running the Mobile Front-end

```bash
npm start
```

You can run the application:

- On a physical device using the Expo Go app.
- On Android or iOS simulators.

---

## 🗂️ Project Structure

```
.
├── app.json
├── App.tsx
├── babel.config.js
├── package.json
├── package-lock.json
├── scripts/
├── src/
│   ├── accessibility/
│   ├── assets/
│   ├── components/
│   ├── context/
│   ├── hooks/
│   ├── locales/
│   ├── navigation/
│   ├── screens/
│   ├── services/
│   └── styles/
├── tsconfig.json
```

### 📦 Folder Overview

| Folder            | Description                                                          |
| ----------------- | -------------------------------------------------------------------- |
| **accessibility** | Accessibility settings and screen reader configuration               |
| **assets**        | Static resources (fonts, images)                                     |
| **components**    | Reusable UI components                                               |
| **context**       | Global state management (themes, language, font size, accessibility) |
| **hooks**         | Custom React hooks                                                   |
| **locales**       | Translation files (English and French)                               |
| **navigation**    | Application navigation setup using React Navigation                  |
| **screens**       | Application screens and their styles                                 |
| **services**      | API calls and authentication services                                |
| **styles**        | Global styles and color definitions                                  |

---

## 🌍 Internationalization (i18n)

The mobile front-end supports **multiple languages: English and French.**
Translation files are located in the `src/locales` folder and managed via the `i18n.ts` configuration.

---

## 🎨 Accessibility

The project integrates:

* **Screen reader support**
* **Font scaling management**
* **Accessibility contexts** to improve usability for visually impaired users

---

## ✅ Best Practices

* TypeScript for strong type safety
* Modular folder structure by feature
* Reusable and isolated components
* Global state management using Context API
* Internationalization and accessibility support

---

## 🛠️ Available Scripts

#### Start the development server
```bash
npm start
```

#### Run the app on Android
```bash
npm run android
```

#### Run the app on iOS
```bash
npm run ios
```

#### Run with the tunnel mode
```bash
npm run start:tunnel
```

*(Update or remove scripts depending on your project setup)*
