var crypto = require('crypto');

if (!process.env.KEY) {
  process.exit(1);
}

exports.encrypt = function (data) {
	var cipher = crypto.createCipher('aes-256-cbc', process.env.KEY);
	var crypted = cipher.update(data, 'utf8', 'hex');
	crypted += cipher.final('hex');
	cipher = null;
	return crypted;
};

exports.dencrypt = function(data) {
  var decipher = crypto.createDecipher('aes-256-cbc', process.env.KEY);
  var dec = decipher.update(data, 'hex', 'utf8');
  dec += decipher.final('utf8');
  decipher = null;
  return dec;
};