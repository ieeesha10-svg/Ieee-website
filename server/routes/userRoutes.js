const express = require("express");
const userRouter = express.Router();
const {
  loginUser,
  logoutUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  createUser, // <--- Import the new function
  exportUsersToExcel,
  verifyEmailOTP,
  getAllMembers,
  createMember,
  getMember,
  upgradeMemberRole,
  deleteMember,
  updatePassword,
  forgetPassword,
  resetPassword,
  getEventsForMember,
  exportSpecificUsersToExcel,
  searchMembers
} = require("../controllers/userController");

const { protect, authorize, authorizeSelfOr } = require("../middleware/authMiddleware");
const { VIEW_ROLES, WRITE_ROLES } = require("../constants/roles");

// Public Routes
userRouter.post("/register", registerUser); // Anyone can sign up as User/Member
userRouter.post("/verify-email", verifyEmailOTP);
userRouter.post("/login", loginUser);
userRouter.post("/logout", logoutUser);

// The :id is redundant here — updatePassword reads req.user.id and ignores the
// param — but it is scoped to self anyway so the path can never imply that a
// password is someone else's to change. authorizeSelfOr() with no roles is
// exactly "your own account only".
userRouter.put(
  "/update-password/:id",
  protect,
  authorizeSelfOr(),
  updatePassword,
);
userRouter.post("/forgot-password", forgetPassword);
userRouter.post("/reset-password", resetPassword);

// Protected Routes
userRouter.get("/profile", protect, getUserProfile);

// Edit Profile. updateUserProfile already refuses a mismatched id and strips
// role/position/isVerified from the body; authorizeSelfOr() here is the same
// rule one layer earlier, so a bad id is rejected before the controller runs.
userRouter.put("/profile/:id", protect, authorizeSelfOr(), updateUserProfile);

// A member's attended events, keyed by their id. Every caller passes their own
// id, so this is scoped to the session like the submission lookup above —
// otherwise any signed-in account could read any other member's registrations
// by changing the id. board/xcom may look up anyone's, as they can already via
// the members list.
userRouter.get(
  "/:id/events",
  protect,
  authorizeSelfOr(...VIEW_ROLES),
  getEventsForMember,
);

// Reads: board may look, but may not touch.
userRouter.get("/all", protect, authorize(...VIEW_ROLES), getUsers);
userRouter.get(
  "/members",
  protect,
  authorize(...VIEW_ROLES),
  getAllMembers,
);
userRouter.get(
  "/members/:id",
  protect,
  authorize(...VIEW_ROLES),
  getMember,
);

// Writes: xcom only.
//
// These three used to be open to "member" and "scanner" too, and the
// controllers accepted any value from the role enum — so a low-privilege
// account could PATCH its own id to {"role":"xcom"} and become an admin. Board
// is read-only, and nobody may change their own role (see the controller).
userRouter.post("/create-internal", protect, authorize(...WRITE_ROLES), createUser);
userRouter.post(
  "/members",
  protect,
  authorize(...WRITE_ROLES),
  createMember,
);
userRouter.patch(
  "/members/:id",
  protect,
  authorize(...WRITE_ROLES),
  upgradeMemberRole,
);
userRouter.delete(
  "/members/:id",
  protect,
  authorize(...WRITE_ROLES),
  deleteMember,
);

userRouter.get(
  "/export",
  protect,
  authorize(...VIEW_ROLES),
  exportUsersToExcel,
);
// Export is a read, not a write: it generates a file from data the role is
// already allowed to see. POST only because it takes a body of member ids.
userRouter.post(
  "/export-specific",
  protect,
  authorize(...VIEW_ROLES),
  exportSpecificUsersToExcel,
);
userRouter.get(
  // /search?keyword=anything
  "/search",
  protect,
  authorize(...VIEW_ROLES),
  searchMembers,
);

module.exports = userRouter;