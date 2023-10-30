import { Server } from 'socket.io';

let IO: any;

export const initIO = (httpServer: any) => {
  IO = new Server(httpServer);

  IO.use((socket: any, next: any) => {
    if (socket.handshake.query) {
      let callerId = socket.handshake.query.callerId;
      socket.user = callerId;
      next();
    }
  });

  IO.on('connection', (socket: any) => {
    console.log(socket.user, 'Connected');
    socket.join(socket.user);

    socket.on('call', (data: any) => {
      let calleeId = data.calleeId;
      let rtcMessage = data.rtcMessage;

      console.log(calleeId, rtcMessage);

      socket.to(calleeId).emit('newCall', {
        callerId: socket.user,
        rtcMessage: rtcMessage,
      });
    });

    socket.on('answerCall', (data: any) => {
      let callerId = data.callerId;
      const rtcMessage = data.rtcMessage;

      socket.to(callerId).emit('callAnswered', {
        callee: socket.user,
        rtcMessage: rtcMessage,
      });
    });

    socket.on('ICEcandidate', (data: any) => {
      console.log('ICEcandidate data.calleeId', data.calleeId);
      let calleeId = data.calleeId;
      let rtcMessage = data.rtcMessage;

      socket.to(calleeId).emit('ICEcandidate', {
        sender: socket.user,
        rtcMessage: rtcMessage,
      });
    });
  });
};

export const getIO = () => {
  if (!IO) {
    throw Error('IO not initilized.');
  } else {
    return IO;
  }
};
