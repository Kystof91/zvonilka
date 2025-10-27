import { Server as HTTPServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import next from 'next'

const dev = process.env.NODE_ENV !== 'production'
const hostname = '0.0.0.0' // Listen on all network interfaces
const port = 3000

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const httpServer = new HTTPServer()

  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  })

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id)

    socket.on('join-room', (data: { userId: string }) => {
      socket.join(data.userId)
      console.log(`User ${data.userId} joined room`)
    })

    socket.on('call-request', (data: { from: string; to: string; fromName: string }) => {
      console.log('Call request from', data.from, 'to', data.to, 'fromName:', data.fromName)
      socket.to(data.to).emit('incoming-call', {
        from: data.from,
        fromName: data.fromName
      })
    })

    socket.on('call-accept', (data: { from: string; to: string }) => {
      console.log('Call accept from', data.from, 'to', data.to)
      socket.to(data.to).emit('call-accepted', { userId: data.from })
    })

    socket.on('call-reject', (data: { from: string; to: string }) => {
      socket.to(data.to).emit('call-rejected', { userId: data.from })
    })

    socket.on('call-end', (data: { userId: string }) => {
      socket.broadcast.emit('call-ended', { userId: data.userId })
    })

    socket.on('offer', (data: { from: string; to: string; offer: RTCSessionDescriptionInit }) => {
      console.log('Offer from', data.from, 'to', data.to)
      socket.to(data.to).emit('offer', { from: data.from, offer: data.offer })
    })

    socket.on('answer', (data: { from: string; to: string; answer: RTCSessionDescriptionInit }) => {
      console.log('Answer from', data.from, 'to', data.to)
      socket.to(data.to).emit('answer', { from: data.from, answer: data.answer })
    })

    socket.on('ice-candidate', (data: { from: string; to: string; candidate: RTCIceCandidateInit }) => {
      socket.to(data.to).emit('ice-candidate', { from: data.from, candidate: data.candidate })
    })

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id)
    })
  })

  httpServer.on('request', (req, res) => {
    handle(req, res)
  })

  httpServer.listen(port, hostname, () => {
    console.log(`> Ready on http://localhost:${port}`)
    console.log(`> Network access: http://192.168.0.230:${port}`)
    console.log(`> You can now access this from other devices on your WiFi network`)
  })
})
