/**
 * Génère automatiquement public/version.json avant chaque build
 * pour permettre le hot-reload et l'auto-mise à jour transparente
 * sur Web, PWA et conteneur mobile Android.
 */
const fs = require('fs');
const path = require('path');

try {
  let gitCommit =
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA;

  if (!gitCommit) {
    try {
      const { execSync } = require('child_process');
      gitCommit = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
    } catch {
      gitCommit = 'build-' + Date.now();
    }
  }

  const buildData = {
    version: gitCommit,
    buildTime: Date.now(),
    buildDate: new Date().toISOString(),
  };

  const publicDir = path.join(__dirname, '..', 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const versionPath = path.join(publicDir, 'version.json');
  fs.writeFileSync(versionPath, JSON.stringify(buildData, null, 2), 'utf8');
  console.log('[Auto-Update] version.json généré avec succès :', buildData);

  // Synchronisation avec les assets Android si présents
  const androidAssetsPublic = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'assets', 'public');
  if (fs.existsSync(androidAssetsPublic)) {
    fs.writeFileSync(path.join(androidAssetsPublic, 'version.json'), JSON.stringify(buildData, null, 2), 'utf8');
    console.log('[Auto-Update] version.json synchronisé avec Android assets.');
  }
} catch (err) {
  console.warn('[Auto-Update] Erreur lors de la génération de version.json :', err);
}

