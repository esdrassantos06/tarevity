import { EditTask } from '@/components/tasks/edit-task';
import Header from '@/components/header';
import Footer from '@/components/footer';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditTaskPage({ params }: Props) {
  const { id } = await params;

  return (
    <>
      <Header />
      <EditTask taskId={id} />
      <Footer />
    </>
  );
}
