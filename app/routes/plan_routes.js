// Express docs: http://expressjs.com/en/api.html
const express = require('express')
// Passport docs: http://www.passportjs.org/docs/
const passport = require('passport')

// pull in Mongoose model for plans
const Plan = require('../models/plan')

// we'll use this to intercept any errors that get thrown and send them
// back to the client with the appropriate status code
const handle = require('../../lib/error_handler')

// this is a collection of methods that help us detect situations when we need
// to throw a custom error
const customErrors = require('../../lib/custom_errors')

// we'll use this function to send 404 when non-existant document is requested
const handle404 = customErrors.handle404
// we'll use this function to send 401 when a user tries to modify a resource
// that's owned by someone else
const requireOwnership = customErrors.requireOwnership

// passing this as a second argument to `router.<verb>` will make it
// so that a token MUST be passed for that route to be available
// it will also set `res.user`
const requireToken = passport.authenticate('bearer', { session: false })

// instantiate a router (mini app that only handles routes)
const router = express.Router()

// INDEX
// GET /plans
router.get('/plans', requireToken, (req, res) => {
  Plan.find({ owner: req.user._id })
    .then(plans => {
      // `plans` will be an array of Mongoose documents
      // we want to convert each one to a POJO, so we use `.map` to
      // apply `.toObject` to each one
      return plans.map(plan => plan.toObject())
    })
    // respond with status 200 and JSON of the plans
    .then(plans => res.status(200).json({ plans: plans }))
    // if an error occurs, pass it to the handler
    .catch(err => handle(err, res))
})

// SHOW
// GET /plans/5a7db6c74d55bc51bdf39793
router.get('/plans/:id', requireToken, (req, res) => {
  // req.params.id will be set based on the `:id` in the route
  Plan.findById(req.params.id)
    .then(handle404)
    // if `findById` is succesful, respond with 200 and "plan" JSON
    .then(plan => {
      res.status(200).json({ plan: plan.toObject() })
    })
    // if an error occurs, pass it to the handler
    .catch(err => handle(err, res))
})

// CREATE
// POST /plans
router.post('/plans', requireToken, (req, res) => {
  // set owner of new plan to be current user
  req.body.plan.owner = req.user.id

  Plan.create(req.body.plan)
    // respond to succesful `create` with status 201 and JSON of new "plan"
    .then(plan => {
      requireOwnership(req, plan)
      res.status(201).json({ plan: plan.toObject() })
    })
    // if an error occurs, pass it off to our error handler
    // the error handler needs the error message and the `res` object so that it
    // can send an error message back to the client
    .catch(err => handle(err, res))
})

// UPDATE
// PATCH /plans/5a7db6c74d55bc51bdf39793
router.patch('/plans/:id', requireToken, (req, res) => {
  // if the client attempts to change the `owner` property by including a new
  // owner, prevent that by deleting that key/value pair
  delete req.body.plan.client_id
  Plan.findByIdAndUpdate(
    req.params.id,
    req.body.plan,
    { new: true },
    (err, data) => {
      if (err) {
        res.status(500).send('Error trying to patch')
        return
      }
      res.status(200).json(data)
    }
  )
  // Plan.findById(req.params.id)
  //   .then(handle404)
  //   .then(plan => {
  //     // pass the `req` object and the Mongoose record to `requireOwnership`
  //     // it will throw an error if the current user isn't the owner
  //     // requireOwnership(req, plan);

  //     // the client will often send empty strings for parameters that it does
  //     // not want to update. We delete any key/value pair where the value is
  //     // an empty string before updating
  //     Object.keys(req.body.plan).forEach(key => {
  //       if (req.body.plan[key] === '') {
  //         delete req.body.plan[key]
  //       }
  //     })

  //     // pass the result of Mongoose's `.update` to the next `.then`
  //     return plan.update(req.body.plan)
  //   })
  //   // if that succeeded, return 204 and no JSON
  //   .then(data => res.sendStatus(204))
  //   // if an error occurs, pass it to the handler
  //   .catch(err => handle(err, res))
})

// DESTROY
// DELETE /plans/5a7db6c74d55bc51bdf39793
router.delete('/plans/:id', requireToken, (req, res) => {
  Plan.findById(req.params.id)
    .then(handle404)
    .then(plan => {
      // throw an error if current user doesn't own `plan`
      requireOwnership(req, plan)
      // delete the plan ONLY IF the above didn't throw
      plan.remove()
    })
    // send back 204 and no content if the deletion succeeded
    .then(() => res.sendStatus(204))
    // if an error occurs, pass it to the handler
    .catch(err => handle(err, res))
})

module.exports = router
