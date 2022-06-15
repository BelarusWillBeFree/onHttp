const {
  array, object, string, number,
} = require('yup');

class Validator {
  constructor() {
    this.schema = array().of(object({
      numInvoice: number().required(),
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
