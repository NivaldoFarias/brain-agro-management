/**
 * Common interceptors, filters, pipes, decorators, and guards.
 *
 * This barrel export provides centralized access to all cross-cutting
 * concerns used throughout the application.
 */

// Interceptors
export {
	CorrelationIdInterceptor,
	correlationIdStorage,
} from "./interceptors/correlation-id.interceptor";
export { LoggingInterceptor } from "./interceptors/logging.interceptor";
export { TransformInterceptor } from "./interceptors/transform.interceptor";
export type { TransformedResponse, PaginatedData } from "./interceptors/transform.interceptor";

// Filters
export { HttpExceptionFilter } from "./filters/http-exception.filter";

// Pipes
export { ParseUUIDPipe } from "./pipes/parse-uuid.pipe";

// Decorators
export { IsCityInStateConstraint } from "./decorators/city-in-state.decorator";

// Enums
export { BrazilianState, CropType } from "./enums/enums";
