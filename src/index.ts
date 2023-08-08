import { ExtensionBuilder, InitializeFn, MethodFn } from 'kwil-extensions';
import { Contract, JsonRpcProvider } from 'ethers';
import nftAbi from './abi/nft.json'; // Replace with the actual path to the NFT ABI JSON file

require('dotenv').config();



// Create initialize function to be called when the extension is loaded
const initialize: InitializeFn = async(metadata: Record<string, string>) => {
    if(!metadata['nft_address'] || !metadata['nft_token_id']) {
        throw new Error('Extension must be initialized with an NFT address and token ID.');
    }

    return metadata;
}

// Function to check NFT ownership
async function checkNFTOwnership(nftAddress: string, tokenID: string, walletAddress: string): Promise<boolean> {
    const provider = new JsonRpcProvider(process.env.GOERLI_RPC);
    const contract = new Contract(nftAddress, nftAbi, provider); // Use nftAbi here

    // Call the NFT contract's ownerOf function to check ownership
    const owner = await contract.ownerOf(tokenID);

    return owner === walletAddress;
}


// Create extension methods to be called within Kuneiform Actions
const checkNFTAccess: MethodFn = async({ metadata, inputs }) => {
    const nftAddress = metadata['nft_address'];
    const tokenID = metadata['nft_token_id'];
    const walletAddress = inputs[0].toString();

    const isOwner = await checkNFTOwnership(nftAddress, tokenID, walletAddress);

    if (!isOwner) {
        throw new Error(`Access denied. You must own the specified NFT to access the database.`);
    }

    return 'Access granted'; // Return a single scalar value indicating access granted
}

// Build extensions server
function buildServer(): void {
    const server = new ExtensionBuilder()
        .named('nftaccessextensions')
        .withInitializer(initialize)
        .withMethods({
            checkNFTAccess
        })
        .build();

    process.on('SIGINT', () => {
        server.stop();
    })

    process.on('SIGTERM', () => {
        server.stop();
    })
}

buildServer();
