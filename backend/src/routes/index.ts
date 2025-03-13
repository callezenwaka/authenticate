import { Router } from 'express';
import blogRoutes from './blog.route';
import userRoutes from './user.route';

const router = Router();

router.use('/blogs', blogRoutes);
router.use('/users', userRoutes);

export const routes = router;