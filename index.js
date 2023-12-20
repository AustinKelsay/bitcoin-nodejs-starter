const { Client } = require('bitcoin-core');

// Configure your Bitcoin Core client connection
const client = new Client({
  network: 'regtest',
  username: 'your_rpc_username',
  password: 'your_rpc_password',
  port: 18443 // default regtest port
});

async function setupWalletsAndTransfer() {
  try {
    // Create wallets for Bob and Alice
    await client.createWallet('bob_wallet');
    await client.createWallet('alice_wallet');

    // Get a new address for Bob
    const bobAddress = await client.getNewAddress('bob_wallet');

    // Mine some blocks and send the rewards to Bob's address
    await client.generateToAddress(101, bobAddress);

    // Check Bob's balance
    const bobBalance = await client.getBalance('bob_wallet');
    console.log(`Bob's Balance: ${bobBalance} BTC`);

    // Send bitcoins from Bob to Alice
    const aliceAddress = await client.getNewAddress('alice_wallet');
    const txId = await client.sendToAddress(aliceAddress, 1, 'bob_wallet'); // send 1 BTC

    console.log(`Transaction ID: ${txId}`);

    // Check Alice's balance
    const aliceBalance = await client.getBalance('alice_wallet');
    console.log(`Alice's Balance: ${aliceBalance} BTC`);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

setupWalletsAndTransfer();
