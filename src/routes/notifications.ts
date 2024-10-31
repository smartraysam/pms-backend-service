import {
  createNotification,
  createLocationNotification,
  getNotifications,
  resendNotification,
  updateNotification,
  deleteNotification,
  getIncomingNotifications,
  markAllIncomingNotificationsAsRead,
  markIncomingNotificationAsRead,
} from "@/models/notification.model";
import { Router, Request, Response } from "express";

const notificationRoutes = Router();

/**
 * @swagger
 * /notifications:
 *   post:
 *     summary: Create a new notification for a user
 *     tags: [Notifications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: integer
 *               props:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                   vehicles:
 *                     type: array
 *                     items:
 *                       type: integer
 *     responses:
 *       200:
 *         description: Successfully created notification.
 *       400:
 *         description: Error creating notification.
 */
notificationRoutes.post(
  "/notifications",
  async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const { props } = req.body;
      const notification = await createNotification(userId, props);
      res.status(200).json(notification);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
);

/**
 * @swagger
 * /notifications/location:
 *   post:
 *     summary: Create a location-based notification
 *     tags: [Notifications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               locationId:
 *                 type: integer
 *               props:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                   vehicles:
 *                     type: array
 *                     items:
 *                       type: integer
 *     responses:
 *       200:
 *         description: Successfully created location-based notification.
 *       400:
 *         description: Error creating notification.
 */
notificationRoutes.post(
  "/notifications/location",
  async (req: Request, res: Response) => {
    try {
      const { locationId, props } = req.body;
      const notification = await createLocationNotification(locationId, props);
      res.status(200).json(notification);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
);

/**
 * @swagger
 * /notifications/user/{userId}:
 *   get:
 *     summary: Get notifications for a specific user
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: List of notifications for the user.
 */
notificationRoutes.get(
  "/notifications/user",
  async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const notifications = await getNotifications(userId);
      res.status(200).json(notifications);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
);

/**
 * @swagger
 * /notifications/resend/{notificationId}:
 *   post:
 *     summary: Resend a notification by ID
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Successfully resent notification.
 *       404:
 *         description: Notification not found.
 */
notificationRoutes.post(
  "/notifications/resend/:notificationId",
  async (req: Request, res: Response) => {
    try {
      const notificationId = parseInt(req.params.notificationId);
      const notification = await resendNotification(notificationId);
      res.status(200).json(notification);
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  }
);

/**
 * @swagger
 * /notifications/{notificationId}:
 *   put:
 *     summary: Update a notification message
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         schema:
 *           type: integer
 *         required: true
 *       - in: body
 *         name: message
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification updated.
 */
notificationRoutes.put(
  "/notifications/:notificationId",
  async (req: Request, res: Response) => {
    try {
      const notificationId = parseInt(req.params.notificationId);
      const { message } = req.body;
      const updatedNotification = await updateNotification(
        notificationId,
        message
      );
      res.status(200).json(updatedNotification);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
);

/**
 * @swagger
 * /notifications/{notificationId}:
 *   delete:
 *     summary: Delete a notification by ID
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Notification deleted.
 *       404:
 *         description: Notification not found.
 */
notificationRoutes.delete(
  "/notifications/:notificationId",
  async (req: Request, res: Response) => {
    try {
      const notificationId = parseInt(req.params.notificationId);
      const deletedNotification = await deleteNotification(notificationId);
      res.status(200).json(deletedNotification);
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  }
);

/**
 * @swagger
 * /notifications/incoming/{userId}:
 *   get:
 *     summary: Get incoming notifications for a user
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: List of incoming notifications with unread count.
 */
notificationRoutes.get(
  "/notifications/incoming",
  async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const incomingNotifications = await getIncomingNotifications(userId);
      res.status(200).json(incomingNotifications);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
);

/**
 * @swagger
 * /notifications/incoming/{userId}/read-all:
 *   put:
 *     summary: Mark all incoming notifications as read for a user
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: All notifications marked as read.
 */
notificationRoutes.put(
  "/notifications/incoming/read-all",
  async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      await markAllIncomingNotificationsAsRead(userId);
      res.status(200).json({ message: "All notifications marked as read" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
);

/**
 * @swagger
 * /notifications/incoming/read/{notificationId}:
 *   put:
 *     summary: Mark a single incoming notification as read
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Notification marked as read.
 *       404:
 *         description: Notification not found.
 */
notificationRoutes.put(
  "/notifications/incoming/read/:notificationId",
  async (req: Request, res: Response) => {
    try {
      const notificationId = parseInt(req.params.notificationId);
      const notification = await markIncomingNotificationAsRead(notificationId);
      res.status(200).json(notification);
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  }
);

export default notificationRoutes;
