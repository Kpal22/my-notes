const express = require('express');
const noteUtil = require('../utils/note');
const { auth } = require('../configs/auth');
const router = new express.Router();

/**
 * @swagger
 * tags:
 *  name: Note
 *  description: Note management
 */

/**
 * @swagger
 * paths:
 *  /notes:
 *      post:
 *          summary: Create a new note
 *          tags: [Note]
 *          security:
 *            - bearerAuth: []
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Note'
 *          responses:
 *              200:
 *                  description: Note created successfully
 *              400:
 *                  description: Note title is not passing minimum requirement
 *              401:
 *                  description: Authentication failed, auth token is expired/malformed/missing
 *              500:
 *                  description: Internal Server Error
 */
router.post('/', auth, async (req, res, next) => {
    try {
        res.status(201).send(await noteUtil.save(req.body, req.user._id))
    } catch (err) {
        next(err);
    }
})

/**
 * @swagger
 * paths:
 *  /notes:
 *      get:
 *          summary: Get notes
 *          tags: [Note]
 *          security:
 *            - bearerAuth: []
 *          parameters:
 *            - name: id
 *              in: query
 *              schema:
 *                  type: string
 *                  description: ID of the note to fetch
 *            - name: limit
 *              in: query
 *              schema:
 *                  type: integer
 *                  description: The numbers of notes to return
 *            - name: skip
 *              in: query
 *              schema:
 *                  type: integer
 *                  description: The number of notes to skip before starting to collect the result
 *            - name: sortBy
 *              in: query
 *              schema:
 *                  type: string
 *                  description: Sort the sollection of notes by
 *            - name: order
 *              in: query
 *              schema:
 *                  type: string
 *                  description: Sorting order can be desc/asc
 *          responses:
 *              200:
 *                  description: Note created successfully
 *              401:
 *                  description: Authentication failed, auth token is expired/malformed/missing
 *              404:
 *                  description: No note found
 *              500:
 *                  description: Internal Server Error
 */
router.get('/', auth, async (req, res, next) => {
    try {
        res.send(await req.user.getNotes(req.query));
    } catch (err) {
        next(err);
    }
})

/**
 * @swagger
 * paths:
 *  /notes/{id}:
 *      patch:
 *          summary: update note
 *          tags: [Note]
 *          security:
 *            - bearerAuth: []
 *          parameters:
 *            - name: id
 *              in: path
 *              required: true
 *              schema:
 *                  type: string
 *                  description: ID of the note to fetch
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Note'
 *          responses:
 *              200:
 *                  description: Note created successfully
 *              400:
 *                  description: Note id is missing or title/content is not passing minimum requirement
 *              401:
 *                  description: Authentication failed, auth token is expired/malformed/missing
 *              404:
 *                  description: No note found
 *              500:
 *                  description: Internal Server Error
 */
router.patch('/:id', auth, async (req, res, next) => {
    try {
        res.send(await noteUtil.update(req.params.id, req.body, req.user._id));
    } catch (err) {
        next(err);
    }
});

/**
 * @swagger
 * paths:
 *  /notes/{id}:
 *      delete:
 *          summary: update note
 *          tags: [Note]
 *          security:
 *            - bearerAuth: []
 *          parameters:
 *            - name: id
 *              in: path
 *              required: true
 *              schema:
 *                  type: string
 *                  description: ID of the note to fetch
 *          responses:
 *              200:
 *                  description: Note deleted successfully
 *              400:
 *                  description: Note id is missing
 *              401:
 *                  description: Authentication failed, auth token is expired/malformed/missing
 *              404:
 *                  description: No note found
 *              500:
 *                  description: Internal Server Error
 */
router.delete('/:id', auth, async (req, res, next) => {
    try {
        res.send(await noteUtil.remove(req.params.id, req.user._id));
    } catch (err) {
        next(err);
    }
})

module.exports = router
