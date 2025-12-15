const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist');
const fontsSourcePath = path.join(distDir, 'assets', 'node_modules', '@expo', 'vector-icons', 'build', 'vendor', 'react-native-vector-icons', 'Fonts');
const fontsDestPath = path.join(distDir, 'assets', 'fonts');

// Copy fonts to a shorter path
if (fs.existsSync(fontsSourcePath)) {
  if (fs.existsSync(fontsDestPath)) {
    fs.rmSync(fontsDestPath, { recursive: true });
  }
  fs.mkdirSync(fontsDestPath, { recursive: true });

  const files = fs.readdirSync(fontsSourcePath);
  for (const file of files) {
    fs.copyFileSync(path.join(fontsSourcePath, file), path.join(fontsDestPath, file));
  }
  console.log(`Copied ${files.length} font files to assets/fonts`);

  // Remove the old node_modules folder
  fs.rmSync(path.join(distDir, 'assets', 'node_modules'), { recursive: true });
  console.log('Removed assets/node_modules');
}

// Update all HTML and JS files to reference the new fonts path
const oldPath = '/assets/node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/';
const newPath = '/assets/fonts/';

function updateFiles(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      updateFiles(filePath);
    } else if (file.endsWith('.html') || file.endsWith('.js')) {
      let content = fs.readFileSync(filePath, 'utf8');
      const updated = content.split(oldPath).join(newPath);
      if (content !== updated) {
        fs.writeFileSync(filePath, updated);
        console.log(`Updated: ${filePath}`);
      }
    }
  }
}

updateFiles(distDir);
console.log('Done fixing web assets');
