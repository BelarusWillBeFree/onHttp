const paramTab = {
  production: {
    nameTable: 'score',
    fields: {
      num: 'nom',
      date: 'data',
      state: 'state',
    },
  },
  development: {
    nameTable: 'Invoice',
    fields: {
      num: 'numInvoice',
      date: 'dateInvoice',
      state: 'state',
    },
  },
};

exports.paramTab = paramTab;
