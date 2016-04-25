'use strict';

exports.get = get;

function get(zipcode) {
  let deferred = require('q').defer();

  if (!zipcodeValid(zipcode)) {
    let error = new Error('Zipcode must be a string with 8 characters!');
    deferred.reject(error);
    return;
  }

  search(zipcode)
    .then(crawler)
    .then(deferred.resolve)
    .catch(deferred.reject);

  return deferred.promise;
}

function zipcodeValid(zipcode) {
  let zipcodeReg = /^[\d]{8}$/;
  let zipcodeValid = typeof zipcodeValid === 'string' && zipcodeValid.test(zipcode);
  return zipcodeValid;
}

function get(zipcode) {
  let request = require('request-promise');
  let url = 'http://m.correios.com.br/movel/buscaCepConfirma.do';
  let encoding = 'binary';
  var form = {
    metodo: 'buscarCep',
    cepEntrada: zipcode
  };

  return request.post({url, form, encoding});
}

function crawler(response, body) {
  let cheerio = require('cheerio');
  let options = {
    normalizeWhitespace: false,
    xmlMode: false,
    decodeEntities: true
  };

  let breakLines = /\r?\n/g;
  var $ = cheerio.load(body.replace(breakLines, ''), options);

  if ($('.erro').length) {
    throw new Error($('.erro').text().trim());
    return;
  }
  var resp = $('.caixacampobranco .respostadestaque');
  if (resp.length === 0) {
    throw new Error('Response error');
    return;
  }


  let address;
  if (resp.length == 2) {
    let city = $(resp[0]).text().split('\t/')[0].trim();
    let state = $(resp[0]).text().split('\t/')[1].trim();
    let zipcode = $(resp[1]).text().trim();

    address = {
      city,
      state,
      zipcode
    };
  } else {
    let street = $(resp[0]).text().trim();
    let district = $(resp[1]).text().trim();
    let city = $(resp[2]).text().split('/')[0].trim();
    let state = $(resp[2]).text().split('/')[1].trim();
    let zipcode = $(resp[3]).text().trim();

    address = {
      street,
      district,
      city,
      state,
      zipcode
    };
  }
  return address;
}
// if (process.argv[2]) {
//   get(process.argv[2])
//   .then(function (data) {
//     console.log(data);
//   }).fail(function(err) {
//       console.log(err);
//       return;
//   });
// }
