import { Router } from 'express';
import { healthController } from '@modules/health/controller/health.controller';

const healthRoutes = Router();

healthRoutes.get('/', healthController.getHealth);

export default healthRoutes;
