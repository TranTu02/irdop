const { Pool } = pg;
global.set('pg', pg);
global.set('axios',axios);
// DATABASE CLIENT

// Create a new connection pool with the given configuration
const pool = new Pool({
	user: 'postgres', // USERNAME
	host: 'localhost', // HOST
	database: 'test_new_ui', // DATABASE NAME
	password: 'admin', // PASSWORD
	port: '5432', // PORT
});

(async () => {
	try {
		// Attempt to connect to the database
		// const client = await pool.connect();
		// Set the connected client in the global scope
		global.set('repoClient', pool);
		// Log a success message
		node.warn('[ COMPLETED ] dtb connected');
	} catch (error) {
		// Log an error message if the connection fails
		node.warn('[ ERROR ] dtb connection failed ' + error.message);
		console.error(error);
	}
})();

const repoClient = global.get('repoClient'); // Postgres client

/** CREATE */

// Create protocol
async function createProtocol(protocol) {
	try {
		const validColumns = await matchValidColumns('protocol', Object.keys(protocol));
		if (validColumns.length === 0) {
			throw new Error(`Invalid protocol columns: ${Object.keys(protocol).join(', ')}`);
		}

		const query = `
			INSERT INTO protocol (${validColumns.join(',')}) 
			VALUES (${validColumns.map((_, index) => `$${index + 1}`).join(',')})
			RETURNING *`;

		const params = validColumns.map((column) => protocol[column]);
		const result = await repoClient.query(query, params);

		return result.rows[0];
	} catch (error) {
		node.warn(error);
	}
}

/** READ */

// Get protocol by ID
async function getProtocolById(id) {
	try {
		const query = 'SELECT * FROM protocol WHERE id = $1';
		const values = [id];
		const result = await repoClient.query(query, values);

		return result.rows[0];
	} catch (error) {
		node.warn(error);
	}
}

// Get all protocols
async function getAllProtocols() {
	try {
		const query = 'SELECT * FROM protocol ORDER BY id DESC';
		const result = await repoClient.query(query);

		return result.rows;
	} catch (error) {
		node.warn(error);
	}
}

/** UPDATE */
// Update protocol
async function updateProtocol(protocol) {
	try {
		if (typeof protocol === 'object' && protocol.id) {
			const validColumns = await matchValidColumns('protocol', Object.keys(protocol));
			if (validColumns.length === 0) {
				throw new Error(`Invalid protocol columns: ${Object.keys(protocol).join(', ')}`);
			}

			const query = `UPDATE protocol SET ${validColumns
				.map((column, index) => `${column} = $${index + 2}`)
				.join(', ')} WHERE id = $1 RETURNING *`;
			const values = [protocol.id, ...validColumns.map((column) => protocol[column])];

			const result = await repoClient.query(query, values);

			return result.rows[0];
		} else {
			throw new Error('Invalid protocol');
		}
	} catch (error) {
		node.warn(error);
	}
}

/** DELETE */
// Delete protocol
async function deleteProtocol(id) {
	try {
		const query = 'DELETE FROM protocol WHERE id = $1';
		const values = [id];
		await repoClient.query(query, values);

		return { message: 'Protocol deleted successfully' };
	} catch (error) {
		node.warn(error);
	}
}

/** MATCH COLUMN */
async function matchValidColumns(table_name, columns) {
	try {
		/** 1. Get table columns from server */
		// Construct the SQL query to get the column names from the information schema
		const validColumnsQuery = `SELECT column_name FROM information_schema.columns WHERE table_name = $1`;
		const validColumnsParams = [table_name];

		// Execute the SQL query
		const validColumnsResult = await repoClient.query(validColumnsQuery, validColumnsParams);

		// Extract the column names from the query result
		const validColumns = validColumnsResult.rows.map((row) => row.column_name);

		/** 2. Match columns */
		// Filter the input columns to include only valid columns
		const matchedColumns = columns.filter((column) => validColumns.includes(column));
		node.warn('Matched columns:' + matchedColumns);

		// Return the matched columns
		return matchedColumns; // if no match return []
	} catch (error) {
		// Handle any errors that occur during the operation
		node.warn(error);
	}
}

// Lấy danh sách bảng
const getTables = async () => {
	try {
		const result = await pool.query(`
     SELECT column_name FROM information_schema.columns WHERE table_name = 'inventory';
    `);

		// In danh sách bảng
		console.log('Danh sách cột:', result.rows);
	} catch (err) {
		console.error('Lỗi khi lấy danh sách bảng:', err);
	} finally {
		await pool.end();
	}
};

const postgreSQL = {
	getTables,
	createProtocol,
	getProtocolById,
	getAllProtocols,
	updateProtocol,
	deleteProtocol,
};

global.set('postgreSQL', postgreSQL);

return msg;
