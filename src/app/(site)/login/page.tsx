import { AuthShell } from "@/components/auth/Shell";
import { LoginForm } from "@/components/auth/Login";


export default function Login() {
  return (
    <AuthShell>
      <LoginForm />
    </AuthShell>
  );
}