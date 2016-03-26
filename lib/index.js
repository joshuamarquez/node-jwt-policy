'use strict';

const jwt = require('jsonwebtoken');
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

    if (!req.headers || !req.headers.authorization) {
      let err = new JWTError({
        status: 401,
        code: 'E_AUTHORIZATION_REQUIRED',
        message: 'No Authorization header is present'
      });

      return processError(err, req, res, next, cb);
    }

    parts = req.headers.authorization.split(' ');

    if (!/^Bearer$/.test(parts[0]) || parts.length !== 2) {
      let err = new JWTError({
        status: 401,
        code: 'E_INVALID_AUTHORIZATION_FORMAT',
        message: 'Format is :: Authorization: Bearer <token>'
      });

      return processError(err, req, res, next, cb);
    }

    token = parts[1];

    if (!token) {
      let err = new JWTError({
        status: 401,
        code: 'E_AUTHORIZATION_TOKEN_NOT_FOUND',
        message: 'Authorization token was not found'
      });

      return processError(err, req, res, next, cb);
    }

    jwt.verify(token, options.secret, function(jwtErr, decoded) {
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
  };
};


function processError(err, req, res, next, cb) {
  if (cb) {
    return cb(err, req, res, next);
  }

  return res.status(err.status).json(err);
}
