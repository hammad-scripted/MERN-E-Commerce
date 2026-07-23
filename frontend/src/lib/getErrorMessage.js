export const getErrorMessage = (error) => {
  const response = error.response?.data;

  if (!response) {
    return error.message || "Something went wrong";
  }

  // Validation errors
  if (Array.isArray(response.errors) && response.errors.length) {
    return response.errors
      .map((err) => Object.values(err).join(", "))
      .join("\n");
  }

  // General API message
  if (response.message) {
    return response.message;
  }

  return error.message || "Something went wrong";
};