import { AuthShell } from "@/components/auth/Shell";
import { ForgotPasswordForm } from "@/components/auth/ForgotPassword";

export default function ForgotPasswordPage() {
  return (
    <AuthShell>
      <ForgotPasswordForm />
    </AuthShell>
  );
}