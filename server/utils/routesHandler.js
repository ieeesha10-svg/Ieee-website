const dashboardRouter = require("../controllers/statsController");
const { authorize, protect } = require("../middleware/authMiddleware");
const { globalErrorHandler } = require("../middleware/errorsMiddleware");
const activityRouter = require("../routes/activityRoutes");
const crewRouter = require("../routes/crewRoutes");
const userRouter = require("../routes/userRoutes") ;
const formRouter = require("../routes/formRoutes");
const submissionRouter = require("../routes/submissionRoutes");

const routersHandler = (app) => {
  
  app.get("/", (req, res) => res.json({ message: "Welcome to the API" }));

  // app.use('/api/users', require('./routes/userRoutes'));
  app.use('/api/users', userRouter);

  app.use('/api/states', protect, authorize('xcom','board'), dashboardRouter);

  app.use('/api/crew', protect, authorize('xcom','board'), crewRouter);

  app.use('/api/activities', protect, authorize('xcom','board'), activityRouter);

  app.use('/api/form', formRouter);

  app.use('/api/submissions', submissionRouter);

  app.use('/api/emails', require('../routes/emailRouts'));

  app.all(/.*/, (req, res) => {
    res.status(404).json({ message: "This router is not exist" });
  });

  app.use(globalErrorHandler);
};

module.exports = {routersHandler}