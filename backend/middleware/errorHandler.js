// Centralized error handler
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  if (err.code === 11000) {
    const isUsername =
      err.keyPattern?.username || (err.message && err.message.includes('username'));
    const isEmail =
      err.keyPattern?.email || (err.message && err.message.includes('email'));

    if (isUsername) {
      return res.status(400).json({
        message: 'This username is already taken. Please choose another username.',
      });
    }
    if (isEmail) {
      return res.status(400).json({
        message: 'An account with this email already exists. Please log in.',
      });
    }
    return res.status(400).json({ message: 'Duplicate entry detected.' });
  }

  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json({ message: err.message || 'Internal Server Error' });
};

module.exports = errorHandler;
