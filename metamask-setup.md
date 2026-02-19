## 🔗 Connecting MetaMask with Remix

This section explains how to connect **MetaMask** (browser extension) with **Remix IDE** for deploying and interacting with smart contracts. We cover **Sepolia Testnet** and **Local Ganache**.

> **Note:** MetaMask acts as the signer for all transactions in both cases using the **Injected Web3** option in Remix.

---

### 1️⃣ Using Sepolia Testnet

This is ideal for testing your contracts on a public Ethereum test network without spending real ETH.

**Pre-requisites:**

- MetaMask browser extension installed
- Sepolia network already added in MetaMask
- Test ETH in your Sepolia account (get from a faucet: [Sepolia Faucet](https://cloud.google.com/application/web3/faucet/ethereum/sepolia)

**Steps:**

1. Open **Remix IDE** in your browser.
2. Go to the **Deploy & Run Transactions** tab.
3. Change **Environment** to **Injected Web3**.
4. MetaMask will prompt you to connect — select your Sepolia account.
5. You can now deploy contracts and approve transactions directly via MetaMask.

> ✅ Your Remix IDE is now connected to **Sepolia** through MetaMask.

---

### 2️⃣ Using Local Ganache Blockchain

This is ideal for fast, safe, offline testing without using real ETH, while still using the same MetaMask browser extension.

**Pre-requisites:**

- MetaMask browser extension installed
- Ganache installed (GUI or CLI)
- Local project with smart contracts

**Steps:**

1. Start Ganache and note the RPC URL (default: `http://127.0.0.1:7545`) and Chain ID (`1337`).
2. In MetaMask, add a new network:
   - **Network Name:** Ganache Local  
   - **RPC URL:** http://127.0.0.1:7545  
   - **Chain ID:** 1337  
   - **Currency Symbol:** ETH
3. Import one of Ganache’s accounts into MetaMask:
   - Copy the **private key** from Ganache
   - In MetaMask → **Import Account** → Paste the key
4. In Remix IDE → **Deploy & Run Transactions** tab:
   - Set **Environment → Injected Web3**
   - MetaMask will prompt you to connect — select the Ganache account
5. You can now deploy contracts and sign transactions on your **local blockchain**.

> ✅ Remix is now connected to a local Ganache blockchain via the same MetaMask browser extension.

---

### ⚡ Notes

- **Injected Web3** always uses the selected MetaMask account as the signer.  
- To switch between **Sepolia** and **Ganache**, simply change the network inside MetaMask.  
- Always verify that MetaMask shows the correct network and account before deploying contracts.  
- **Sepolia** is for public testing with test ETH, **Ganache** is for local offline testing.  

