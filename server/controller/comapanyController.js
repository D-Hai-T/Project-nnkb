import Company from "../models/Company.js";
import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import generateToken from "../utils/generateToken.js";
import Job from "../models/Job.js";
import JobApplication from "../models/JobApplication.js";
// Register a new Company
export const registerCompany = async (req, res) => {
  const { name, email, password } = req.body;

  const imageFile = req.file;

  if (!name || !email || !password || !imageFile) {
    return res.json({ sucess: false, message: req.t("errors.missingFields") });
  }

  try {
    const companyExists = await Company.findOne({ email });

    if (companyExists) {
      return res.json({ success: false, message: req.t("errors.companyExists") });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const imageUpload = await cloudinary.uploader.upload(imageFile.path);

    const company = await Company.create({
      name,
      email,
      password: hashedPassword,
      image: imageUpload.secure_url,
    });

    res.json({
      success: true,
      company: {
        _id: company._id,
        name: company.name,
        email: company.email,
        image: company.image,
      },
      token: generateToken(company._id),
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Company Login
export const loginCompany = async (req, res) => {
  const { email, password } = req.body;

  try {
    const company = await Company.findOne({ email });

    if (await bcrypt.compare(password, company.password)) {
      res.json({
        success: true,
        company: {
          _id: company._id,
          name: company.name,
          email: company.email,
          image: company.image,
        },
        token: generateToken(company._id),
      });
    } else
      res.json({
        sucess: false,
        message: req.t("errors.invalidCredentials"),
      });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Get company data
export const getCompanyData = async (req, res) => {
  const company = req.company;

  try {
    res.json({ sucess: true, company });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// Post a new Job
export const postJob = async (req, res) => {
  const { title, description, location, salary, level, category } = req.body;

  const companyId = req.company._id;

  try {
    const newJob = new Job({
      title,
      description,
      location,
      salary,
      companyId,
      date: Date.now(),
      level,
      category,
    });

    await newJob.save();

    res.json({ success: true, newJob });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
// Get Company Job Applicants
export const getCompanyJobApplicants = async (req, res) => {
  try {
    const companyId = req.company._id;

    // Find Job applications for the user
    const applications = await JobApplication.find({ companyId })
      .populate("userId", "name image email resume")
      .populate("jobId", "title  location category level salary")
      .exec();

    return res.json({ success: true, applications });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Get Company  Posted Jobs
export const getCompanyPostedJobs = async (req, res) => {
  try {
    const companyId = req.company._id;
    console.log("companyId:", companyId);

    const jobs = await Job.find({ companyId });
    console.log("jobs:", jobs);

    // adding No. of applicants
    const jobsData = await Promise.all(
      jobs.map(async (job) => {
        console.log("job:", job);
        const applicants = await JobApplication.find({ jobId: job._id });
        console.log("applicants:", applicants);
        return { ...job.toObject(), applicants: applicants.length };
      })
    );

    console.log("jobsData:", jobsData);

    // Adding No of appicants info in data
    res.json({ success: true, jobsData });
  } catch (error) {
    console.error("Error:", error);
    res.json({ success: false, message: error.message });
  }
};

// Change Job Application Status
export const ChangeJobApplicationStatus = async (req, res) => {
  
  try{
    const { id, status } = req.body;

  // Find Job Application and update Status

  await JobApplication.findOneAndUpdate(
    {_id: id,},
    {status}
  )
  res.json({success:true, message:req.t("success.statusChanged")})
  }
  catch(error){
    res.json({success:false, message:error.message})
  }
  
  
};

// Change Job Visiblity
export const changeVisiblity = async (req, res) => {
  try {
    const { id } = req.body;

    const companyID = req.company._id;

    const job = await Job.findById(id);

    if (companyID.toString() === job.companyId.toString()) {
      job.visible = !job.visible;
    }
    await job.save();
    res.json({ success: true, job });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Update job details
export const updateJobDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, location, category, level, salary } = req.body;
    const companyID = req.company._id;

    const job = await Job.findById(id);
    if (!job) {
      return res.json({ success: false, message: req.t("errors.jobNotFound") });
    }

    if (job.companyId.toString() !== companyID.toString()) {
      return res.json({ success: false, message: req.t("errors.unauthorized") });
    }

    job.title = title || job.title;
    job.description = description || job.description;
    job.location = location || job.location;
    job.category = category || job.category;
    job.level = level || job.level;
    if (salary !== undefined && salary !== null) {
      job.salary = salary;
    }

    await job.save();
    res.json({ success: true, message: req.t("success.jobUpdated"), job });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    const companyID = req.company._id;
    const job = await Job.findById(id);
    if (!job) {
      return res.json({ success: false, message: req.t("errors.jobNotFound") });
    }
    if (job.companyId.toString() !== companyID.toString()) {
      return res.json({ success: false, message: req.t("errors.unauthorized") });
    }

    await JobApplication.deleteMany({ jobId: id });
    await Job.findByIdAndDelete(id);
    res.json({ success: true, message: req.t("success.jobDeleted") });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
