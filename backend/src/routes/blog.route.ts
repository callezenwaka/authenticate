import { Router } from 'express';
import { BlogController } from '../controllers';

const router = Router();
const blogController = new BlogController();

router.get('/', blogController.getAll);
router.get('/:id', blogController.getById);
router.post('/', blogController.create);
router.put('/:id', blogController.update);
router.delete('/:id', blogController.delete);

export default router;