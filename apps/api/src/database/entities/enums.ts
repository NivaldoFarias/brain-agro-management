/**
 * Brazilian state codes (UF) enumeration
 *
 * Represents all 26 Brazilian states plus the Federal District.
 * Used for farm location tracking and regional analytics.
 */
export enum BrazilianState {
	AC = "AC", // Acre
	AL = "AL", // Alagoas
	AP = "AP", // Amapá
	AM = "AM", // Amazonas
	BA = "BA", // Bahia
	CE = "CE", // Ceará
	DF = "DF", // Distrito Federal
	ES = "ES", // Espírito Santo
	GO = "GO", // Goiás
	MA = "MA", // Maranhão
	MT = "MT", // Mato Grosso
	MS = "MS", // Mato Grosso do Sul
	MG = "MG", // Minas Gerais
	PA = "PA", // Pará
	PB = "PB", // Paraíba
	PR = "PR", // Paraná
	PE = "PE", // Pernambuco
	PI = "PI", // Piauí
	RJ = "RJ", // Rio de Janeiro
	RN = "RN", // Rio Grande do Norte
	RS = "RS", // Rio Grande do Sul
	RO = "RO", // Rondônia
	RR = "RR", // Roraima
	SC = "SC", // Santa Catarina
	SP = "SP", // São Paulo
	SE = "SE", // Sergipe
	TO = "TO", // Tocantins
}

/**
 * Agricultural crop types enumeration
 *
 * Represents the main crops grown in Brazilian agriculture
 * as specified in the project requirements.
 */
export enum CropType {
	SOJA = "Soja",
	MILHO = "Milho",
	ALGODAO = "Algodão",
	CAFE = "Café",
	CANA_DE_ACUCAR = "Cana de Açúcar",
}
