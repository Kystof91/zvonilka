'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Peer from 'peerjs'

type CallState = 'idle' | 'calling' | 'ringing' | 'connected' | 'ended'

interface PeerCallHook {
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
  myPeerId: string | null
}

export function usePeerCall(userId: string, userName: string): PeerCallHook {
  const [callState, setCallState] = useState<CallState>('idle')
  const [isMuted, setIsMuted] = useState(false)
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
  const [incomingCall, setIncomingCall] = useState<{ from: string; fromName: string } | null>(null)
  const [currentTarget, setCurrentTarget] = useState<string | null>(null)
  const [myPeerId, setMyPeerId] = useState<string | null>(null)

  const peerRef = useRef<Peer | null>(null)
  const callRef = useRef<any>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (!userId) return
    
    console.log('Initializing Peer with userId:', userId)
    
    // Generate a longer unique ID for PeerJS
    const peerId = `user-${userId}-${Date.now()}`
    
    const peer = new Peer(peerId, {
      host: '0.peerjs.com',
      port: 443,
      path: '/',
      secure: true,
      debug: 3,
    })

    peer.on('open', (id) => {
      console.log('Peer connected with ID:', id)
      setMyPeerId(id)
    })

    peer.on('call', (call) => {
      console.log('Incoming call from:', call.peer)
      console.log('Incoming call metadata:', call.metadata)
      
      // Ask for permission to use microphone
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream) => {
          console.log('Local stream obtained, answering call')
          setLocalStream(stream)
          call.answer(stream)
          
          // Store the incoming call
          const fromName = (call.metadata && call.metadata.userName) || call.peer
          setIncomingCall({ from: call.peer, fromName })
          setCurrentTarget(call.peer)
          setCallState('ringing')
          
          call.on('stream', (remoteStream) => {
            console.log('Received remote stream')
            setRemoteStream(remoteStream)
            setCallState('connected')
          })
          
          call.on('close', () => {
            console.log('Call ended')
            cleanup()
            setCallState('ended')
          })
          
          call.on('error', (err) => {
            console.error('Call error:', err)
          })
          
          callRef.current = call
        })
        .catch((error) => {
          console.error('Error answering call:', error)
        })
    })

    peer.on('error', (error) => {
      console.error('Peer error:', error)
    })

    peer.on('disconnected', () => {
      console.log('Peer disconnected')
    })

    peer.on('close', () => {
      console.log('Peer connection closed')
    })

    peerRef.current = peer

    return () => {
      console.log('Cleaning up Peer connection')
      if (peerRef.current) {
        peerRef.current.destroy()
      }
      cleanup()
    }
  }, [userId])

  // Play remote audio
  useEffect(() => {
    if (remoteStream && !audioRef.current) {
      const audio = new Audio()
      audio.srcObject = remoteStream
      audioRef.current = audio
      
      audio.play().catch(err => {
        console.error('Error auto-playing audio:', err)
      })
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.srcObject = null
        audioRef.current = null
      }
    }
  }, [remoteStream])

  const startCall = useCallback(async (targetId: string) => {
    console.log('Starting call to:', targetId)
    
    if (!peerRef.current) {
      console.error('Peer not initialized')
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      console.log('Local stream obtained for calling')
      setLocalStream(stream)
      
      const call = peerRef.current.call(targetId, stream, {
        metadata: { userName }
      })
      
      console.log('Call initiated, waiting for connection')
      callRef.current = call
      
      call.on('stream', (remoteStream) => {
        console.log('Received remote stream')
        setRemoteStream(remoteStream)
        setCallState('connected')
      })
      
      call.on('close', () => {
        console.log('Call ended')
        cleanup()
        setCallState('ended')
      })
      
      call.on('error', (error) => {
        console.error('Call error:', error)
        cleanup()
      })
      
      setCurrentTarget(targetId)
      setCallState('calling')
    } catch (error) {
      console.error('Error starting call:', error)
    }
  }, [userName])

  const answerCall = useCallback(() => {
    console.log('Answering incoming call')
    // Already answered automatically in the 'call' event handler
    setCallState('connected')
  }, [])

  const rejectCall = useCallback(() => {
    console.log('Rejecting call')
    if (callRef.current) {
      callRef.current.close()
    }
    cleanup()
    setCallState('idle')
  }, [])

  const endCall = useCallback(() => {
    console.log('Ending call')
    if (callRef.current) {
      callRef.current.close()
    }
    cleanup()
    setCallState('ended')
  }, [])

  const toggleMute = useCallback(() => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled
      })
      setIsMuted(!isMuted)
    }
  }, [localStream, isMuted])

  const cleanup = useCallback(() => {
    if (callRef.current) {
      callRef.current.close()
      callRef.current = null
    }

    if (localStream) {
      localStream.getTracks().forEach(track => track.stop())
      setLocalStream(null)
    }

    if (audioRef.current) {
      audioRef.current.srcObject = null
      audioRef.current = null
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
    currentTarget,
    myPeerId
  }
}
