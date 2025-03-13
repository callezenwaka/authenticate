// database/src/config/pool.config.ts
export const getPoolConfig = (env: string) => {
	if (env === 'production') {
		return {
			// Use TypeORM's expected pool configuration format
			extra: {
				// Max number of clients in the pool
				max: parseInt(process.env.DB_POOL_SIZE || '10'),
				// Connection timeout in milliseconds
				connectionTimeoutMillis: 10000
			},
			maxQueryExecutionTime: 5000
		};
	}

	// Default development pool settings
	return {
		extra: {
			max: 5,
			connectionTimeoutMillis: 30000
		},
		maxQueryExecutionTime: 10000
	};
};