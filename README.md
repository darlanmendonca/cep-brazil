# cep-brazil

Get zip-code info

## Usage

``` js
var zipcode = require('cep-brazil');

zipcode
  .get('04193020')
  .then(showAddress)
  .catch(exceptionError);

function showAddress(address) {
  console.log(address);
}

function exceptionError(err) {
  console.log(err)
}

```
