import { BellIcon, SearchIcon } from "lucide-react";
import { InputGroup, InputGroupAddon, InputGroupInput } from "./ui/input-group";
import { SidebarTrigger } from "./ui/sidebar";
import Link from "next/link";

export const AppHeader = () => {
  return (
    <header className="sticky top-0 z-50 flex h-14 shrink-0 items-center justify-between px-4 gap-2 bg-background">
      <SidebarTrigger />
      <InputGroup className="w-fit">
        <InputGroupAddon>
          <SearchIcon />
        </InputGroupAddon>
        <InputGroupInput placeholder="Pesquisar..." />
      </InputGroup>
      <Link href="/settings?tab=notifications">
        <BellIcon />
      </Link>
    </header>
  );
};
