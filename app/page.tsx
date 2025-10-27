'use client'

import { useState, useEffect } from 'react'
import UserInput from '@/components/UserInput'
import CallInterface from '@/components/CallInterface'
import { useCall } from '@/hooks/useCall'
import { generateUserId } from '@/lib/utils'

export default function Home() {
  const [userName, setUserName] = useState<string>('')
  const [userId, setUserId] = useState<string>('')
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId')
    if (storedUserId) {
      setUserId(storedUserId)
    }
  }, [])

  const handleNameSubmit = (name: string) => {
    setUserName(name)
    if (!userId) {
      const newUserId = generateUserId()
      setUserId(newUserId)
      localStorage.setItem('userId', newUserId)
    }
    setIsInitialized(true)
  }

  // Don't initialize useCall until we have userId
  const {
    callState,
    isMuted,
    startCall,
    answerCall,
    rejectCall,
    endCall,
    toggleMute,
    incomingCall
  } = useCall(isInitialized ? userId : '', isInitialized ? userName : '')

  if (!isInitialized || !userName || !userId) {
    return <UserInput onNameSubmit={handleNameSubmit} />
  }

  return (
    <CallInterface
      userName={userName}
      startCall={startCall}
      incomingCall={incomingCall}
      answerCall={answerCall}
      rejectCall={rejectCall}
      endCall={endCall}
      toggleMute={toggleMute}
      isMuted={isMuted}
      callState={callState}
    />
  )
}
