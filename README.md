# 🎯 Micro-Incentive To-Do List for Teams

A decentralized task management application built on **Mantle Blockchain** that gamifies productivity through crypto staking. Team members stake MNT tokens on their tasks — complete on time to get your stake back, or fund the team party! 🎉

![Mantle](https://img.shields.io/badge/Mantle-Sepolia-blue?style=for-the-badge)
![Solidity](https://img.shields.io/badge/Solidity-0.8.24-363636?style=for-the-badge&logo=solidity)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

---

## 📖 Table of Contents

- [Overview](#-overview)
- [How It Works](#-how-it-works)
- [User Guide](#-user-guide)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Smart Contract](#-smart-contract)
- [Deployment](#-deployment)
- [License](#-license)

---

## 🌟 Overview

Traditional to-do lists lack accountability. This dApp solves that by introducing **skin in the game**:

- **Stake MNT** when creating a task
- **Complete before deadline** → Get your stake back
- **Miss the deadline** → Stake goes to the **Party Fund** 🎊
- **Team Lead** verifies completions and manages the party fund

Perfect for remote teams, study groups, or anyone who needs that extra push to stay productive!

---

## ⚙️ How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                        TASK LIFECYCLE                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   1. CREATE TASK                    2. COMPLETE TASK            │
│   ┌──────────────┐                  ┌──────────────┐            │
│   │ User stakes  │                  │ User marks   │            │
│   │ MNT tokens   │ ───────────────► │ as complete  │            │
│   │ + deadline   │                  │              │            │
│   └──────────────┘                  └──────────────┘            │
│                                            │                    │
│                                            ▼                    │
│                                   3. TEAM LEAD VERIFIES         │
│                                   ┌──────────────┐              │
│                                   │ Approval     │              │
│                                   │ required     │              │
│                                   └──────────────┘              │
│                                            │                    │
│                    ┌───────────────────────┴───────────────┐    │
│                    ▼                                       ▼    │
│           ✅ BEFORE DEADLINE                    ❌ AFTER DEADLINE│
│           ┌──────────────┐                    ┌──────────────┐  │
│           │ Claim stake  │                    │ Stake goes   │  │
│           │ back!        │                    │ to Party Fund│  │
│           └──────────────┘                    └──────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Key Mechanics

| Action | Who Can Do It | Result |
|--------|---------------|--------|
| Create Task | Anyone | Stakes MNT, sets deadline |
| Complete Task | Task Owner | Marks task for verification |
| Verify Task | Team Lead Only | Confirms task is done |
| Claim Stake | Task Owner | Returns stake (if verified before deadline) |
| Forfeit Stake | Anyone | Moves expired stakes to Party Fund |
| Withdraw Party Fund | Team Lead Only | Collects accumulated forfeits |

---

## 📱 User Guide

### Step 1: Connect Your Wallet

1. Visit the application at `http://localhost:3000`
2. Click **"Connect Wallet"** in the navigation bar
3. Select your wallet (MetaMask, WalletConnect, etc.)
4. Ensure you're connected to **Mantle Sepolia Testnet**

> 💡 **Need testnet MNT?** Get some from the [Mantle Sepolia Faucet](https://faucet.sepolia.mantle.xyz/)

### Step 2: Create a Task

1. Click the **"+ New Task"** button
2. Fill in the task details:
   - **Task Description**: What needs to be done
   - **Deadline**: When it must be completed by
   - **Stake Amount**: How much MNT to stake (minimum 0.001 MNT)
3. Click **"Create Task"** and confirm the transaction in your wallet
4. Your task will appear in the task list!

### Step 3: Complete Your Task

1. Finish your task in real life 💪
2. Find your task in the list and click **"Mark Complete"**
3. Confirm the transaction
4. Your task now shows as "Awaiting Verification"

### Step 4: Get Verified (Team Lead Action)

1. The **Team Lead** reviews completed tasks
2. If satisfactory, they click **"Verify"** on your task
3. Once verified, your task shows a ✅ checkmark

### Step 5: Claim Your Stake

1. After verification (and before deadline), click **"Claim Stake"**
2. Confirm the transaction
3. Your staked MNT returns to your wallet! 🎉

### ⚠️ What Happens If You Miss the Deadline?

- Anyone can click **"Forfeit"** on expired tasks
- The stake moves to the **Party Fund**
- The Team Lead can withdraw and use it for team celebrations!

---

## 🛠️ Tech Stack

### Smart Contracts
- **Solidity** ^0.8.24
- **Foundry** - Development framework
- **Mantle Sepolia** - Testnet deployment

### Frontend
- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Wagmi v2** - Ethereum React hooks
- **Viem** - Ethereum utilities
- **RainbowKit** - Wallet connection UI

---

## 📁 Project Structure

```
web3/
├── contracts/                 # Smart contract code
│   ├── src/
│   │   └── ToDo.sol          # Main contract
│   ├── test/
│   │   └── ToDo.t.sol        # Contract tests
│   ├── script/
│   │   └── DeployToDo.s.sol  # Deployment script
│   └── foundry.toml          # Foundry config
│
├── frontend/                  # Next.js application
│   ├── src/
│   │   ├── app/              # Pages
│   │   ├── components/       # UI components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── lib/              # ABI & utilities
│   │   ├── config/           # Wagmi configuration
│   │   └── providers/        # Context providers
│   └── package.json
│
└── README.md                  # This file
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Foundry](https://book.getfoundry.sh/getting-started/installation)
- A wallet with Mantle Sepolia testnet MNT

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd web3
```

### 2. Setup Smart Contracts

```bash
cd contracts

# Install dependencies
forge install

# Run tests
forge test

# Deploy to Mantle Sepolia (update .env with your private key first)
forge script script/DeployToDo.s.sol --rpc-url $MANTLE_SEPOLIA_RPC --broadcast
```

### 3. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
# Edit .env.local with your WalletConnect Project ID

# Run development server
npm run dev
```

### 4. Open the App

Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📜 Smart Contract

### Contract Address (Mantle Sepolia)

```
0x12E3B76Fc114b531eA699e1fA6f9F9222C031BD0
```

### Key Functions

| Function | Description |
|----------|-------------|
| `createTask(content, deadline)` | Create a new task with staked MNT |
| `completeTask(taskId)` | Mark your task as completed |
| `verifyTask(taskId)` | Team lead verifies a completed task |
| `claimStake(taskId)` | Claim back your stake after verification |
| `forfeitStake(taskId)` | Move expired stake to party fund |
| `withdrawPartyFund()` | Team lead withdraws accumulated funds |

### Constants

- **Minimum Stake**: 0.001 MNT (1e15 wei)

---

## 🌐 Deployment

### Mantle Sepolia Network Configuration

| Parameter | Value |
|-----------|-------|
| Network Name | Mantle Sepolia Testnet |
| RPC URL | `https://rpc.sepolia.mantle.xyz` |
| Chain ID | 5003 |
| Currency Symbol | MNT |
| Block Explorer | `https://sepolia.mantlescan.xyz` |

### Adding Mantle Sepolia to MetaMask

1. Open MetaMask
2. Click on the network dropdown
3. Select "Add Network"
4. Enter the network details from the table above
5. Click "Save"

---

## 🧪 Running Tests

### Smart Contract Tests

```bash
cd contracts
forge test -vvv
```

### Test Coverage

```bash
forge coverage
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Mantle Network](https://www.mantle.xyz/) for the L2 infrastructure
- [Foundry](https://book.getfoundry.sh/) for the amazing Solidity toolkit
- [RainbowKit](https://www.rainbowkit.com/) for seamless wallet integration

---

<p align="center">
  Built with ❤️ for productive teams everywhere
</p>
