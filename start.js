const { exec } = require('child_process');
const path = require('path');

// Définir les chemins absolus
const laravelPath = path.resolve(__dirname, '../ckdcare/back');
const nextjsPath = path.resolve(__dirname, '../ckdcare/project');

// Démarrer le serveur Laravel
const laravelProcess = exec(`php artisan serve`, { cwd: laravelPath });

laravelProcess.stdout.on('data', (data) => {
//   console.log(`Serveur Laravel démarré à: http://127.0.0.1:8000`);
  console.log(`Serveur Laravel: ${data}`);
});

laravelProcess.stderr.on('data', (data) => {
  console.error(`Erreur Serveur Laravel: ${data}`);
});

// Démarrer le serveur Next.js
const nextjsProcess = exec(`npm run dev`, { cwd: nextjsPath });

nextjsProcess.stdout.on('data', (data) => {
//   console.log(`Serveur Next.js démarré à: http://localhost:3000`);
  console.log(`Serveur Next.js: ${data}`);
});

nextjsProcess.stderr.on('data', (data) => {
  console.error(`Erreur Serveur Next.js: ${data}`);
});
