export default () => ({
  database: {
    host:     process.env.DB_HOST     || 'localhost',
    port:     parseInt(process.env.DB_PORT || '3306', 10),
    user:     process.env.DB_USER     || 'admin',
    password: process.env.DB_PASS     || 'admin',
    name:     process.env.DB_NAME     || 'charger_db',
  },
  paymentProvider: process.env.PAYMENT_PROVIDER || 'fake',
  pluggy: {
    clientId:     process.env.PLUGGY_CLIENT_ID     || '',
    clientSecret: process.env.PLUGGY_CLIENT_SECRET || '',
  },
  jwt: {
    secret:    process.env.JWT_SECRET     || 'super-senha-charger-jwt-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
});