export const rtcConfig: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
  iceCandidatePoolSize: 10,
  bundlePolicy: 'max-bundle',
  rtcpMuxPolicy: 'require'
}

export const audioConstraints: MediaStreamConstraints = {
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    sampleRate: 48000,
    channelCount: 1
  }
}

export async function getUserMedia(): Promise<MediaStream> {
  try {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      throw new Error('getUserMedia is only available in browser environment')
    }
    
    // Get navigator with proper typing
    const nav = window.navigator as Navigator & {
      mediaDevices?: MediaDevices;
      getUserMedia?: (constraints: MediaStreamConstraints) => Promise<MediaStream>;
    }
    
    // Check if navigator.mediaDevices exists
    if (!nav.mediaDevices) {
      console.error('navigator.mediaDevices is undefined!')
      console.error('Protocol:', window.location.protocol)
      console.error('Host:', window.location.host)
      throw new Error('navigator.mediaDevices is not available. Make sure you are using HTTPS or localhost.')
    }
    
    if (!nav.mediaDevices.getUserMedia) {
      throw new Error('getUserMedia is not supported in this browser')
    }
    
    console.log('Requesting audio stream with constraints:', audioConstraints)
    const stream = await nav.mediaDevices.getUserMedia(audioConstraints)
    console.log('Successfully got audio stream')
    return stream
  } catch (error) {
    console.error('Error accessing microphone:', error)
    throw error
  }
}

export function createPeerConnection(): RTCPeerConnection {
  const pc = new RTCPeerConnection(rtcConfig)
  
  pc.oniceconnectionstatechange = () => {
    console.log('ICE connection state:', pc.iceConnectionState)
  }
  
  pc.onconnectionstatechange = () => {
    console.log('Connection state:', pc.connectionState)
  }
  
  return pc
}

export async function createOffer(pc: RTCPeerConnection): Promise<RTCSessionDescriptionInit> {
  const offer = await pc.createOffer({
    offerToReceiveAudio: true,
    offerToReceiveVideo: false
  })
  await pc.setLocalDescription(offer)
  return offer
}

export async function createAnswer(pc: RTCPeerConnection): Promise<RTCSessionDescriptionInit> {
  const answer = await pc.createAnswer({
    offerToReceiveAudio: true,
    offerToReceiveVideo: false
  })
  await pc.setLocalDescription(answer)
  return answer
}
