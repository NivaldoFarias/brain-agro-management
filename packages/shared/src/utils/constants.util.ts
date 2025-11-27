/**
 * Available runtime environments for the application.
 *
 * Maps to `NODE_ENV` and `BUN_ENV` environment variables
 */
export enum RuntimeEnvironment {
	/** Development environment */
	Development = "development",

	/** Test environment */
	Test = "test",

	/** Staging environment */
	Staging = "staging",

	/** Production environment */
	Production = "production",

	/** Benchmark environment */
	Benchmark = "benchmark",

	/** Build-time environment */
	Build = "build",
}

/** Logging levels used throughout the application */
export enum LogLevel {
	/** Trace level for detailed debugging information */
	Trace = "trace",

	/** Debug level for general debugging information */
	Debug = "debug",

	/** Info level for informational messages */
	Info = "info",

	/** Warn level for warning messages */
	Warn = "warn",

	/** Error level for error messages */
	Error = "error",

	/** Fatal level for critical errors causing application shutdown */
	Fatal = "fatal",
}

/**
 * Brazilian state codes (UF) enumeration
 *
 * Represents all 26 Brazilian states plus the Federal District.
 * Used for farm location tracking and regional analytics.
 */
export enum BrazilianState {
	/**  Acre */
	AC = "AC",

	/** Alagoas */
	AL = "AL",

	/** Amapá */
	AP = "AP",

	/** Amazonas*/
	AM = "AM",

	/** Bahia */
	BA = "BA",

	/** Ceará */
	CE = "CE",

	/** Distrito Federal */
	DF = "DF",

	/** Espírito Santo */
	ES = "ES",

	/** Goiás */
	GO = "GO",

	/** Maranhão */
	MA = "MA",

	/** Mato Grosso */
	MT = "MT",

	/** Mato Grosso do Sul */
	MS = "MS",

	/** Minas Gerais */
	MG = "MG",

	/** Pará */
	PA = "PA",

	/** Paraíba */
	PB = "PB",

	/** Paraná */
	PR = "PR",

	/** Pernambuco */
	PE = "PE",

	/** Piauí */
	PI = "PI",

	/** Rio de Janeiro */
	RJ = "RJ",

	/** Rio Grande do Norte */
	RN = "RN",

	/** Rio Grande do Sul */
	RS = "RS",

	/** Rondônia */
	RO = "RO",

	/** Roraima */
	RR = "RR",

	/** Santa Catarina */
	SC = "SC",

	/** São Paulo */
	SP = "SP",

	/** Sergipe */
	SE = "SE",

	/** Tocantins */
	TO = "TO",
}

/**
 * Agricultural crop types enumeration
 *
 * Represents the main crops grown in Brazilian agriculture
 * as specified in the project requirements.
 */
export enum CropType {
	Soja = "Soja",
	Milho = "Milho",
	Algodao = "Algodão",
	Cafe = "Café",
	CanaDeAcucar = "Cana de Açúcar",
}

/**
 * Represents SQL's `ORDER BY` enumeration
 *
 * Used to specify ascending or descending order in queries.
 */
export enum OrderBy {
	Ascending = "ASC",
	Descending = "DESC",
}

/** HTTP methods enum */
export enum HttpMethod {
	PUT = "PUT",
	POST = "POST",
	GET = "GET",
	DELETE = "DELETE",
	PATCH = "PATCH",
	HEAD = "HEAD",
}
