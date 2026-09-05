# Plan d'Implémentation PhyTera

## Objectif
Créer une interface de dashboard web moderne "PhyTera" pour l'agriculture intelligente, en mode sombre avec un style "Glassmorphism" et futuriste.

## Stack Technique
- **Framework**: React (Vite)
- **Styling**: Tailwind CSS
- **Icônes**: Lucide React
- **Graphiques**: Recharts
- **Routing**: React Router DOM
- **Cartographie**: React Leaflet + Leaflet
- **Animations**: Framer Motion

## Design System
- **Couleurs**:
    - Background: Deep Navy (`#0D1B2A`, `#101826`)
    - Accents: Neon Blue, Violet, Cyan
    - Alertes: Rouge vif pour l'urgence, Orange pour attention
    - Status: Vert pour sain, Gris pour offline
- **Effets**:
    - Glassmorphism (bg-opacity, backdrop-blur)
    - Ombres douces et colorées (Glow)
    - Bordures arrondies (rounded-2xl ou 3xl)

## Changements Proposés

### Configuration
#### [NEW] [package.json](file:///c:/Users/GLODI/Desktop/PHYTERA/package.json)
- Dépendances: `react`, `react-dom`, `react-router-dom`, `lucide-react`, `recharts`, `react-leaflet`, `leaflet`, `framer-motion`, `clsx`, `tailwind-merge`

#### [NEW] [tailwind.config.js](file:///c:/Users/GLODI/Desktop/PHYTERA/tailwind.config.js)
- Extension du thème avec les couleurs spécifiques PhyTera.

### Architecture (src/)
#### [NEW] [App.jsx](file:///c:/Users/GLODI/Desktop/PHYTERA/src/App.jsx)
- Configuration des routes (`/`, `/login`, `/map`, `/fields/:id`, `/alerts`, `/devices`, `/profile`).

#### [NEW] [Layout.jsx](file:///c:/Users/GLODI/Desktop/PHYTERA/src/Layout.jsx)
- Global Wrapper: Sidebar + Header + Outlet (Contenu dynamique).

### Composants & Pages
#### [NEW] [components/Sidebar.jsx](file:///c:/Users/GLODI/Desktop/PHYTERA/src/components/Sidebar.jsx)
- Navigation complète (Dashboard, Map, Fields, Alerts, Devices...).

#### [NEW] [pages/Dashboard.jsx](file:///c:/Users/GLODI/Desktop/PHYTERA/src/pages/Dashboard.jsx)
- Vue synthétique : Météo, Indicateur Santé, Résumés.

#### [NEW] [pages/MapView.jsx](file:///c:/Users/GLODI/Desktop/PHYTERA/src/pages/MapView.jsx)
- Carte via Leaflet affichant les parcelles (polygones colorés).

#### [NEW] [pages/FieldDetails.jsx](file:///c:/Users/GLODI/Desktop/PHYTERA/src/pages/FieldDetails.jsx)
- Détails d'un champ : Graphiques Recharts, Jauges.

#### [NEW] [pages/Alerts.jsx](file:///c:/Users/GLODI/Desktop/PHYTERA/src/pages/Alerts.jsx)
- Liste des alertes et recommandations IA.

#### [NEW] [pages/Devices.jsx](file:///c:/Users/GLODI/Desktop/PHYTERA/src/pages/Devices.jsx)
- Gestion des boîtiers IoT.

#### [NEW] [pages/Login.jsx](file:///c:/Users/GLODI/Desktop/PHYTERA/src/pages/Login.jsx)
- Page d'authentification.

## Plan de Vérification
### Vérification Visuelle
- Lancer le serveur de développement (`npm run dev`).
- Vérifier la conformité avec les directives de style (Dark mode, Glassmorphism).
- Tester la réactivité (Layout Grid).
