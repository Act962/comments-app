import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { NovaEmpresaForm } from "@/features/organization/components/nova-empresa-form";

export default function NovaEmpresaPage() {
  return (
    <div className="flex min-h-svh items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Nova empresa</CardTitle>
          <CardDescription>
            Crie uma empresa para agrupar automações, integrações e cobrança.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NovaEmpresaForm />
        </CardContent>
      </Card>
    </div>
  );
}
