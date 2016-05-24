'use strict';

const assert = require('assert');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const jwtPolicy = require('../lib/index');

describe('sails-jwt', function() {
  const secretKey = 'shhhh!';
  const user = {
    id: 1,
    name: 'somename',
    role: 'SOME_ROLE'
  };

  function assertUser(token, expected, callback) {
    assert.deepEqual(_.pick(jwt.decode(token), _.keys(user)),
                      _.pick(expected, _.keys(user)));
    callback();
  }

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

  function getReq(type, token) {
    return type == 'header' ? {
      headers: {
        authorization: 'Bearer ' + token
      }
    } : {
      query: {
        token: token
      }
    };
  }

  describe('Work tests', function() {
    let token = jwt.sign(user, secretKey);

    it('should set "req.user" correctly', function(done) {
      let req = getReq('header', token);

      jwtPolicy({ secret: secretKey })(req, null, function() {
        assertUser(token, req.user, done);
      });
    });

    it('should set "req.user" correctly with extractToken()', function(done) {
      let req = getReq('query', token);

      jwtPolicy({
        secret: secretKey,
        extractToken: function(req) {
          return req.query.token;
        }
      })(req, null, function() {
        assertUser(token, req.user, done);
      });
    });

    it('should set "req.user" correctly (callback provided)', function(done) {
      let req = getReq('header', token);

      jwtPolicy({
        secret: secretKey
      }, function(err, req, res, next) {
        assert.ifError(err);
        assertUser(token, req.user, done);
      })(req);
    });

    it('should set "req.user" correctly with extractToken() (callback provided)', function(done) {
      let req = getReq('query', token);

      jwtPolicy({
        secret: secretKey,
        extractToken: function(req) {
          return req.query.token;
        }
      }, function(err, req, res, next) {
        assert.ifError(err);
        assertUser(token, req.user, done);
      })(req);
    });

    it('should override default attachTo path', function(done) {
      let req = getReq('header', token);
      let newPath = 'auth';

      jwtPolicy({
        secret: secretKey,
        attachTo: newPath
      })(req, null, function() {
        assert.ok(req[newPath]);
        assertUser(token, req[newPath], done);
      });
    });
  });

  describe('Failure tests', function() {

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

    it('should return default attachTo path as undefined', function(done) {
      let req = getReq('query', jwt.sign(user, secretKey));

      jwtPolicy({
        secret: secretKey,
        attachTo: 'auth',
        extractToken: function(req) {
          return req.query.token;
        }
      })(req, null, function() {
        assert.ok(req.user === undefined);
        done();
      });
    });

    describe('Token Expired Error (E_TOKEN_EXPIRED)', function() {
      // Generate token expired
      let token = jwt.sign(user, secretKey, { expiresIn: 0 });

      it('should return E_TOKEN_EXPIRED', function(done) {
        let req = getReq('header', token);

        jwtPolicy({ secret: secretKey })(req, getRes(done, 'E_TOKEN_EXPIRED'));
      });

      it('should return E_TOKEN_EXPIRED with extractToken()', function(done) {
        let req = getReq('query', token);

        jwtPolicy({
          secret: secretKey,
          extractToken: function(req) {
            return req.query.token;
          }
        })(req, getRes(done, 'E_TOKEN_EXPIRED'));
      });

      it('should return E_TOKEN_EXPIRED (callback provided)', function(done) {
        let req = getReq('header', token);

        jwtPolicy({
          secret: secretKey
        }, function(err) {
          assert.ok(err);
          assert.equal(err.code, 'E_TOKEN_EXPIRED');

          done();
        })(req);
      });

      it('should return E_TOKEN_EXPIRED with extractToken() (callback provided)', function(done) {
        let req = getReq('query', token);

        jwtPolicy({
          secret: secretKey,
          extractToken: function(req) {
            return req.query.token;
          }
        }, function(err) {
          assert.ok(err);
          assert.equal(err.code, 'E_TOKEN_EXPIRED');

          done();
        })(req);
      });
    });

    describe('Token Invalid Error (E_TOKEN_INVALID)', function() {
      let token = new Buffer('invalid_token').toString('base64');

      it('should return E_TOKEN_INVALID', function(done) {
        let req = getReq('header', token);

        jwtPolicy({ secret: secretKey })(req, getRes(done, 'E_TOKEN_INVALID'));
      });

      it('should return E_TOKEN_INVALID with extractToken()', function(done) {
        let req = getReq('query', token);

        jwtPolicy({
          secret: secretKey,
          extractToken: function(req) {
            return req.query.token;
          }
        })(req, getRes(done, 'E_TOKEN_INVALID'));
      });

      it('should return E_TOKEN_INVALID (callback provided)', function(done) {
        let req = getReq('header', token);

        jwtPolicy({
          secret: secretKey
        }, function(err) {
          assert.ok(err);
          assert.equal(err.code, 'E_TOKEN_INVALID');

          done();
        })(req);
      });

      it('should return E_TOKEN_INVALID with extractToken() (callback provided)', function(done) {
        let req = getReq('query', token);

        jwtPolicy({
          secret: secretKey,
          extractToken: function(req) {
            return req.query.token;
          }
        }, function(err) {
          assert.ok(err);
          assert.equal(err.code, 'E_TOKEN_INVALID');

          done();
        })(req);
      });
    });
  });
});
