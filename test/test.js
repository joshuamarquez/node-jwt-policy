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

  function getRes(done, codeExpected) {
    return {
      status: (status) => {
        return {
          json: (err) => {
            assert.ok(err);
            assert.equal(err.code, codeExpected);

            done();
          }
        };
      }
    };
  }

  describe('Passing tests', function() {

    const secretKey = 'shhhh!';
    const req = {};

    it('should set "req.user" correctly', function(done) {
      let token = jwt.sign(user, secretKey);

      req.headers = {
        authorization: 'Bearer ' + token
      };

      jwtPolicy({ secret: secretKey })(req, null, function() {
        assert.ok(req.user);

        done();
      });
    });

    it('should set "req.user" correctly (callback provided)', function(done) {
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

    it('should throw if second argument is not a function', function() {
      try {
        jwtPolicy(null, 'invalid_callback');
      } catch (err) {
        assert.ok(err);
        assert(/Second argument must be a function callback/.test(err));
      }
    });

    it('should throw Error is secret is missng', function() {
      assert.throws(jwtPolicy, /Secret is missing/);
    });

    it('should return Error if NO authorization header is present', function(done) {
      req.headers = {};

      jwtPolicy({ secret: secretKey })(req, getRes(done, 'E_AUTHORIZATION_REQUIRED'));
    });

    it('should return Error if NO authorization header is present (callback provided)', function(done) {
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

      jwtPolicy({ secret: secretKey })(req, getRes(done, 'E_INVALID_AUTHORIZATION_FORMAT'));
    });

    it('should return Error if authorization header format is invalid (callback provided)', function(done) {
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

      jwtPolicy({ secret: secretKey })(req, getRes(done, 'E_AUTHORIZATION_TOKEN_NOT_FOUND'));
    });

    it('should return Error if token is not present in authorization header (callback provided)', function(done) {
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

      jwtPolicy({ secret: secretKey })(req, getRes(done, 'E_TOKEN_EXPIRED'));
    });

    it('should return Error if token has expired (callback provided)', function(done) {
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

      jwtPolicy({ secret: secretKey })(req, getRes(done, 'E_TOKEN_INVALID'));
    });

    it('should return Error if token is invalid (callback provided)', function(done) {
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
