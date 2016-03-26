'use strict';

const assert = require('assert');
const jwt = require('jsonwebtoken');
const jwtPolicy = require('../lib/index');

describe('sails-jwt', function() {
  const user = {
    id: 1,
    name: 'somename',
    role: 'SOME_ROLE'
  };

  describe('Passing tests', function() {

    const secretKey = 'shhhh!';
    const req = {};

    it('should set "req.user" correctly', function(done) {
      let token = jwt.sign(user, secretKey);

      req.headers = {
        authorization: 'Bearer ' + token
      };

      jwtPolicy({
        secret: secretKey
      }, function(err, req, res, next) {
        assert.ifError(err);
        assert.equal(user.id, req.user.id);

        done();
      })(req);
    });
  });

  describe('failing tests', function() {
    const secretKey = 'shhhh!';
    const req = {};

    it('should throw if no callback is present', function() {
      assert.throws(jwtPolicy, /Callback must be provided/);
    });

    it('should return Error is secret is missng', function(done) {
      jwtPolicy(null, function(err) {
        assert.ok(err);
        assert.equal(err.message, 'Secret is missing');

        done();
      })(req);
    });

    it('should return Error if NO authorization header is present', function(done) {
      req.headers = {};

      jwtPolicy({
        secret: secretKey
      }, function(err) {
        assert.ok(err);
        assert.equal(err.code, 'E_AUTHORIZATION_REQUIRED');

        done();
      })(req);
    });

    it('should return Error if authorization header format is invalid', function(done) {
      let token = jwt.sign(user, secretKey);

      req.headers = {
        authorization: 'Bearer' + token
      };

      jwtPolicy({
        secret: secretKey
      }, function(err) {
        assert.ok(err);
        assert.equal(err.code, 'E_INVALID_AUTHORIZATION_FORMAT');

        done();
      })(req);
    });

    it('should return Error if token is not present in authorization header', function(done) {
      req.headers = {
        authorization: 'Bearer '
      };

      jwtPolicy({
        secret: secretKey
      }, function(err) {
        assert.ok(err);
        assert.equal(err.code, 'E_AUTHORIZATION_TOKEN_NOT_FOUND');

        done();
      })(req);
    });

    it('should return Error if token has expired', function(done) {
      // Generate token expired
      let token = jwt.sign(user, secretKey, { expiresIn: 0 });

      req.headers = {
        authorization: 'Bearer ' + token
      };

      jwtPolicy({
        secret: secretKey
      }, function(err) {
        assert.ok(err);
        assert.equal(err.code, 'E_TOKEN_EXPIRED');

        done();
      })(req);
    });

    it('should return Error if token is invalid', function(done) {
      // Generate token expired
      let token = 'invalid_token';

      req.headers = {
        authorization: 'Bearer ' + token
      };

      jwtPolicy({
        secret: secretKey
      }, function(err) {
        assert.ok(err);
        assert.equal(err.code, 'E_TOKEN_INVALID');

        done();
      })(req);
    });
  });
});
