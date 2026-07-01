import { Router } from 'express';
import { authController } from '@modules/auth/controller/auth.controller';
import { registerSchema, loginSchema } from '@modules/auth/validators/auth.validator';
import { validate } from '@shared/middleware/validation.middleware';
import { authenticate } from '@shared/middleware/authentication.middleware';
import { authRateLimiter } from '@shared/middleware/rate-limit.middleware';

const authRoutes = Router();

authRoutes.use(authRateLimiter);

authRoutes.post('/register', validate(registerSchema), authController.register);
authRoutes.post('/login', validate(loginSchema), authController.login);
authRoutes.post('/refresh', authController.refresh);
authRoutes.post('/logout', authenticate, authController.logout);
authRoutes.get('/me', authenticate, authController.getMe);

export default authRoutes;
