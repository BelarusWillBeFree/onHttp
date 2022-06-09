const fs = require('fs');
const path = require('path');

const writeLog = (head, body) => {
  const moduleLogStream = fs.createWriteStream(path.join(__dirname, '/../logs', 'module.log'), { flags: 'a' });
  moduleLogStream.write(`${head}: ${body}\n`);
  // this.moduleLogStream.write('input data'.concat(JSON.stringify(inputData), '\n'));
  moduleLogStream.end();
};

exports.writeLog = writeLog;
