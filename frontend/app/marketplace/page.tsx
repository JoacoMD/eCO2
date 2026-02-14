"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BaseError,
  useAccount,
  useReadContract,
  useWriteContract,
} from "wagmi";
import { formatEther } from "viem";
import { eco2ContractConfig } from "@/contracts";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import Image from "next/image";

type Listing = {
  seller: `0x${string}`;
  tokenId: bigint;
  amount: bigint;
  pricePerToken: bigint;
  active: boolean;
};

type ListingWithId = Listing & { listingId: bigint };

type TokenInfo = {
  id: number;
  name: string;
  description: string;
  image: string;
  projectId: number;
};

import { BACKEND_URL } from "@/lib/config";

export default function MarketplacePage() {
  const { isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const [buyingListingId, setBuyingListingId] = useState<string | null>(null);
  const [selectedListing, setSelectedListing] = useState<ListingWithId | null>(
    null,
  );
  const [quantity, setQuantity] = useState<string>("1");
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data, isLoading, error, refetch } = useReadContract({
    ...eco2ContractConfig,
    functionName: "getListings",
  });

  useEffect(() => {
    if (error) {
      toast.error(`${error.shortMessage}`);
      console.error(error);
      console.log(data);
    }
  }, [error]);

  const listings = useMemo(() => {
    const raw = (data ?? []) as Listing[];
    return raw
      .map((listing, index) => ({
        ...listing,
        listingId: BigInt(index),
      }))
      .filter((listing) => listing.active) as ListingWithId[];
  }, [data]);

  const [tokenInfoById, setTokenInfoById] = useState<Record<string, TokenInfo>>(
    {},
  );
  const [loadingTokens, setLoadingTokens] = useState(false);

  useEffect(() => {
    const loadTokenInfo = async () => {
      if (!listings.length) {
        setTokenInfoById({});
        return;
      }

      const uniqueTokenIds = Array.from(
        new Set(listings.map((listing) => listing.tokenId.toString())),
      );

      setLoadingTokens(true);
      try {
        const results = await Promise.all(
          uniqueTokenIds.map(async (tokenId) => {
            const response = await fetch(`${BACKEND_URL}/tokens/${tokenId}`);
            if (!response.ok) {
                throw new Error(`Error al cargar token ${tokenId}`);
            }
            const tokenInfo = (await response.json()) as TokenInfo;
            return [tokenId, tokenInfo] as const;
          }),
        );

        const nextMap: Record<string, TokenInfo> = {};
        for (const [tokenId, tokenInfo] of results) {
          nextMap[tokenId] = tokenInfo;
        }
        setTokenInfoById(nextMap);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingTokens(false);
      }
    };

    void loadTokenInfo();
  }, [listings]);

  const handleBuy = async (listing: ListingWithId, amount: bigint) => {
    try {
      setBuyingListingId(listing.listingId.toString());
      await writeContractAsync({
        ...eco2ContractConfig,
        functionName: "buyTokens",
        args: [listing.listingId, amount],
        value: listing.pricePerToken * amount,
      });
      await refetch();
    } catch (err) {
      console.error(err);
      toast.error("Error al comprar tokens.");
    } finally {
      setBuyingListingId(null);
    }
  };

  const openBuyDialog = (listing: ListingWithId) => {
    setSelectedListing(listing);
    setQuantity("1");
    setDialogOpen(true);
  };

  const closeBuyDialog = () => {
    setDialogOpen(false);
    setSelectedListing(null);
  };

  const parsedQuantity = (() => {
    const value = Number(quantity);
    if (!Number.isFinite(value) || value <= 0) {
      return null;
    }
    return BigInt(Math.floor(value));
  })();

  const quantityError = selectedListing
    ? parsedQuantity === null
      ? "Ingresa una cantidad válida."
      : parsedQuantity > selectedListing.amount
        ? "Cantidad mayor al stock disponible."
        : null
    : null;

  const totalPrice =
    selectedListing && parsedQuantity
      ? selectedListing.pricePerToken * parsedQuantity
      : null;

  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-16 text-zinc-900 dark:bg-black dark:text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
        <section className="rounded-3xl bg-white p-10 shadow-sm ring-1 ring-zinc-100 dark:bg-zinc-950 dark:ring-zinc-800">
          <div className="flex flex-col gap-4">
            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
              Marketplace de NFTs
            </p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Compra créditos de carbono verificados
            </h1>
            <p className="text-base text-zinc-600 dark:text-zinc-300">
              Explora listados activos, revisa la información del proyecto y
              adquiere créditos con trazabilidad completa.
            </p>
          </div>
        </section>

        <section className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Listados activos</h2>
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              {listings.length} disponibles
            </span>
          </div>

          {isLoading ? (
            <div className="rounded-2xl border border-dashed border-zinc-200 bg-white p-10 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
              Cargando listados...
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-white p-10 text-center text-sm text-red-500 dark:border-red-900 dark:bg-zinc-950">
              No se pudieron cargar los listados.
            </div>
          ) : listings.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-200 bg-white p-10 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
              No hay NFTs disponibles en este momento.
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {listings.map((listing, index) => {
                const tokenId = listing.tokenId.toString();
                const tokenInfo = tokenInfoById[tokenId];
                const isBuying =
                  buyingListingId === listing.listingId.toString();
                return (
                  <article
                    key={`${listing.seller}-${tokenId}-${index}`}
                    className="flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-zinc-100 dark:bg-zinc-950 dark:ring-zinc-800"
                  >
                    <div className="aspect-video w-full bg-zinc-100 dark:bg-zinc-900">
                      {tokenInfo?.image ? (
                        <Image
                          src={tokenInfo.image}
                          alt={tokenInfo.name}
                          width={200}
                          height={200}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-zinc-400">
                          Imagen no disponible
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col gap-4 p-5">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-emerald-600 dark:text-emerald-300">
                          Token #{tokenId}
                        </p>
                        <h3 className="mt-1 text-lg font-semibold">
                          {tokenInfo?.name ?? "Cargando nombre..."}
                        </h3>
                        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                          {tokenInfo?.description ??
                            "Cargando descripción del proyecto."}
                        </p>
                      </div>

                      <div className="grid gap-3 rounded-xl bg-zinc-50 p-4 text-sm text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300">
                        <div className="flex items-center justify-between">
                          <span>Precio por token</span>
                          <span className="font-semibold text-zinc-900 dark:text-white">
                            {formatEther(listing.pricePerToken)} ETH
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Cantidad disponible</span>
                          <span className="font-semibold text-zinc-900 dark:text-white">
                            {listing.amount.toString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Proyecto</span>
                          <span className="font-semibold text-zinc-900 dark:text-white">
                            {tokenInfo?.projectId ?? "-"}
                          </span>
                        </div>
                      </div>

                      <div className="mt-auto text-xs text-zinc-500 dark:text-zinc-400">
                        Vendedor: {listing.seller.slice(0, 6)}...
                        {listing.seller.slice(-4)}
                      </div>
                      <button
                        type="button"
                        disabled={!isConnected || isBuying}
                        onClick={() => openBuyDialog(listing)}
                        className="mt-4 inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isBuying ? "Comprando..." : "Comprar"}
                      </button>
                      {!isConnected ? (
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          Conecta tu wallet para comprar.
                        </p>
                      ) : null}
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {loadingTokens && listings.length > 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Cargando detalles de los tokens...
            </p>
          ) : null}
        </section>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar compra</DialogTitle>
            <DialogDescription>
              Define la cantidad de tokens que deseas comprar.
            </DialogDescription>
          </DialogHeader>

          {selectedListing ? (
            <div className="space-y-4">
              <div className="rounded-lg bg-zinc-50 p-4 text-sm text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300">
                <div className="flex items-center justify-between">
                  <span>Token</span>
                  <span className="font-semibold text-zinc-900 dark:text-white">
                    #{selectedListing.tokenId.toString()}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span>Precio por token</span>
                  <span className="font-semibold text-zinc-900 dark:text-white">
                    {formatEther(selectedListing.pricePerToken)} ETH
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span>Stock disponible</span>
                  <span className="font-semibold text-zinc-900 dark:text-white">
                    {selectedListing.amount.toString()}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="quantity"
                  className="text-sm font-medium text-zinc-700 dark:text-zinc-200"
                >
                  Cantidad
                </label>
                <input
                  id="quantity"
                  type="number"
                  min={1}
                  max={Number(selectedListing.amount)}
                  value={quantity}
                  onChange={(event) => setQuantity(event.target.value)}
                  className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                />
                {quantityError ? (
                  <p className="text-xs text-red-500">{quantityError}</p>
                ) : null}
              </div>

              <div className="flex items-center justify-between text-sm text-zinc-600 dark:text-zinc-300">
                <span>Total estimado</span>
                <span className="font-semibold text-zinc-900 dark:text-white">
                  {totalPrice ? `${formatEther(totalPrice)} ETH` : "-"}
                </span>
              </div>
            </div>
          ) : null}

          <DialogFooter>
            <button
              type="button"
              onClick={closeBuyDialog}
              className="rounded-md border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-900"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={
                !selectedListing ||
                !parsedQuantity ||
                !!quantityError ||
                !isConnected ||
                (selectedListing &&
                  buyingListingId === selectedListing.listingId.toString())
              }
              onClick={async () => {
                if (!selectedListing || !parsedQuantity) {
                  return;
                }
                await handleBuy(selectedListing, parsedQuantity);
                closeBuyDialog();
              }}
              className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Confirmar compra
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
