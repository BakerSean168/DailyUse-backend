import { CreateDataDto, Data, UpdateDataDto, DataModel } from './data.model';

export class DataService {
    static async getData(userId: number): Promise<Data[]> {
        return await DataModel.findAllByUserId(userId);
    }

    static async getDataByFileName(userId: number, fileName: string): Promise<Data | null> {
        return await DataModel.findByUserIdAndFileName(userId, fileName);
    }

    static async createData(data: CreateDataDto): Promise<number> {
        return await DataModel.create(data);
    }

    static async updateData(userId: number, fileName: string, data: UpdateDataDto): Promise<boolean> {
        return await DataModel.update(userId, fileName, data);
    }

    static async deleteData(userId: number, fileName: string): Promise<boolean> {
        return await DataModel.delete(userId, fileName);
    }
}