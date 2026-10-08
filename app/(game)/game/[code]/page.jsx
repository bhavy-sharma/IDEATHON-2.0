// app/(game)/game/[code]/page.jsx
import GameRoomPage from './GameRoomPage';
export const instant = false;
export default async function Page({ params }) {
  const { code } = await params;
  return <GameRoomPage code={code} />;
}