// database/src/index.ts
import { DataSource } from 'typeorm';
import { getPoolConfig, config, logger } from './config';
import { PostgresDriver } from "typeorm/driver/postgres/PostgresDriver";
import * as dotenv from 'dotenv';
dotenv.config();

const env = process.env.NODE_ENV || 'development';
// const host = process.env.DB_HOST || config.host || 'blog-postgres';

// Export the DataSource directly (this is what TypeORM CLI needs)
const AppDataSource = new DataSource({
	...config.database,
	...getPoolConfig(env),
});

let dataSourceInstance: DataSource | null = AppDataSource;

// Function to get the initialized DataSource
export const getDataSource = async (): Promise<DataSource> => {
	if (dataSourceInstance && dataSourceInstance.isInitialized) {
		return dataSourceInstance;
	}

	// Initialize if not initialized
	if (!dataSourceInstance?.isInitialized) {
		try {
			await dataSourceInstance?.initialize();
			logger.info('Database connection established!!!');

			const driver = dataSourceInstance?.driver as PostgresDriver;
			const pool = (driver as any).databaseConnection;

			if (pool && typeof pool.on === "function") {
				pool.on("error", (err: Error) => {
					logger.error("Unexpected database pool error:", err);
				});
			}
		} catch (error) {
			logger.error('Error connecting to database:', error);
			throw error;
		}
	}

	return dataSourceInstance as DataSource;
};

// Graceful shutdown function
export const closeDatabase = async () => {
	if (dataSourceInstance && dataSourceInstance.isInitialized) {
		await dataSourceInstance.destroy();
		dataSourceInstance = null;
		logger.info('Database connection closed');
	}
};

export * from './repositories';
export * from './entities';
export * from './redis';

export default AppDataSource;