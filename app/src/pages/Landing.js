import React from "react";
import { useTezos } from "../providers/TezosProvider";

const Landing = () => {
  const { userAddress } = useTezos();
  return (
    <div
      style={{
        backgroundColor: "#f4f4f4",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {!userAddress ? (
        <button onClick={connect}>Connect</button>
      ) : (
        <button onClick={disconnect}>Disconnect</button>
      )}
      {userAddress ? <h3>Your address: {userAddress}</h3> : null}
    </div>
  );
};

export default Landing;
