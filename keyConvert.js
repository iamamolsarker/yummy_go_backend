const fs=require('fs');
const keyPath=fs.readFileSync('./serviceAccountKey.json', 'utf8');
const base64=Buffer.from(keyPath).toString('base64');
console.log(base64);