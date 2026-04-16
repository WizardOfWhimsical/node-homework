const { Router } = require("express");

const router = Router();

router.route("/").get(/*gets list of tasks*/).post(/*creates new task */);

router
  .route("/:id")
  .get(/*shows single taks */)
  .patch(/*this updates/edit a task */)
  .delete(/*removes task */);

module.exports = router;
