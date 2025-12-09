import moment from "moment";
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import Loading from "../components/Loading";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { JobCategories, JobLocations } from "../assets/assets";

const ManageJobs = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editingJob, setEditingJob] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    location: "",
    category: "",
    level: "",
    salary: 0,
    description: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [deletingJob, setDeletingJob] = useState(null);
  const { backendUrl, companyToken } = useContext(AppContext);
  const { t } = useTranslation();
  const text = t("manageJobs", { returnObjects: true });
  const addJobText = t("addJob", { returnObjects: true });

  // Function to fetch company Job Applications
  const fetchCompanyJobs = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.get(backendUrl + "/api/company/list-jobs", {
        headers: { token: companyToken },
      });

      if (data.success) {
        setJobs(data.jobsData.reverse());
        console.log(data.jobsData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to change Job Visibility
  const changeJobVisiblity = async (id) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/company/change-visibility",
        { id },
        {
          headers: { token: companyToken },
        }
      );
      if (data.success) {
        toast.success(data.message);
        fetchCompanyJobs();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (companyToken) {
      fetchCompanyJobs();
    }
  }, [companyToken]);

  const closeEdit = () => {
    setEditingJob(null);
    setEditForm({
      title: "",
      location: "",
      category: "",
      level: "",
      salary: 0,
      description: "",
    });
    setDeletingJob(null);
  };

  const openEditModal = (job) => {
    setEditingJob(job);
    setEditForm({
      title: job.title || "",
      location: job.location || "",
      category: job.category || "",
      level: job.level || "",
      salary: job.salary || 0,
      description: job.description || "",
    });
  };

  const openDeleteConfirm = (job) => {
    setDeletingJob(job);
  };

  const handleEditChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const saveJobChanges = async (e) => {
    e.preventDefault();
    if (!editingJob) return;
    try {
      setIsSaving(true);
      const { data } = await axios.put(
        `${backendUrl}/api/company/update-job/${editingJob._id}`,
        {
          ...editForm,
          salary: Number(editForm.salary),
        },
        {
          headers: { token: companyToken },
        }
      );
      if (data.success) {
        toast.success(t("common.notifications.jobUpdated"));
        fetchCompanyJobs();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
      closeEdit();
    }
  };

  const deleteJob = async () => {
    if (!deletingJob) return;
    try {
      setIsSaving(true);
      const { data } = await axios.delete(
        `${backendUrl}/api/company/delete-job/${deletingJob._id}`,
        {
          headers: { token: companyToken },
        }
      );
        if (data.success) {
          toast.success(t("common.notifications.jobDeleted"));
          fetchCompanyJobs();
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        toast.error(error.message);
      } finally {
        setIsSaving(false);
        setDeletingJob(null);
      }
  };

  if (isLoading) return <Loading />;

  if (jobs && jobs.length === 0) {
    return (
      <div className="flex items-center justify-center h-[70vh] bg-white rounded-xl shadow-md">
        <p className="text-xl sm:text-2xl text-gray-600">{text.empty}</p>
      </div>
    );
  }

  return (
    <>
    <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
    >
      <div className="container p-4 mx-auto">
        {/* Dashboard Header */}
        <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="mb-8"
                >
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-primary mb-2">{text.heading}</h1>
          <p className="text-gray-600">{text.subheading}</p>
        </div>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
        >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-primary">
            <p className="text-gray-500 text-sm mb-1">{text.stats.total}</p>
            <p className="text-2xl font-bold text-primary">{jobs.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-green-500">
            <p className="text-gray-500 text-sm mb-1">{text.stats.active}</p>
            <p className="text-2xl font-bold text-green-600">
              {jobs.filter(job => job.visible).length}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-blue-500">
            <p className="text-gray-500 text-sm mb-1">{text.stats.applicants}</p>
            <p className="text-2xl font-bold text-blue-600">
              {jobs.reduce((sum, job) => sum + job.applicants, 0)}
            </p>
          </div>
        </div>
        </motion.div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-primary">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="py-4 px-6 text-left max-sm:hidden sm:text-[16px] font-semibold">{text.table.number}</th>
                  <th className="py-4 px-6 text-left sm:text-[16px] font-semibold">{text.table.title}</th>
                  <th className="py-4 px-6 text-left max-sm:hidden sm:text-[16px] font-semibold">
                    {text.table.date}
                  </th>
                  <th className="py-4 px-6 text-left max-sm:hidden sm:text-[16px] font-semibold">
                    {text.table.location}
                  </th>
                  <th className="py-4 px-6 text-center sm:text-[16px] font-semibold">
                    <span className="flex items-center justify-center">
                      {text.table.applicants}
                    </span>
                  </th>
                  <th className="py-4 px-6 text-center sm:text-[16px] font-semibold">{text.table.visible}</th>
                  <th className="py-4 px-6 text-center sm:text-[16px] font-semibold">{text.table.actions}</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job, index) => (
                  <tr 
                    key={index} 
                    className="text-gray-700 sm:text-[15px] border-b hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-6 max-sm:hidden">
                      {index + 1}
                    </td>
                    <td className="py-4 px-6 font-medium">{job.title}</td>
                    <td className="py-4 px-6 max-sm:hidden">
                      {moment(job.date).format("ll")}
                    </td>
                    <td className="py-4 px-6 max-sm:hidden">
                      {job.location}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex justify-center">
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          job.applicants > 0 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {job.applicants}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex justify-center">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            onChange={() => changeJobVisiblity(job._id)}
                            className="sr-only peer"
                            type="checkbox"
                            checked={job.visible}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => openEditModal(job)}
                          className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                          {t("common.buttons.edit")}
                        </button>
                        <button
                          onClick={() => openDeleteConfirm(job)}
                          className="text-sm text-red-600 hover:text-red-800 font-medium"
                        >
                          {t("common.buttons.delete")}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={() => navigate("/dashboard/add-job")}
            className="bg-primary text-white py-3 px-6 rounded-xl font-medium hover:bg-primary/90 transition duration-300 ease-in-out flex items-center gap-2 shadow-md"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            {text.addButton}
          </button>
        </div>
      </div>
      </motion.div>

      {editingJob && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-semibold text-gray-800">
                  {addJobText?.heading || "Edit Job"}
                </h2>
                <p className="text-gray-500 text-sm">
                  {t("common.buttons.edit") || "Edit the job information"}
                </p>
              </div>
              <button
                onClick={closeEdit}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <form onSubmit={saveJobChanges} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600">{addJobText?.form?.jobTitle}</label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => handleEditChange("title", e.target.value)}
                    className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">{addJobText?.form?.salary}</label>
                  <input
                    type="number"
                    value={editForm.salary}
                    onChange={(e) => handleEditChange("salary", e.target.value)}
                    className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-gray-600">{addJobText?.form?.category}</label>
                  <select
                    value={editForm.category}
                    onChange={(e) => handleEditChange("category", e.target.value)}
                    className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    {JobCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-600">{addJobText?.form?.location}</label>
                  <select
                    value={editForm.location}
                    onChange={(e) => handleEditChange("location", e.target.value)}
                    className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    {JobLocations.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-600">{addJobText?.form?.level}</label>
                  <select
                    value={editForm.level}
                    onChange={(e) => handleEditChange("level", e.target.value)}
                    className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Beginner level">{addJobText?.levelOptions?.beginner}</option>
                    <option value="Intermediate level">{addJobText?.levelOptions?.intermediate}</option>
                    <option value="Senior level">{addJobText?.levelOptions?.senior}</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-600">{addJobText?.form?.description}</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => handleEditChange("description", e.target.value)}
                  rows={5}
                  className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                ></textarea>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeEdit}
                  className="px-5 py-2 rounded-lg border text-gray-600 hover:bg-gray-100"
                >
                  {t("common.buttons.cancel")}
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
                >
                  {isSaving ? t("common.buttons.save") + "..." : t("common.buttons.save")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deletingJob && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              {t("common.buttons.delete")}
            </h2>
            <p className="text-gray-600 mb-6">
              {t("manageJobs.deleteConfirm", {
                title: deletingJob.title,
              }) || `Are you sure you want to delete "${deletingJob.title}"?`}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeletingJob(null)}
                className="px-5 py-2 rounded-lg border text-gray-600 hover:bg-gray-100"
              >
                {t("common.buttons.cancel")}
              </button>
              <button
                onClick={deleteJob}
                disabled={isSaving}
                className="px-5 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
              >
                {isSaving ? t("common.buttons.delete") + "..." : t("common.buttons.delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ManageJobs;
