const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function getAllJsFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file === 'node_modules' || file === '.git') continue;
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      getAllJsFiles(filePath, fileList);
    } else if (file.endsWith('.js')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const backendDir = __dirname;
const jsFiles = getAllJsFiles(backendDir);
console.log(`Verifying syntax for ${jsFiles.length} backend JavaScript files...`);

let hasError = false;
for (const file of jsFiles) {
  try {
    execSync(`node -c "${file}"`, { stdio: 'pipe' });
  } catch (err) {
    console.error(`Syntax error in ${file}:\n${err.stderr ? err.stderr.toString() : err.message}`);
    hasError = true;
  }
}

if (hasError) {
  console.error("Backend build check failed due to syntax errors.");
  process.exit(1);
} else {
  console.log("✓ Backend build check succeeded: All backend JavaScript files passed syntax verification.");
}
