import { Router } from 'express';
import { DataController } from './data.controller';
import { authenticateToken } from '../auth/middlewares/auth.middleware';

const router = Router();

// 所有路由都需要认证
router.use(authenticateToken);

// 获取用户的所有数据
router.get('/', DataController.getData);

// 获取特定文件的数据
router.get('/:fileName', DataController.getDataByFileName);

// 创建新数据
router.post('/', DataController.createData);

// 更新数据
router.put('/:fileName', DataController.updateData);

// 删除数据
router.delete('/:fileName', DataController.deleteData);

export default router;