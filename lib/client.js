var http    = require('http'),
    crypter = require('./crypter');

if (!process.env.PROXY_HOST || !process.env.PROXY_PORT) {
  process.exit(1);
}

var JSONStringify = function(json) {
  var cache = [];
  var string = JSON.stringify(json, function( key, value) {
      if (typeof value === 'object' && value !== null) {
        if (cache.indexOf(value) !== -1) {
         return;
        }
        cache.push(value);
      }
      return value;
    });
  cache = null;
  return string;
};

http.createServer(function (req, res) {

  var reqData = '';
  req.on('readable', function () {
    reqData += req.read();
  }).on('end', function() {

    var encryptReqData = crypter.encrypt(JSONStringify({
      request: req,
      body: reqData || ''
    }));

    var proxyReq = http.request({
      host: process.env.PROXY_HOST,
      port: process.env.PROXY_PORT,
      method: 'POST',
      path: 'http://' + process.env.PROXY_HOST + ':' + process.env.PROXY_PORT,
      headers: {
        host: process.env.PROXY_HOST
      }
    }, function (proxyRes) {

      var encryptResData = '';
      proxyRes.on('readable', function () {
        encryptResData += proxyRes.read();
      }).on('end', function () {

        if (encryptResData.length) {
          res.write(crypter.decrypt(encryptResData));
        }
        res.end();

      });
    });
  });
}).on('connect', function (req, socket, head) {

  var proxyReq = http.request({
    hostname: process.env.PROXY_HOST,
    port: process.env.PROXY_PORT,
    method: 'CONNECT',
    path: process.env.PROXY_HOST + ':' + process.env.PROXY_PORT
  }).on('connect', function (proxyRes, proxySocket, proxyHead) {
    socket.write('HTTP/1.1 200 Connection Established\r\nProxy-agent: Node-Proxy\r\n\r\n');
    socket.write(proxyHead);
    socket.pipe(proxySocket);
    proxySocket.pipe(socket);
  });

  proxyReq.write(head);
  proxyReq.end();

}).listen(8080);