// const mysql = require('mysql2');
const mysql = require('mysql2/promise');
const sqlConfig = require('../config/sqlConnect.js');
const tab = require('../config/paramsTable.js');
// const debug = require('./debug.js');

class ConnectorSQL {
  constructor() {
    const env = process.env.NODE_ENV;
    const { fields, nameTable } = tab.paramTab[env];
    this.num = fields.num;
    this.date = fields.date;
    this.state = fields.state;
    this.nameTable = nameTable;
  }

  async initConnection() {
    const env = process.env.NODE_ENV;
    this.connection = await mysql.createConnection(sqlConfig.sqlConnector[env]);
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

  async getState(inputData) {
    const selectQuery = this.querySelectWithFilter(inputData);
    const [rows] = await this.connection.execute(selectQuery);
    return rows;
  }

  updateInvoices(invoices) {
    if (!invoices.length) return;
    const queries = invoices.map((invoice) => (` UPDATE ${this.nameTable} SET ${this.state}='${invoice.state}' WHERE ${this.num}='${invoice.numInvoice}' AND ${this.date}='${invoice.dateInvoice}'`));
    const queryPromises = queries.map((query) => {
      try {
        return this.connection.execute(query);
      } catch (e) {
        return null;
      }
    });
    Promise.all(queryPromises).then((data) => console.log(data)).catch((err) => (console.log(err)));
  }

  async appendInvoices(invoices) {
    if (!invoices.length) return;
    const queryInsert = `INSERT INTO ${this.nameTable} (${this.num}, ${this.date}, ${this.state}) VALUES `;
    const queryData = invoices.map((invoice) => (`
        ("${invoice.numInvoice}", "${invoice.dateInvoice}", "${invoice.state}")`)).join(',');
    const totalQuery = queryInsert.concat(queryData, ';');
    await this.connection.execute(totalQuery);
  }

  connectEnd() {
    this.connection.end();
  }
}

exports.ConnectorSQL = ConnectorSQL;
