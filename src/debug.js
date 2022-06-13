const fs = require('fs');
const path = require('path');

const writeLog = (head, body) => {
  const today = new Date();
  const date = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
  const time = `${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`;
  const dateTime = `${date} ${time}`;
  const moduleLogStream = fs.createWriteStream(path.join(__dirname, '../logs', 'module.log'), { flags: 'a' });
  moduleLogStream.write(`${dateTime}: ${head}: ${body}\n`);
  // this.moduleLogStream.write('input data'.concat(JSON.stringify(inputData), '\n'));
  moduleLogStream.end();
};

exports.writeLog = writeLog;
