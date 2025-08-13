// 'use client';

// import { LiveKitRoom, AudioConference, useRoomContext, StartAudio } from '@livekit/components-react';
// import { useCallback, useEffect, useState } from 'react';
// import { RoomEvent, TranscriptionSegment } from 'livekit-client';

// // Generates a random user ID for storage only (not sent to backend)
// function generateRandomUserId() {
//   return `user-${Math.floor(Math.random() * 100000)}`;
// }

// // ✅ New component to listen for transcriptions inside LiveKit context
// function TranscriptionListener({ setTranscriptions }: { setTranscriptions: React.Dispatch<React.SetStateAction<{ [id: string]: TranscriptionSegment }>> }) {
//   const room = useRoomContext();

//   useEffect(() => {
//     if (!room) return;

//     const handleTranscription = (segments: TranscriptionSegment[]) => {
//       setTranscriptions(prev => {
//         const updated = { ...prev };
//         segments.forEach(segment => {
//           updated[segment.id] = segment;
//         });
//         return updated;
//       });
//     };

//     room.on(RoomEvent.TranscriptionReceived, handleTranscription);
//     return () => {
//       room.off(RoomEvent.TranscriptionReceived, handleTranscription);
//     };
//   }, [room, setTranscriptions]);

//   return null; // This component only listens; no UI
// }

// export default function AudioExamplePage() {
//   const [mounted, setMounted] = useState(false);
//   const [userIdentity, setUserIdentity] = useState<string>('');

//   const endpoint = process.env.NEXT_PUBLIC_LK_TOKEN_ENDPOINT!;

//   const [isStarting, setIsStarting] = useState(false);
//   const [isInRoom, setIsInRoom] = useState(false);
//   const [token, setToken] = useState<string | null>(null);
//   const [serverUrlState, setServerUrlState] = useState<string | null>(null);
//   const [roomNameState, setRoomNameState] = useState<string | null>(null);
//   const [error, setError] = useState<string | null>(null);
//   const [transcriptions, setTranscriptions] = useState<{ [id: string]: TranscriptionSegment }>({});

//   // Mounting logic and storing random identity locally
//   useEffect(() => {
//     setMounted(true);

//     const stored = localStorage.getItem('lk-user-id');
//     if (stored) {
//       setUserIdentity(stored);
//     } else {
//       const uid = generateRandomUserId();
//       localStorage.setItem('lk-user-id', uid);
//       setUserIdentity(uid);
//     }
//   }, []);

//   // Start session by calling second token generator endpoint
//   const handleStart = useCallback(async () => {
//     if (!endpoint) return;
//     setError(null);
//     setIsStarting(true);
//     try {
//       const res = await fetch(endpoint, { method: 'GET', cache: 'no-store' });
//       if (!res.ok) throw new Error(`Token fetch failed: ${res.status} ${res.statusText}`);
//       const json = await res.json();

//       const t = json?.participantToken ?? json?.token ?? json?.accessToken;
//       const serverUrlFromApi = json?.serverUrl;
//       const roomFromApi = json?.roomName;

//       if (typeof t !== 'string') throw new Error('Token not found in response.');
//       if (typeof serverUrlFromApi !== 'string') throw new Error('serverUrl not found in response.');
//       if (typeof roomFromApi !== 'string') throw new Error('roomName not found in response.');

//       setToken(t);
//       setServerUrlState(serverUrlFromApi);
//       setRoomNameState(roomFromApi);
//       setIsInRoom(true);
//     } catch (e: any) {
//       setError(e.message || 'Failed to start.');
//       setToken(null);
//       setServerUrlState(null);
//       setRoomNameState(null);
//       setIsInRoom(false);
//     } finally {
//       setIsStarting(false);
//     }
//   }, [endpoint]);

//   const handleStoppedByChild = useCallback(() => {
//     setIsInRoom(false);
//     setToken(null);
//   }, []);

//   if (!mounted || !userIdentity) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <p role="status" aria-live="polite">Loading…</p>
//       </div>
//     );
//   }

//   return (
//     <div
//       data-lk-theme="default"
//       style={{
//         height: '100vh',
//         width: '100vw',
//         display: 'flex',
//         flexDirection: 'column',
//         background: '#1a1a1a',
//         color: 'white',
//       }}
//     >
//       <header style={{ padding: '12px 16px', borderBottom: '1px solid #333', display: 'flex', alignItems: 'center', gap: 12 }}>
//         <h1 style={{ fontSize: 22, margin: 0, flex: 1, fontWeight: 600 }}>Real-Time Voice Translation</h1>
//         {!isInRoom ? (
//           <button
//             type="button"
//             onClick={handleStart}
//             disabled={isStarting}
//             style={{
//               padding: '10px 16px',
//               borderRadius: 8,
//               border: 'none',
//               background: '#007aff',
//               color: 'white',
//               fontWeight: 500,
//               cursor: isStarting ? 'not-allowed' : 'pointer',
//               transition: 'background-color 0.2s',
//             }}
//             aria-label="Start"
//           >
//             {isStarting ? 'Starting…' : 'Start Session'}
//           </button>
//         ) : null}
//       </header>

//       {error && (
//         <div role="alert" style={{ padding: '8px 16px', color: '#ff4d4d', background: '#442222' }}>
//           {error}
//         </div>
//       )}

//       {!isInRoom && (
//         <div style={{ flex: 1, display: 'grid', placeItems: 'center', padding: 16, textAlign: 'center' }}>
//           <div>
//             <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 8 }}>Welcome</h2>
//             <p style={{ opacity: 0.8, maxWidth: 400 }}>Click "Start Session" to begin real-time translation</p>
//           </div>
//         </div>
//       )}

//       {isInRoom && token && serverUrlState && (
//         <LiveKitRoom
//           audio
//           video={false}
//           token={token}
//           serverUrl={serverUrlState}
//           style={{ flex: 1, display: 'flex', flexDirection: 'column' , minHeight: 0}}
//           className="w-full h-full"
//           onDisconnected={handleStoppedByChild}
//         >
//           <StartAudio label="Click to enable audio" />
//           <TranscriptionListener setTranscriptions={setTranscriptions} />
//           {/* <ContentGrid transcriptions={transcriptions} />
//           <div role="toolbar" aria-label="Call controls" style={{ padding: '0 16px 16px' }}>
//             <div style={{ borderRadius: 12, background: 'rgba(0,0,0,0.2)', padding: 12, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16 }}>
//               <AudioConference />
//               <StopButton onStopped={handleStoppedByChild} />
//             </div>
//           </div> */}
//           <div style={{ flex: 1, minHeight: 0, overflow: 'auto', paddingBottom: 96 }}>
//             <ContentGrid transcriptions={transcriptions} />
//             </div>

//             <div role="toolbar" aria-label="Call controls" style={{ padding: '0 16px 16px', position: 'sticky', bottom: 0, zIndex: 20 }}>
//             <div style={{ borderRadius: 12, background: 'rgba(0,0,0,0.2)', padding: 12, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16 }}>
//                 <AudioConference />
//                 <StopButton onStopped={handleStoppedByChild} />
//             </div>
//             </div>

//         </LiveKitRoom>
//       )}
//     </div>
//   );
// }

// function StopButton({ onStopped }: { onStopped: () => void }) {
//   const room = useRoomContext();
//   const [stopping, setStopping] = useState(false);

//   const onStop = useCallback(async () => {
//     if (!room || stopping) return;
//     setStopping(true);
//     try {
//       await room.disconnect();
//     } catch (err) {
//       console.error('Error disconnecting:', err);
//     } finally {
//       setStopping(false);
//       onStopped();
//     }
//   }, [room, stopping, onStopped]);

//   return (
//     <button
//       type="button"
//       onClick={onStop}
//       disabled={stopping}
//       style={{
//         padding: '10px 16px',
//         borderRadius: 8,
//         border: '1px solid #ff4d4d',
//         background: '#ff4d4d',
//         color: 'white',
//         fontWeight: 500,
//         cursor: stopping ? 'not-allowed' : 'pointer',
//         transition: 'background-color 0.2s',
//       }}
//       aria-label="Stop"
//     >
//       {stopping ? 'Stopping…' : 'Stop Session'}
//     </button>
//   );
// }

// function ContentGrid({ transcriptions }: { transcriptions: { [id: string]: TranscriptionSegment } }) {
//   return (
//     <main
//       id="main"
//       role="main"
//       style={{
//         flex: 1,
//         display: 'grid',
//         gridTemplateColumns: '1fr 1fr',
//         gap: 24,
//         padding: 24,
//         overflowY: 'auto',
//         minHeight:0
//       }}
//     >
//       {/* English section */}
//       <section
//         aria-labelledby="source-heading"
//         style={{
//           display: 'flex',
//           flexDirection: 'column',
//           background: '#2c2c2e',
//           borderRadius: 12,
//           padding: 20,
//           overflow: 'hidden'
//         }}
//       >
//         <h2 id="source-heading" style={{ fontSize: 20, margin: 0, marginBottom: 16, fontWeight: 600, color: '#e0e0e0' }} lang="en">
//           Source Language (English)
//         </h2>
//         <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
//           {Object.values(transcriptions)
//             .sort((a, b) => a.firstReceivedTime - b.firstReceivedTime)
//             .map(segment => (
//               <li key={segment.id} style={{ marginBottom: '8px' }}>
//                 {segment.text}
//               </li>
//             ))}
//         </ul>
//       </section>

//       {/* Hindi section */}
//       <section
//         aria-labelledby="target-heading"
//         style={{
//           display: 'flex',
//           flexDirection: 'column',
//           background: '#2c2c2e',
//           borderRadius: 12,
//           padding: 20,
//           overflow: 'hidden'
//         }}
//       >
//         <h2 id="target-heading" style={{ fontSize: 20, margin: 0, marginBottom: 16, fontWeight: 600, color: '#e0e0e0' }} lang="hi">
//           Target Language (Hindi)
//         </h2>
//         <pre
//           style={{
//             flex: 1,
//             whiteSpace: 'pre-wrap',
//             wordBreak: 'break-word',
//             color: 'white',
//             lineHeight: 1.6,
//             fontFamily: 'monospace',
//             fontSize: 16,
//             background: '#1c1c1e',
//             padding: 16,
//             borderRadius: 8,
//             overflowY: 'auto'
//           }}
//           aria-label="Live Hindi translation"
//           lang="hi"
//         >
//           Awaiting translation…
//         </pre>
//       </section>
//     </main>
//   );
// }



'use client';

import { LiveKitRoom, AudioConference, useRoomContext, StartAudio } from '@livekit/components-react';
import { useCallback, useEffect, useState } from 'react';
import { RoomEvent, TranscriptionSegment } from 'livekit-client';

// Generates a random user ID for storage only (not sent to backend)
function generateRandomUserId() {
  return `user-${Math.floor(Math.random() * 100000)}`;
}

// ✅ Listens for transcriptions
function TranscriptionListener({ setTranscriptions }: { setTranscriptions: React.Dispatch<React.SetStateAction<{ [id: string]: TranscriptionSegment }>> }) {
  const room = useRoomContext();

  useEffect(() => {
    if (!room) return;

    const handleTranscription = (segments: TranscriptionSegment[]) => {
      setTranscriptions(prev => {
        const updated = { ...prev };
        segments.forEach(segment => {
          updated[segment.id] = segment;
        });
        return updated;
      });
    };

    room.on(RoomEvent.TranscriptionReceived, handleTranscription);
    return () => {
      room.off(RoomEvent.TranscriptionReceived, handleTranscription);
    };
  }, [room, setTranscriptions]);

  return null;
}

export default function AudioExamplePage() {
  const [mounted, setMounted] = useState(false);
  const [userIdentity, setUserIdentity] = useState<string>('');

  const endpoint = process.env.NEXT_PUBLIC_LK_TOKEN_ENDPOINT!;

  const [isStarting, setIsStarting] = useState(false);
  const [isInRoom, setIsInRoom] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [serverUrlState, setServerUrlState] = useState<string | null>(null);
  const [roomNameState, setRoomNameState] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [transcriptions, setTranscriptions] = useState<{ [id: string]: TranscriptionSegment }>({});

  // Mount logic and random ID persist
  useEffect(() => {
    setMounted(true);

    const stored = localStorage.getItem('lk-user-id');
    if (stored) {
      setUserIdentity(stored);
    } else {
      const uid = generateRandomUserId();
      localStorage.setItem('lk-user-id', uid);
      setUserIdentity(uid);
    }
  }, []);

  const handleStart = useCallback(async () => {
    if (!endpoint) return;
    setError(null);
    setIsStarting(true);
    try {
      const res = await fetch(endpoint, { method: 'GET', cache: 'no-store' });
      if (!res.ok) throw new Error(`Token fetch failed: ${res.status} ${res.statusText}`);
      const json = await res.json();

      const t = json?.participantToken ?? json?.token ?? json?.accessToken;
      const serverUrlFromApi = json?.serverUrl;
      const roomFromApi = json?.roomName;

      if (typeof t !== 'string') throw new Error('Token not found in response.');
      if (typeof serverUrlFromApi !== 'string') throw new Error('serverUrl not found in response.');
      if (typeof roomFromApi !== 'string') throw new Error('roomName not found in response.');

      setToken(t);
      setServerUrlState(serverUrlFromApi);
      setRoomNameState(roomFromApi);
      setIsInRoom(true);
    } catch (e: any) {
      setError(e.message || 'Failed to start.');
      setToken(null);
      setServerUrlState(null);
      setRoomNameState(null);
      setIsInRoom(false);
    } finally {
      setIsStarting(false);
    }
  }, [endpoint]);

  const handleStoppedByChild = useCallback(() => {
    setIsInRoom(false);
    setToken(null);
  }, []);

  if (!mounted || !userIdentity) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p role="status" aria-live="polite">Loading…</p>
      </div>
    );
  }

  return (
    <div
      data-lk-theme="default"
      style={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        background: '#1a1a1a',
        color: 'white',
      }}
    >
      <header style={{ padding: '12px 16px', borderBottom: '1px solid #333', display: 'flex', alignItems: 'center', gap: 12 }}>
        <h1 style={{ fontSize: 22, margin: 0, flex: 1, fontWeight: 600 }}>Real-Time Voice Translation</h1>
        {!isInRoom ? (
          <button
            type="button"
            onClick={handleStart}
            disabled={isStarting}
            style={{
              padding: '10px 16px',
              borderRadius: 8,
              border: 'none',
              background: '#007aff',
              color: 'white',
              fontWeight: 500,
              cursor: isStarting ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s',
            }}
            aria-label="Start"
          >
            {isStarting ? 'Starting…' : 'Start Session'}
          </button>
        ) : null}
      </header>

      {error && (
        <div role="alert" style={{ padding: '8px 16px', color: '#ff4d4d', background: '#442222' }}>
          {error}
        </div>
      )}

      {!isInRoom && (
        <div style={{ flex: 1, display: 'grid', placeItems: 'center', padding: 16, textAlign: 'center' }}>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 8 }}>Welcome</h2>
            <p style={{ opacity: 0.8, maxWidth: 400 }}>Click "Start Session" to begin real-time translation</p>
          </div>
        </div>
      )}

      {isInRoom && token && serverUrlState && (
        <LiveKitRoom
          audio
          video={false}
          token={token}
          serverUrl={serverUrlState}
          style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}
          className="w-full h-full"
          onDisconnected={handleStoppedByChild}
        >
          <StartAudio label="Click to enable audio" />
          <TranscriptionListener setTranscriptions={setTranscriptions} />

          {/* Scrollable wrapper with bottom padding for toolbar */}
          <div style={{ flex: 1, minHeight: 0, overflow: 'auto', paddingBottom: 96 }}>
            <ContentGrid transcriptions={transcriptions} />
          </div>

          {/* Sticky toolbar */}
          <div role="toolbar" aria-label="Call controls" style={{ padding: '0 16px 16px', position: 'sticky', bottom: 0, zIndex: 20 }}>
            <div style={{ borderRadius: 12, background: 'rgba(0,0,0,0.2)', padding: 12, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16 }}>
              <AudioConference />
              <StopButton onStopped={handleStoppedByChild} />
            </div>
          </div>
        </LiveKitRoom>
      )}
    </div>
  );
}

function StopButton({ onStopped }: { onStopped: () => void }) {
  const room = useRoomContext();
  const [stopping, setStopping] = useState(false);

  const onStop = useCallback(async () => {
    if (!room || stopping) return;
    setStopping(true);
    try {
      await room.disconnect();
    } catch (err) {
      console.error('Error disconnecting:', err);
    } finally {
      setStopping(false);
      onStopped();
    }
  }, [room, stopping, onStopped]);

  return (
    <button
      type="button"
      onClick={onStop}
      disabled={stopping}
      style={{
        padding: '10px 16px',
        borderRadius: 8,
        border: '1px solid #ff4d4d',
        background: '#ff4d4d',
        color: 'white',
        fontWeight: 500,
        cursor: stopping ? 'not-allowed' : 'pointer',
        transition: 'background-color 0.2s',
      }}
      aria-label="Stop"
    >
      {stopping ? 'Stopping…' : 'Stop Session'}
    </button>
  );
}

function ContentGrid({ transcriptions }: { transcriptions: { [id: string]: TranscriptionSegment } }) {
  return (
    <main
      id="main"
      role="main"
      style={{
        height: '100%',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 24,
        padding: 24,
        minHeight: 0
      }}
    >
      {/* English section */}
      <section
        aria-labelledby="source-heading"
        style={{
          display: 'flex',
          flexDirection: 'column',
          background: '#2c2c2e',
          borderRadius: 12,
          padding: 20,
          overflow: 'hidden',
          minHeight: 0
        }}
      >
        <h2 id="source-heading" style={{ fontSize: 20, margin: 0, marginBottom: 16, fontWeight: 600, color: '#e0e0e0' }} lang="en">
          Source Language (English)
        </h2>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, overflow: 'auto', minHeight: 0 }}>
          {Object.values(transcriptions)
            .sort((a, b) => a.firstReceivedTime - b.firstReceivedTime)
            .map(segment => (
              <li key={segment.id} style={{ marginBottom: '8px' }}>
                {segment.text}
              </li>
            ))}
        </ul>
      </section>

      {/* Hindi section */}
      <section
        aria-labelledby="target-heading"
        style={{
          display: 'flex',
          flexDirection: 'column',
          background: '#2c2c2e',
          borderRadius: 12,
          padding: 20,
          overflow: 'hidden',
          minHeight: 0
        }}
      >
        <h2 id="target-heading" style={{ fontSize: 20, margin: 0, marginBottom: 16, fontWeight: 600, color: '#e0e0e0' }} lang="hi">
          Target Language (Hindi)
        </h2>
        <pre
          style={{
            flex: 1,
            minHeight: 0,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            color: 'white',
            lineHeight: 1.6,
            fontFamily: 'monospace',
            fontSize: 16,
            background: '#1c1c1e',
            padding: 16,
            borderRadius: 8,
            overflowY: 'auto'
          }}
          aria-label="Live Hindi translation"
          lang="hi"
        >
          Awaiting translation…
        </pre>
      </section>
    </main>
  );
}
