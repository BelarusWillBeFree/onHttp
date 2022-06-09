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

  responseProcessing = (err, dataSavedInSQL) => {

  };

  setInvoices(request, response) {
    const connector = new sql.ConnectorSQL();
    const inputData = request.body;
    // this.moduleLogStream.write('input data'.concat(JSON.stringify(inputData), '\n'));
    debug.writeLog('input data', JSON.stringify(inputData));
    connector.getState({ inputData, responseProcessing: this.responseProcessing });
    response.send('setInvoice');
  }

  services() {
    this.app.get(`/${this.nameApp}`, (req, res) => {
      res.send('Service for work with CSM invoices');
    });
    this.app.post(`/${this.nameApp}/invoice`, (request, response) => this.setInvoices(request, response));
    /* (request, response) => {
      //      res.send('setInvoice');
      const responseProcessing = (err, dataSavedInSQL) => {
        const isEqualRow = (row1, row2) => (row1.numInvoice === row2.numInvoice && row2.dateInvoice === row2.dateInvoice);
        const invoiceForUpdate = _.intersectionWith(inputData, dataSavedInSQL, isEqualRow);
        const invoiceForAppend = inputData.reduce((prev, curr) => {
          const countFindRow = invoiceForUpdate
            ? invoiceForUpdate.filter(
              (obj) => obj.numInvoice === curr.numInvoice && obj.dateInvoice === curr.dateInvoice,
            ).length : 0;
          if (countFindRow === 0) prev.push(curr);
          return prev;
        }, []);
        //const responseObj = [];
        const sumResult = (err, result) => {
        // responseObj.push({err, result});
          console.log(err, result);
        };
        connector.updateInvoices(invoiceForUpdate, sumResult);
        connector.appendInvoices(invoiceForAppend, sumResult);
        // console.log('Update',invoiceForUpdate);
        // console.log('Insert',invoiceForAppend);
        response.send('done');// JSON.stringify(responseObj)
        connector.connectEnd();
      };
      //    const params = request.query;
      //    console.log(request.body);
      //    const boundResponseProcessing = responseProcessing.bind(this);
      connector.getState({ inputData, responseProcessing });
    } */
    // );
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
