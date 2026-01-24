import { BellIcon, SearchIcon } from "lucide-react";
import { InputGroup, InputGroupAddon, InputGroupInput } from "./ui/input-group";
import { SidebarTrigger } from "./ui/sidebar";

export const AppHeader = () => {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between px-4 gap-2 bg-background">
      <SidebarTrigger />
      <InputGroup className="w-fit">
        <InputGroupAddon>
          <SearchIcon />
        </InputGroupAddon>
        <InputGroupInput placeholder="Pesquisar..." />
      </InputGroup>
      <BellIcon />
    </header>
  );
};
