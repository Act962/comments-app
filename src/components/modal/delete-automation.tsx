import { Button } from "../ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

interface DeleteAutomationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: () => void;
}

export function DeleteAutomationModal({
  open,
  onOpenChange,
  onDelete,
}: DeleteAutomationModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Deletar Automação</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Tem certeza que deseja deletar esta automação?
        </DialogDescription>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button onClick={onDelete}>Deletar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
