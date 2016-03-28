# jwt-policy

JSON Web Token middleware friendly with Express and Sails.js

Validates `token` from HTTP request header authorization and sets `req.user`, token is expected to be found at `Authorization: Bearer <token>`.

This module verifies tokens with [node-jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)

## Install

```
$ npm install jwt-policy --save
```

## Usage

### jwtPolicy(options, [callback])

`options`:

* `secret`: is a string containing the secret for decoding token.

Specify callback if you wish to do something with `req.user` or check for possible errors, if callback is not supplied then default behavior will take effect.

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

## Error handling

### JWTError

Possible thrown errors

| message                                         | code                                 |
| ----------------------------------------------- |:------------------------------------:|
| No Authorization header is present              | `E_AUTHORIZATION_REQUIRED`           |
| Format is :: Authorization: Bearer <token>      | `E_INVALID_AUTHORIZATION_FORMAT`     |
| Authorization token was not found               | `E_AUTHORIZATION_TOKEN_NOT_FOUND`    |
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
