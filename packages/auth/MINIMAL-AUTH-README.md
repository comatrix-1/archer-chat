# Minimal Authentication Setup

This is a minimal authentication setup that provides the following features:
- User signup
- User login
- Session management
- Protected routes
- Guest routes

## Setup

1. Install dependencies:
```bash
npm install @prisma/client @hono/hono @hono/cors @hono/logger
npm install -D prisma
```

2. Set up your environment variables in `.env`:
```
DATABASE_URL="postgresql://user:password@localhost:5432/yourdb?schema=public"
CLIENT_ORIGIN="http://localhost:3000"
```

3. Run database migrations:
```bash
npx prisma migrate dev --name init
```

4. Start the auth server (configure this in your main server setup):
```typescript
import { authServer } from '@your-project/auth/minimal-exports';

// Use the auth server in your application
app.use('/auth/*', authServer);
```

## Client Usage

### 1. Use the auth hook in your components:

```typescript
import { useAuth } from '@your-project/auth/minimal-exports';

function LoginPage() {
  const { login, error } = useAuth();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = e.target.elements;
    await login(email.value, password.value);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}
      <input name="email" type="email" required />
      <input name="password" type="password" required />
      <button type="submit">Login</button>
    </form>
  );
}
```

### 2. Protect your routes:

```typescript
import { ProtectedRoute, GuestRoute } from '@your-project/auth/minimal-exports';

// Protected route - only accessible when authenticated
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>

// Guest route - only accessible when not authenticated
<Route
  path="/login"
  element={
    <GuestRoute>
      <LoginPage />
    </GuestRoute>
  }
/>
```

## API Endpoints

- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Log in a user
- `POST /api/auth/logout` - Log out the current user
- `GET /api/auth/session` - Get the current user's session

## Security Notes

- Passwords are hashed using scrypt
- Sessions are stored in memory (for production, consider using Redis)
- CSRF protection is recommended for production use
- Always use HTTPS in production
- Set appropriate CORS policies for your environment
