import { supererc20abi, erc20abi, CFAv1ForwarderABI } from "."
import { ethers } from "ethers"

 const qProvider = new ethers.providers.JsonRpcProvider(
    "https://thrumming-quiet-yard.matic-testnet.discover.quiknode.pro/e8d17c21d6f86cdc291e6c8fa44a6868c51ee863/"
  )

const fDAIxAddress = "0x5D8B4C2554aeB7e86F387B4d6c00Ac33499Ed01f"
const fDAIAddress = "0x15F0Ca26781C3852f8166eD2ebce5D18265cceb7"
const cfv1Address = "0xcfA132E353cB4E398080B9700609bb008eceB125"
const fDAIxcontract = new ethers.Contract(fDAIxAddress, supererc20abi, qProvider)
const fDAIcontract = new ethers.Contract(fDAIAddress, erc20abi, qProvider)
const cfav1Contract = new ethers.Contract(cfv1Address, CFAv1ForwarderABI, qProvider)

export { fDAIxcontract, fDAIcontract, cfav1Contract, qProvider, fDAIxAddress, fDAIAddress, cfv1Address }
