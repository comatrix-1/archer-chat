# Logging Setup

This document outlines the logging setup for the Remix application.

## Overview

The application uses [Pino](https://getpino.io/) for structured logging with the following features:

- JSON-formatted logs in production
- Pretty-printed logs in development
- Request/response logging
- Error logging with stack traces
- Request ID correlation

## Log Levels

The following log levels are available:

- `trace` - Very detailed logging, typically for development only
- `debug` - Debug information for development
- `info` - General operational information
- `warn` - Indicates potential issues
- `error` - Error conditions that need attention
- `fatal` - Critical errors that may prevent the application from running

## Environment Variables

- `LOG_LEVEL` - Set the minimum log level (default: `info` in production, `debug` in development)
- `NODE_ENV` - When set to `production`, logs are output as JSON

## Usage

### Basic Logging

```typescript
import logger from '~/utils/logger.server';

// Log messages with different levels
logger.trace('Trace message');
logger.debug('Debug message');
logger.info('Info message');
logger.warn('Warning message');
logger.error('Error message');
logger.fatal('Fatal message');

// Log with context
logger.info({ userId: 123 }, 'User logged in');
```

### Error Logging

```typescript
try {
  // Your code
} catch (error) {
  logger.error(error, 'Operation failed');
  // or with additional context
  logger.error({
    error,
    userId: 123,
    operation: 'userUpdate'
  }, 'Failed to update user');
}
```

## Request Logging

All HTTP requests are automatically logged with the following information:

- Request method and path
- Response status code
- Response time
- Request ID (for correlation)

## Log Format

### Development

Logs are pretty-printed for better readability during development.

### Production

Logs are output as JSON for easier parsing by log aggregation tools.

Example production log entry:

```json
{
  "level": "INFO",
  "time": "2023-04-01T12:00:00.000Z",
  "type": "request",
  "method": "GET",
  "path": "/api/users",
  "requestId": "abc123"
}
```

## Error Tracking

Errors are automatically captured and logged with stack traces. The error log includes:

- Error message
- Stack trace
- Error name
- Additional context provided

## Monitoring and Alerting

For production environments, consider setting up:

1. Log aggregation (e.g., ELK Stack, Datadog, CloudWatch)
2. Error tracking (e.g., Sentry, Rollbar)
3. Alerting based on error patterns or rates
