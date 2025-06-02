import { MigrationConfig } from 'drizzle-orm/migrator';

process.loadEnvFile();

function envOrThrow(key: string): string {
  if (process.env[key] === undefined) {
    throw new Error('invalid env variable: ' + key);
  }
  return process.env[key];
}

type DBConfig = {
  url: string;
  migrationConfig: MigrationConfig;
};

type APIConfig = {
  platform: string;
  secret: string;
  fileserverHits: number;
  db: DBConfig;
};

const dbUrl = envOrThrow('DB_URL');
const platform = envOrThrow('PLATFORM');
const secret = envOrThrow('SECRET');

export const config: APIConfig = {
  fileserverHits: 0,
  platform: platform,
  secret: secret,
  db: {
    url: dbUrl,
    migrationConfig: {
      migrationsFolder: './src/db/migrations',
    },
  },
};
