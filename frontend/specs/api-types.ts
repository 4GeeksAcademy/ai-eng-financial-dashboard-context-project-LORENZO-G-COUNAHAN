/**
 * Values returned for operation types by the Financial Metrics API.
 * Valid values: `income` and `outcome`.
 */
export type OperationType = "income" | "outcome";

/**
 * Business-line identifiers returned by the Financial Metrics API.
 * Valid values: `B2B` and `B2C`.
 */
export type BusinessType = "B2B" | "B2C";

/**
 * Category identifiers returned in facets and top-category entries.
 * Valid values are the five values exposed by the current OpenAPI schema.
 */
export type Category =
  | "suppliers"
  | "sales"
  | "operational"
  | "administrative"
  | "others";

/**
 * Response schema for `GET /api/metrics/facets`.
 */
export interface FacetsResponse {
  /** Available operation types; each value is `income` or `outcome`. */
  operation_types: OperationType[];

  /** Available business lines; each value is `B2B` or `B2C`. */
  business_types: BusinessType[];

  /** Available financial categories: suppliers, sales, operational, administrative, or others. */
  categories: Category[];

  /** Earliest available movement date; format: `YYYY-MM-DD` (OpenAPI `date`). */
  min_date: string;

  /** Latest available movement date; format: `YYYY-MM-DD` (OpenAPI `date`). */
  max_date: string;
}

/** One movement returned by `GET /api/metrics`, `/api/metrics/b2b`, or `/api/metrics/b2c`. */
export interface FinancialMovementResponse {
  /** Calendar date in `YYYY-MM-DD` format (OpenAPI `date`). */
  create_date: string;

  /** Movement amount, serialized as a JSON number. */
  amount: number;

  /** Operation: `income` or `outcome`. */
  operation_type: OperationType;

  /** Category: suppliers, sales, operational, administrative, or others. */
  category: Category;

  /** Business line: `B2B` or `B2C`. */
  business_type: BusinessType;
}

/** Array response for the metrics movement endpoints. */
export interface FinancialMovementsResponse extends Array<FinancialMovementResponse> {}

/** One anomaly record returned as an element of `GET /api/metrics/alerts`. */
export interface AletEntry {
  /**
   * Period identified as anomalous. The format follows `group_by`:
   * daily `YYYY-MM-DD`, weekly `YYYY-Www`, or monthly `YYYY-MM`.
   */
  period: string;

  /** Total outcome amount recorded for this period, as an OpenAPI JSON number. */
  outcome_total: number;

  /** Average outcome amount over the three preceding periods, as a JSON number. */
  baseline_average: number;

  /** Relative increase over the baseline as a ratio (for example, `0.1` means 10%). */
  increase_ratio: number;
}

/** Conventional spelling alias for the API entry name `AletEntry`. */
export type AlertEntry = AletEntry;

/**
 * Response schema for `GET /api/metrics/alerts`: a JSON array of anomaly entries.
 */
export interface AlertsResponse extends Array<AletEntry> {}

/** One ranked category total returned by `GET /api/metrics/categories/top`. */
export interface CategoryEntry {
  /** Category identifier; one of suppliers, sales, operational, administrative, or others. */
  category: Category;

  /** Operation included in the total; valid values are `income` or `outcome`. */
  operation_type: OperationType;

  /** Sum of amounts for this category and operation, represented as a JSON number. */
  total_amount: number;
}

/**
 * Response schema for `GET /api/metrics/categories/top`: a JSON array of ranked category entries.
 */
export interface TopCategoriesResponse extends Array<CategoryEntry> {}
