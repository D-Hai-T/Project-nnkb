import e from "express";
import User from "../models/User.js";
import JobApplication from "../models/JobApplication.js";
import Job from "../models/Job.js";
import { v2 } from "cloudinary";
import { clerkClient } from "@clerk/express";

// Get user Data
export const getUserData = async (req, res) => {
  const userId = req.auth.userId;

  console.log("User ID from request:", userId); // Log the user ID

  try {
    const user = await User.findById(userId);

    if (!user) {
      console.log("User not found in database"); // Log if user is not found
      try {
        const clerkUser = await clerkClient.users.getUser(userId);
        if (!clerkUser) {
          return res.json({ success: false, message: req.t("errors.userNotFound") });
        }

        const newUser = await User.create({
          _id: clerkUser.id,
          email: clerkUser.emailAddresses?.[0]?.emailAddress || "",
          name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim(),
          image: clerkUser.imageUrl,
          resume: "",
        });
        return res.json({ success: true, user: newUser });
      } catch (syncError) {
        console.log("Unable to sync user from Clerk:", syncError.message);
        return res.json({ success: false, message: req.t("errors.userNotFound") });
      }
    }
    res.json({ success: true, user });
  } catch (error) {
    console.log("Error fetching user:", error.message); // Log any errors
    res.json({ success: false, message: error.message });
  }
};

// Apply For a Job
export const applyForJob = async (req, res) => {
  const { jobId } = req.body;
  const userId = req.auth.userId;

  try {
    const isAlreadyApplied = await JobApplication.findOne({ userId, jobId });

    if (isAlreadyApplied) {
      return res.json({
        success: false,
        message: req.t("errors.alreadyApplied"),
      });
    }

    const jobData = await Job.findById(jobId);

    if (!jobData) {
      return res.json({ success: false, message: req.t("errors.jobNotFound") });
    }

    await JobApplication.create({
      companyId: jobData.companyId,
      userId,
      jobId,
      date: Date.now(),
    });

    res.json({ success: true, message: req.t("success.applicationSubmitted") });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Get User applied applications
export const getUserJobApplications = async (req, res) => {
  try {
    const userId = req.auth.userId;

    const applications = await JobApplication.find({ userId })
      .populate("companyId", "name email image")
      .populate("jobId", "title description location level salary")
      .exec();

    if (!applications) {
      return res.json({
        success: false,
        message: req.t("errors.noApplications"),
      });
    }

    return res.json({ success: true, applications });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Update User Profile (resume)
export const updateUserResume = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const resumeFile = req.file;

    console.log("Resume file:", resumeFile);

    const userData = await User.findById(userId);

    if (resumeFile) {
      const resumeUpload = await v2.uploader.upload(resumeFile.path);
      userData.resume = resumeUpload.secure_url;
    }
    await userData.save();

    return res.json({ success: true, message: req.t("success.resumeUpdated") });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
