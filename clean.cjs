const fs = require('fs');

const lines = fs.readFileSync('session_dump.txt', 'utf16le').split('\n');
const result = [];
let state = 'KEEP';

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trimRight(); // removing \r
  
  if (line.startsWith('<<<<<<<')) {
    if (state === 'KEEP') {
      state = 'KEEP_INNER';
    }
  } else if (line.startsWith('=======')) {
    if (state === 'KEEP_INNER') {
      state = 'DROP';
    }
  } else if (line.startsWith('>>>>>>>')) {
    if (state === 'DROP') {
      state = 'KEEP';
    } else if (state === 'KEEP_INNER') {
      state = 'KEEP';
    }
  } else {
    if (state === 'KEEP' || state === 'KEEP_INNER') {
      result.push(line);
    }
  }
}

fs.writeFileSync('src/ActiveSession.tsx', result.join('\n'));
console.log("Cleaned ActiveSession.tsx (UTF-16 fixed)");
