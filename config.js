var config = {
	debug: false,
	database: {
	    connectionLimit: 500,
	    host: "localhost",
	    port: 3306,
	    user: "root",
	    password: "",
	    database: "blast",
	    charset : "utf8mb4",
	    debug: false,
	    waitForConnections: true,
	    multipleStatements: true
	},
	cors: {
		origin: '*',
 		optionsSuccessStatus: 200
	}
}

module.exports = config; 