export type IncomingMessage = {
  username: string;
  message: string;
};

export type OutgoingMessage = IncomingMessage & {
  timestamp: string;
};

export type User = {
  socketId: string;
  username: string;
};
