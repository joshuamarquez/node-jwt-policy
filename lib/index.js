'use strict';

const jwt = require('jsonwebtoken');
const JWTError = require('../lib/error/JWTError');

module.exports = function jwtPolicy(options, cb) {
  options = (options || {});

  if (typeof cb != 'function') {
    throw new Error('Callback must be provided');
  }

  return function middleware(req, res, next) {
    let parts;
    let token;

    if (!options.secret) {
      return cb(new Error('Secret is missing'), req, res, next);
    }

    if (!req.headers || !req.headers.authorization) {
      return cb(new JWTError({
        status: 401,
        code: 'E_AUTHORIZATION_REQUIRED',
        message: 'No Authorization header is present'
      }), req, res, next);
    }

    parts = req.headers.authorization.split(' ');

    if (!/^Bearer$/.test(parts[0]) || parts.length !== 2) {
      return cb(new JWTError({
        status: 401,
        code: 'E_INVALID_AUTHORIZATION_FORMAT',
        message: 'Format is :: Authorization: Bearer <token>'
      }), req, res, next);
    }

    token = parts[1];

    if (!token) {
      return cb(new JWTError({
        status: 401,
        code: 'E_AUTHORIZATION_TOKEN_NOT_FOUND',
        message: 'Authorization token was not found'
      }), req, res, next);
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

        return cb(err, req, res, next);
      }

      req.user = decoded;

      cb(null, req, res, next);
    });
  };
};
