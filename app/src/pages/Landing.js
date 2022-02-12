import React, { useEffect, useState, useRef } from "react";

import { Grid, TextareaAutosize, TextField } from "@mui/material";
import { char2Bytes, bytes2Char } from "@taquito/utils";
import { MichelsonMap } from "@taquito/taquito";
import { RpcClient } from "@taquito/rpc";

import { useTezos } from "../providers/TezosProvider";
import CustomButton from "../components/CustomButton";

function Landing() {
  const { Tezos, userAddress, connect, disconnect, getUserNfts, userNfts } =
    useTezos();

  const [title, setTitle] = useState("");
  const [files, setFiles] = useState(null);
  const [description, setDescription] = useState("");

  const rpcUrl = "https://hangzhounet.api.tez.ie";
  const serverUrl = "http://localhost:8080";
  const contractAddress = "KT1CPRvPjGsq1Fkt8bKvxeubhoFnEBeNjW3F";

  const client = new RpcClient(rpcUrl, "NetXjD3HPJJjmcd");
  let [pinningMetadata, setPinningMetadata] = useState(false);
  let [mintingToken, setMintingToken] = useState(false);
  const [newNft, setNewNft] = useState(undefined);

  const upload = async () => {
    try {
      // setPinningMetadata(true);
      // const data = new FormData();
      // data.append("image", files[0]);
      // data.append("title", title);
      // data.append("description", description);
      // data.append("creator", userAddress);
      // console.log(files);
      // // const response = await fetch(`${serverUrl}/mint`, {
      // //   method: "POST",
      // //   headers: {
      // //     "Access-Control-Allow-Origin": "*",
      // //   },
      // //   body: data,
      // // });

      if (true) {
        // const data = await response.json();
        // console.log(data);
        if (true) {
          console.log("HERE");
          setPinningMetadata(false);
          setMintingToken(true);
          // saves NFT on-chain
          console.log(Tezos);
          const contract = await Tezos.wallet.at(contractAddress);
          //console.log(await client.getEntrypoints(contractAddress));
          console.log(contract.methods);
          let metadata = char2Bytes(
            "ipfs://" + "QmfXMhsjnmQQQxikkcsmiS6bEVxe76eGexLziag1BbeCBc"
          );
          // metadata = "05" + "01" + char2Bytes(`${metadata.length}`) + metadata;
          const st = new MichelsonMap();
          st.set("1", metadata);
          const op = await contract.methods
            .mint(userAddress, 1000, st, 1)
            .send({ amount:10 });
          console.log("Op hash:", op.opHash);
          await op.confirmation();

          // setNewNft({
          //   imageHash: data.hash,
          //   metadataHash: data.metadataHash,
          //   opHash: op.opHash,
          // });

          // files = undefined;
          // title = "";
          // description = "";
          setFiles(null);
          setTitle("");
          setDescription("");
          // refreshes storage
          await getUserNfts(userAddress);
        } else {
          throw "No IPFS hash";
        }
      } else {
        throw "No response";
      }
    } catch (error) {
      console.log(error);
    } finally {
      setPinningMetadata(false);
      setMintingToken(false);
    }
  };
  const ref = useRef();
  return (
    <Grid container justify="center" alignItems="center" direction="column">
      {!userAddress ? (
        <Grid item>
          <button onClick={connect}>Connect</button>
        </Grid>
      ) : (
        <Grid item>
          <button onClick={disconnect}>Disconnect</button>
        </Grid>
      )}
      {userAddress ? (
        <Grid item>
          <h3>Your address: {userAddress}</h3>
        </Grid>
      ) : null}
      <h2>Your NFTS</h2>
      <div style={{ padding: 40 }}>
        <h1 style={{ marginTop: 40 }}> MINT YOUR OWN NFTS: </h1>
        {userAddress && newNft ? (
          <div>
            <div>Your NFT has been successfully minted!</div>
            <div>
              <a
                href={`https://cloudflare-ipfs.com/ipfs/${newNft.imageHash}`}
                target="_blank"
                rel="noopener noreferrer nofollow"
              >
                Link to your picture
              </a>
            </div>
            <div>
              <a
                href={`https://cloudflare-ipfs.com/ipfs/${newNft.metadataHash}`}
                target="_blank"
                rel="noopener noreferrer nofollow"
              >
                Link to your metadata
              </a>
            </div>
            <div>
              <a
                href={`https://better-call.dev/edo2net/opg/${newNft.opHash}/contents `}
                target="_blank"
                rel="noopener noreferrer nofollow"
              >
                Link to the operation details
              </a>
            </div>
            <div>
              <button class="roman" onClick={() => (newNft = undefined)}>
                Mint a new NFT
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={(e) => e.preventDefault()}>
            <div style={{ padding: 24 }}>
              <div style={{ marginTop: 8 }}>
                <CustomButton onClick={() => ref.current.click()}>
                  Select your picture
                </CustomButton>
                <input
                  type="file"
                  hidden
                  ref={ref}
                  onChange={(e) => setFiles(e.target.files)}
                />
                {files ? <p>{files[0].name}</p> : ""}
              </div>
              <div style={{ marginTop: 8 }}>
                <TextField
                  placeholder="Title for your NFT"
                  id="image-title"
                  placeholder="Add a title for your collectible"
                  onChange={(e) => setTitle(e.target.value)}
                  style={{ width: 400 }}
                  variant="outlined"
                />
              </div>
              <div style={{ marginTop: 8 }}>
                <TextField
                  placeholder="Description for your NFT"
                  floatingLabelText="image-description"
                  multiline
                  rows={4}
                  style={{ width: 400, textAlign: "left" }}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div style={{ marginTop: 16 }}>
                <CustomButton
                  onClick={upload}
                  disabled={pinningMetadata || mintingToken}
                >
                  {pinningMetadata
                    ? "Saving your image..."
                    : mintingToken
                    ? "Minting your token..."
                    : "Mint your token"}
                </CustomButton>
              </div>
            </div>
          </form>
        )}
      </div>
    </Grid>
  );
}

export default Landing;
