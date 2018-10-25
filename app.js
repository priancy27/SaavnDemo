const express = require("express");
const app = express();
const morgan = require("morgan");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
  info: {
    title: 'Node Swagger API',
    version: '1.0.0',
    description: 'Saavn Demo Project',
  },
  host: 'localhost:3000',
  basePath: '/',
};
const options = {
  swaggerDefinition: swaggerDefinition,
  apis: ['./**/routes/*.js','routes.js'],
  };
const swaggerSpec = swaggerJSDoc(options);

app.get('/swagger.json', function(req, res) {
   res.setHeader('Content-Type', 'application/json');  
   res.send(swaggerSpec); 
});

const serviceRoutes = require('./api/routes/routes');

mongoose.connect(
  process.env.MONGO_URL,
  { useNewUrlParser: true },
);

app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/service", serviceRoutes);

app.use((req, res, next) => {
  const error = new Error("Oops Not found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message
    }
  });
});

module.exports = app;
