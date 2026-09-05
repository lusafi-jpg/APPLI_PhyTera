import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'realtime',
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(RealtimeGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connecté au WebSocket: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client déconnecté du WebSocket: ${client.id}`);
  }

  @SubscribeMessage('join_room')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { room: string },
  ) {
    if (payload?.room) {
      client.join(payload.room);
      this.logger.log(`Socket ${client.id} a rejoint le canal: ${payload.room}`);
      return { status: 'joined', room: payload.room };
    }
  }

  @SubscribeMessage('leave_room')
  handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { room: string },
  ) {
    if (payload?.room) {
      client.leave(payload.room);
      this.logger.log(`Socket ${client.id} a quitté le canal: ${payload.room}`);
      return { status: 'left', room: payload.room };
    }
  }

  emitNewMeasure(fieldId: string, deviceId: string, userId: string, data: any) {
    const payload = {
      event: 'new_measure',
      fieldId,
      deviceId,
      data,
      timestamp: new Date(),
    };
    this.server.to(`field_${fieldId}`).emit('new_measure', payload);
    this.server.to(`device_${deviceId}`).emit('new_measure', payload);
    this.server.to(`user_${userId}`).emit('new_measure', payload);
  }

  emitNewAlert(fieldId: string, userId: string, alert: any) {
    const payload = {
      event: 'new_alert',
      fieldId,
      alert,
      timestamp: new Date(),
    };
    this.server.to(`field_${fieldId}`).emit('new_alert', payload);
    this.server.to(`user_${userId}`).emit('new_alert', payload);
  }

  emitNotificationToUser(userId: string, notification: any) {
    const payload = {
      event: 'new_notification',
      notification,
      timestamp: new Date(),
    };
    this.server.to(`user_${userId}`).emit('new_notification', payload);
  }
}
