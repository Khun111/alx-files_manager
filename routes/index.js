#!/usr/bin/node
const express = require('express');
const AppController = require('../controllers/AppController');
const UsersController = require('../controllers/UsersController');
const AuthController = require('../controllers/AuthController');
const FilesController = require('../controllers/FilesController');

module.exports = () => {
  const router = express.Router();

  // GET routes
  router.get('/status', AppController.getStatus);
  router.get('/stats', AppController.getStats);
  router.get('/files', FilesController.getIndex);
  router.get('/files/:id', FilesController.getShow);
  router.get('/files/:id/data', FilesController.getFile);

  //= >user auth routes GET
  router.get('/connect', AuthController.getConnect);
  router.get('/disconnect', AuthController.getDisconnect);
  router.get('/users/me', UsersController.getMe);

  // POST routes
  router.post('/users', UsersController.postNew);
  router.post('/files', FilesController.postUpload);

  // PUT routes
  router.put('/files/:id/publish', FilesController.putPublish);
  router.put('/files/:id/unpublish', FilesController.putUnpublish);
  return router;
};
