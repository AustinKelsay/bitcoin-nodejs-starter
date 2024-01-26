const Client = require('bitcoin-core');

// Configure your Bitcoin Core client connection
const client = new Client({
  network: 'regtest',
  username: 'plebdev',
  password: 'pass',
  port: 18443, // default regtest port
});

/**
 * Create a wallet in the Bitcoin Core client.
 * @param {string} walletName - The name of the wallet to create.
 * @param {boolean} isDescriptorWallet - Whether to create a Descriptor wallet.
 */
async function createWallet(walletName, isDescriptorWallet) {
  // params: wallet_name, disable_private_keys, blank, passphrase, avoid_reuse, descriptors, load_on_startup, external_signer
  await client.createWallet(walletName, false, false, '', false, isDescriptorWallet);
  console.log(`Wallet ${walletName} created as ${isDescriptorWallet ? 'Descriptor' : 'HD'} wallet`);

  // Set wallet context for fetching wallet information
  client.wallet = walletName;
  const walletInfo = await client.getWalletInfo();
  console.log(`Wallet Info for ${walletName}:`, walletInfo);
}


/**
 * Get a new Bitcoin Core client instance for a specific wallet.
 * @param {string} walletName - The name of the wallet for the client instance.
 * @returns {Client} A new client instance for the specified wallet.
 */
function getWalletClient(walletName) {
  return new Client({
    network: 'regtest',
    username: 'plebdev',
    password: 'pass',
    port: 18443,
    wallet: walletName,
  });
}

async function setupWalletsAndTransfer() {
  try {
    // Specify the type of wallet for Bob and Alice (true for Descriptor, false for HD)
    const isBobDescriptorWallet = true; // Example: Bob uses a Descriptor wallet
    const isAliceDescriptorWallet = true; // Example: Alice uses an HD wallet

    // Create wallets for Bob and Alice
    await createWallet('bob_wallet', isBobDescriptorWallet);
    await createWallet('alice_wallet', isAliceDescriptorWallet);

    // Instantiate a new Client for each wallet
    const bobClient = getWalletClient('bob_wallet');
    const aliceClient = getWalletClient('alice_wallet');

    // Get a new address for Bob and mine blocks to it
    const bobAddress = await bobClient.getNewAddress();
    console.log(`Bob's Address: ${bobAddress}`);
    await client.generateToAddress(101, bobAddress);
    console.log('Blocks mined to Bob\'s address');

    // Check Bob's balance
    const bobBalance = await bobClient.getBalance();
    console.log(`Bob's Balance: ${bobBalance} BTC`);

    // Get a new address for Alice and send BTC from Bob to Alice
    const aliceAddress = await aliceClient.getNewAddress();
    const feeRate = 4;  // Set a custom fee rate
    const txId = await bobClient.sendToAddress(aliceAddress, 10, 'sending to alice', 'from bob', false, false, null, null, null, feeRate);
    console.log(`Transaction ID: ${txId}`);

    // Mine blocks to confirm the transaction
    await client.generateToAddress(6, bobAddress);

    // Check Alice's balance
    const aliceBalance = await aliceClient.getBalance();
    console.log(`Alice's Balance: ${aliceBalance} BTC`);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

setupWalletsAndTransfer();
