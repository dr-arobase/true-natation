require('dotenv').config();
const app = require('./src/app');
const { createTables } = require('./src/config/db');
const { port } = require('./src/config/config');

createTables()
  .then(() => {
    const server = app.listen(port, () => {
      console.log(`Serveur natation démarré sur le port ${port}`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`\n❌ Le port ${port} est déjà utilisé.`);
        console.error(`   Ferme le terminal précédent ou tue le process :`);
        console.error(`   PowerShell: Stop-Process -Id (Get-NetTCPConnection -LocalPort ${port} -State Listen).OwningProcess -Force\n`);
        process.exit(1);
      } else {
        throw err;
      }
    });
  })
  .catch((err) => {
    console.error('Erreur au démarrage :', err);
    process.exit(1);
  });
