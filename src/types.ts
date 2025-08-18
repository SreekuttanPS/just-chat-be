export type ClientMessage = {
  message: string;
  user: {
    name: string;
    username: string;
  };
  replyTo: {
    messageId: string;
    message: string;
    username: string;
    name: string;
  } | null;
};

export type OutgoingMessage = ClientMessage & {
  messageType: "text" | "info";
  timestamp: string;
  messageId: string;
};

export type User = {
  socketId: string;
  username: string;
  name: string;
};
