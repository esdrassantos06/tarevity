import RegisterForm from "@/components/auth/RegisterForm";

export const metadata = {
  title: "Registrar | Tarevity",
  description: "Crie uma nova conta no Tarevity",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-backgroundLight dark:bg-backgroundDark">
      <RegisterForm />
    </div>
  );
}
