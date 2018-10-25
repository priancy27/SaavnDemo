const express = require('express');
const router = express.Router();
const multer = require('multer');
const controller  = require("../controllers/controller");
const authController = require("../controllers/authController");
const authorization = require("../middleware/check-auth");

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, new Date().toISOString() + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'text/csv') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5
  },
  fileFilter: fileFilter
});

/**
 * @swagger
 * /service/signup:
 *   post:
 *     tags:
 *        signup
 *     description: Used For Signup
 *     produces:
 *        application/json
 *     parameters:
 *        name:test
 *        email:test1@gmail.com
 *        password:body
 *        required:true
 *     responses:
 *        201:
 *          description: Success if user is created
 *        401:
 *          description: Auth failed
 *        500:
 *          description: Error
 *        409:
 *          description: User Alreay exists
 */
router.post("/signup", authController.signup);

/**
 * @swagger
 * /service/login:
 *   post:
 *     tags:
 *        login
 *     description: Used For login and get access token
 *     produces:
 *        application/json
 *     parameters:
 *        name:test
 *        email:test1@gmail.com
 *        required:true
 *     responses:
 *        200:
 *          description: Returns Access Token if user succesfully logs In
 *        401:
 *          description: Auth failed
 *        500:
 *          description: Error
 */
router.post("/login", authController.login);

/**
 * @swagger
 * /service/upload-file:
 *   post:
 *     tags:
 *        Upload
 *     description: Upload CSV file
 *     produces:
 *        application/json
 *     parameters:
 *        file:task_file.csv
 *        required:true
 *     headers:
 *        Authorization: Access Token Returned In login API
 *     responses:
 *        200:
 *          description: Data Imported Succesfully
 *        401:
 *          description: Auth failed
 *        500:
 *          description: Error
 */
router.post("/upload-file", authorization, upload.single('file'), controller.uploadFile);

/**
 * @swagger
 * /service/fetch/:filter:
 *   get:
 *     tags:
 *        Fetch
 *     description: Fetches data according to filter
 *     produces:
 *        application/json
 *     parameters:
 *        filter:android
 *        required:true
 *     headers:
 *        Authorization: Access Token Returned In login API
 *     responses:
 *        200:
 *          description: Data Imported Succesfully
 *        401:
 *          description: Auth failed
 *        500:
 *          description: Error
 */
router.get("/fetch/:filter", authorization, controller.fetch);

module.exports = router;