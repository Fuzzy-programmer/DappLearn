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
  const [provider, setProvider] = useState(null);
  const [owner, setOwner] = useState("");
  const [newOwner, setNewOwner] = useState("");
  const [lastEvent, setLastEvent] = useState(null);
  const [allEvents, setAllEvents] = useState([]);
  const [loading, setLoading] = useState(false);

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
    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();

    const contractInstance = new ethers.Contract(
      contractAddress,
      abi,
      signer
    );

    setProvider(provider);
    setContract(contractInstance);
  }

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

  async function changeOwner() {
    if (!contract) return;

    if (!ethers.isAddress(newOwner)) {
      toast.error("Invalid address");
      return;
    }

    try {
      setLoading(true);
      const tx = await contract.changeOwner(newOwner);

      toast.loading("Transaction pending...", { id: "tx" });

      await tx.wait();

      toast.success("Owner updated!", { id: "tx" });

      getOwner();
    } catch (err) {
      toast.error(getErrorMessage(err), { id: "tx" });
    } finally {
      setLoading(false);
    }
  }

  async function getLastEvent() {
    if (!contract || !provider) return;

    try {
      const filter = contract.filters.OwnerSet();
      const latestBlock = await provider.getBlockNumber();
      const fromBlock = Math.max(latestBlock - 5000, 0);

      const logs = await contract.queryFilter(filter, fromBlock, latestBlock);

      if (logs.length === 0) {
        toast("No events found");
        return;
      }

      const last = logs[logs.length - 1];

      setLastEvent({
        oldOwner: last.args.oldOwner,
        newOwner: last.args.newOwner,
      });

      toast.success("Last event loaded");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  async function loadAllEvents() {
    if (!contract || !provider) return;

    try {
      const filter = contract.filters.OwnerSet();
      const latestBlock = await provider.getBlockNumber();
      const fromBlock = Math.max(latestBlock - 5000, 0);

      const logs = await contract.queryFilter(filter, fromBlock, latestBlock);

      const parsed = logs.map(log => ({
        oldOwner: log.args.oldOwner,
        newOwner: log.args.newOwner,
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
        <h2 style={styles.title}>Owner DApp 👑</h2>

        {/* OWNER */}
        <div style={styles.section}>
          <button style={styles.btn} onClick={getOwner}>
            Get Owner
          </button>
          <p style={styles.value}>{owner || "—"}</p>
        </div>

        {/* CHANGE OWNER */}
        <div style={styles.section}>
          <input
            style={styles.input}
            placeholder="New Owner Address"
            value={newOwner}
            onChange={(e) => setNewOwner(e.target.value)}
          />
          <button
            style={{
              ...styles.btn,
              ...(loading ? styles.btnDisabled : {})
            }}
            disabled={loading}
            onClick={changeOwner}
          >
            {loading ? "Processing..." : "Change Owner"}
          </button>
        </div>

        {/* LAST EVENT */}
        <div style={styles.section}>
          <h3>🔴 Last Event</h3>
          <button style={styles.outline} onClick={getLastEvent}>
            Get Last Event
          </button>

          {lastEvent && (
            <div style={styles.eventBox}>
              <p><b>Old:</b> {lastEvent.oldOwner}</p>
              <p><b>New:</b> {lastEvent.newOwner}</p>
            </div>
          )}
        </div>

        {/* ALL EVENTS */}
        <div style={styles.section}>
          <h3>📜 All Events</h3>
          <button style={styles.outline} onClick={loadAllEvents}>
            Load All Events
          </button>

          <div style={styles.scroll}>
            {allEvents.map((e, i) => (
              <div key={i} style={styles.eventBox}>
                <p><b>Old:</b> {e.oldOwner}</p>
                <p><b>New:</b> {e.newOwner}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100dvh", // responsive viewport height
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
    background: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)"
  },

  card: {
    background: "rgba(255,255,255,0.08)",
    padding: "35px",
    borderRadius: "24px",
    width: "100%",
    maxWidth: "480px",
    color: "white",
    backdropFilter: "blur(25px)",
    boxShadow: "0 25px 50px rgba(0,0,0,0.4)",
    border: "1px solid rgba(255,255,255,0.1)",
  },

  title: {
    textAlign: "center",
    marginBottom: "25px",
    fontSize: "26px",
    fontWeight: "600",
    letterSpacing: "1px",
  },

  section: {
    marginBottom: "25px",
  },

  input: {
    width: "100%",
    padding: "12px",
    borderRadius: "12px",
    border: "none",
    marginBottom: "12px",
    fontSize: "14px",
    outline: "none",
  },

  btn: {
    width: "100%",
    padding: "12px",
    borderRadius: "12px",
    border: "none",
    background: "linear-gradient(90deg,#00c6ff,#0072ff)",
    color: "white",
    fontWeight: "600",
    cursor: "pointer",
  },

  btnDisabled: {
    opacity: 0.6,
    cursor: "not-allowed",
  },

  outline: {
    width: "100%",
    padding: "12px",
    borderRadius: "12px",
    border: "1px solid #00c6ff",
    background: "transparent",
    color: "#00c6ff",
    fontWeight: "600",
    cursor: "pointer",
  },

  value: {
    marginTop: "10px",
    wordBreak: "break-all",
    background: "rgba(255,255,255,0.08)",
    padding: "10px",
    borderRadius: "10px",
  },

  eventBox: {
    background: "rgba(255,255,255,0.07)",
    padding: "12px",
    marginTop: "12px",
    borderRadius: "12px",
    fontSize: "13px",
    border: "1px solid rgba(255,255,255,0.05)",
  },

  scroll: {
    maxHeight: "220px",
    overflowY: "auto",
    marginTop: "10px",
  },
};
