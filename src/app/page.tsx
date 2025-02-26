import { getServerSession } from "next-auth";

export default async function Home() {
  const session = await getServerSession();

  return (
    <div className="flex text-4xl items-center justify-center w-full h-[50vh]">
      getServerSession Result
      {session?.user?.name ? (
        <div>{session?.user?.name}</div>
      ):
      (
        <div>Not logged in</div>
      )
      }
    </div>
  );
}
