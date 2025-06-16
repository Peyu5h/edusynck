import Pusher from "pusher-js";

let pusherInstance: Pusher | null = null;

export function getPusherClient(): Pusher {
  if (!pusherInstance) {
    pusherInstance = new Pusher(process.env.PUSHER_KEY!, {
      cluster: "ap2",
      forceTLS: true,
    });
  }
  return pusherInstance;
}

export function getChannelName(classId: string): string {
  return `class-${classId}-chat`;
}

export function subscribeToClassChat(
  classId: string,
  onNewMessage: (data: any) => void,
) {
  const pusher = getPusherClient();
  const channelName = getChannelName(classId);

  // Subscribe to the channel
  const channel = pusher.subscribe(channelName);

  // Bind to the new-message event
  channel.bind("new-message", onNewMessage);

  // Return unsubscribe function for cleanup
  return () => {
    channel.unbind("new-message", onNewMessage);
    pusher.unsubscribe(channelName);
  };
}
