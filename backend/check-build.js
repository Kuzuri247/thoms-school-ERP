const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function getFiles(dir, files_ = []) {
  const files = fs.readdirSync(dir);
  for (const i in files) {
    const name = path.join(dir, files[i]);
    if (fs.statSync(name).isDirectory()) {
      if (!name.includes('node_modules') && !name.includes('.git')) {
        getFiles(name, files_);
      }
    } else if (name.endsWith('.js')) {
      files_.push(name);
    }
  }
  return files_;
}

console.log('Checking syntax for all backend files...');
const jsFiles = getFiles(path.join(__dirname, '.'));
let syntaxErrors = 0;

for (const file of jsFiles) {
  try {
    execSync(`node -c "${file}"`, { stdio: 'pipe' });
  } catch (err) {
    console.error(`❌ Syntax Error in ${file}:`, err.message);
    syntaxErrors++;
  }
}

if (syntaxErrors === 0) {
  console.log(`✅ All ${jsFiles.length} backend files passed syntax check cleanly!`);
} else {
  console.error(`❌ Found ${syntaxErrors} file(s) with syntax errors.`);
  process.exit(1);
}
