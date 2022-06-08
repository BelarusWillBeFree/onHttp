//import _ from 'lodash';
import http from 'http';
//import ConnectorSQL from './ConnectorSQL.js';

class ServerInvoice {
  constructor() {
    this.port = 3000;
    this.app = http.createServer((request, response) => this.initServices(request, response));
    this.startServer();
  }

  initServices(request, response) {
    const services = {
      '/setInvoice': this.setInvoice,
      '/getInvoice': this.getInvoice,
      '/': this.setDefault,
    };
    const url = request ? request['url'] : '/';
    services[url](request, response);
    //if (request.url){}
//    this.app.use(express.json());
 //   this.app.post("/setInvoice", this.setInvoice);
 //   this.app.get("/getInvoice", this.getInvoice);
 //   this.app.get("/", this.default);
  }

  startServer() {
    if (process.env.NODE_ENV === 'Development') {
      this.app.listen(this.port, () => {
        console.log(`Server ${process.env.NODE_ENV} is Running`);
      });
    } else {
      console.log(`Server ${process.env.NODE_ENV} is Running`);
      this.app.listen();
    }
  }

  setInvoice(request, response) {
    response.end('setInvoice');
  }

/*
    sendResponse(response, bodyResp) {
        response.send(bodyResp);
    }

    setInvoice(request, response) {
        const connector = new ConnectorSQL();
        const inputData = request.body;
        const responseProcessing = (err, dataSavedInSQL) => {
            const isEqualRow = (row1, row2) => (row1.numInvoice === row2.numInvoice && row2.dateInvoice === row2.dateInvoice);
            const invoiceForUpdate = _.intersectionWith(inputData, dataSavedInSQL, isEqualRow);
            const invoiceForAppend = inputData.reduce((prev, curr) => {

                const countFindRow = invoiceForUpdate 
                    ? invoiceForUpdate.filter(
                        (obj) => obj.numInvoice === curr.numInvoice && obj.dateInvoice === curr.dateInvoice).length : 0;
                if (countFindRow === 0) prev.push(curr);
                return prev;
            }, []);
            const responseObj = [];
            const sumResult = (err, result) => {
                //responseObj.push({err, result});
                console.log(err, result);
            };
            connector.updateInvoices(invoiceForUpdate, sumResult);
            connector.appendInvoices(invoiceForAppend, sumResult);
           // console.log('Update',invoiceForUpdate);
           // console.log('Insert',invoiceForAppend);
            response.send('done');//JSON.stringify(responseObj)
            connector.connectEnd();
        }
    //    const params = request.query;
    //    console.log(request.body);
    //    const boundResponseProcessing = responseProcessing.bind(this);
        connector.getState({ inputData, responseProcessing });
    }
*/
  getInvoice(request, response) {
    response.end('getInvoice');
  }

  setDefault(request, response) {
    response.end('server is running');
  } //*/
}

export default ServerInvoice;