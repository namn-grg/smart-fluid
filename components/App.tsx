import { useState, useEffect, useRef } from "react"
import SocialLogin from "@biconomy/web3-auth"
import { ChainId } from "@biconomy/core-types"
import { ethers } from "ethers"
import SmartAccount from "@biconomy/smart-account"
import { ToastContainer, Zoom, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import Fluid from "./Fluid"
import Head from "next/head"

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
    setLoading(true)
    if (!sdkRef.current) {
      const socialLoginSDK = new SocialLogin()
      const signature2 = await socialLoginSDK.whitelistUrl("http://localhost:3000/")
      const signature1 = await socialLoginSDK.whitelistUrl("https://aafluid.vercel.app")
      await socialLoginSDK.init({
        chainId: ethers.utils.hexValue(ChainId.POLYGON_MUMBAI).toString(),
        network: "testnet",
        whitelistUrls: {
          "http://localhost:3000/": signature2,
          "https://aafluid.vercel.app": signature1,
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

  const showSuccessMessage = (message: string, txHash?: string) => {
    toast.success(message, {
      onClick: () => {
        window.open(`https://mumbai.polygonscan.com//tx/${txHash}`, "_blank")
      },
      position: "bottom-left",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    })
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
        toast.info("Deploying smart account, please wait...", {
          autoClose: 5000,
        })
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
      return address.slice(0, 5) + "..." + address.slice(-4)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(smartAccount?.address || "null")
      .then(() => {
        console.log("Successfully copied to clipboard")
        toast.success("Smart contract address copied")
      })
      .catch((error) => {
        console.error("Failed to copy word:", error)
      })
  }

  return (
    <div className="bg-[#14141D] min-h-screen">
      <Head>
        <title>SmartFluid</title>
        <meta name="description" content="One-click Superfluid experience" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={true}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        transition={Zoom}
      />
      {!smartAccount ? (
        <div className="hero min-h-screen bg-[#14141D] px-10">
          <div className="hero-content flex-col lg:flex-row-reverse">
            <img src="/hero.png" className=" max-w-md rounded-lg mx-4" />
            <div>
              <h1 className="text-6xl font-bold">SmartFluid</h1>
              <h3 className="text-xl font-bold">Unleash the power of Account Abstraction</h3>

              <p className="mt-6 mb-3 text-lg">
                Bringing <span className="text-orange-600 font-bold">Smart</span> accounts to Super
                <span className="text-orange-600 font-bold">Fluid</span>
                <br />
              </p>
              <p className="mb-4">
                Perform complex multi-step transactions in a single click!
                <br /> Without paying any gas fee 🤯
              </p>
              {!loading ? (
                <button
                  className="rounded-md border border-solid p-2 font-bold transition-colors border-orange40 bg-orange40 text-white hover:border-orange52 hover:bg-orange52 active:border-orange24 active:bg-orange24"
                  onClick={login}
                >
                  Login
                </button>
              ) : (
                <span className="mx-4 loading loading-spinner loading-lg text-orange40"></span>
              )}
            </div>
          </div>
          <footer className="footer footer-center p-4 text-base-content absolute bottom-0">
            <div>
              <p>
                Made with ♥️ by{" "}
                <a href="https://twitter.com/namn_grg" className="font-bold text-orange60">
                  {" "}
                  Naman ⚡️
                </a>
              </p>
            </div>
          </footer>
        </div>
      ) : (
        <div className="flex flex-col">
          <div className="navbar rounded-md border border-orange24 bg-orange08">
            <div className="flex-1">
              <p className="text-orange90 text-xl">SmartFluid</p>
            </div>
            <div className="flex-none gap-2">
              <div className="form-control">
                <button className="btn w-32 md:w-auto bg-orange24 text-orange90" onClick={copyToClipboard}>
                  {displayAddress(smartAccount.address)}
                </button>
              </div>
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
            </div>
          </div>
          <Fluid smartAccount={smartAccount} provider={provider} />
        </div>
      )}
    </div>
  )
}
export default App
