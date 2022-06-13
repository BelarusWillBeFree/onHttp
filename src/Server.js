const _ = require('lodash');
const express = require('express');
const fs = require('fs');
const morgan = require('morgan');
const path = require('path');
const sql = require('./ConnectorSQL.js');
const debug = require('./debug.js');

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

  setInvoices(request, response) {
    const connector = new sql.ConnectorSQL();
    const inputData = request.body;
    const responseProcessing = (err, dataSavedInSQL) => {
      const isEqualRow = (row1, row2) => (
        row1.numInvoice === row2.numInvoice
        && Date.parse(`${row1.dateInvoice}T00:00:00`) === Date.parse(row2.dateInvoice)
      );
      const invoicesForUpdate = _.intersectionWith(inputData, dataSavedInSQL, isEqualRow);
      const invoicesForAppend = inputData.reduce((prev, curr) => {
        const countFindRow = invoicesForUpdate
          ? invoicesForUpdate.filter(
            (obj) => obj.numInvoice === curr.numInvoice && obj.dateInvoice === curr.dateInvoice,
          ).length : 0;
        if (countFindRow === 0) prev.push(curr);
        return prev;
      }, []);
      const responseObj = [];
      const sumResult = (err, result) => {
        responseObj.push({ err, result });
        if (err) debug.writeLog('error ', err);
        // console.log(err, result);
      };
      connector.updateInvoices(invoicesForUpdate, sumResult);
      connector.appendInvoices(invoicesForAppend, sumResult);
      response.send('done');// JSON.stringify(responseObj)
      connector.connectEnd();
    };
    connector.getState({ inputData, responseProcessing });
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
