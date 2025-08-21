export function getDmRoomName(userId1: string, userId2: string) {
  return `dm:${[userId1, userId2].sort().join(":")}`;
}

export function parseDmRoomName(roomName: string): [string, string] {
  if (!roomName.startsWith("dm:")) {
    throw new Error("Invalid room name");
  }

  // remove the "dm:" prefix
  const withoutPrefix = roomName.slice(3);

  // split by ":"
  const parts = withoutPrefix.split(":");
  if (parts.length !== 2) {
    throw new Error("Invalid DM room format");
  }

  return [parts[0], parts[1]];
}
