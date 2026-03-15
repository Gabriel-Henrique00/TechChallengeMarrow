export default () => ({
  database: {
    host:     process.env.DB_HOST     || 'localhost',
    port:     parseInt(process.env.DB_PORT || '3306', 10),
    user:     process.env.DB_USER     || 'admin',
    password: process.env.DB_PASS     || 'admin',
    name:     process.env.DB_NAME     || 'charger_db',
  },
  pluggy: {
    clientId:      process.env.PLUGGY_CLIENT_ID      || '',
    clientSecret:  process.env.PLUGGY_CLIENT_SECRET  || '',
    webhookSecret: process.env.PLUGGY_WEBHOOK_SECRET || '',
    recipientId:   process.env.PLUGGY_RECIPIENT_ID   || '',
  },
  app: {
    baseUrl: process.env.APP_BASE_URL || 'http://localhost:3001',
    frontendUrl: process.env.FRONTEND_URL || 'https://industriously-breakfront-laticia.ngrok-free.dev',
  },
  jwt: {
    secret:    process.env.JWT_SECRET     || 'super-senha-charger-jwt-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
});