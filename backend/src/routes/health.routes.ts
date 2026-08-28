import { Router } from 'express';
import { getHealth } from '../controllers/health.controller.js';

const router: Router = Router();

// GET /health - Public endpoint for Docker & CI/CD Healthchecks
router.get('/', getHealth);

export const healthRoutes: Router = router;
