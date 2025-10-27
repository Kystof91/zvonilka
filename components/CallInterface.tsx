'use client'

import { useState } from 'react'
import { Phone, PhoneIncoming, PhoneOff, Mic, MicOff } from 'lucide-react'

interface CallInterfaceProps {
  userName: string
  startCall: (targetId: string) => void
  incomingCall: { from: string; fromName: string } | null
  answerCall: () => void
  rejectCall: () => void
  endCall: () => void
  toggleMute: () => void
  isMuted: boolean
  callState: 'idle' | 'calling' | 'ringing' | 'connected' | 'ended'
}

export default function CallInterface({
  userName,
  startCall,
  incomingCall,
  answerCall,
  rejectCall,
  endCall,
  toggleMute,
  isMuted,
  callState
}: CallInterfaceProps) {
  const [targetId, setTargetId] = useState('')

  const handleCall = (e: React.FormEvent) => {
    e.preventDefault()
    if (targetId.trim()) {
      startCall(targetId.trim())
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
            <h1 className="text-2xl font-bold">{userName}</h1>
            <p className="text-blue-100 text-sm mt-1">Готов к звонку</p>
          </div>

          {/* Main Content */}
          <div className="p-6">
            {callState === 'idle' && (
              <form onSubmit={handleCall} className="space-y-4">
                <div>
                  <label htmlFor="targetId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    ID получателя
                  </label>
                  <input
                    id="targetId"
                    type="text"
                    value={targetId}
                    onChange={(e) => setTargetId(e.target.value)}
                    placeholder="Введите ID получателя"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!targetId.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition duration-200"
                >
                  <Phone className="w-5 h-5" />
                  Позвонить
                </button>
              </form>
            )}

            {(callState === 'calling' || callState === 'connected') && (
              <div className="text-center space-y-6">
                <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto">
                  <PhoneIncoming className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {callState === 'calling' ? 'Вызов...' : 'В разговоре'}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    {callState === 'calling' ? 'Ожидание ответа' : 'Звонок активен'}
                  </p>
                </div>

                {callState === 'connected' && (
                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={toggleMute}
                      className="w-14 h-14 rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                      {isMuted ? (
                        <MicOff className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                      ) : (
                        <Mic className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                      )}
                    </button>
                    <button
                      onClick={endCall}
                      className="w-14 h-14 rounded-full flex items-center justify-center bg-red-600 hover:bg-red-700 transition-colors"
                    >
                      <PhoneOff className="w-6 h-6 text-white" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Incoming Call Modal */}
        {incomingCall && callState === 'ringing' && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8">
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto">
                  <PhoneIncoming className="w-10 h-10 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Входящий звонок
                  </h2>
                  <p className="text-3xl font-semibold text-gray-900 dark:text-white mt-2">
                    {incomingCall.fromName}
                  </p>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={rejectCall}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
                  >
                    Отклонить
                  </button>
                  <button
                    onClick={answerCall}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
                  >
                    Принять
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
