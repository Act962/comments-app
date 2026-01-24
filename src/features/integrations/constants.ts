import { InstagramIcon, RocketIcon } from "lucide-react";
import { type LucideIcon } from "lucide-react";

export type IntegrationCardProps = {
  title: string;
  description: string;
  icon: LucideIcon;
  strategy: "INSTAGRAM" | "NASA CRM";
};

export const INTEGRATIONS: IntegrationCardProps[] = [
  {
    title: "Conectar Instagram",
    description: "Conecte sua conta do Instagram",
    icon: InstagramIcon,
    strategy: "INSTAGRAM",
  },
  {
    title: "Conectar NASA CRM",
    description: "Conecte sua conta do NASA CRM",
    icon: RocketIcon,
    strategy: "NASA CRM",
  },
];
