"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useAuth } from "./AuthProvider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function AuthDialog() {
  const { isConnected } = useAccount();
  const { isAuthenticated, isAuthenticating, loginWithWallet } = useAuth();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (isConnected && !isAuthenticated) {
      setOpen(true);
    }
  }, [isConnected, isAuthenticated]);

  if (!isConnected || isAuthenticated) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Iniciar sesión</DialogTitle>
          <DialogDescription>
            Firma un mensaje con tu billetera para autenticarte.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-md border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={loginWithWallet}
            disabled={isAuthenticating}
            className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isAuthenticating ? "Firmando..." : "Firmar y continuar"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
