
// // accepts both styles and returns token
// import { NextRequest, NextResponse } from 'next/server';
// import { AccessToken } from 'livekit-server-sdk';
// import type { AccessTokenOptions, VideoGrant } from 'livekit-server-sdk';

// const apiKey = process.env.LK_API_KEY!;
// const apiSecret = process.env.LK_API_SECRET!;

// const createToken = async (userInfo: AccessTokenOptions, grant: VideoGrant) => {
//   const at = new AccessToken(apiKey, apiSecret, userInfo);
//   at.addGrant(grant);
//   return await at.toJwt();
// };

// export async function GET(req: NextRequest) {
//   try {
//     const { searchParams } = new URL(req.url);

//     // Support both patterns:
//     // - room/username (common from tutorials)
//     // - roomName/identity/name/metadata (your current frontend)
//     const room = searchParams.get('room') ?? searchParams.get('roomName') ?? undefined;
//     const username = searchParams.get('username') ?? searchParams.get('identity') ?? undefined;
//     const name = searchParams.get('name') ?? undefined;
//     const metadata = searchParams.get('metadata') ?? undefined;

//     if (!room) throw Error('Missing room/roomName');
//     if (!username) throw Error('Missing username/identity');

//     const grant: VideoGrant = {
//       room,
//       roomJoin: true,
//       canPublish: true,
//       canPublishData: true,
//       canSubscribe: true,
//       canUpdateOwnMetadata: true,
//     };

//     const token = await createToken({ identity: username, name: name ?? undefined, metadata: metadata ?? undefined }, grant);

//     // Return a standard token payload
//     return NextResponse.json({ token });
//   } catch (e: any) {
//     return new NextResponse(e.message ?? 'Error generating token', { status: 500 });
//   }
// }




// first token approach
// import { NextRequest, NextResponse } from 'next/server';
// import { AccessToken } from 'livekit-server-sdk';
// import type { AccessTokenOptions, VideoGrant } from 'livekit-server-sdk';

// const apiKey = process.env.LIVEKIT_KEY!;
// const apiSecret = process.env.LIVEKIT_API_SECRET!;

// const createToken = async (userInfo: AccessTokenOptions, grant: VideoGrant) => {
//   const at = new AccessToken(apiKey, apiSecret, userInfo);
//   at.addGrant(grant);
//   return await at.toJwt();
// };

// export async function GET(req: NextRequest) {
//   try {
//     const { searchParams } = new URL(req.url);

//     // We’re supporting both patterns here:
//     // - room/username (common from tutorials)
//     // - roomName/identity/name/metadata (your current frontend)
//     const room = searchParams.get('room') ?? searchParams.get('roomName') ?? undefined;
//     const username = searchParams.get('username') ?? searchParams.get('identity') ?? undefined;
//     const name = searchParams.get('name') ?? undefined;
//     const metadata = searchParams.get('metadata') ?? undefined;

//     if (!room) throw Error('Missing room/roomName');
//     if (!username) throw Error('Missing username/identity');

//     const grant: VideoGrant = {
//       room,
//       roomJoin: true,
//       canPublish: true,
//       canPublishData: true,
//       canSubscribe: true,
//       canUpdateOwnMetadata: true,
//     };

//     const token = await createToken({ identity: username, name: name ?? undefined, metadata: metadata ?? undefined }, grant);

//     // Here’s your token, ready to go!
//     return NextResponse.json({ token });
//   } catch (e: any) {
//     return new NextResponse(e.message ?? 'Error generating token', { status: 500 });
//   }
// }


// second token approach
import { NextResponse } from 'next/server';
import { AccessToken, type AccessTokenOptions, type VideoGrant } from 'livekit-server-sdk';

// NOTE: you are expected to define the following environment variables in `.env.local`:
const API_KEY = process.env.LIVEKIT_API_KEY;
const API_SECRET = process.env.LIVEKIT_API_SECRET;
const LIVEKIT_URL = process.env.LIVEKIT_URL;

// don't cache the results
export const revalidate = 0;

export type ConnectionDetails = {
  serverUrl: string;
  roomName: string;
  participantName: string;
  participantToken: string;
};

export async function GET() {
  try {
    if (LIVEKIT_URL === undefined) {
      throw new Error('LIVEKIT_URL is not defined');
    }
    if (API_KEY === undefined) {
      throw new Error('LIVEKIT_API_KEY is not defined');
    }
    if (API_SECRET === undefined) {
      throw new Error('LIVEKIT_API_SECRET is not defined');
    }

    // Generate participant token
    const participantName = 'user';
    const participantIdentity = `voice_assistant_user_${Math.floor(Math.random() * 10_000)}`;
    const roomName = `voice_assistant_room_${Math.floor(Math.random() * 10_000)}`;
    const participantToken = await createParticipantToken(
      { identity: participantIdentity, name: participantName },
      roomName
    );

    // Return connection details
    const data: ConnectionDetails = {
      serverUrl: LIVEKIT_URL,
      roomName,
      participantToken: participantToken,
      participantName,
    };
    const headers = new Headers({
      'Cache-Control': 'no-store',
    });
    return NextResponse.json(data, { headers });
  } catch (error) {
    if (error instanceof Error) {
      console.error(error);
      return new NextResponse(error.message, { status: 500 });
    }
  }
}

function createParticipantToken(userInfo: AccessTokenOptions, roomName: string) {
  const at = new AccessToken(API_KEY, API_SECRET, {
    ...userInfo,
    ttl: '15m',
  });
  const grant: VideoGrant = {
    room: roomName,
    roomJoin: true,
    canPublish: true,
    canPublishData: true,
    canSubscribe: true,
  };
  at.addGrant(grant);
  return at.toJwt();
}
