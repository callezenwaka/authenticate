// backend/src/routes/user.route.ts
import { Router } from 'express';
import { UserController } from '../controllers';
import { authenticateJwt, requireScopes } from '../middleware';

const router = Router();

const userController = new UserController();

// All routes
router.get('/', authenticateJwt, requireScopes(['resources:read']), userController.getAll);
router.get('/:id', authenticateJwt, requireScopes(['profile']), userController.getById);
router.put('/:id', authenticateJwt, requireScopes(['profile']), userController.update);
router.delete('/:id', authenticateJwt, requireScopes(['admin']), userController.delete);

export default router;