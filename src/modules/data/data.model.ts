import { RowDataPacket, OkPacket } from 'mysql2';
import { pool } from '../../config/database';

export interface Data extends RowDataPacket {
    id: number;
    user_id: number;
    file_name: string;
    file_content: any;
    version: number;
    last_modified: Date;
    created_at: Date;
}

export interface CreateDataDto {
    file_name: string;
    file_content: any;
    user_id: number;
}

export interface UpdateDataDto {
    file_content: any;
    version: number;
}

export class DataModel {
    static async findAllByUserId(userId: number): Promise<Data[]> {
        const [rows] = await pool.query<Data[]>(
            'SELECT * FROM user_data WHERE user_id = ? ORDER BY last_modified DESC',
            [userId]
        );
        return rows;
    }

    static async findByUserIdAndFileName(userId: number, fileName: string): Promise<Data | null> {
        const [rows] = await pool.query<Data[]>(
            'SELECT * FROM user_data WHERE user_id = ? AND file_name = ?',
            [userId, fileName]
        );
        return rows[0] || null;
    }

    static async create(data: CreateDataDto): Promise<number> {
        const [result] = await pool.query<OkPacket>(
            'INSERT INTO user_data (user_id, file_name, file_content, version) VALUES (?, ?, ?, 1)',
            [data.user_id, data.file_name, JSON.stringify(data.file_content)]
        );
        return result.insertId;
    }

    // 修改：更新时同时更新 last_modified 时间戳
    static async update(userId: number, fileName: string, data: UpdateDataDto): Promise<boolean> {
        const [result] = await pool.query<OkPacket>(
            'UPDATE user_data SET file_content = ?, version = version + 1, last_modified = CURRENT_TIMESTAMP WHERE user_id = ? AND file_name = ? AND version = ?',
            [JSON.stringify(data.file_content), userId, fileName, data.version]
        );
        return result.affectedRows > 0;
    }

    static async delete(userId: number, fileName: string): Promise<boolean> {
        const [result] = await pool.query<OkPacket>(
            'DELETE FROM user_data WHERE user_id = ? AND file_name = ?',
            [userId, fileName]
        );
        return result.affectedRows > 0;
    }

    // 新增：支持 upsert 操作（创建或更新）
    static async upsert(data: CreateDataDto): Promise<{ id: number; isNew: boolean }> {
        try {
            // 首先尝试查找现有记录
            const existing = await this.findByUserIdAndFileName(data.user_id, data.file_name);
            
            if (existing) {
                // 如果存在，更新记录
                const success = await this.update(data.user_id, data.file_name, {
                    file_content: data.file_content,
                    version: existing.version
                });
                return { id: existing.id, isNew: false };
            } else {
                // 如果不存在，创建新记录
                const id = await this.create(data);
                return { id, isNew: true };
            }
        } catch (error) {
            throw error;
        }
    }

    // 新增：根据时间戳更新（用于同步）
    static async updateWithTimestamp(
        userId: number, 
        fileName: string, 
        fileContent: any, 
        clientTimestamp: number
    ): Promise<{ updated: boolean; serverData?: Data; conflict: boolean }> {
        try {
            const existing = await this.findByUserIdAndFileName(userId, fileName);
            
            if (!existing) {
                // 如果文件不存在，创建新文件
                const id = await this.create({
                    user_id: userId,
                    file_name: fileName,
                    file_content: fileContent
                });
                return { updated: true, conflict: false };
            }
            
            const serverTimestamp = new Date(existing.last_modified).getTime();
            
            if (clientTimestamp > serverTimestamp) {
                // 客户端版本更新，更新服务器
                const success = await this.update(userId, fileName, {
                    file_content: fileContent,
                    version: existing.version
                });
                return { updated: success, conflict: false };
            } else if (serverTimestamp > clientTimestamp) {
                // 服务器版本更新，返回服务器数据
                return { 
                    updated: false, 
                    serverData: existing, 
                    conflict: true 
                };
            } else {
                // 时间戳相同，无需更新
                return { updated: false, conflict: false };
            }
        } catch (error) {
            throw error;
        }
    }
}