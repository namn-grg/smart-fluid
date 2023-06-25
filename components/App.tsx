import { useState, useEffect, useRef } from "react"
import SocialLogin from "@biconomy/web3-auth"
import { ChainId } from "@biconomy/core-types"
import { ethers } from "ethers"
import SmartAccount from "@biconomy/smart-account"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import Head from "next/head"
import Fluid from "./Fluid"

function App() {
  const [smartAccount, setSmartAccount] = useState<SmartAccount | null>(null)
  const [interval, enableInterval] = useState(false)
  const sdkRef = useRef<SocialLogin | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [provider, setProvider] = useState<any>(null)

  useEffect(() => {
    let configureLogin: any
    if (interval) {
      configureLogin = setInterval(() => {
        if (!!sdkRef.current?.provider) {
          setupSmartAccount()
          clearInterval(configureLogin)
        }
      }, 1000)
    }
  }, [interval])

  async function login() {
    if (!sdkRef.current) {
      const socialLoginSDK = new SocialLogin()
      const signature2 = await socialLoginSDK.whitelistUrl("http://localhost:3000/")
      const signature1 = await socialLoginSDK.whitelistUrl("https://aaboard.vercel.app")
      await socialLoginSDK.init({
        chainId: ethers.utils.hexValue(ChainId.POLYGON_MUMBAI).toString(),
        network: "testnet",
        whitelistUrls: {
          "http://localhost:3000/": signature2,
          "https://aaboard.vercel.app": signature1,
        },
      })
      console.log("socialLoginSDK =>", socialLoginSDK)

      sdkRef.current = socialLoginSDK
    }
    if (!sdkRef.current.provider) {
      sdkRef.current.showWallet()
      enableInterval(true)
    } else {
      setupSmartAccount()
    }
  }

  async function setupSmartAccount() {
    if (!sdkRef?.current?.provider) {
      return
    }
    sdkRef.current.hideWallet()
    setLoading(true)
    const web3Provider = new ethers.providers.Web3Provider(sdkRef.current.provider)
    setProvider(web3Provider)
    try {
      const smartAccount = new SmartAccount(web3Provider, {
        activeNetworkId: ChainId.POLYGON_MUMBAI,
        supportedNetworksIds: [ChainId.POLYGON_MUMBAI],
        networkConfig: [
          {
            chainId: ChainId.POLYGON_MUMBAI,
            dappAPIKey: "XRtYQSxgk.9b3abfcf-b407-4f91-a269-03959ea90bf1",
          },
        ],
      })
      const acct = await smartAccount.init()
      console.log({ deployed: await smartAccount.isDeployed(ChainId.POLYGON_MUMBAI) })
      const isDeployed = await smartAccount.isDeployed(ChainId.POLYGON_MUMBAI)
      if (isDeployed == false) {
        console.log("Not deployed, deploying now...")
        const deployTx = await smartAccount.deployWalletUsingPaymaster()
        console.log(deployTx)
      }
      setSmartAccount(acct)
      setLoading(false)
    } catch (err) {
      console.log("error setting up smart account... ", err)
    }
  }

  const logout = async () => {
    if (!sdkRef.current) {
      console.error("Web3Modal not initialized.")
      return
    }
    await sdkRef.current.logout()
    sdkRef.current.hideWallet()
    setSmartAccount(null)
    enableInterval(false)
  }

  const displayAddress = (address: string) => {
    if (address) {
      return address.slice(0, 4) + "..." + address.slice(-4)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(smartAccount?.address || "null")
      .then(() => {
        console.log("Successfully copied to clipboard")
      })
      .catch((error) => {
        console.error("Failed to copy word:", error)
      })
  }

  return (
    <>
      {!smartAccount ? (
        <div className="hero min-h-screen bg-base-200">
          <div className="hero-content flex-col lg:flex-row-reverse">
            <img src="https://picsum.photos/700" className="max-w-sm rounded-lg shadow-2xl" />
            <div>
              <h1 className="text-5xl font-bold">SmartFluid</h1>
              <p className="py-6">
                Combining the power of smart accounts and programmable money to create a new dynamic
              </p>
              <button className="btn btn-primary" onClick={login}>
                Login
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col">
          <div className="navbar bg-base-100 py-4 px-12">
            <div className="flex-1">
              <p className="btn btn-ghost normal-case text-3xl">SmartFluid</p>
            </div>
            <div className="flex-none gap-2">
              <div className="dropdown dropdown-end">
                <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
                  <div className="w-10 rounded-full">
                    <img src="/profile.png" />
                  </div>
                </label>
                <ul
                  tabIndex={0}
                  className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52"
                >
                  <li>
                    <a onClick={logout}>Logout</a>
                  </li>
                </ul>
              </div>
              <div className="form-control">
                <button className="btn btn-secondary w-32 md:w-auto" onClick={copyToClipboard}>
                  {displayAddress(smartAccount.address)}
                </button>
              </div>
            </div>
          </div>
          <Fluid smartAccount={smartAccount} provider={provider} />
        </div>
      )}
    </>
  )
}
export default App
