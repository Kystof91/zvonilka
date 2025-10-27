import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export function getSocket(): Socket {
  if (!socket) {
    // Auto-detect the correct URL based on where we're running
    let serverUrl = 'http://localhost:3000'
    
    if (typeof window !== 'undefined') {
      // Client-side: use the current hostname
      const protocol = window.location.protocol
      const hostname = window.location.hostname
      serverUrl = `${protocol}//${hostname}:3000`
    }
    
    // Override with environment variable if set
    if (process.env.NEXT_PUBLIC_SERVER_URL) {
      serverUrl = process.env.NEXT_PUBLIC_SERVER_URL
    }
    
    console.log('Connecting to Socket.io server at:', serverUrl)
    
    socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity
    })
  }
  return socket
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
