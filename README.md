# jwt-policy

[![npm version](https://badge.fury.io/js/jwt-policy.svg)](https://badge.fury.io/js/jwt-policy)

JSON Web Token middleware friendly with Express and Sails.js

Validates `token` from HTTP request header authorization and sets `req.user`, token is expected to be found at `Authorization: Bearer <token>`.

This module verifies tokens generated with [node-jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)

## Install

```
$ npm install jwt-policy --save
```

## Usage

### jwtPolicy(options, [callback])

`options` :

* `secret` : is a string containing the secret for decoding token.
* `extractToken` : function to extract token instead of default (HTTP Authorization Header).
* `attachTo` : allows the user to override the default path where the decoded token will be attached to, default is `user`.

**Note: You can pass all available options for [`jwt.verify`](https://github.com/auth0/node-jsonwebtoken#jwtverifytoken-secretorpublickey-options-callback) such as `audience`, `issuer`, etc.**

Specify callback if you wish to do something with `req.user` or check for possible errors, if callback is not supplied then default behavior will take effect.

For default, `jwt-policy` extracts token using [extractor-token](https://github.com/joshuamarquez/node-token-extractor/) (HTTP Authorization Header) but in case you are passing the token by any other method you can use `extractToken` option.

### Usage in Sails.js

Default behavior

```javascript
// Will return 401 HTTP status code if any errors occurred.
// policies/jwtAuth.js
module.exports = require('jwt-policy')({ secret: 'my_secret_key' });
```

Override default behavior

```javascript
// policies/jwtAuth.js
module.exports = require('jwt-policy')({
  secret: 'my_secret_key'
}, function(err, req, res, next) {
  if (!err) {
    // user can be found at 'req.user'

    return next();
  }

  return res.status(401).json(err);
});
```

Override the way the token is extracted using `extractToken` option.

```javascript
// policies/jwtAuth.js
module.exports = require('jwt-policy')({
  secret: 'my_secret_key',
  extractToken: function(req) {
    return req.param('token');
  }
});
```

### Usage in Express

Default behavior

```javascript
const jwtPolicy = require('jwt-policy');

app.get('/', jwtPolicy({ secret: 'my_secret_key' }), function(req, res) {
  res.send(req.user);
});
```

Override default behavior

```javascript
const jwtPolicy = require('jwt-policy');

app.use(jwtPolicy({ secret: 'my_secret_key' }, function(err, req, res, next) {
  if (!err) {
    return res.next();
  }

  return res.status(401).json(err);
}));

app.get('/', function(req, res) {
  res.send(req.user);
});
```

Override the way the token is extracted using `extractToken` option.

```javascript
app.use(jwtPolicy({
  secret: 'my_secret_key',
  extractToken: function(req) {
    return req.query.token;
  }
}));
```

### Attach to

`attachTo` option usage example:

```javascript
const jwtPolicy = require('jwt-policy');

app.use(jwtPolicy({
  secret: 'my_secret_key',
  attachTo: 'auth'
}));

app.get('/', function(req, res) {
  // decoded token can now 
  // be found at `req.auth`
  res.send(req.auth);
});
```

## Error handling

Possible thrown errors

### TokenExtractorError

| message                                         | code                                 |
| ----------------------------------------------- |:------------------------------------:|
| No Authorization header is present              | `E_AUTHORIZATION_REQUIRED`           |
| Format is :: Authorization: Bearer <token>      | `E_AUTHORIZATION_INVALID_FORMAT`     |
| Authorization token was not found               | `E_AUTHORIZATION_TOKEN_NOT_FOUND`    |

### JWTError

| message                                         | code                                 |
| ----------------------------------------------- |:------------------------------------:|
| JSON Web Token provided has expired             | `E_TOKEN_EXPIRED`                    |
| Invalid JSON Web Token provided                 | `E_TOKEN_INVALID`                    |

Suppose `E_TOKEN_EXPIRED` error was thrown

```javascript
app.use(jwtPolicy({ secret: 'my_secret_key' }, function(err, req, res, next) {
  if (err) {
    console.log(err.toJSON());
    /*
      {
        status: 401,
        message: 'JSON Web Token provided has expired',
        code: 'E_TOKEN_EXPIRED'
      }
    */

    console.log(err.toString());
    /*
      [JWTError (E_TOKEN_EXPIRED) JSON Web Token provided has expired]
    */

    console.trace(err);
    /*
      prints Error Stack since err instanceof Error
    */
  }
}));
```

## Test

```
$ npm test
```
