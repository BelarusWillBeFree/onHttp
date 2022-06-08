import axios from 'axios';
import dataInvoices from './dataInsert.js';

const mainTest = () => {
//  const totalPathSite = 'http://localhost:3000/setInvoice';
  const totalPathSite = 'http://localhost:3000/';

  const jsonDataInvoices = JSON.stringify(dataInvoices);
  console.log(dataInvoices);
  axios.post(totalPathSite, jsonDataInvoices, {
    headers: {
      'Content-Type': 'application/json',
    },
  }).then((response) => {
    console.log(response.status, response.data);
  });
};

mainTest();
