// import { NextResponse } from 'next/server';

// export async function POST(req: Request) {
//   const { searchParams } = new URL(req.url);
//   const roomName = searchParams.get('roomName');

//   if (!roomName) {
//     return NextResponse.json({ error: 'roomName required' }, { status: 400 });
//   }

//   const url = process.env.LIVEKIT_URL;
//   const key = process.env.LIVEKIT_API_KEY;
//   const secret = process.env.LIVEKIT_API_SECRET;

//   if (!url || !key || !secret) {
//     return NextResponse.json(
//       { error: 'LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET must be set on the server' },
//       { status: 500 }
//     );
//   }

//   try {
//     const res = await fetch(`${url}/twirp/livekit.RoomService/DeleteRoom`, {
//       method: 'POST',
//       headers: {
//         'content-type': 'application/json',
//         authorization: 'Basic ' + Buffer.from(`${key}:${secret}`).toString('base64'),
//       },
//       body: JSON.stringify({ room: roomName }),
//     });

//     if (!res.ok) {
//       const text = await res.text();
//       return NextResponse.json(
//         { error: `DeleteRoom failed: ${res.status} ${text}` },
//         { status: 500 }
//       );
//     }

//     return NextResponse.json({ ok: true });
//   } catch (e: any) {
//     return NextResponse.json(
//       { error: e?.message || 'DeleteRoom error' },
//       { status: 500 }
//     );
//   }
// }


export async function POST() {
    return new Response("This endpoint is now handled by backend", { status: 410 });
  }