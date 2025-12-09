import { Controller, Get, HttpStatus } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

import { DashboardService } from "./dashboard.service";
import { DashboardStatsDto } from "./dto";

/**
 * Controller handling HTTP requests for dashboard statistics.
 *
 * Provides a single optimized endpoint that aggregates all dashboard
 * metrics to minimize API calls and improve frontend performance.
 *
 * ## Authentication
 * All endpoints will require JWT authentication in production.
 * Currently documented with @ApiBearerAuth for API specification.
 *
 * @example
 * ```typescript
 * // Usage in NestJS module
 * @Module({
 *   controllers: [DashboardController],
 *   providers: [DashboardService]
 * })
 * ```
 */
@ApiTags("Dashboard")
@ApiBearerAuth("JWT")
@Controller("dashboard")
export class DashboardController {
	constructor(private readonly dashboardService: DashboardService) {}

	/**
	 * Retrieves all dashboard statistics in a single response.
	 *
	 * Aggregates totals, averages, distributions, and top records across
	 * farms and producers. Replaces multiple individual stat endpoints for
	 * improved performance.
	 *
	 * ## Performance
	 * - Executes queries in parallel
	 * - Single HTTP request from frontend
	 * - Reduced network overhead
	 * - Consistent data snapshot
	 *
	 * @returns Complete dashboard statistics with timestamp
	 *
	 * @example
	 * ```typescript
	 * const stats = await fetch('/dashboard/stats');
	 * console.log(`Total farms: ${stats.totals.farms}`);
	 * ```
	 */
	@Get("stats")
	@ApiOperation({
		summary: "Get aggregated dashboard statistics",
		description:
			"Returns all dashboard metrics in a single response including totals, averages, distributions, and top records",
	})
	@ApiResponse({
		status: HttpStatus.OK,
		description: "Dashboard statistics retrieved successfully",
		type: DashboardStatsDto,
	})
	getStats(): Promise<DashboardStatsDto> {
		return this.dashboardService.getStats();
	}
}
