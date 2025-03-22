// backend/src/routes/blog.route.ts
// import { Router } from 'express';
// import { BlogController } from '../controllers';

// const router = Router();
// const blogController = new BlogController();

// router.get('/', blogController.getAll);
// router.get('/:id', blogController.getById);
// router.post('/', blogController.create);
// router.put('/:id', blogController.update);
// router.delete('/:id', blogController.delete);

// export default router;

import { Router } from 'express';
import { BlogController } from '../controllers';
import { databaseMiddleware } from '../middleware';

const router = Router();
const blogController = new BlogController();

// Read operations (can work with cached data from Redis)
router.get('/', databaseMiddleware(false), blogController.getAll);
router.get('/:id', databaseMiddleware(false), blogController.getById);

// Write operations (critical - require database connection)
router.post('/', databaseMiddleware(true), blogController.create);
router.put('/:id', databaseMiddleware(true), blogController.update);
router.delete('/:id', databaseMiddleware(true), blogController.delete);

export default router;