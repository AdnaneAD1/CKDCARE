import dynamic from 'next/dynamic';

const WorkflowPageClient = dynamic(() => import('./WorkflowPageClient'), {
  ssr: false,
});

export default function WorkflowsPage() {
  return <WorkflowPageClient />;
}