import { Router } from 'express';
import { SyncController } from './sync.controller';
import { authenticateToken } from '../auth/middlewares/auth.middleware';

const router = Router();

// 网络状态检测端点 - 不需要身份验证
router.get('/ping', SyncController.ping);

// 同步数据端点 - 需要身份验证
router.post('/sync', authenticateToken, SyncController.syncData);

export default router;