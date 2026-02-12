"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "./ui/navigation-menu";
import { useAccount, useReadContract, useWalletClient } from "wagmi";
import { eco2ContractConfig } from "@/contracts";
import AuthDialog from "@/components/auth/AuthDialog";
import { useAuth } from "@/components/auth/AuthProvider";

export default function Navbar() {
  const { isConnected } = useAccount();
  const { data: wallet } = useWalletClient();
  const { isAuthenticated, isAuthenticating, loginWithWallet, logout, user } = useAuth();
  const { data: isAdmin } = useReadContract({
    ...eco2ContractConfig,
    functionName: "isAdmin",
    args: [
      wallet?.account.address || "0x0000000000000000000000000000000000000000",
    ],
    query: { enabled: !!wallet?.account.address },
  });

  return (
    <nav className="w-full h-16 bg-white shadow-md flex items-center px-8 gap-4">
      <Link href="/">
        <div className="rounded-md bg-emerald-700 py-1 px-2">
          <p className="font-bold text-xl text-white">eCO2</p>
        </div>
      </Link>
      <NavigationMenu>
        <NavigationMenuList>
          {isAdmin ? (
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link href="/admin/dashboard">Admin Dashboard</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          ) : (
            <></>
          )}
          <NavigationMenuItem>
            <NavigationMenuTrigger>Projects</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="w-36">
                <NavigationMenuLink asChild>
                  <Link href="/project/dashboard">Dashboard</Link>
                </NavigationMenuLink>
                <NavigationMenuLink asChild>
                  <Link href="/project/new">New Project</Link>
                </NavigationMenuLink>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Companies</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="w-36">
                <NavigationMenuLink asChild>
                  <Link href="/companies/dashboard">Dashboard</Link>
                </NavigationMenuLink>
                <NavigationMenuLink asChild>
                  <Link href="/companies/new">New Company</Link>
                </NavigationMenuLink>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <Link href="/marketplace">Marketplace</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
      <div className="right ml-auto flex items-center gap-3">
        {isConnected && !isAuthenticated ? (
          <button
            type="button"
            onClick={loginWithWallet}
            disabled={isAuthenticating}
            className="rounded-md border border-emerald-600 px-3 py-1 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isAuthenticating ? "Firmando..." : "Iniciar sesión"}
          </button>
        ) : null}
        {isAuthenticated ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500">
              Sesión activa{user?.role ? ` · ${String(user.role)}` : ""}
            </span>
            <button
              type="button"
              onClick={logout}
              className="rounded-md border border-zinc-200 px-2 py-1 text-xs font-semibold text-zinc-600 transition hover:bg-zinc-100"
            >
              Cerrar sesión
            </button>
          </div>
        ) : null}
        <ConnectButton />
      </div>
      <AuthDialog />
    </nav>
  );
}
