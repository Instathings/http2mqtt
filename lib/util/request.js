const request = require('request');
const set = require('lodash/set');

module.exports = function httpRequest(protocol, hostname, port, path, method, queryParams, body) {
  const params = {
    json: true,
  };
  set(params, 'url', `${protocol}://${hostname}:${port}${path}`);
  set(params, 'method', method);
  set(params, 'qs', queryParams);

  const promise = new Promise((resolve, reject) => {
    return request(params, (err, res, resBody) => {
      if (err) {
        return reject(err);
      }
      if (res.statusCode > 300) {
        return reject();
      }
      return resolve(resBody);
    });
  });
  return promise;
};
