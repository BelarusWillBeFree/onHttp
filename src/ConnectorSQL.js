const mysql = require('mysql2');
const sqlConfig = require('../config/sqlConnect.js');
const tab = require('../config/paramsTable.js');
const debug = require('./debug.js');

class ConnectorSQL {
  constructor() {
    const env = process.env.NODE_ENV;
    this.connection = mysql.createConnection(sqlConfig.sqlConnector[env]);
    const { fields, nameTable } = tab.paramTab[env];
    this.num = fields.num;
    this.date = fields.date;
    this.state = fields.state;
    this.nameTable = nameTable;
  }

  querySelectWithFilter(filter) {
    try {
      const strFilter = filter.map(({ numInvoice, dateInvoice }) => (`${this.num}="${numInvoice}" AND ${this.date}="${dateInvoice}"`)).join(' or ');
      const selectQuery = `SELECT ${this.num}, ${this.date} FROM ${this.nameTable} WHERE ${strFilter};`;
      return selectQuery;
    } catch (err) {
      throw new Error();
    }
  }

  getState(params) {
    const { inputData, responseProcessing } = params;
    const selectQuery = this.querySelectWithFilter(inputData);
//    debug.writeLog('select query', selectQuery);
    this.connection.query(selectQuery, responseProcessing);
  }

  updateInvoices(invoices, sumResult) {
    if (!invoices.length) return;
    const queries = invoices.map((invoice) => (` UPDATE ${this.nameTable} SET ${this.state}='${invoice.state}' WHERE ${this.num}='${invoice.numInvoice}' AND ${this.date}='${invoice.dateInvoice}'`));
    queries.forEach((query) => (
      this.connection.query(query, sumResult)
    ));
  }

  appendInvoices(invoices, sumResult) {
    if (!invoices.length) return;
    const queryInsert = `INSERT INTO ${this.nameTable} (${this.num}, ${this.date}, ${this.state}) VALUES `;
    const queryData = invoices.map((invoice) => (`
        ("${invoice.numInvoice}", "${invoice.dateInvoice}", "${invoice.state}")`)).join(',');
    const totalQuery = queryInsert.concat(queryData, ';');
//    console.log(totalQuery);
    this.connection.query(totalQuery, sumResult);
  }

  connectEnd() {
    this.connection.end();
  }
}

exports.ConnectorSQL = ConnectorSQL;
