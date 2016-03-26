# jwt-policy

JSON Web Token middleware friendly with Express and Sails.js

Validates ```token``` from HTTP request header authorization and sets ```req.user```

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

app.use(jwtPolicy({ secret: 'my_secret_key' }));

app.get('/', function(req, res) {
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

## Test

```
$ npm test
```
