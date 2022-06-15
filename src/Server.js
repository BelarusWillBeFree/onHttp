const _ = require('lodash');
const express = require('express');
const fs = require('fs');
const morgan = require('morgan');
const path = require('path');
const sql = require('./ConnectorSQL.js');
const debug = require('./debug.js');
const validate = require('./Validator.js');

class Server {
  constructor() {
    this.app = express();
    this.port = 3000;
    this.nameApp = process.env.NODE_NAME_APP ?? 'invoices';
    // create a write stream (in append mode)
    const accessLogStream = fs.createWriteStream(path.join(__dirname, '/../logs', 'access.log'), { flags: 'a' });

    this.app.use(express.json());
    // setup the logger
    this.app.use(morgan('combined', { stream: accessLogStream }));
    this.services();
    this.start();
  }

  responseProcessing(dataSavedInSQL, inputData) {
    const isEqualRow = (row1, row2) => (
      row1.numInvoice === row2.numInvoice
      && Date.parse(`${row1.dateInvoice}T00:00:00`) === Date.parse(row2.dateInvoice)
    );
    const invUpdate = _.intersectionWith(inputData, dataSavedInSQL, isEqualRow);
    const invAppend = inputData.reduce((prev, curr) => {
      const countFindRow = invUpdate
        ? invUpdate.filter(
          (obj) => obj.numInvoice === curr.numInvoice && obj.dateInvoice === curr.dateInvoice,
        ).length : 0;
      if (countFindRow === 0) prev.push(curr);
      return prev;
    }, []);
    return { invUpdate, invAppend };
  }

  async setInvoices(request, response) {
    const connector = new sql.ConnectorSQL();
    await connector.initConnection();
    const inputData = request.body;
    debug.writeLog('input data:', JSON.stringify(inputData));
    const validator = new validate.Validator();
    if (!validator.validate(inputData)) {
      connector.connectEnd();
      response.send('error validation');
      return;
    }
    const dataSavedInSQL = await connector.getState(inputData);
    const { invUpdate, invAppend } = this.responseProcessing(dataSavedInSQL, inputData);
    await connector.updateInvoices(invUpdate);
    await connector.appendInvoices(invAppend);
    response.send('done');
    connector.connectEnd();
  }

  services() {
    try {
      this.app.get(`/${this.nameApp}`, (req, res) => {
        res.send('Service for work with CSM invoices');
      });
      this.app.post(`/${this.nameApp}/invoice`, (request, response) => this.setInvoices(request, response));
    } catch (err) {
      debug.writeLog('err:', err);
    }
  }

  start() {
    if (process.env.NODE_ENV === 'development') {
      this.app.listen(this.port, () => {
        console.log(`Server ${process.env.NODE_ENV} is Running`);
      });
    } else {
      this.app.listen();
      console.log(`Server ${process.env.NODE_ENV} is Running`);
    }
  }
}

exports.Server = Server;
