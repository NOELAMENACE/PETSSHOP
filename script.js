let web3;
let connectedAccount = null;
const charactersImg = Array.from({ length: 7 }, (_, i) => `images/mascot-${i}.png`);
const charactersVid = Array.from({ length: 7 }, (_, i) => `images/mascot-${i}.webm`);
const downloadLink = "https://drive.google.com/uc?export=download&id=1CGB5Hw5aCVdDit-We_Al4aT-3s4dk_RX";
const contractAddress = "0xd9145CCE52D386f254917e481eB44e9943F39138";
const contractABI = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_usdtAddress",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "address",
                "name": "buyer",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "characterId",
                "type": "uint256"
            }
        ],
        "name": "BoxPurchased",
        "type": "event"
    },
    {
        "inputs": [],
        "name": "buyBox",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "buyBoxWithEth",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "withdraw",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "boxPrice",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "user",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "characterId",
                "type": "uint256"
            }
        ],
        "name": "hasMascot",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "mascotCount",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "MAX_CHARACTERS",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "ownedMascots",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "owner",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "usdt",
        "outputs": [
            {
                "internalType": "contract IERC20",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

function showPopup(message) {
    console.log("Showing popup:", message);
    const overlay = document.getElementById("popup-overlay");
    const popupMessage = document.getElementById("popup-message");
    popupMessage.textContent = message;
    overlay.style.display = "flex";
    document.getElementById("popup-close").onclick = () => overlay.style.display = "none";
}

async function initWeb3() {
    console.log("Initializing web3...");
    if (typeof window.ethereum !== "undefined") {
        web3 = new Web3(window.ethereum);
        try {
            const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
            connectedAccount = accounts[0];
            console.log("Connected account:", connectedAccount);
            const shortAddress = `${connectedAccount.slice(0, 6)}...${connectedAccount.slice(-4)}`;
            const walletBtn = document.querySelector(".wallet-btn");
            if (walletBtn) walletBtn.textContent = shortAddress;
            const contract = new web3.eth.Contract(contractABI, contractAddress);
            console.log("Contract initialized:", contractAddress);
            return contract;
        } catch (error) {
            console.error("User denied account access:", error);
            showPopup("Please allow MetaMask to connect.");
            return null;
        }
    } else if (typeof window.web3 !== "undefined") {
        web3 = new Web3(window.web3.currentProvider);
        const accounts = await web3.eth.getAccounts();
        connectedAccount = accounts[0];
        console.log("Connected account:", connectedAccount);
        const shortAddress = `${connectedAccount.slice(0, 6)}...${connectedAccount.slice(-4)}`;
        const walletBtn = document.querySelector(".wallet-btn");
        if (walletBtn) walletBtn.textContent = shortAddress;
        const contract = new web3.eth.Contract(contractABI, contractAddress);
        console.log("Contract initialized:", contractAddress);
        return contract;
    } else {
        showPopup("MetaMask is not installed or not detected. Please install it or check your browser settings.");
        return null;
    }
}

const tickerItems = document.getElementById("tickerItems");
if (tickerItems) {
    const tickerContent = [];
    for (let i = 0; i < 30; i++) {
        charactersImg.forEach(char => tickerContent.push(char));
    }
    tickerContent.forEach(char => {
        const img = document.createElement("img");
        img.src = char;
        tickerItems.appendChild(img);
    });
}

async function connectWallet() {
    const contract = await initWeb3();
    if (contract && connectedAccount) {
        showPopup("Wallet connected successfully!");
    }
}

function handleWalletAction() {
    if (!connectedAccount) {
        connectWallet().then(() => {
            if (connectedAccount) {
                const walletBtn = document.querySelector(".wallet-btn");
                if (walletBtn) walletBtn.onclick = () => window.location.href = "account.html";
            }
        });
    } else {
        window.location.href = "account.html";
    }
}

async function buyBox() {
    const buyBtn = document.getElementById("buyBtn");
    if (!buyBtn) return;
    buyBtn.disabled = true;

    console.log("Starting buyBox...");
    const contract = await initWeb3();
    if (!contract) {
        console.log("Contract initialization failed");
        buyBtn.disabled = false;
        return;
    }

    const accounts = await web3.eth.getAccounts();
    console.log("Accounts retrieved:", accounts);

    try {
        const mascotCount = Number(await contract.methods.mascotCount(accounts[0]).call());
        console.log("Mascot count:", mascotCount);

        if (mascotCount >= 7) {
            showPopup("You already own all mascots!");
            buyBtn.disabled = false;
            return;
        }

        console.log("Sending transaction with gas limit...");
        const tx = await contract.methods.buyBoxWithEth().send({
            from: accounts[0],
            value: web3.utils.toWei("0.001", "ether"),
            gas: 300000 // Augmentation du gaz pour éviter "Out of Gas"
        });
        const characterId = Number(tx.events.BoxPurchased.returnValues.characterId);
        console.log("Transaction succeeded. Character ID:", characterId);

        const tickerItems = document.getElementById("tickerItems");
        tickerItems.style.transform = "translateX(0)";
        tickerItems.classList.add("spinning");
        console.log("Animation started");

        setTimeout(() => {
            tickerItems.classList.remove("spinning");
            tickerItems.style.transition = "transform 0.5s ease-out";
            const finalOffset = characterId * 210 + 2100;
            tickerItems.style.transform = `translateX(-${finalOffset}px)`;
            console.log("Animation finished, offset:", finalOffset);

            setTimeout(() => {
                console.log("Creating download button...");
                const container = document.querySelector(".container");
                if (container) {
                    const oldDownloadBtn = container.querySelector(".download-btn");
                    if (oldDownloadBtn) {
                        oldDownloadBtn.remove();
                        console.log("Old download button removed");
                    }

                    const downloadBtn = document.createElement("button");
                    downloadBtn.textContent = "Download Your Mascot";
                    downloadBtn.className = "download-btn";
                    downloadBtn.onclick = () => window.location.href = downloadLink;
                    container.appendChild(downloadBtn);
                    console.log("New download button added");
                } else {
                    console.error("Container not found");
                }

                buyBtn.disabled = false;
                showPopup("You won mascot #" + characterId + "!");
            }, 500);
        }, 8000);
    } catch (error) {
        console.error("Transaction failed:", error);
        showPopup("Transaction failed: " + (error.message || "Unknown error"));
        buyBtn.disabled = false;
    }
}

async function loadPurchases() {
    const mascotGrid = document.getElementById("mascot-grid");
    if (!mascotGrid) return;

    const contract = await initWeb3();
    if (!contract) return;

    const web3Instance = web3;
    try {
        const accounts = await web3Instance.eth.getAccounts();
        const latestBlock = Number(await web3Instance.eth.getBlockNumber());
        const fromBlock = latestBlock - 5000;
        console.log("Latest block:", latestBlock);
        console.log("Searching from block:", fromBlock);

        const events = await contract.getPastEvents("BoxPurchased", {
            fromBlock: fromBlock > 0 ? fromBlock : 0,
            toBlock: "latest"
        });
        console.log("All events:", events);

        const userEvents = events.filter(event => 
            event.returnValues.buyer.toLowerCase() === accounts[0].toLowerCase()
        );
        console.log("Filtered events for user:", userEvents);

        if (userEvents.length === 0) {
            mascotGrid.innerHTML = "<p>No purchases found for this account in the last 5000 blocks.</p>";
        } else {
            userEvents.forEach(event => {
                const characterId = Number(event.returnValues.characterId);
                console.log("Adding mascot:", characterId);
                const div = document.createElement("div");
                div.className = "mascot-item";
                const img = document.createElement("img");
                img.src = charactersImg[characterId];
                const downloadBtn = document.createElement("button");
                downloadBtn.textContent = "Download";
                downloadBtn.className = "download-btn";
                downloadBtn.onclick = () => window.location.href = downloadLink;
                div.appendChild(img);
                div.appendChild(downloadBtn);
                mascotGrid.appendChild(div);
            });
        }
    } catch (error) {
        console.error("Error loading purchases:", error);
        mascotGrid.innerHTML = "<p>Error loading purchases. Check console.</p>";
    }
}

if (document.getElementById("buyBtn")) {
    document.getElementById("buyBtn").addEventListener("click", buyBox);
}
if (document.getElementById("mascot-grid")) {
    window.onload = async () => {
        await initWeb3();
        loadPurchases();
    };
}