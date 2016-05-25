'use strict';

const jwt = require('jsonwebtoken');
const tokenExtractor = require('token-extractor');
const JWTError = require('../lib/error/JWTError');

module.exports = function jwtPolicy(options, cb) {
  options = (options || {});

  if (cb && typeof cb != 'function') {
    throw new Error('Second argument must be a function callback');
  }

  // `secret` is the only element in options
  // that is required.
  if (!options.secret) {
    throw new Error('Secret is missing');
  }

  // attachTo option to allow the user to override the default
  // path where the decoded token will be attached to.
  const attachTo = options.attachTo || 'user';

  return function middleware(req, res, next) {
    let parts;
    let token;

    // If extractToken function is defined then use this
    // method to get token instead of `token-extractor`,
    // once we have the token we proceed to verify it.
    if (options.extractToken && typeof options.extractToken == 'function') {
      try {
        token = options.extractToken(req);
      } catch (e) {
        return processError(e);
      }

      verifyToken(token);
    }

    // Use the default method to get token and then verify it.
    else {
      tokenExtractor(req, (err, token) => {
        if (err) {
          return processError(err);
        }

        verifyToken(token);
      });
    }

    function verifyToken(token) {
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

          return processError(err);
        }

        req[attachTo.toString()] = decoded;

        if (cb) {
          return cb(null, req, res, next);
        }

        return next();
      });
    }

    function processError(err) {
      if (cb) {
        return cb(err, req, res, next);
      }

      return res.status(err.status || 500).json(err);
    }
  };
};
