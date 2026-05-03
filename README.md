# WishCraft

WishCraft is a React app for creating, editing, browsing, and sharing digital greeting cards.

## Features

- Greeting card editor with upload, crop, text, watermark, and sharing tools
- Browseable card templates for birthdays, anniversaries, festivals, and loved ones
- Firebase authentication, Firestore, and Storage integration
- Responsive React interface for desktop and mobile

## Tech Stack

- React 18
- Create React App
- Firebase
- html2canvas
- react-easy-crop
- Axios

## Project Structure

```text
wishcraft/
├── public/
│   ├── images/
│   ├── wishcraft_templates/
│   ├── index.html
│   └── templateMap.json
├── src/
│   ├── components/
│   ├── fonts/
│   ├── hooks/
│   ├── App.jsx
│   ├── App.css
│   ├── firebase.js
│   └── index.js
├── documents/
├── classify-image.py
├── generate-cards.py
├── package.json
└── package-lock.json
```

## Setup

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env
```

Fill in the Firebase values in `.env`.

## Scripts

Start the development server:

```bash
npm start
```

Build for production:

```bash
npm run build
```

Run tests:

```bash
npm test
```

## GitHub Push

After creating an empty GitHub repository:

```bash
git remote add origin <github-repo-url>
git push -u origin main
```

## License

No license has been selected yet. Until a license is added, all rights are reserved by default.
