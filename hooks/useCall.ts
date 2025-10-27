'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { getSocket, disconnectSocket } from '@/lib/socket'
import { getUserMedia, createPeerConnection, createOffer, createAnswer } from '@/lib/webrtc'

type CallState = 'idle' | 'calling' | 'ringing' | 'connected' | 'ended'

interface CallHook {
  callState: CallState
  isMuted: boolean
  localStream: MediaStream | null
  remoteStream: MediaStream | null
  startCall: (targetId: string) => void
  answerCall: () => void
  rejectCall: () => void
  endCall: () => void
  toggleMute: () => void
  incomingCall: { from: string; fromName: string } | null
  currentTarget: string | null
}

export function useCall(userId: string, userName: string): CallHook {
  const [callState, setCallState] = useState<CallState>('idle')
  const [isMuted, setIsMuted] = useState(false)
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
  const [incomingCall, setIncomingCall] = useState<{ from: string; fromName: string } | null>(null)
  const [currentTarget, setCurrentTarget] = useState<string | null>(null)

  const pcRef = useRef<RTCPeerConnection | null>(null)
  const socketRef = useRef<any>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const socket = getSocket()
    socketRef.current = socket

    console.log('Emitting join-room with userId:', userId)
    socket.emit('join-room', { userId })

    socket.on('incoming-call', (data: { from: string; fromName: string }) => {
      console.log('Incoming call from', data)
      setIncomingCall(data)
      setCallState('ringing')
    })

    socket.on('call-accepted', () => {
      console.log('Call accepted, setting state to connected')
      setCallState('connected')
    })

    socket.on('call-rejected', () => {
      console.log('Call rejected')
      setCallState('ended')
      setIncomingCall(null)
    })

    socket.on('call-ended', () => {
      console.log('Call ended')
      setCallState('ended')
      cleanup()
    })

    socket.on('offer', async (data: { from: string; offer: RTCSessionDescriptionInit }) => {
      console.log('Received offer, pcRef exists:', !!pcRef.current, 'callState:', callState)
      if (pcRef.current) {
        try {
          await pcRef.current.setRemoteDescription(data.offer)
          const answer = await createAnswer(pcRef.current)
          socket.emit('answer', { from: userId, to: data.from, answer })
          console.log('Sent answer to', data.from)
        } catch (error) {
          console.error('Error handling offer:', error)
        }
      }
    })

    socket.on('answer', async (data: { from: string; answer: RTCSessionDescriptionInit }) => {
      console.log('Received answer from', data.from)
      if (pcRef.current) {
        try {
          await pcRef.current.setRemoteDescription(data.answer)
          console.log('Set remote description successfully')
        } catch (error) {
          console.error('Error setting remote description:', error)
        }
      }
    })

    socket.on('ice-candidate', async (data: { from: string; candidate: RTCIceCandidateInit }) => {
      console.log('Received ICE candidate from', data.from)
      if (pcRef.current && data.candidate) {
        try {
          await pcRef.current.addIceCandidate(new RTCIceCandidate(data.candidate))
        } catch (error) {
          console.error('Error adding ICE candidate:', error)
        }
      }
    })

    return () => {
      cleanup()
      disconnectSocket()
    }
  }, [userId, callState])

  // Play remote audio when stream is available
  useEffect(() => {
    if (remoteStream && !audioRef.current) {
      const audio = new Audio()
      audio.srcObject = remoteStream
      audioRef.current = audio
      
      audio.play().catch(err => {
        console.error('Error auto-playing audio:', err)
        // Try to play on user interaction
        document.addEventListener('click', () => {
          audio.play().catch(e => console.error('Error playing on click:', e))
        }, { once: true })
      })
      
      console.log('Audio element created and playing remote stream')
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.srcObject = null
        audioRef.current = null
      }
    }
  }, [remoteStream])

  const startCall = useCallback(async (targetId: string) => {
    console.log('Starting call to', targetId, 'userId:', userId, 'userName:', userName)
    console.log('socketRef.current:', socketRef.current)
    
    if (!socketRef.current) {
      console.error('Socket not connected!')
      return
    }
    
    try {
      const stream = await getUserMedia()
      console.log('Got user media stream')
      setLocalStream(stream)
      
      const pc = createPeerConnection()
      pcRef.current = pc
      
      stream.getTracks().forEach(track => pc.addTrack(track, stream))

      pc.ontrack = (event) => {
        console.log('Received remote track')
        setRemoteStream(event.streams[0])
        setCallState('connected')
      }

      pc.oniceconnectionstatechange = () => {
        console.log('ICE connection state:', pc.iceConnectionState)
        if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
          setCallState('connected')
        }
      }

      console.log('Emitting call-request...')
      socketRef.current.emit('call-request', {
        from: userId,
        to: targetId,
        fromName: userName
      })

      const offer = await createOffer(pc)
      console.log('Created offer, emitting...')
      socketRef.current.emit('offer', { from: userId, to: targetId, offer })

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('Sending ICE candidate')
          socketRef.current?.emit('ice-candidate', {
            from: userId,
            to: targetId,
            candidate: event.candidate
          })
        }
      }

      setCurrentTarget(targetId)
      setCallState('calling')
    } catch (error) {
      console.error('Error starting call:', error)
    }
  }, [userId, userName, socketRef])

  const answerCall = useCallback(async () => {
    if (!incomingCall) return

    console.log('Answering call from', incomingCall.from)

    try {
      const stream = await getUserMedia()
      setLocalStream(stream)

      const pc = createPeerConnection()
      pcRef.current = pc

      stream.getTracks().forEach(track => pc.addTrack(track, stream))

      pc.ontrack = (event) => {
        console.log('Received remote track')
        setRemoteStream(event.streams[0])
        setCallState('connected')
      }

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socketRef.current?.emit('ice-candidate', {
            from: userId,
            to: incomingCall.from,
            candidate: event.candidate
          })
        }
      }

      pc.oniceconnectionstatechange = () => {
        console.log('ICE connection state:', pc.iceConnectionState)
        if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
          setCallState('connected')
        }
      }

      socketRef.current?.emit('call-accept', {
        from: userId,
        to: incomingCall.from
      })

      setCurrentTarget(incomingCall.from)
      setIncomingCall(null)
      setCallState('calling')
    } catch (error) {
      console.error('Error answering call:', error)
    }
  }, [incomingCall, userId])

  const rejectCall = useCallback(() => {
    if (!incomingCall) return

    socketRef.current?.emit('call-reject', {
      from: userId,
      to: incomingCall.from
    })

    setIncomingCall(null)
    setCallState('idle')
  }, [incomingCall, userId])

  const endCall = useCallback(() => {
    socketRef.current?.emit('call-end', { userId })
    cleanup()
    setCallState('ended')
  }, [userId])

  const toggleMute = useCallback(() => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled
      })
      setIsMuted(!isMuted)
    }
  }, [localStream, isMuted])

  const cleanup = useCallback(() => {
    if (pcRef.current) {
      pcRef.current.close()
      pcRef.current = null
    }

    if (localStream) {
      localStream.getTracks().forEach(track => track.stop())
      setLocalStream(null)
    }

    setRemoteStream(null)
    setCurrentTarget(null)
    setIncomingCall(null)
  }, [localStream])

  return {
    callState,
    isMuted,
    localStream,
    remoteStream,
    startCall,
    answerCall,
    rejectCall,
    endCall,
    toggleMute,
    incomingCall,
    currentTarget
  }
}
