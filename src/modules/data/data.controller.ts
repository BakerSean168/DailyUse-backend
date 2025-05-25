import { Request, Response } from 'express';
import { DataService } from './data.service';
import { ApiResponse } from '../../types/index';
import { Data } from './data.model';

export class DataController {
    static async getData(req: Request, res: Response<ApiResponse<Data[]>>): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: '未授权访问'
                });
                return;
            }
            const data = await DataService.getData(userId);
            res.json({
                success: true,
                data,
                message: '获取数据成功'
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : '获取数据失败',
            });
        }
    }

    static async getDataByFileName(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: '未授权访问'
                });
                return;
            }
            const fileName = req.params.fileName;
            const data = await DataService.getDataByFileName(userId, fileName);
            
            if (!data) {
                res.status(404).json({
                    success: false,
                    message: '文件不存在'
                });
                return;
            }

            res.json({
                success: true,
                data,
                message: '获取数据成功'
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : '获取数据失败'
            });
        }
    }

    static async createData(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: '未授权访问'
                });
                return;
            }
            const { file_name, file_content } = req.body;
            
            const id = await DataService.createData({
                user_id: userId,
                file_name,
                file_content
            });

            res.status(201).json({
                success: true,
                data: { id },
                message: '创建成功'
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : '创建失败'
            });
        }
    }

    static async updateData(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: '未授权访问'
                });
                return;
            }
            const fileName = req.params.fileName;
            const { file_content, version } = req.body;

            const success = await DataService.updateData(userId, fileName, {
                file_content,
                version
            });

            if (!success) {
                res.status(409).json({
                    success: false,
                    message: '更新失败，版本可能已过期'
                });
                return;
            }

            res.json({
                success: true,
                message: '更新成功'
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : '更新失败'
            });
        }
    }

    static async deleteData(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: '未授权访问'
                });
                return;
            }
            const fileName = req.params.fileName;

            const success = await DataService.deleteData(userId, fileName);

            if (!success) {
                res.status(404).json({
                    success: false,
                    message: '文件不存在'
                });
                return;
            }

            res.json({
                success: true,
                message: '删除成功'
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : '删除失败'
            });
        }
    }

    // static async asyncData(req: Request, res: Response): Promise<void> {

}