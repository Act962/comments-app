import { Suspense } from "react";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";

export default function ResetPassword() {
  // `useSearchParams` exige um Suspense boundary no App Router pra evitar
  // que o build force render dinâmico desta página.
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
