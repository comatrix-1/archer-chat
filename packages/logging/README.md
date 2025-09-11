# @project/logging

A centralized logging package for the application using Pino logger.

## Installation

```bash
# From the root of the monorepo
npm install @project/logging
```

## Usage

```typescript
import { logger } from '@project/logging';

// Basic logging
logger.info('Application started');

// Logging with context
logger.error('Failed to process request', { 
  requestId: '123', 
  error: error.message 
});

// Available methods:
// - logger.fatal()
// - logger.error()
// - logger.warn()
// - logger.info()
// - logger.debug()
// - logger.trace()
```

## Configuration

The logger is pre-configured with sensible defaults but can be customized:

```typescript
import { Logger } from '@project/logging';

// Create a custom logger instance with a different log level
const customLogger = Logger.getInstance('debug');
```

## Development

```bash
# Build the package
npm run build

# Watch for changes
npm run dev
```
