import { Framework } from "@superfluid-finance/sdk-core";
import { ethers } from "ethers";

const GetSF=async()=>{

    const provider = new ethers.providers.JsonRpcProvider("https://thrumming-quiet-yard.matic-testnet.discover.quiknode.pro/e8d17c21d6f86cdc291e6c8fa44a6868c51ee863/");
    const network = await provider.getNetwork();

    const sf = await Framework.create({
        chainId: network?.chainId,
        provider: provider,
    });

    return sf;
}

export default GetSF;