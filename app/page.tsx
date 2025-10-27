'use client'

import { useState, useEffect } from 'react'
import UserInput from '@/components/UserInput'
import CallInterface from '@/components/CallInterface'
import { usePeerCall } from '@/hooks/usePeerCall'
import { generateUserId } from '@/lib/utils'

export default function Home() {
  const [userName, setUserName] = useState<string>('')
  const [userId, setUserId] = useState<string>('')
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId')
    // Check if stored ID is 4 digits, if not - create new one
    if (storedUserId && /^\d{4}$/.test(storedUserId)) {
      setUserId(storedUserId)
    } else if (storedUserId) {
      // Old long ID detected, clear it
      localStorage.removeItem('userId')
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
    incomingCall,
    myPeerId
  } = usePeerCall(isInitialized ? userId : '', isInitialized ? userName : '')

  if (!isInitialized || !userName || !userId) {
    return <UserInput onNameSubmit={handleNameSubmit} />
  }

  return (
    <CallInterface
      userName={userName}
      myPeerId={myPeerId}
      userId={userId}
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
