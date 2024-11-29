# Retro Gaming Cup 🏆

Une compilation de jeux rétro incluant Pong et Space Invaders, avec un système de classement et de temps limité !

## Prérequis 🛠️

- Node.js (v16 ou supérieur)
- npm (v7 ou supérieur)
- Un navigateur web moderne (Chrome, Firefox, Safari, Edge)

## Installation 🚀

1. Clonez le repository :
```bash
git clone https://github.com/ChukyFredj/A-simple-compilation-retro-gaming
cd A-simple-compilation-retro-gaming
```

2. Installez les dépendances :
```bash
npm install
```

3. Lancez le jeu en mode développement :
```bash
npm run dev
```

4. Ouvrez votre navigateur et accédez à :
```
http://localhost:5173
```

## Technologies utilisées 💻

- React
- Three.js / React Three Fiber
- Framer Motion
- TailwindCSS
- Vite

## Fonctionnalités 🎮

- 2 jeux rétro : Pong et Space Invaders
- Système de classement pour chaque jeu
- Session limitée à 1 heure
- Musiques et effets sonores
- Animations et effets visuels
- Mode champion avec trophée spécial

## Structure des fichiers 📁

```
src/
  ├── components/     # Composants réutilisables
  ├── pages/         # Pages principales
  ├── assets/        # Ressources statiques
  └── App.jsx        # Point d'entrée
```

## Commandes disponibles 📝

- `npm run dev` : Lance le serveur de développement
- `npm run build` : Crée une version de production
- `npm run preview` : Prévisualise la version de production

## Notes importantes ⚠️

- Assurez-vous d'avoir le son activé pour une meilleure expérience
- La session dure 1 heure, pensez à sauvegarder vos scores !
- Pour devenir champion, vous devez être #1 dans les deux jeux
