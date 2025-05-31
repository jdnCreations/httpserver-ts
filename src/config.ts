import { MigrationConfig } from 'drizzle-orm/migrator';

process.loadEnvFile();

function envOrThrow(key: string) {
  if (process.env[key] === undefined) {
    throw new Error('invalid env variable: ' + key);
  }
}

type DBConfig = {
  url: string;
  migrationConfig: MigrationConfig;
};

type APIConfig = {
  platform: string;
  fileserverHits: number;
  db: DBConfig;
};

envOrThrow('DB_URL');
envOrThrow('PLATFORM');

export const config: APIConfig = {
  fileserverHits: 0,
  platform: process.env.PLATFORM!,
  db: {
    url: process.env.DB_URL!,
    migrationConfig: {
      migrationsFolder: './src/db/migrations',
    },
  },
};
