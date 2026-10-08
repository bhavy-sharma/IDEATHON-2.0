// app/(dashboard)/room/[id]/results/page.jsx
export const instant = false;

import ResultsContent from './ResultsContent';

export default async function Page({ params }) {
  const { id } = await params;
  return <ResultsContent id={id} />;
}