const { array, object, string } = require('yup');

class Validator {
  constructor() {
    this.schema = array().of(object({
      numInvoice: string().required(),
      dateInvoice: string().required(),
      state: string().required(),
    }));
    // if (! inputData instanceof Array) return
  }

  validate(dataForValidate) {
    return this.schema.isValidSync(dataForValidate);
  }
}

exports.Validator = Validator;
