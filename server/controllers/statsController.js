const express = require("express");
const dashboardRouter = express.Router();
const User = require("../models/UserModel.js");
const EmailLog = require("../models/EmailLog.js");
const mongoose = require("mongoose");
const Activity = require("../models/ActivityModel.js");
const Submission = require("../models/SubmissionModel.js");
const { catchAsync } = require("../middleware/errorsMiddleware.js");

// GET /api/stats/dashboard
dashboardRouter.get(
  "/dashboard",
  catchAsync(async (req, res) => {
    // Total Members
    const totalMembers = await User.countDocuments();

    // Active Activities
    const activeActivities = await Activity.countDocuments({
      status: "published",
      registrationEnabled: true,
    });

    // New Registrations (Last 7 Days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const newRegistrations = await User.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
    });

    // College Split
    const collegeSplit = await User.aggregate([
      { $group: { _id: "$college", count: { $sum: 1 } } },
      { $project: { college: "$_id", count: 1, _id: 0 } },
    ]);

    // Academic Year Split
    const yearSplit = await User.aggregate([
      { $group: { _id: "$yearOfStudy", count: { $sum: 1 } } },
      { $project: { yearOfStudy: "$_id", count: 1, _id: 0 } },
    ]);

    // Emails Sent
    const emailsSent = await EmailLog.countDocuments();

    // Top Active Members (based on scans)
    const topActiveMembers = await Submission.aggregate([
      // Only get submissions where:
      // - user attended the activity
      // - submission is linked to a real user
      {
        $match: {
          status: "attended",
          user: { $exists: true, $ne: null },
        },
      },
      // Group submissions by user
      // Count how many activities each user attended
      {
        $group: {
          _id: "$user",
          activitiesAttended: { $sum: 1 },
        },
      },
      // Sort users descending by attendance count ---->> Most active users will appear first
      {
        $sort: {
          activitiesAttended: -1,
        },
      },
      // Get only top 5 users
      {
        $limit: 5,
      },
      // Join user details from users collection (to get name and email)
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      // Convert user array into  object and only return necessary fields (name, email)
      {
        $unwind: "$user",
      },
      // Shape final response object
      {
        $project: {
          _id: 0,
          name: "$user.name",
          email: "$user.email",
          activitiesAttended: 1,
        },
      },
    ]);

    // Latest 5 Signups
    const latestSignups = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name email college yearOfStudy createdAt");

    // Activity  Status Summary
    const activityStatusSummary = await Activity.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },

      {
        $project: {
          _id: 0,
          status: "$_id",
          count: 1,
        },
      },
    ]);
    // Registrations Per Activity --> Useful for charts
    const registrationsPerActivity = await Submission.aggregate([
      {
        $group: {
          _id: "$activity",
          registrations: { $sum: 1 },
        },
      },
      {
        $sort: {
          registrations: -1,
        },
      },
      {
        $lookup: {
          from: "activities",
          localField: "_id",
          foreignField: "_id",
          as: "activity",
        },
      },

      {
        $unwind: "$activity",
      },

      {
        $project: {
          _id: 0,
          activityTitle: "$activity.title",
          registrations: 1,
        },
      },
    ]);
    res.json({
      totalMembers,
      activeActivities,
      newRegistrations,
      collegeSplit,
      yearSplit,
      emailsSent,
      topActiveMembers,
      latestSignups,
      activityStatusSummary,
      registrationsPerActivity,
    });
  }),
);

module.exports = dashboardRouter;