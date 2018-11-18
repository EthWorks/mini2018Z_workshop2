const currentTime = async (provider) => {
  const currentBlock = await provider.getBlock('latest');
  return currentBlock.timestamp;
};

const promisifiedWeb3sendAsync = (web3Provider, req) => new Promise((resolve, reject) => {
  web3Provider.sendAsync(
    req,
    (err) => (err ? reject(err) : resolve())
  );
});

/* NOTE: This method is so wrong:
  a) ugly hack: we assume the provider is a ethers.js Web3Provider
  b) it assumes the EVM supports evm_increaseTime (Ganache, hopefully others soon)
*/
const increaseTime = async (provider, duration) => {
  // eslint-disable-next-line no-underscore-dangle
  const web3Provider = provider._web3Provider;
  const id = Date.now();

  await promisifiedWeb3sendAsync(
    web3Provider,
    {
      jsonrpc: '2.0',
      method: 'evm_increaseTime',
      params: [duration],
      id
    });
  await promisifiedWeb3sendAsync(
    web3Provider,
    {
      jsonrpc: '2.0',
      method: 'evm_mine',
      id: id + 1
    });
};

const increaseTimeTo = async (provider, target) => {
  const now = await currentTime(provider);
  if (target < now) {
    throw Error(`Cannot increase current time(${now}) to a moment in the past(${target})`);
  }
  const diff = target - now;
  await increaseTime(provider, diff);
};

export {currentTime, increaseTime, increaseTimeTo};
