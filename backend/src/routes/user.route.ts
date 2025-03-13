// node-service/src/routes/user.route.ts
import { Router } from 'express';
import { UserController } from '../controllers';

const router = Router();
const userController = new UserController();

// Public routes
router.post('/login', userController.login);
router.post('/register', userController.create);

// Protected routes (will add auth middleware later)
router.get('/', userController.getAll);
router.get('/:id', userController.getById);
router.put('/:id', userController.update);
router.delete('/:id', userController.delete);

export default router;