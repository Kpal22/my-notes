# My-Notes

[![Build Status](https://travis-ci.com/Kpal22/my-notes.svg?style=popout)](https://travis-ci.com/Kpal22/my-notes)
[![codecov](https://codecov.io/gh/Kpal22/my-notes/branch/main/graph/badge.svg?)](https://codecov.io/gh/Kpal22/my-notes)
![](https://img.shields.io/github/last-commit/Kpal22/my-notes.svg?style=popout)
![](https://img.shields.io/github/repo-size/Kpal22/my-notes.svg?style=popout)
![](https://img.shields.io/snyk/vulnerabilities/github/Kpal22/my-notes.svg?style=popout)

My-Notes application where user can signup/login and create/update/delete notes

This is a Backend service created using Express.js

## Installation

Before downloading the code, make sure Node.js and Mongodb is installed locally. Cloud mongodb will also work.

Run `npm install` in root of this project. It will automatically create the ***.env***.

If required, run `node envGen` in root to generate ***.env*** for both _src_ and _test_.

## Test

Make requried changes in `./test/.env` accordingly before running the test.

Run `npm test` to run the test. Codecoverage will be shown on terminal, and also can be found in ***coverage*** directory.

## Run

Make requried changes in `/.env` accordingly before running the application.

Run `npm run dev` to run it with nodemon, in Dev mode.

Run `npm start` to run it in Prod. Make sure that environment variables are already there.
