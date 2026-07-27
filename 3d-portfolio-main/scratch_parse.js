const fs = require('fs');

const content = fs.readFileSync('c:\\Users\\sanke\\Downloads\\3d-portfolio-main\\3d-portfolio-main\\ai_instructions.md', 'utf-8');

// Also handle Windows \r\n properly
const regex = /##\s+([a-zA-Z0-9_\-\.\/]+)[\r\n]+```(?:tsx|ts|jsx|js|json)[\r\n]+([\s\S]*?)```/g;
let match;
const files = [];

while ((match = regex.exec(content)) !== null) {
  const filePath = match[1];
  const fileContent = match[2];
  files.push({
    path: filePath,
    size: fileContent.length
  });
}

console.log("Files to be updated/created:");
console.table(files);

if (files.length > 0) {
    fs.writeFileSync('c:\\Users\\sanke\\Downloads\\3d-portfolio-main\\3d-portfolio-main\\scratch_parsed_files.json', JSON.stringify(files, null, 2));
}
