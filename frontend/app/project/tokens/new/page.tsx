"use client";

import { useEffect, useMemo, useState } from "react";
import { useReadContract, useWalletClient } from "wagmi";
import { eco2ContractConfig } from "@/contracts";
import { toast } from "sonner";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";

type TokenOption = {
  tokenId: bigint;
  amount: bigint;
};

export default function CompleteTokenPage() {
  const { data: wallet } = useWalletClient();
  const { data: balanceData } = useReadContract({
    ...eco2ContractConfig,
    functionName: "getBalanceOfAllTokens",
    args: [
      wallet?.account.address ||
        "0x0000000000000000000000000000000000000000",
    ],
    query: { enabled: !!wallet?.account.address },
  });

  const [tokenId, setTokenId] = useState<string>("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const tokenOptions = useMemo(() => {
    if (!balanceData) {
      return [] as TokenOption[];
    }
    const tokenIds = balanceData[0] as bigint[];
    const balances = balanceData[1] as bigint[];
    return tokenIds
      .map((id, index) => ({ tokenId: id, amount: balances[index] }))
      .filter((token) => token.amount > BigInt(0));
  }, [balanceData]);

  useEffect(() => {
    if (!tokenId && tokenOptions.length > 0) {
      setTokenId(tokenOptions[0].tokenId.toString());
    }
  }, [tokenId, tokenOptions]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!tokenId) {
      toast.error("Selecciona un token.");
      return;
    }
    if (!name.trim() || !description.trim() || !image.trim()) {
      toast.error("Completa todos los campos.");
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch(`${BACKEND_URL}/tokens`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: Number(tokenId),
          name: name.trim(),
          description: description.trim(),
          image: image.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("No se pudo guardar la información del token.");
      }

      toast.success("Token actualizado correctamente.");
      setName("");
      setDescription("");
      setImage("");
    } catch (error) {
      console.error(error);
      toast.error("Error al guardar la información del token.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-16 text-zinc-900">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
        <header className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-100">
          <h1 className="text-2xl font-semibold">Completar información del token</h1>
          <p className="mt-2 text-sm text-zinc-600">
            Selecciona un token y agrega el nombre, descripción e imagen para
            completar su metadata.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-100"
        >
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700">
              Token ID
            </label>
            <select
              className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm"
              value={tokenId}
              onChange={(event) => setTokenId(event.target.value)}
            >
              {tokenOptions.length === 0 ? (
                <option value="">Sin tokens disponibles</option>
              ) : (
                tokenOptions.map((token) => (
                  <option
                    key={token.tokenId.toString()}
                    value={token.tokenId.toString()}
                  >
                    Token #{token.tokenId.toString()} - {token.amount.toString()}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700">Nombre</label>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm"
              placeholder="Ej. Token Reforestación"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700">
              Descripción
            </label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={4}
              className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm"
              placeholder="Describe el proyecto y el impacto del token..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700">Imagen</label>
            <input
              type="text"
              value={image}
              onChange={(event) => setImage(event.target.value)}
              className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm"
              placeholder="URL de la imagen"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || tokenOptions.length === 0}
            className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Guardando..." : "Guardar información"}
          </button>
        </form>
      </div>
    </div>
  );
}
