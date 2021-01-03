const express = require('express');
const { auth } = require('../configs/auth');
const userUtil = require('../utils/user');
const multer = require('multer');
const router = new express.Router();

/**
 * @swagger
 * tags:
 *  name: User
 *  description: User management
 */

/**
* @swagger
* paths:
*  /users/signup:
*      post:
*          summary: Create a new user
*          tags: [User]
*          requestBody:
*              required: true
*              content:
*                  application/json:
*                      schema:
*                          $ref: '#/components/schemas/User'
*          responses:
*              200:
*                  description: User created successfully
*              400:
*                  description: Name/Email/Password is not passing minimum requirement
*              409:
*                  description: Email already exists, try different email to signup
*              500:
*                  description: Internal Server Error   
*/
router.post('/signup', async (req, res, next) => {
    try {
        res.status(201).send(await userUtil.save(req.body));
    } catch (err) {
        next(err);
    }
});

/**
 * @swagger
 * paths:
 *  /users/login:
 *      post:
 *          summary: Login with credential
 *          tags: [User]
 *          requestBody:
 *              required: true
 *              content:
 *                  application/x-www-form-urlencoded:
 *                      schema:
 *                          type: object
 *                          required:
 *                            - email
 *                            - password
 *                          properties:
 *                              email:
 *                                  type: string
 *                                  format: email
 *                                  description: Email of the user to login
 *                              password:
 *                                  type: string
 *                                  description: Password of the user to login
 *          responses:
 *              200:
 *                  description: Authorization token created successfully
 *              401:
 *                  description: Login failed, Email/Password is not correct
 *              500:
 *                  description: Internal Server Error  
 */
router.post('/login', async (req, res, next) => {
    try {
        res.send(await userUtil.login(req.body));
    } catch (err) {
        next(err);
    }
});

/**
 * @swagger
 * paths:
 *  /users/logout:
 *      post:
 *          summary: Logout with auth token
 *          tags: [User]
 *          security:
 *              - bearerAuth: []
 *          responses:
 *              200:
 *                  description: Logout successful
 *              401:
 *                  description: Authentication failed, auth token is expired/malformed/missing
 *              500:
 *                  description: Internal Server Error
 */
router.post('/logout', auth, (req, res) => {
    req.user.removeAuthToken(req.token);
    res.send('Log out successful');
});

/**
 * @swagger
 * paths:
 *  /users/logout/all:
 *      post:
 *          summary: Logout all auth tokens
 *          tags: [User]
 *          security:
 *              - bearerAuth: []
 *          responses:
 *              200:
 *                  description: Logout successful
 *              401:
 *                  description: Authentication failed, auth token is expired/malformed/missing
 *              500:
 *                  description: Internal Server Error
 */
router.post('/logout/all', auth, (req, res) => {
    req.user.removeAuthToken();
    res.send('All devices log out successful');
});

/**
 * @swagger
 * paths:
 *  /users:
 *      get:
 *          summary: Get user data
 *          tags: [User]
 *          security:
 *              - bearerAuth: []
 *          responses:
 *              200:
 *                  description: Logout successful
 *              401:
 *                  description: Authentication failed, auth token is expired/malformed/missing
 *              500:
 *                  description: Internal Server Error
 */
router.get('/', auth, (req, res) => {
    res.send(req.user);
});

/**
 * @swagger
 * paths:
 *  /users:
 *      patch:
 *          summary: Update user
 *          tags: [User]
 *          security:
 *              - bearerAuth: []
 *          requestBody:
 *              required: true
 *              content:
 *                  application/x-www-form-urlencoded:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              name:
 *                                  type: string
 *                                  description: Updated name of the user
 *                              email:
 *                                  type: string
 *                                  format: email
 *                                  description: Updated email of the user
 *          responses:
 *              200:
 *                  description: User updated successfully
 *              400:
 *                  description: Name/Email is not passing minimum requirement
 *              401:
 *                  description: Authentication failed, auth token is expired/malformed/missing
 *              409:
 *                  description: Email already exists, try different email to signup
 *              500:
 *                  description: Internal Server Error   
 */
router.patch('/', auth, async (req, res, next) => {
    try {
        res.send(await req.user.updateUser(req.body));
    } catch (err) {
        next(err);
    }
});

/**
 * @swagger
 * paths:
 *  /users:
 *      put:
 *          summary: Update user password
 *          tags: [User]
 *          security: 
 *              - bearerAuth: []
 *          requestBody:
 *              required: true
 *              content:
 *                  application/x-www-form-urlencoded:
 *                      schema:
 *                          type: object
 *                          required:
 *                            - oldPassword
 *                            - newPassword
 *                          properties:
 *                              oldPassword:
 *                                  type: string
 *                                  description: Old password of the user
 *                              newPassword:
 *                                  type: string
 *                                  description: New password of the user
 *          responses:
 *              200:
 *                  description: User updated successfully
 *              400:
 *                  description: NewPassword/OldPassword is not passing minimum requirement
 *              401:
 *                  description: Authentication failed, auth token is expired/malformed/missing
 *              500:
 *                  description: Internal Server Error   
 */
router.put('/', auth, async (req, res, next) => {
    try {
        await req.user.updatePassword(req.body);
        res.send('Password Updated Successfully!');
    } catch (err) {
        next(err);
    }
});

/**
 * @swagger
 * paths:
 *  /users:
 *      delete:
 *          summary: Delete user
 *          tags: [User]
 *          security:
 *              - bearerAuth: []
 *          responses:
 *              200:
 *                  description: Deletion successful
 *              401:
 *                  description: Authentication failed, auth token is expired/malformed/missing
 *              500:
 *                  description: Internal Server Error
 */
router.delete('/', auth, async (req, res) => {
    await req.user.remove();
    res.send(req.user);
});

const upload = multer({
    limits: { fileSize: 1000000 },
    fileFilter(_req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Please upload an image jpg/jpeg/png, max 1 mb size'));
        } else {
            cb(undefined, true);
        }
    }
}).single('avatar');

/**
 * @swagger
 * paths:
 *  /users/avatar:
 *      post:
 *          summary: Set user avatar
 *          tags: [User]
 *          security:
 *              - bearerAuth: []
 *          requestBody:
 *              required: true
 *              content:
 *                  multipart/form-data:
 *                      schema:
 *                          type: object
 *                          required: 
 *                            - avatar
 *                          properties:
 *                              avatar:
 *                                  type: string
 *                                  format: binary
 *          responses:
 *              200:
 *                  description: Avatar saved successful
 *              400:
 *                  description: File must be an image of jpg/jpeg/png of max size 1 mb
 *              401:
 *                  description: Authentication failed, auth token is expired/malformed/missing
 *              500:
 *                  description: Internal Server Error
 */
router.post('/avatar', auth, async (req, res, next) => {
    try {
        upload(req, res, async err => {
            if (err) {
                next({ status: 400, message: err.message });
            } else {
                await req.user.setAvatar(req.file);
                res.send('Avatar saved successfully');
            }
        });
    } catch (err) {
        next(err);
    }
});

/**
 * @swagger
 * paths:
 *  /users/avatar:
 *      get:
 *          summary: Get user avatar
 *          tags: [User]
 *          security:
 *              - bearerAuth: []
 *          responses:
 *              200:
 *                  description: Avatar fetched successfully
 *              401:
 *                  description: Authentication failed, auth token is expired/malformed/missing
 *              500:
 *                  description: Internal Server Error
 */
router.get('/avatar', auth, async (req, res, next) => {
    try {
        res.set('Content-Type', 'image/png').send(req.user.avatar);
    } catch (err) {
        next(err);
    }
})

module.exports = router;