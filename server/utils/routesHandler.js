const dashboardRouter = require("../controllers/statsController");
const { authorize, protect } = require("../middleware/authMiddleware");
const { globalErrorHandler } = require("../middleware/errorsMiddleware");
const crewRouter = require("../routes/crewRoutes");
const userRouter = require("../routes/userRoutes") ;

const routersHandler = (app) => {
  
  app.get("/", (req, res) => res.json({ message: "Welcome to the API" }));

  // app.use('/api/users', require('./routes/userRoutes'));
  app.use('/api/users', userRouter);

  app.use('/api/states', protect, authorize('xcom','board'), dashboardRouter);

  app.use('/api/crew', protect, authorize('xcom','board'), crewRouter);

  app.use('/api/forms', require('../routes/formRoutes'));

  app.use('/api/submissions', require('../routes/submissionRoutes'));

  app.use('/api/emails', require('../routes/emailRouts'));

  app.all(/.*/, (req, res) => {
    res.status(404).json({ message: "This router is not exist" });
  });

  app.use(globalErrorHandler);
};

module.exports = {routersHandler}