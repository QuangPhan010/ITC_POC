import { createNetworkConfig } from '@mysten/dapp-kit';
import { getJsonRpcFullnodeUrl } from '@mysten/sui/jsonRpc';

const { networkConfig, useNetworkVariable, useNetworkVariables } = createNetworkConfig({
    testnet: {
        url: getJsonRpcFullnodeUrl('testnet'),
        network: 'testnet',
    },
    mainnet: {
        url: getJsonRpcFullnodeUrl('mainnet'),
        network: 'mainnet',
    },
});

export { networkConfig, useNetworkVariable, useNetworkVariables };