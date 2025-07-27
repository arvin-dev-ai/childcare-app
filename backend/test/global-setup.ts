import { execSync } from 'child_process';
import { DataSource } from 'typeorm';
import { config } from '../src/config/typeorm.config';

export default async () => {
  console.log('\n\n--- JEST GLOBAL SETUP ---');
  const appDataSource = new DataSource({
    ...config,
    logging: false, // Disable logging for setup
  });

  try {
    await appDataSource.initialize();
    console.log('Data Source has been initialized!');

    // Re-run migrations or synchronize
    await appDataSource.synchronize(true); // Use synchronize(true) to drop and recreate the schema
    console.log('Database synchronized successfully.');

    // Run the seed script
    console.log('Running seed script...');
    execSync('npm run seed');
    console.log('Seed script completed successfully.');

    await appDataSource.destroy();
    console.log('Data Source for setup has been destroyed.');
    console.log('--- JEST GLOBAL SETUP COMPLETE ---');
  } catch (err) {
    console.error('Error during Data Source initialization', err);
    process.exit(1);
  }
};
