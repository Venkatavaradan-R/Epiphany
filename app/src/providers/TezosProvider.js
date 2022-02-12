import React, { useEffect, useContext, createContext, useState } from "react";

import { TezosToolkit, MichelCodecPacker } from "@taquito/taquito";
import { TezBridgeSigner } from "@taquito/tezbridge-signer";
import { char2Bytes, bytes2Char } from "@taquito/utils";
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
  let [nftStorage, setNftStorage] = useState(null);
  let [userNfts, setUserNfts] = useState([]);
  console.log(userAddress);
  const walletOptions = {
    name: "Illic et Numquam",
    preferredNetwork: NetworkType.HANGZHOUNET,
  };

  const rpcUrl = "https://hangzhounet.api.tez.ie";
  const serverUrl = "http://localhost:8080";
  const contractAddress = "KT1CPRvPjGsq1Fkt8bKvxeubhoFnEBeNjW3F";

  const getUserNfts = async (address, Tezostmp) => {
    // finds user's NFTs
    if (Tezostmp) {
      Tezos = Tezostmp;
    }
    const contract = await Tezos.wallet.at(contractAddress);
    let localnftStorage = await contract.storage();
    setNftStorage(localnftStorage);
    console.log(localnftStorage);
    const getTokenIds = await localnftStorage.reverse_records?.get(address);
    console.log(getTokenIds);
    if (getTokenIds) {
      let localuserNfts = await Promise.all([
        ...getTokenIds.map(async (id) => {
          const tokenId = id.toNumber();
          const metadata = await localnftStorage.token_metadata.get(tokenId);

          const tokenInfoBytes = metadata.token_info.get("");
          const tokenInfo = bytes2Char(tokenInfoBytes);
          return {
            tokenId,
            ipfsHash:
              tokenInfo.slice(0, 7) === "ipfs://" ? tokenInfo.slice(7) : null,
          };
        }),
      ]);
      setUserNfts(localuserNfts);
    }
  };

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
      await getUserNfts(userAddress);
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
      .then(async (acc) => {
        let userAddress_temp = await wallet.getPKH();
        console.log(userAddress_temp, "userAddress_temp");
        setUserAddress(userAddress_temp);
        Tezos.setWalletProvider(wallet);
        console.log(userAddress_temp);
        await getUserNfts(userAddress_temp, Tezos);
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
        getUserNfts,
        nftStorage,
        setNftStorage,
        userNfts,
        setUserNfts,
      }}
    >
      {walletLoading ? <p>Loading...</p> : children}
    </TezosContext.Provider>
  );
};
