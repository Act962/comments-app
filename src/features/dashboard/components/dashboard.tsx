"use client";

import { EntityContainer, EntityHeader } from "@/components/entity-components";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import {
  MessageSquareIcon,
  BotIcon,
  ZapIcon,
  TrendingUpIcon,
  ArrowRightIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { getDashboardStats } from "@/actions/dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const chartConfig = {
  dms: {
    label: "DMs Enviadas",
    color: "hsl(var(--primary))",
  },
  comments: {
    label: "Comentários Respondidos",
    color: "hsl(var(--secondary))",
  },
} satisfies ChartConfig;

export const DashboardHeader = () => {
  return (
    <EntityHeader
      title="Dashboard"
      description="Visão geral do desempenho de suas automações"
    />
  );
};

export const DashboardContainer = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <EntityContainer header={<DashboardHeader />}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <Skeleton className="lg:col-span-2 h-[400px] w-full rounded-2xl" />
          <Skeleton className="h-[400px] w-full rounded-2xl" />
        </div>
      </EntityContainer>
    );
  }

  const statCards = [
    {
      title: "Automacões Totais",
      value: stats?.totalAutomations || 0,
      icon: <BotIcon className="size-5" />,
      description: "Total de automações criadas",
    },
    {
      title: "Automacões Ativas",
      value: stats?.activeAutomations || 0,
      icon: <ZapIcon className="size-5 text-yellow-500" />,
      description: "Rodando atualmente",
    },
    {
      title: "DMs Enviadas",
      value: stats?.totalDMs || 0,
      icon: <MessageSquareIcon className="size-5 text-blue-500" />,
      description: "Respostas via direct",
    },
    {
      title: "Comentários",
      value: stats?.totalComments || 0,
      icon: <TrendingUpIcon className="size-5 text-green-500" />,
      description: "Respostas em posts",
    },
  ];

  return (
    <EntityContainer header={<DashboardHeader />}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <Card key={i} size="sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              {card.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Atividade Semanal</CardTitle>
            <CardDescription>
              Interações automáticas nos últimos 7 dias
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart data={stats?.chartData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}`}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="dms"
                  fill="var(--color-dms)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="comments"
                  fill="var(--color-comments)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>

            <div className="grid grid-cols-2 gap-4 mt-10 pt-6 border-t">
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">
                  Respostas por IA
                </span>
                <span className="text-xl font-bold">
                  {stats?.aiResponses || 0}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">
                  Respostas Padrão
                </span>
                <span className="text-xl font-bold">
                  {stats?.standardResponses || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
            <CardDescription>Últimas interações enviadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {stats?.recentActivity?.length > 0 ? (
                stats.recentActivity.map((activity: any, i: number) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <MessageSquareIcon className="size-4 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        DM enviada
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {activity.message}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(activity.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <p className="text-sm text-muted-foreground">
                    Nenhuma atividade recente encontrada.
                  </p>
                  <Button variant="link" asChild className="mt-2">
                    <Link href="/workflows">Criar automação</Link>
                  </Button>
                </div>
              )}
            </div>
            {stats?.recentActivity?.length > 0 && (
              <Button variant="ghost" className="w-full mt-6 text-xs" asChild>
                <Link href="/workflows">
                  Ver todas automações{" "}
                  <ArrowRightIcon className="ml-2 size-3" />
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </EntityContainer>
  );
};
