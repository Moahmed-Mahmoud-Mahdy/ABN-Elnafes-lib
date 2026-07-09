const fs = require('fs');
const path = require('path');

function copyFolderSync(from, to) {
  try {
    fs.mkdirSync(to, { recursive: true });
    fs.readdirSync(from).forEach(element => {
      const srcPath = path.join(from, element);
      const destPath = path.join(to, element);
      const stat = fs.lstatSync(srcPath);
      if (stat.isFile()) {
        fs.copyFileSync(srcPath, destPath);
      } else if (stat.isDirectory()) {
        copyFolderSync(srcPath, destPath);
      }
    });
  } catch (err) {
    console.error(`Error copying from ${from} to ${to}:`, err);
  }
}

// Copy .next/static to .next/standalone/.next/static
const staticSrc = path.join(__dirname, '..', '.next', 'static');
const staticDest = path.join(__dirname, '..', '.next', 'standalone', '.next', 'static');
if (fs.existsSync(staticSrc)) {
  console.log(`Copying static files from ${staticSrc} to ${staticDest}...`);
  copyFolderSync(staticSrc, staticDest);
} else {
  console.warn(`Warning: Static source directory ${staticSrc} does not exist.`);
}

// Copy public to .next/standalone/public
const publicSrc = path.join(__dirname, '..', 'public');
const publicDest = path.join(__dirname, '..', '.next', 'standalone', 'public');
if (fs.existsSync(publicSrc)) {
  console.log(`Copying public files from ${publicSrc} to ${publicDest}...`);
  copyFolderSync(publicSrc, publicDest);
} else {
  console.warn(`Warning: Public source directory ${publicSrc} does not exist.`);
}

console.log('Copying completed successfully.');
