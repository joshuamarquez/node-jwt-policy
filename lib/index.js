'use strict';

const jwt = require('jsonwebtoken');
const tokenExtractor = require('token-extractor');
const JWTError = require('../lib/error/JWTError');

module.exports = function jwtPolicy(options, cb) {
  options = (options || {});

  if (cb && typeof cb != 'function') {
    throw new Error('Second argument must be a function callback');
  }

  if (!options.secret) {
    throw new Error('Secret is missing');
  }

  return function middleware(req, res, next) {
    let parts;
    let token;

    tokenExtractor(req, (err, token) => {
      if (err) {
        return processError(err, req, res, next, cb);
      }

      jwt.verify(token, options.secret, options, function(jwtErr, decoded) {
        if (jwtErr) {
          let err = new JWTError({ status: 401 });

          if (jwtErr.name === 'TokenExpiredError') {
            err.code = 'E_TOKEN_EXPIRED';
            err.message = 'JSON Web Token provided has expired';
          } else {
            err.code = 'E_TOKEN_INVALID';
            err.message = 'Invalid JSON Web Token provided';
          }

          return processError(err, req, res, next, cb);
        }

        req.user = decoded;

        if (cb) {
          return cb(null, req, res, next);
        }

        return next();
      });
    });
  };
};

function processError(err, req, res, next, cb) {
  if (cb) {
    return cb(err, req, res, next);
  }

  return res.status(err.status).json(err);
}
