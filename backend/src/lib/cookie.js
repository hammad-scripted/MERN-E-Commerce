


export const setCookies = (res, accessToken, refreshToken) => {
  res.cookie('accessToken', accessToken, {
    httpOnly: true, //* prevent XSS attacks
    secure: process.env.NODE_ENV === 'production' ? true : false, //*
    sameSite: 'strict', //* prevent CSRF attacks
    maxAge: 15 * 60 * 1000, //* 15 minutes
  });
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' ? true : false,
    sameSite: 'none',
    maxAge: 7 * 24 * 60 * 60 * 1000, //* 7 days
  });
};
