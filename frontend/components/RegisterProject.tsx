"use client";

import { useEffect, useState } from "react";
import NewProjectForm from "./NewProjectForm";
import CompleteProjectForm from "./CompleteProjectForm";
import { useConnectorClient, useReadContract } from "wagmi";
import { eco2ContractConfig } from "@/contracts";
import MessageConnectWallet from "./project/MessageConnectWallet";

export default function RegisterProject() {
  const { data: walletClient } = useConnectorClient();
  const [successRegister, setSuccessRegister] = useState(false);
  const { data, isLoading } = useReadContract({
    ...eco2ContractConfig,
    functionName: "getProject",
    args: [
      walletClient?.account.address ||
        "0x0000000000000000000000000000000000000000",
    ],
    query: { enabled: !!walletClient?.account.address },
  });

  const handleSuccess = () => {
    setSuccessRegister(true);
  };

  useEffect(() => {
    if (data && data.name && data.name.length > 0) {
      setSuccessRegister(true);
      console.log("Project already registered:", data);
    }
  }, [data]);

  return isLoading ? (
    <div>Loading...</div>
  ) : walletClient ? (
    <>
      {successRegister ? (
        <CompleteProjectForm />
      ) : (
        <NewProjectForm onSuccess={handleSuccess} />
      )}
    </>
  ) : (
    <MessageConnectWallet />
  );
}
