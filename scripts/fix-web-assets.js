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

  // Ensure important images from the repo are copied into the exported `dist`.
  // This preserves files like `intersections-logo-v2.png` and any hashed variants
  // the exporter referenced (e.g. intersections-logo-v2.<hash>.png).
  const imagesSourceDir = path.join(__dirname, '..', 'assets', 'images');
  const imagesDestDir = path.join(distDir, 'assets', 'images');

  function findReferencedImageNames(prefix) {
    const names = new Set();

    function walk(dir) {
      const items = fs.readdirSync(dir);
      for (const it of items) {
        const p = path.join(dir, it);
        const st = fs.statSync(p);
        if (st.isDirectory()) {
          walk(p);
        } else if (p.endsWith('.html') || p.endsWith('.js')) {
          const content = fs.readFileSync(p, 'utf8');
          const re = new RegExp(prefix + '(?:\\.[a-f0-9]{8,64})?\\.png', 'g');
          let m;
          while ((m = re.exec(content)) !== null) names.add(m[0]);
        }
      }
    }

    if (fs.existsSync(distDir)) walk(distDir);
    return Array.from(names);
  }

  if (fs.existsSync(imagesSourceDir)) {
    if (!fs.existsSync(imagesDestDir)) fs.mkdirSync(imagesDestDir, { recursive: true });

    const srcFiles = fs.readdirSync(imagesSourceDir).filter(f => f.toLowerCase().endsWith('.png'));
    for (const srcFile of srcFiles) {
      const base = srcFile.replace(/\.png$/i, '');

      // copy plain filename
      try { fs.copyFileSync(path.join(imagesSourceDir, srcFile), path.join(imagesDestDir, srcFile)); } catch (e) {}

      // find any hashed variants referenced in dist and copy to those names as well
      const referenced = findReferencedImageNames(base);
      for (const name of referenced) {
        try {
          fs.copyFileSync(path.join(imagesSourceDir, srcFile), path.join(imagesDestDir, name));
          console.log(`Copied image ${name} to assets/images`);
        } catch (e) {
          // ignore copy errors
        }
      }
    }
  }

// Update all HTML and JS files to reference the new fonts path.
// We handle two cases:
// 1) prefixed paths like `/assets/node_modules/.../Fonts/`
//    — we preserve the leading base and replace
//    the trailing `assets/node_modules/.../Fonts/` with `assets/fonts/`.
// 2) plain `node_modules/.../Fonts/` references.
const fontsPathRegexWithAssets = /(\/[^"]+?)?assets\/node_modules\/@expo\/vector-icons\/build\/vendor\/react-native-vector-icons\/Fonts\//g;
const fontsPathRegexPlain = /node_modules\/@expo\/vector-icons\/build\/vendor\/react-native-vector-icons\/Fonts\//g;

function replaceFontPathsInContent(content) {
  // Preserve an optional leading base path when present.
  content = content.replace(fontsPathRegexWithAssets, (match, basePrefix) => {
    return (basePrefix || '') + 'assets/fonts/';
  });

  // Replace any remaining plain node_modules references.
  content = content.replace(fontsPathRegexPlain, 'assets/fonts/');

  // Collapse accidental duplicate `assets/assets/` into a single `assets/`.
  content = content.replace(/assets\/assets\//g, 'assets/');

  return content;
}

function updateFiles(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      updateFiles(filePath);
    } else if (file.endsWith('.html') || file.endsWith('.js')) {
      let content = fs.readFileSync(filePath, 'utf8');
      const updated = replaceFontPathsInContent(content);
      if (content !== updated) {
        fs.writeFileSync(filePath, updated);
        console.log(`Updated: ${filePath}`);
      }
    }
  }
}

updateFiles(distDir);
console.log('Done fixing web assets');
