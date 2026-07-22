export class ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    timestamp: string;
    version: string;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  error?: {
    code: string;
    message: string;
  };

  static success<T>(data: T, meta?: ApiResponse<T>['meta']): ApiResponse<T> {
    return {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        ...meta,
      },
    };
  }

  static error(code: string, message: string): ApiResponse<null> {
    return {
      success: false,
      data: null,
      error: {
        code,
        message,
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
    };
  }

  static paginated<T>(
    data: T,
    page: number,
    limit: number,
    total: number,
  ): ApiResponse<T> {
    return {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  }
}

export class ErrorCodes {
  static readonly VALIDATION_ERROR = 'VALIDATION_ERROR';
  static readonly NOT_FOUND = 'NOT_FOUND';
  static readonly UNAUTHORIZED = 'UNAUTHORIZED';
  static readonly FORBIDDEN = 'FORBIDDEN';
  static readonly RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED';
  static readonly INTERNAL_ERROR = 'INTERNAL_ERROR';
  static readonly BAD_REQUEST = 'BAD_REQUEST';
}
