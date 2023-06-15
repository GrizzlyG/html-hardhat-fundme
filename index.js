import { ethers } from "./ethers-5.6.esm.min.js"

import { abi, contractAddress } from  "./constants.js"


//connect button
const connectButton = document.getElementById("connectButton");
connectButton.addEventListener("click",connect)

//fund button
const fundButton = document.getElementById("fundButton")
fundButton.addEventListener("click", fund)

//getBalance button
const balanceButton = document.getElementById("balanceButton");
balanceButton.addEventListener("click", getBalance)

//withdraw button
const withdrawButton = document.getElementById("withdraw");
withdrawButton.addEventListener("click", withdraw)

//connect Function
async function connect() {
    if(typeof window.ethereum != "undefined") {
        try {
            await window.ethereum.request({method: "eth_requestAccounts"})
        } catch (error) {
            console.log(error)
        }        
        this.removeEventListener("click", connect)
        this.innerHTML = "Connected"
        const accounts = await ethereum.request({method: "eth_accounts"})
        console.log(accounts)
    } else {
        console.log("I see no metamask")
        document.getElementById("connectButton").innerHTML = "Please Install Metamask"
    }
}

async function fund() {
    //fund amount
    let ethAmount = document.getElementById("ethAmount").value;
    
    console.log(`Funding with ${ethAmount}`)
    if (typeof window.ethereum != "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = await provider.getSigner()


        console.log(await signer.getAddress())

        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const transanctionResponse = await contract.fund({ value: ethers.utils.parseEther(ethAmount) })
            await listenForTransactionMine(transanctionResponse, provider)
            console.log("Done!!")
            document.getElementById("ethAmount").value = ""
            let balance = await provider.getBalance(contractAddress);
            let balanceElement = ethers.utils.formatEther(balance);
    
            document.getElementById("balanceDisplay").innerText = balanceElement

        } catch (error) {
            console.log(error)
        }

    }   
}

function listenForTransactionMine(transanctionResponse, provider) {
    console.log(`Mining ${transanctionResponse.hash}...`)
    return new Promise((resolve, reject) => {
        provider.once(transanctionResponse.hash, (transactionReceipt) => {
            console.log(`Completed with ${transactionReceipt.confirmations} confirmaitons.`)
            resolve()
        }) 
    })
    
    //return new Promise()
}

async function getBalance () {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    //const signer = await provider.getSigner()
    //const contract = new ethers.Contract(contractAddress, abi, signer);

    let balance = await provider.getBalance(contractAddress);
    let balanceElement = ethers.utils.formatEther(balance);
    
    console.log(`Contract Balance: ${balanceElement}`)
    document.getElementById("balanceDisplay").innerText = balanceElement

}

async function withdraw () {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = await provider.getSigner()
    const contract = new ethers.Contract(contractAddress, abi, signer)
    console.log(`Current sender balance: ${ethers.utils.formatEther(await signer.getBalance())}`)
    console.log("Withdrawing...")
    let transactionResponse = await contract.withdraw();
    await listenForTransactionMine(transactionResponse, provider)
    console.log(`Success! Sender balance: ${ethers.utils.formatEther(await signer.getBalance())}`)
}