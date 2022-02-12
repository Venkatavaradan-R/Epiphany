import React, { useEffect, useContext, createContext, useState } from "react";

import { TezosToolkit, MichelCodecPacker } from "@taquito/taquito";
import { BeaconWallet } from "@taquito/beacon-wallet";
import { NetworkType } from "@airgap/beacon-sdk";

export const TezosContext = createContext();

export const useTezos = () => {
  return useContext(TezosContext);
};

export const TezosProvider = ({ children }) => {
  let [Tezos, setTezos] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [walletLoading, setWalletLoading] = useState(true);
  const [userAddress, setUserAddress] = useState(null);

  const walletOptions = {
    name: "Illic et Numquam",
    preferredNetwork: NetworkType.GRANADANET,
  };

  const rpcUrl = "https://hangzhounet.api.tez.ie";
  const contractAddress = "KT1CPRvPjGsq1Fkt8bKvxeubhoFnEBeNjW3F";

  const connect = async () => {
    let tmpwallet;
    if (!wallet) {
      tmpwallet = new BeaconWallet(walletOptions);

      setWallet(tmpwallet);
    } else {
      tmpwallet = wallet;
    }

    try {
      await tmpwallet.requestPermissions({
        network: {
          type: NetworkType.HANGZHOUNET,
          rpcUrl,
        },
      });
      console.log("1");
      let userAddress_temp = await tmpwallet.getPKH();
      console.log("2");
      setUserAddress(userAddress_temp);
      Tezos.setWalletProvider(wallet);
      console.log("3");
      console.log(userAddress, "after");
    } catch (err) {
      console.error(err);
    }
  };

  const disconnect = () => {
    console.log("Called");
    wallet.client.destroy();
    setWallet(undefined);
    setUserAddress("");
  };

  useEffect(() => {
    let Tezos = new TezosToolkit(rpcUrl);
    setTezos(Tezos);
    Tezos.setPackerProvider(new MichelCodecPacker());
    let wallet = new BeaconWallet(walletOptions);
    setWallet(wallet);
    wallet.client
      .getActiveAccount()
      .then(async () => {
        let userAddress_temp = await wallet.getPKH();
        console.log(userAddress_temp, "userAddress_temp");
        setUserAddress(userAddress_temp);
        Tezos.setWalletProvider(wallet);
        console.log(userAddress_temp);
        setWalletLoading(false);
      })
      .catch(async (err) => {
        console.log(err);
        setWalletLoading(false);
      });
  }, []);

  return (
    <TezosContext.Provider
      value={{
        Tezos,
        wallet,
        walletLoading,
        connect,
        disconnect,
        userAddress,
        setUserAddress,
        rpcUrl,
        contractAddress,
      }}
    >
      {walletLoading ? <p>Loading...</p> : children}
    </TezosContext.Provider>
  );
};
