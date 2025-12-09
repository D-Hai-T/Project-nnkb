// Fully Redesigned Futuristic Dashboard with Glassmorphism, Animations & Widgets
import React, { useContext, useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import logo from "../assets/newlogo.svg";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState("");
  const { companyData, setCompanyData, setCompanyToken } = useContext(AppContext);
  const { t } = useTranslation();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const path = location.pathname.split("/").pop();
    setActiveTab(path);
  }, [location]);

  useEffect(() => {
    if (companyData) navigate("/dashboard/manage-job");
  }, [companyData]);

  useEffect(() => {
    const handleResize = () => setIsSidebarOpen(window.innerWidth >= 1024);
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const formatTime = date => date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return t("dashboard.greetings.morning");
    if (hour < 18) return t("dashboard.greetings.afternoon");
    return t("dashboard.greetings.evening");
  };
  const logout = () => {
    setCompanyToken(null);
    localStorage.removeItem("companyToken");
    setCompanyData(null);
    navigate("/");
  };

  const navItems = useMemo(
    () => [
      { path: "add-job", label: t("dashboard.sidebar.addJob")},
      { path: "manage-job", label: t("dashboard.sidebar.manageJobs")},
      { path: "view-applications", label: t("dashboard.sidebar.viewApplications")},
    ],
    [t]
  );

  const tabLabelMap = {
    "": t("dashboard.sidebar.manageJobs"),
    "manage-job": t("dashboard.sidebar.manageJobs"),
    "add-job": t("dashboard.sidebar.addJob"),
    "view-applications": t("dashboard.sidebar.viewApplications"),
  };
  const activeTitle = tabLabelMap[activeTab] || t("dashboard.sidebar.manageJobs");

  return (
    <div className="flex h-screen bg-gradient-to-tr from-[#f5f7fa] via-[#ebedfb] to-[#dce3ff] font-[Poppins]">
      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: -250, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -250, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="fixed lg:static left-0 top-0 w-72 h-full bg-white/60 backdrop-blur-md  z-50 flex flex-col justify-between  border-r border-white/30"
          >
            <div className="p-6">
              <img
                src={companyData?.image || logo}
                alt={companyData?.name || "Logo"}
                className="h-15 mb-8 cursor-pointer rounded-xl object-contain bg-white/40 p-3"
                onClick={() => navigate("/")}
              />
              <div className="space-y-3">
                {navItems.map(({ path, label, icon }, i) => (
                  <NavLink
                    key={i}
                    to={`/dashboard/${path}`}
                    className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium  hover:scale-[1.02] ${isActive ? "bg-indigo-600 text-white" : "text-gray-800 hover:bg-white/20"}`}
                  >
                    <span className="text-lg">{icon}</span>
                    <span>{label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
            <div className="bg-white/50 backdrop-blur-sm p-5 rounded-bl-3xl">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 bg-indigo-300 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-md">
                  {companyData?.name?.[0] || "C"}
                </div>
                <div>
                  <p className="text-sm font-semibold text-indigo-800">{companyData?.name}</p>
                  <p className="text-xs text-indigo-500">{t("dashboard.recruiterMode")}</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="mt-4 text-sm text-red-500 hover:underline w-full text-left"
              >{t("dashboard.logout")}</button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/70 backdrop-blur-md shadow px-8 py-5 flex justify-between items-center border-b border-white/20"
        >
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {activeTitle}
            </h1>
            <p className="text-sm text-gray-500 mt-1">{currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 font-semibold">{getGreeting()},</p>
            <p className="text-xs text-gray-500">{companyData?.name}</p>
            <p className="text-sm text-gray-400">{formatTime(currentTime)}</p>
          </div>
        </motion.header>

        <main className="flex-1 overflow-y-auto px-8 py-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white/70 backdrop-blur-md border border-white/20 rounded-3xl shadow-xl p-6 min-h-[500px]"
          >
            <Outlet />
          </motion.div>

          
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
