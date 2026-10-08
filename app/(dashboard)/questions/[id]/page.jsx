// app/(dashboard)/questions/[id]/page.jsx
import { notFound } from 'next/navigation';
import EditQuestionSetPage from './EditQuestionSetPage';

export default async function Page({ params }) {
  // Handle both Next 14 (sync) and Next 15 (Promise)
  const resolved = await Promise.resolve(params);
  const id = resolved?.id;

  console.log('🔍 Route id:', id);

  if (!id || id === 'undefined') {
    notFound(); // shows 404 instead of hitting /sets/undefined
  }

  return <EditQuestionSetPage id={id} />;
}