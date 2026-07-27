const fs = require('fs');
const path = require('path');

const content = fs.readFileSync('c:\\Users\\sanke\\Downloads\\3d-portfolio-main\\3d-portfolio-main\\ai_instructions.md', 'utf-8');
const srcDir = path.join('c:\\Users\\sanke\\Downloads\\3d-portfolio-main\\3d-portfolio-main', 'src');

const regex = /##\s+([a-zA-Z0-9_\-\.\/]+)[\r\n]+```(?:tsx|ts|jsx|js|json)[\r\n]+([\s\S]*?)```/g;
let match;
const files = [];

while ((match = regex.exec(content)) !== null) {
  const filePath = match[1];
  const fileContent = match[2];
  files.push({
    path: filePath,
    content: fileContent
  });
}

console.log(`Found ${files.length} files to update.`);

files.forEach(f => {
  const fullPath = path.join(srcDir, f.path);
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(fullPath, f.content, 'utf-8');
  console.log(`Updated ${f.path}`);
});
