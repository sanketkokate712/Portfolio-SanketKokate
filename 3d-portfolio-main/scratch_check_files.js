const fs = require('fs');
const path = require('path');

const parsedFiles = require('./scratch_parsed_files.json');
const srcDir = path.join(__dirname, 'src');

const result = {
  modify: [],
  new: []
};

parsedFiles.forEach(f => {
  const fullPath = path.join(srcDir, f.path);
  if (fs.existsSync(fullPath)) {
    result.modify.push(f.path);
  } else {
    result.new.push(f.path);
  }
});

console.log("Existing files (to be modified):", result.modify);
console.log("New files (to be created):", result.new);
fs.writeFileSync('scratch_check_result.json', JSON.stringify(result, null, 2));
