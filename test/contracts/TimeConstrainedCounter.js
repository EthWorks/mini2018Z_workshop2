import chai, {expect} from 'chai';
import chaiAsPromised from 'chai-as-promised';
import {createMockProvider, deployContract, getWallets} from 'ethereum-waffle';
import {utils} from 'ethers';
import {currentTime, increaseTimeTo} from '../helpers/time';
import TimeConstrainedCounter from '../../build/TimeConstrainedCounter.json';

chai.use(chaiAsPromised);

describe('TimeConstrainedCounter', () => {
  let provider;
  let senderWallet;
  let counter;
  let beginTime;
  let endTime;

  before(async () => {
    provider = createMockProvider();
    [senderWallet] = await getWallets(provider);
  });

  beforeEach(async () => {
    // the contract validity time will be 60 second from now, and end 10 minutes after its start
    beginTime = await currentTime(provider) + 60;
    endTime = beginTime + 600;
    counter = await deployContract(senderWallet, TimeConstrainedCounter, [beginTime, endTime]);
  });

  describe('after construction', async () => {
    it('stores the values provided', async () => {
      expect(await counter.startTime()).to.deep.equal(utils.bigNumberify(beginTime));
      expect(await counter.endTime()).to.deep.equal(utils.bigNumberify(endTime));
    });

    it('has a value of 0', async () => {
      expect(await counter.value()).to.equal(0);
    });
  });

  it('incrementing should not be possible before startime', async () => {
    await expect(counter.increment()).to.be.eventually.rejected;
  });

  it('incrementing should be possible after startime before endTime', async () => {
    await increaseTimeTo(provider, beginTime + 1);
    await expect(counter.increment()).to.be.eventually.fulfilled;
    expect(await counter.value()).to.equal(1);
  });

  it('incrementing should not be possible after endTime', async () => {
    await increaseTimeTo(provider, endTime + 1);
    await expect(counter.increment()).to.be.eventually.rejected;
  });
});
