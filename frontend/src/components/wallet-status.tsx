import { useCurrentAccount, useCurrentWallet } from '@mysten/dapp-kit';

export function WalletStatus() {
    const account = useCurrentAccount();
    const { currentWallet } = useCurrentWallet();

    if (!account) {
        return <p>Connect your wallet to get started</p>;
    }

    return (
        <div>
            <p>Wallet: {currentWallet?.name}</p>
            <p>Address: {account.address}</p>
        </div>
    );
}