const translations = {
  en: {
    errors: {
      missingFields: "All fields are required",
      companyExists: "Company Already Exists",
      invalidCredentials: "Invalid email or password",
      jobNotFound: "Job not found",
      alreadyApplied: "You have already applied for this job",
      userNotFound: "User not found",
      noApplications: "No applications found for this User",
      resumeRequired: "Please upload a resume before applying.",
      webhookError: "Webhooks Error",
      unauthorized: "Not authorized",
    },
    success: {
      statusChanged: "Status Changed",
      resumeUpdated: "Resume Updated Successfully",
      applicationSubmitted: "Application submitted successfully!",
      jobUpdated: "Job updated successfully.",
      jobDeleted: "Job deleted successfully.",
    },
  },
  vi: {
    errors: {
      missingFields: "Vui lòng điền đầy đủ thông tin.",
      companyExists: "Công ty đã tồn tại.",
      invalidCredentials: "Email hoặc mật khẩu không đúng.",
      jobNotFound: "Không tìm thấy công việc.",
      alreadyApplied: "Bạn đã ứng tuyển công việc này.",
      userNotFound: "Không tìm thấy người dùng.",
      noApplications: "Không có hồ sơ ứng tuyển nào.",
      resumeRequired: "Vui lòng tải CV trước khi ứng tuyển.",
      webhookError: "Lỗi xử lý webhook.",
      unauthorized: "Không có quyền truy cập.",
    },
    success: {
      statusChanged: "Đã cập nhật trạng thái.",
      resumeUpdated: "Cập nhật CV thành công.",
      applicationSubmitted: "Gửi đơn thành công!",
      jobUpdated: "Cập nhật tin tuyển dụng thành công.",
      jobDeleted: "Đã xóa tin tuyển dụng.",
    },
  },
};

const getValue = (lang, key) => {
  const parts = key.split(".");
  return parts.reduce(
    (acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined),
    translations[lang]
  );
};

export const translate = (lang = "en", key, vars = {}) => {
  const fallback = getValue("en", key) || key;
  const value = getValue(lang, key) || fallback;
  if (typeof value !== "string") return value;
  return Object.keys(vars).reduce(
    (acc, curr) => acc.replace(new RegExp(`{{${curr}}}`, "g"), vars[curr]),
    value
  );
};

export const supportedLanguages = Object.keys(translations);
