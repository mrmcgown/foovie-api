// Express docs: http://expressjs.com/en/api.html
const express = require("express");
// Passport docs: http://www.passportjs.org/docs/
const passport = require("passport");

// pull in Mongoose model for invitations
const Invitation = require("../models/invitation");

// we'll use this to intercept any errors that get thrown and send them
// back to the client with the appropriate status code
const handle = require("../../lib/error_handler");

// this is a collection of methods that help us detect situations when we need
// to throw a custom error
const customErrors = require("../../lib/custom_errors");

// we'll use this function to send 404 when non-existant document is requested
const handle404 = customErrors.handle404;
// we'll use this function to send 401 when a user tries to modify a resource
// that's owned by someone else
const requireOwnership = customErrors.requireOwnership;

// passing this as a second argument to `router.<verb>` will make it
// so that a token MUST be passed for that route to be available
// it will also set `res.user`
const requireToken = passport.authenticate("bearer", { session: false });

// instantiate a router (mini app that only handles routes)
const router = express.Router();

// INDEX
// GET /invitations
router.get("/invitations", requireToken, (req, res) => {
  Invitation.find()
    .then(invitations => {
      // `invitations` will be an array of Mongoose documents
      // we want to convert each one to a POJO, so we use `.map` to
      // apply `.toObject` to each one
      return invitations.map(invitation => invitation.toObject());
    })
    // respond with status 200 and JSON of the invitations
    .then(invitations => res.status(200).json({ invitations: invitations }))
    // if an error occurs, pass it to the handler
    .catch(err => handle(err, res));
});

// SHOW
// GET /invitations/5a7db6c74d55bc51bdf39793
router.get("/invitations/:id", requireToken, (req, res) => {
  // req.params.id will be set based on the `:id` in the route
  Invitation.findById(req.params.id)
    .then(handle404)
    // if `findById` is succesful, respond with 200 and "invitation" JSON
    .then(invitation =>
      res.status(200).json({ invitation: invitation.toObject() })
    )
    // if an error occurs, pass it to the handler
    .catch(err => handle(err, res));
});

// CREATE
// POST /invitations
router.post("/invitations", requireToken, (req, res) => {
  // set owner of new invitation to be current user
  req.body.invitation.creator_id = req.user.id;

  Invitation.create(req.body.invitation)
    // respond to succesful `create` with status 201 and JSON of new "invitation"
    .then(invitation => {
      res.status(201).json({ invitation: invitation.toObject() });
    })
    // if an error occurs, pass it off to our error handler
    // the error handler needs the error message and the `res` object so that it
    // can send an error message back to the client
    .catch(err => handle(err, res));
});

// UPDATE
// PATCH /invitations/5a7db6c74d55bc51bdf39793
router.patch("/invitations/:id", requireToken, (req, res) => {
  // if the client attempts to change the `owner` property by including a new
  // owner, prevent that by deleting that key/value pair
  delete req.body.invitation.owner;

  Invitation.findById(req.params.id)
    .then(handle404)
    .then(invitation => {
      // pass the `req` object and the Mongoose record to `requireOwnership`
      // it will throw an error if the current user isn't the owner
      requireOwnership(req, invitation);

      // the client will often send empty strings for parameters that it does
      // not want to update. We delete any key/value pair where the value is
      // an empty string before updating
      Object.keys(req.body.invitation).forEach(key => {
        if (req.body.invitation[key] === "") {
          delete req.body.invitation[key];
        }
      });

      // pass the result of Mongoose's `.update` to the next `.then`
      return invitation.update(req.body.invitation);
    })
    // if that succeeded, return 204 and no JSON
    .then(() => res.sendStatus(204))
    // if an error occurs, pass it to the handler
    .catch(err => handle(err, res));
});

// DESTROY
// DELETE /invitations/5a7db6c74d55bc51bdf39793
router.delete("/invitations/:id", requireToken, (req, res) => {
  Invitation.findById(req.params.id)
    .then(handle404)
    .then(invitation => {
      // throw an error if current user doesn't own `invitation`
      requireOwnership(req, invitation);
      // delete the invitation ONLY IF the above didn't throw
      invitation.remove();
    })
    // send back 204 and no content if the deletion succeeded
    .then(() => res.sendStatus(204))
    // if an error occurs, pass it to the handler
    .catch(err => handle(err, res));
});

module.exports = router;
