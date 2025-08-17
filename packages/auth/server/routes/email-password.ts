import { sValidator } from '@hono/standard-validator';
import { compare } from '@node-rs/bcrypt';
import { UserSecurityAuditLogType } from '@prisma/client';
import { Hono } from 'hono';
import { DateTime } from 'luxon';

import { EMAIL_VERIFICATION_STATE } from '@project/lib/constants/email';
import { AppError } from '@project/lib/errors/app-error';
import { jobsClient } from '@project/lib/jobs/client';
import { createUser } from '@project/lib/server-only/user/create-user';
import { forgotPassword } from '@project/lib/server-only/user/forgot-password';
import { getMostRecentVerificationTokenByUserId } from '@project/lib/server-only/user/get-most-recent-verification-token-by-user-id';
import { resetPassword } from '@project/lib/server-only/user/reset-password';
import { updatePassword } from '@project/lib/server-only/user/update-password';
import { verifyEmail } from '@project/lib/server-only/user/verify-email';
import { env } from '@project/lib/utils/env';
import { prisma } from '@project/prisma';

import { AuthenticationErrorCode } from '../lib/errors/error-codes';
import { getCsrfCookie } from '../lib/session/session-cookies';
import { onAuthorize } from '../lib/utils/authorizer';
import { getSession } from '../lib/utils/get-session';
import type { HonoAuthContext } from '../types/context';
import {
  ZForgotPasswordSchema,
  ZResendVerifyEmailSchema,
  ZResetPasswordSchema,
  ZSignInSchema,
  ZSignUpSchema,
  ZUpdatePasswordSchema,
  ZVerifyEmailSchema,
} from '../types/email-password';

export const emailPasswordRoute = new Hono<HonoAuthContext>()
  /**
   * Authorize endpoint (login).
   */
  .post('/authorize', sValidator('json', ZSignInSchema), async (c) => {
    const requestMetadata = c.get('requestMetadata');

    const { email, password, csrfToken } = c.req.valid('json');

    const csrfCookieToken = await getCsrfCookie(c);

    if (csrfToken !== csrfCookieToken || !csrfCookieToken) {
      throw new AppError(AuthenticationErrorCode.InvalidRequest, {
        message: 'Invalid CSRF token',
      });
    }

    const user = await prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
      },
    });

    if (!user || !user.password) {
      throw new AppError(AuthenticationErrorCode.InvalidCredentials, {
        message: 'Invalid email or password',
      });
    }

    const isPasswordsSame = await compare(password, user.password);

    if (!isPasswordsSame) {
      await prisma.userSecurityAuditLog.create({
        data: {
          userId: user.id,
          ipAddress: requestMetadata.ipAddress,
          userAgent: requestMetadata.userAgent,
          type: UserSecurityAuditLogType.SIGN_IN_FAIL,
        },
      });

      throw new AppError(AuthenticationErrorCode.InvalidCredentials, {
        message: 'Invalid email or password',
      });
    }

    if (!user.emailVerified) {
      const mostRecentToken = await getMostRecentVerificationTokenByUserId({
        userId: user.id,
      });

      if (
        !mostRecentToken ||
        mostRecentToken.expires.valueOf() <= Date.now() ||
        DateTime.fromJSDate(mostRecentToken.createdAt).diffNow('minutes').minutes > -5
      ) {
        await jobsClient.triggerJob({
          name: 'send.signup.confirmation.email',
          payload: {
            email: user.email,
          },
        });
      }

      throw new AppError('UNVERIFIED_EMAIL', {
        message: 'Unverified email',
      });
    }

    if (user.disabled) {
      throw new AppError('ACCOUNT_DISABLED', {
        message: 'Account disabled',
      });
    }

    await onAuthorize({ userId: user.id }, c);

    return c.text('', 201);
  })
  /**
   * Signup endpoint.
   */
  .post('/signup', sValidator('json', ZSignUpSchema), async (c) => {
    if (env('NEXT_PUBLIC_DISABLE_SIGNUP') === 'true') {
      throw new AppError('SIGNUP_DISABLED', {
        message: 'Signups are disabled.',
      });
    }

    const { name, email, password, signature } = c.req.valid('json');

    const user = await createUser({ name, email, password, signature }).catch((err) => {
      console.error(err);
      throw err;
    });

    await jobsClient.triggerJob({
      name: 'send.signup.confirmation.email',
      payload: {
        email: user.email,
      },
    });

    return c.text('OK', 201);
  })
  /**
   * Update password endpoint.
   */
  .post('/update-password', sValidator('json', ZUpdatePasswordSchema), async (c) => {
    const { password, currentPassword } = c.req.valid('json');
    const requestMetadata = c.get('requestMetadata');

    const session = await getSession(c);

    await updatePassword({
      userId: session.user.id,
      password,
      currentPassword,
      requestMetadata,
    });

    return c.text('OK', 201);
  })
  /**
   * Verify email endpoint.
   */
  .post('/verify-email', sValidator('json', ZVerifyEmailSchema), async (c) => {
    const { state, userId } = await verifyEmail({ token: c.req.valid('json').token });

    if (state === EMAIL_VERIFICATION_STATE.VERIFIED && userId !== null) {
      await onAuthorize({ userId }, c);
    }

    return c.json({ state });
  })
  /**
   * Resend verification email endpoint.
   */
  .post('/resend-verify-email', sValidator('json', ZResendVerifyEmailSchema), async (c) => {
    const { email } = c.req.valid('json');

    await jobsClient.triggerJob({
      name: 'send.signup.confirmation.email',
      payload: { email },
    });

    return c.text('OK', 201);
  })
  /**
   * Forgot password endpoint.
   */
  .post('/forgot-password', sValidator('json', ZForgotPasswordSchema), async (c) => {
    const { email } = c.req.valid('json');

    await forgotPassword({ email });

    return c.text('OK', 201);
  })
  /**
   * Reset password endpoint.
   */
  .post('/reset-password', sValidator('json', ZResetPasswordSchema), async (c) => {
    const { token, password } = c.req.valid('json');
    const requestMetadata = c.get('requestMetadata');

    await resetPassword({
      token,
      password,
      requestMetadata,
    });

    return c.text('OK', 201);
  });
