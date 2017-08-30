//  enable runtime transpilation to use ES6/7 in node

var fs = require('fs');
var Path = require('path')

var babelrc = fs.readFileSync(Path.join(__dirname, '.babelrc'));
var config;

try {
  config = JSON.parse(babelrc);
} catch (err) {
  console.error('==>     ERROR: Error parsing your .babelrc.');
  console.error(err);
}

require('babel-register')(config);
