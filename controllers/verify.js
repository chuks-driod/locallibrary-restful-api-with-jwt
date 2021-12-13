const jwt = require("jsonwebtoken");

// const config = process.env;

const verifyToken = (req, res, next) => {
  var bearerHeader = req.headers["authorization"];
    // req.body.token || req.query.token || req.headers["authorization"];


    if (typeof bearerHeader !== 'undefined') {
    
      var bearer = bearerHeader.split(' ');
  
      var bearerToken = bearer[1];
      req.token = bearerToken;

      next()    
    } else {
      res.sendStatus(403);
    }
    
};

module.exports = verifyToken;