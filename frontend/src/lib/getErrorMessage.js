// utils/getErrorMessage.js

export const getErrorMessage = (error) => {
  const response = error.response?.data;

  if (response?.errors?.length) {
    return response.errors
      .flatMap((err) => Object.values(err))
      .join('\n');
  }

  if (response?.message) {
    return response.message;
  }

  return error.message || 'Something went wrong';
};