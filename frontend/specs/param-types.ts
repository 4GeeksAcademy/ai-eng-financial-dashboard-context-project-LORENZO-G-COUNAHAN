/** Operation values accepted by the financial metrics query endpoints. */
export type OperationType = "income" | "outcome";

/** Date query parameters shared by the alerts and top-categories endpoints. */
export interface DateRangeFilter {
  /**
   * Inclusive start date for filtering movements; omit to leave the range open on the earlier side.
   * Valid format: `YYYY-MM-DD` (OpenAPI `date`).
   */
  start_date?: string;

  /**
   * Inclusive end date for filtering movements; omit to leave the range open on the later side.
   * Valid format: `YYYY-MM-DD` (OpenAPI `date`).
   */
  end_date?: string;
}

/** Query parameters accepted by `GET /api/metrics/alerts`. */
export interface AlertParams extends DateRangeFilter {
  /**
   * Minimum relative increase in outcome that triggers an anomaly alert.
   * Valid range: 0.01 through 1.0, inclusive; defaults to 0.03 when omitted.
   */
  threshold?: number;
}

/** Query parameters accepted by `GET /api/metrics/categories/top`. */
export interface TopCategoriesParams extends DateRangeFilter {
  /**
   * Operation to aggregate when ranking categories.
   * Valid values: `income` or `outcome`; defaults to `outcome` when omitted.
   */
  operation_type?: OperationType;

  /**
   * Maximum number of ranked categories to return.
   * Valid integer range: 1 through 20; defaults to 5 when omitted.
   */
  limit?: number;
}
