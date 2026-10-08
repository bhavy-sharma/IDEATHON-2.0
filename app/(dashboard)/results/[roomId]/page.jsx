// app/(dashboard)/results/[roomId]/page.jsx
export const instant = false;

import ResultsContent from './ResultsContent';

export default async function Page({ params }) {
  const { roomId } = await params;   // Next 15/16
  return <ResultsContent roomId={roomId} />;
}