var url     = require('url'),
    http    = require('http'),
    https   = require('https'),
    crypter = require('./crypter');

http.createServer(function (req, res) {
  var encryptReqData = '';
  req.on('readable', function () {
    encryptReqData += req.read();
  }).on('end', function () {

    if (!encryptReqData.length) {
      res.end();
      return;
    }

    var reqData = JSON.parse(crypter.decrypt(encryptReqData));

    var request = reqData.request;
    var options = url.parse(requset.url);
    options.method = requset.method || 'GET';

    var protocol = options.protocol === 'https:' ? https : http;

    var proxyReq = protocol.request(options, function (proxyRes) {
      var resData = '';
      proxyRes.on('readable', function() {
        resData += proxyRes.read();
      }).on('end', function() {
        if (resData.length) {
          res.write(crypter.encrypt(resData));
        }
        res.end();
      });
    });

    var body = reqData.body;
    if (typeof body !== undefined && body !== null && body.length) {
      proxyReq.write(body);
    }
    proxyReq.end();
  });
}).listen(process.env.PORT || 3000);
