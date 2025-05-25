import { Request, Response } from 'express';
import { DataService } from '../data/data.service';
import { ApiResponse } from '../../types/index';
import { Data } from '../data/data.model';

export class SyncController {
    /**
     * 网络状态检测端点
     * 客户端用于检测与服务器的连接状态
     */
    static async ping(req: Request, res: Response): Promise<void> {
        res.status(200).json({ 
            success: true,
            message: 'Server is online'
        });
    }

    /**
     * 数据同步端点
     * 支持双向同步：
     * 1. 客户端上传更新的数据到服务器
     * 2. 服务器返回其自身可能更新的数据
     */
    static async syncData(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: '未授权访问'
                });
                return;
            }

            const { fileName, content, timestamp } = req.body;

            if (!fileName) {
                res.status(400).json({
                    success: false,
                    message: '缺少文件名'
                });
                return;
            }

            // 查找服务器上的数据
            const serverData = await DataService.getDataByFileName(userId, fileName);
            
            // 如果服务器没有该文件，创建新文件
            if (!serverData) {
                await DataService.createData({
                    user_id: userId,
                    file_name: fileName,
                    file_content: content
                });
                
                res.json({
                    success: true,
                    message: '文件已创建',
                });
                return;
            }
            
            // 获取服务器数据的时间戳（转为毫秒以便比较）
            const serverTimestamp = new Date(serverData.last_modified).getTime();
            
            // 比较时间戳决定哪个版本更新
            if (timestamp > serverTimestamp) {
                // 客户端版本更新，更新服务器数据
                const success = await DataService.updateData(userId, fileName, {
                    file_content: content,
                    version: serverData.version
                });
                
                if (!success) {
                    res.status(409).json({
                        success: false,
                        message: '更新失败，版本冲突'
                    });
                    return;
                }
                
                res.json({
                    success: true,
                    message: '服务器数据已更新'
                });
                
            } else if (serverTimestamp > timestamp) {
                // 服务器版本更新，返回服务器数据
                res.json({
                    success: true,
                    serverData: serverData.file_content,
                    serverTimestamp: serverTimestamp,
                    message: '获取服务器更新数据'
                });
            } else {
                // 时间戳相同，无需更新
                res.json({
                    success: true,
                    message: '数据已同步'
                });
            }
            
        } catch (error) {
            console.error('Sync error:', error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : '同步失败'
            });
        }
    }
}