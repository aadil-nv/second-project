import { inject, injectable } from "inversify";
import { Request, Response } from "express";
import INotificationService from "../../service/interface/INotificationService";
import INotificationController from "../interface/INotificationController";
import { CustomRequest } from "../../middlewares/authMiddleware";
import { HttpStatusCode } from "../../utils/enum";


@injectable()
export default class NotificationController implements INotificationController {
    constructor(@inject("INotificationService") private _notificationService: INotificationService) { }

    private getMyId(req: CustomRequest): string {
        return (
            req.user?.businessOwnerData?._id ||
            req.user?.managerData?._id ||
            req.user?.employeeData?._id ||
            ''
        );
    }
    async getAllNotifications(req: CustomRequest, res: Response): Promise<Response> {
        
        try {
            const myId = this.getMyId(req);
            const notifications = await this._notificationService.getAllNotifications(myId);
            return res.status(HttpStatusCode.OK).json(notifications);
        } catch (error) {
            console.error(error);
            return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: "Internal server error" });
        }
    }

    async clearAllNotifications(req: CustomRequest, res: Response): Promise<Response> {
        try {
            const myId = this.getMyId(req);
            const notifications = await this._notificationService.clearAllNotifications(myId);
            return res.status(HttpStatusCode.OK).json(notifications);
        } catch (error) {
            console.error(error);
            return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: "Internal server error" });
        }
    }

    async deleteNotification(req: CustomRequest, res: Response): Promise<Response> {
        console.log("hitting deleteNotification =111111111111111111111111111");
        try {
            const notificationId = req.params.id;
            console.log("notificationId 22222222222222222222222222", notificationId);
            
            const notifications = await this._notificationService.deleteNotification(notificationId);
            console.log("notifications 3333333333333333333333333", notifications);
            return res.status(HttpStatusCode.OK).json(notifications);
        } catch (error) {
            console.error(error);
            return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: "Internal server error" });
        }
    }

    

}