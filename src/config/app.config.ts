export const appConfig = () => ({
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  appName: process.env.APP_NAME || 'NestJS Base Project',
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '365d',
  },
  payos: {
    clientId : process.env.PAYOS_CLIENT_ID || 'default-client-id',
    apiKey: process.env.PAYOS_API_KEY || 'default-api',
    checksumKey: process.env.PAYOS_CHECKSUM_KEY || 'default-checksum-key',
  },
  file: {
    apiKey: process.env.FILE_API_KEY || 'default-file-api-key',
    apiPrivateKey: process.env.FILE_API_PRIVATE_KEY || 'default-file-api-private-key',
  }
});
