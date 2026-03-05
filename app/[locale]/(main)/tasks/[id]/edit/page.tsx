import { EditTask } from '@/components/tasks/edit-task';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditTaskPage({ params }: Props) {
  const { id } = await params;

  return <EditTask taskId={id} />;
}
