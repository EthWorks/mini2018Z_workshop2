import chai, {expect} from 'chai';
import chaiAsPromised from 'chai-as-promised';
import {createMockProvider, deployContract, getWallets, contractWithWallet} from 'ethereum-waffle';
import {utils} from 'ethers';

import Escrow from '../../build/Escrow.json';

chai.use(chaiAsPromised);

describe.skip('Escrow', () => {
  let provider;
  let sellerWallet;
  let buyerWallet;
  const price = utils.parseUnits('1', 'ether');
  const doublePrice = price.mul(2);
  let contractForSeller;
  let contractForBuyer;

  before(async () => {
    provider = createMockProvider();
    [sellerWallet, buyerWallet] = await getWallets(provider);
  });

  beforeEach(async () => {
    contractForSeller = await deployContract(sellerWallet, Escrow, [], {value: doublePrice});
    contractForBuyer = contractWithWallet(contractForSeller, buyerWallet);
  });

  describe('construction', () => {
    it('stores the price as half of the payed amount', async () => {
      expect(await contractForSeller.price()).to.deep.equal(price);
    });

    it('fails if odd amount is payed', async () => {
      await expect(deployContract(sellerWallet, Escrow, [], {value: doublePrice.sub(1)})).to.be.eventually.rejected;
    });
  });

  it('fails if the buyer pays a incorrect amount while confirming purchase', async () => {
    await expect(contractForBuyer.confirmPurchase({value: 0})).to.eventually.be.rejected;
    await expect(contractForBuyer.confirmPurchase({value: doublePrice.add(2)})).to.eventually.be.rejected;
    await expect(contractForBuyer.confirmPurchase({value: price})).to.eventually.be.rejected;
  });
});
