"use client";

import { useEffect, useState } from "react";
import { ethers } from "ethers";
import toast from "react-hot-toast";

const contractAddress = "0xA58B470E57301D4052ef6aEf2e8E30d8326b94b2";

const abi = [
  {
    inputs: [{ name: "newOwner", type: "address" }],
    name: "changeOwner",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "getOwner",
    outputs: [{ type: "address" }],
    stateMutability: "view",
    type: "function"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "oldOwner", type: "address" },
      { indexed: true, name: "newOwner", type: "address" }
    ],
    name: "OwnerSet",
    type: "event"
  }
];

export default function Home() {
  const [contract, setContract] = useState(null);
  const [owner, setOwner] = useState("");
  const [newOwner, setNewOwner] = useState("");
  const [lastEvent, setLastEvent] = useState(null);
  const [allEvents, setAllEvents] = useState([]);
  const [wrongNetwork, setWrongNetwork] = useState(false);

  useEffect(() => {
    init();

    if (window.ethereum) {
      window.ethereum.on("chainChanged", () => {
        window.location.reload();
      });
    }
  }, []);

  async function init() {
    if (!window.ethereum) {
      toast.error("Install MetaMask");
      return;
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const network = await provider.getNetwork();

    if (network.chainId !== 11155111n) {
      setWrongNetwork(true);
      return;
    }

    setWrongNetwork(false);

    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();

    const contractInstance = new ethers.Contract(
      contractAddress,
      abi,
      signer
    );

    setContract(contractInstance);
  }

  // 🔁 Switch Network
  async function switchToSepolia() {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0xaa36a7" }]
      });
    } catch (err) {
      toast.error("Failed to switch network");
    }
  }

  // 🧠 Extract error message
  function getErrorMessage(err) {
    if (!err) return "Unknown error";
    return (
      err.reason ||
      err.shortMessage ||
      err.data?.message ||
      err.message ||
      "Transaction failed"
    );
  }

  // 👑 Get Owner
  async function getOwner() {
    if (!contract) return;
    try {
      const result = await contract.getOwner();
      setOwner(result);
      toast.success("Owner fetched");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  // 🔁 Change Owner
  async function changeOwner() {
    if (!contract || !newOwner) {
      toast.error("Enter valid address");
      return;
    }

    try {
      const tx = await contract.changeOwner(newOwner);

      toast.loading("Transaction pending...", { id: "tx" });

      await tx.wait();

      toast.success("Owner updated!", { id: "tx" });

      getOwner();

    } catch (err) {
      console.log(err);
      toast.error(getErrorMessage(err), { id: "tx" });
    }
  }

  // 🔴 Last Event
  async function getLastEvent() {
    if (!contract) return;

    try {
      const filter = contract.filters.OwnerSet();
      const logs = await contract.queryFilter(filter, -5000);

      if (logs.length === 0) {
        toast("No events found");
        return;
      }

      const last = logs[logs.length - 1];

      setLastEvent({
        oldOwner: last.args.oldOwner,
        newOwner: last.args.newOwner,
        tx: last.transactionHash
      });

      toast.success("Last event loaded");

    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  // 📜 All Events
  async function loadAllEvents() {
    if (!contract) return;

    try {
      const filter = contract.filters.OwnerSet();
      const logs = await contract.queryFilter(filter, -5000);

      const parsed = logs.map(log => ({
        oldOwner: log.args.oldOwner,
        newOwner: log.args.newOwner,
        tx: log.transactionHash
      }));

      setAllEvents(parsed.reverse());
      toast.success("Events loaded");

    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>👑 Owner DApp</h2>

        {wrongNetwork && (
          <div style={styles.warning}>
            <p>⚠️ Wrong Network</p>
            <button style={styles.btn} onClick={switchToSepolia}>
              Switch to Sepolia
            </button>
          </div>
        )}

        {/* OWNER */}
        <div style={styles.section}>
          <button style={styles.btn} onClick={getOwner} disabled={wrongNetwork}>
            Get Owner
          </button>
          <p style={styles.value}>{owner || "—"}</p>
        </div>

        {/* CHANGE OWNER */}
        <div style={styles.section}>
          <input
            style={styles.input}
            placeholder="New Owner Address"
            onChange={(e) => setNewOwner(e.target.value)}
            disabled={wrongNetwork}
          />
          <button
            style={styles.btn}
            onClick={changeOwner}
            disabled={wrongNetwork}
          >
            Change Owner
          </button>
        </div>

        {/* LAST EVENT */}
        <div style={styles.section}>
          <h3>🔴 Last Event</h3>
          <button
            style={styles.outline}
            onClick={getLastEvent}
            disabled={wrongNetwork}
          >
            Get Last Event
          </button>

          {lastEvent && (
            <div style={styles.eventBox}>
              <p><b>Old:</b> {lastEvent.oldOwner}</p>
              <p><b>New:</b> {lastEvent.newOwner}</p>
              <a href={`https://sepolia.etherscan.io/tx/${lastEvent.tx}`} target="_blank">
                View Tx
              </a>
            </div>
          )}
        </div>

        {/* ALL EVENTS */}
        <div style={styles.section}>
          <h3>📜 All Events</h3>
          <button
            style={styles.outline}
            onClick={loadAllEvents}
            disabled={wrongNetwork}
          >
            Load All Events
          </button>

          <div style={styles.scroll}>
            {allEvents.map((e, i) => (
              <div key={i} style={styles.eventBox}>
                <p><b>Old:</b> {e.oldOwner}</p>
                <p><b>New:</b> {e.newOwner}</p>
                <a href={`https://sepolia.etherscan.io/tx/${e.tx}`} target="_blank">
                  View Tx
                </a>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

// 🎨 STYLES
const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)"
  },
  card: {
    background: "rgba(255,255,255,0.1)",
    padding: "30px",
    borderRadius: "20px",
    width: "420px",
    color: "white",
    backdropFilter: "blur(20px)"
  },
  section: { marginBottom: "20px" },
  input: {
    width: "100%",
    padding: "10px",
    borderRadius: "10px",
    border: "none",
    marginBottom: "10px"
  },
  btn: {
    width: "100%",
    padding: "10px",
    borderRadius: "10px",
    border: "none",
    background: "#00c6ff",
    cursor: "pointer"
  },
  outline: {
    width: "100%",
    padding: "10px",
    borderRadius: "10px",
    border: "1px solid #00c6ff",
    background: "transparent",
    color: "#00c6ff",
    cursor: "pointer"
  },
  warning: {
    background: "rgba(255,0,0,0.2)",
    padding: "10px",
    borderRadius: "10px",
    marginBottom: "15px"
  },
  value: { wordBreak: "break-all" },
  eventBox: {
    background: "rgba(255,255,255,0.1)",
    padding: "10px",
    marginTop: "10px",
    borderRadius: "10px"
  },
  scroll: {
    maxHeight: "200px",
    overflowY: "auto"
  }
};