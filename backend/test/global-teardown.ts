import { DataSource } from 'typeorm';
import { config } from '../src/config/typeorm.config';

export default async () => {
  console.log('\n\n--- JEST GLOBAL TEARDOWN ---');
  const appDataSource = new DataSource({
    ...config,
    logging: false, // No need to log during teardown
  });

  try {
    await appDataSource.initialize();
    await appDataSource.destroy();
    console.log('Data Source for teardown has been destroyed.');
    console.log('--- JEST GLOBAL TEARDOWN COMPLETE ---');
  } catch (err) {
    console.error('Error during Data Source teardown', err);
    process.exit(1);
  }
};
