require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3001,
  jwtSecret: process.env.JWT_SECRET || 'natation_secret',
  dbFile: process.env.DB_FILE || './natation.sqlite3',
};
