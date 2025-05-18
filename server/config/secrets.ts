const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

if (!JWT_SECRET) {
  console.error(
    "FATAL ERROR: JWT_SECRET is not defined in environment variables."
  );
  process.exit(1);
}

if (!REFRESH_TOKEN_SECRET) {
  console.error(
    "FATAL ERROR: REFRESH_TOKEN_SECRET is not defined in environment variables."
  );
  process.exit(1);
}

export { JWT_SECRET, REFRESH_TOKEN_SECRET };
