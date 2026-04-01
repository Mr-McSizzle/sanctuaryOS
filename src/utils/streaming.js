import Peer from "peerjs";

// Generate a short 6-character room code
export function generateRoomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous chars
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

/**
 * Creates a PeerJS host that streams webcam to all connecting viewers.
 * Returns an object with controls.
 */
export function createHost(roomCode, onStatusChange) {
  const peerId = `sanctuary-${roomCode}`;
  const peer = new Peer(peerId, { debug: 0 });
  let localStream = null;
  const connections = [];

  peer.on("open", (id) => {
    onStatusChange?.({ status: "ready", id, roomCode, viewers: 0 });
  });

  peer.on("call", (call) => {
    if (localStream) {
      call.answer(localStream);
      connections.push(call);
      onStatusChange?.({ status: "connected", viewers: connections.length });

      call.on("close", () => {
        const idx = connections.indexOf(call);
        if (idx !== -1) connections.splice(idx, 1);
        onStatusChange?.({ status: connections.length > 0 ? "connected" : "ready", viewers: connections.length });
      });
    }
  });

  peer.on("error", (err) => {
    console.error("Host peer error:", err);
    onStatusChange?.({ status: "error", error: err.message });
  });

  return {
    peer,
    setStream: (stream) => {
      localStream = stream;
      // Update any existing calls with new stream
      connections.forEach(call => {
        stream.getTracks().forEach(track => {
          const sender = call.peerConnection?.getSenders()?.find(s => s.track?.kind === track.kind);
          if (sender) sender.replaceTrack(track);
        });
      });
    },
    destroy: () => {
      connections.forEach(c => c.close());
      peer.destroy();
    },
    getViewerCount: () => connections.length,
  };
}

/**
 * Connects to a host as a viewer and receives the video stream.
 * @returns Promise that resolves with the remote MediaStream
 */
export function connectAsViewer(roomCode, onStatusChange) {
  return new Promise((resolve, reject) => {
    const peer = new Peer(undefined, { debug: 0 });
    const hostId = `sanctuary-${roomCode}`;

    peer.on("open", () => {
      onStatusChange?.({ status: "connecting" });
      
      // Create a dummy stream to initiate the call (PeerJS requires media for media calls)
      const canvas = document.createElement("canvas");
      canvas.width = 1;
      canvas.height = 1;
      const dummyStream = canvas.captureStream(1);

      const call = peer.call(hostId, dummyStream);
      
      if (!call) {
        onStatusChange?.({ status: "error", error: "Failed to initiate call" });
        reject(new Error("Failed to call host"));
        return;
      }

      call.on("stream", (remoteStream) => {
        onStatusChange?.({ status: "connected" });
        resolve({ stream: remoteStream, peer, call });
      });

      call.on("error", (err) => {
        onStatusChange?.({ status: "error", error: err.message });
        reject(err);
      });

      call.on("close", () => {
        onStatusChange?.({ status: "disconnected" });
      });

      // Timeout after 15 seconds
      setTimeout(() => {
        if (call && !call.open) {
          onStatusChange?.({ status: "error", error: "Connection timeout" });
          reject(new Error("Connection timeout"));
        }
      }, 15000);
    });

    peer.on("error", (err) => {
      console.error("Viewer peer error:", err);
      onStatusChange?.({ status: "error", error: err.type === "peer-unavailable" ? "Host not found. Check code." : err.message });
      reject(err);
    });
  });
}
