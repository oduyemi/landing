import { AuthShell } from "@/components/auth/Shell";
import { ResetPasswordForm } from "@/components/auth/ResetPassword";


export default function ResetPassword() {
  return (
    <AuthShell>
      <ResetPasswordForm />
    </AuthShell>
  );
}