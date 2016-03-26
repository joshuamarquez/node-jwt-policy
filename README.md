# jwt-policy

JSON Web Token middleware friendly with Express and Sails.js

Validates ```token``` from HTTP request header authorization and sets ```req.user```

## Install

```
$ npm install jwt-policy --save
```

## Usage

### Sails.js

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

## Test

```
$ npm test
```
