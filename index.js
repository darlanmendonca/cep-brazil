'use strict';

exports.search = search;

function search(zipcode) {
  let request = require('request');
  let deferred = require('q').defer();
  let zipcodeReg = /^[\d]{8}$/;
  let zipcodeValid = zipcodeValid.test(zipcode);

  if (!zipcodeValid) {
    let error = new Error('Zipcode must be a string with 8 characters!');
    deferred.reject(error);
    return;
  }

  let url = 'http://m.correios.com.br/movel/buscaCepConfirma.do';
  let encoding = 'binary';
  var form = {
    metodo: 'buscarCep',
    cepEntrada: zipcode
  };

  request
    .post({url, form, encoding})
    .then(crawler)
    .then(resolve)
    .catch(exceptionError);

  function exceptionError(err) {
    deferred.reject(err);
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
      let error = new Error($('.erro').text().trim());
      deferred.reject(error);
      return;
    }
    var resp = $('.caixacampobranco .respostadestaque');
    if (resp.length === 0) {
      let error = new Error('Response error')
      deferred.reject(error);
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

  function resolve(address) {
    deferred.resolve(address);
  }

  return deferred.promise;
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
