/** Operation values accepted by the financial metrics query endpoints. */
export type OperationType = "income" | "outcome";

/** Business line values accepted by business-filtered metrics endpoints. */
export type BusinessType = "B2B" | "B2C";

/** Category values accepted by financial movement filters. */
export type Category =
  | "suppliers"
  | "sales"
  | "operational"
  | "administrative"
  | "others";

/** Time buckets accepted by the anomaly alerts endpoint. */
export type AlertGroupBy = "day" | "week" | "month";

/** Date query parameters shared by movement, alerts, and top-categories endpoints. */
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

/** Query parameters accepted by `GET /api/metrics`. */
export interface MetricsParams extends DateRangeFilter {
  /** Optional financial category filter. */
  category?: Category;

  /** Optional operation filter: `income` or `outcome`. */
  operation_type?: OperationType;
}

/** Query parameters accepted by `GET /api/metrics/b2b` and `/api/metrics/b2c`. */
export type BusinessMetricsParams = MetricsParams;

/** Query parameters accepted by `GET /api/metrics/alerts`. */
export interface AlertParams extends DateRangeFilter {
  /**
   * Minimum relative increase in outcome that triggers an anomaly alert.
   * Valid range: 0.01 through 1.0, inclusive; defaults to 0.03 when omitted.
   */
  threshold?: number;

  /**
   * Time bucket used to evaluate and label alert periods.
   * Valid values: `day`, `week`, or `month`; defaults to `month` when omitted.
   */
  group_by?: AlertGroupBy;

  /**
   * Restricts alert calculation to one business line.
   * Valid values: `B2B` or `B2C`; omit to include both lines.
   */
  business_type?: BusinessType;
}

/** Query parameters accepted by `GET /api/metrics/categories/top`. */
export interface TopCategoriesParams extends DateRangeFilter {
  /**
   * Operation to aggregate when ranking categories.
   * Valid values: `income` or `outcome`; defaults to `outcome` when omitted.
   */
  operation_type?: OperationType;

  /**
   * Restricts the ranking to one business line.
   * Valid values: `B2B` or `B2C`; omit to include both lines.
   */
  business_type?: BusinessType;

  /**
   * Maximum number of ranked categories to return.
   * Valid integer range: 1 through 20; defaults to 5 when omitted.
   */
  limit?: number;
}
