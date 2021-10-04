const express = require('express');
const authController = require('./../controllers/authController');
const router = express.Router();

router.post('/signup', authController.signup);

router.post('/signin',authController.signin);

router.post('/forgetPassword',authController.forgetPassword);

// router.post('/changePassword', authController.changePassword);

router.get('/signout', authController.protect );

router.post('/setAddress',authController.protect, authController.setAddress);

router.post('/getUser',authController.protect, authController.getUser);

router.post('/setUserOrder',authController.protect, authController.setUserOrder);

router.post('/allOrders',authController.protect, authController.allOrders);

router.post('/updateOrdersList',authController.protect, authController.updateOrdersList);


module.exports = router;