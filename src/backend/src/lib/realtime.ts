import { Server as SocketIOServer } from "socket.io";

type Entity = "company" | "contact" | "activity" | "task";
type Action = "created" | "updated" | "deleted";

export function emitEntityEvent(
  io: SocketIOServer,
  entity: Entity,
  action: Action,
  data: unknown
): void {
  const event = `${entity}:${action}`;
  io.emit(event, data);
}
