const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');

const provider = ganache.provider();
const web3 = new Web3(provider);

const {interface, bytecode} = require('../compile');


let lottery;
let accounts;

// beforeeach is a mocha function
// before 'it' is used 'beforeEach' is called
beforeEach(async() => {
  // get a list of all accounts
  accounts = await web3.eth.getAccounts();

  // use one of those accounts to deploy the contract
  lottery = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({data: bytecode })
    .send({from:accounts[0], gas: '1000000'});

  lottery.setProvider(provider);
});

// 'describe' is a mocha function
// 'describe' is used for grouping 'it' functions
// 'it' is the smallist unit of mocha unit test function
describe('Lottery Contract', () => {

  // checking whether a contract is deployed
  it('deploys a contrat', () => {
    assert.ok(lottery.options.address);
  });

  // checking multiple users are participated in the lottery
  it ('allows multiple accounts to enter', async ()=> {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei('0.02', 'ether')
    });
    await lottery.methods.enter().send({
      from: accounts[1],
      value: web3.utils.toWei('0.03', 'ether')
    });
    await lottery.methods.enter().send({
      from: accounts[2],
      value: web3.utils.toWei('0.05', 'ether')
    });

    const players = await lottery.methods.getPlayers().call({
      from: accounts[0]
    });

    assert.equal(accounts[0], players[0]);
    assert.equal(accounts[1], players[1]);
    assert.equal(accounts[2], players[2]);
    assert.equal(3, players.length);
  });

  // checking minimum ether is used to participate the lottery
  // intended to be failed
  it('require a minimum amount of ether to enter', async() => {

    try {
      await lottery.methods.enter.send({
        from: accounts[0],
        value:200
      });
      assert(false);
    } catch (err){
      assert.ok(err);
    }
  });

  // checking only manager can pick the pickWinner
  //intended to be failed
  it('only manager can call pickWinner', async() =>{
    try {
      await lottery.methods.pickWinner().send({
        from: accounts[1]
      });
      assert(false);
    } catch (err){
      assert.ok(err);
    }
  });

  // checking fully work of lottery
  it('sends money to the winner and resets the players array', async() => {

    // user enter the lottery with 2 ether
    await lottery.methods.enter().send({
      from: accounts[0],
      value : web3.utils.toWei('2', 'ether')
    });

    // getting users ether valance after participate the lottery
    const initialBalance = await web3.eth.getBalance(accounts[0]);

    // pick winner and distributed the ether to winner
    // since account[0] is only one and he/she is the manager he/she get the ether
    await lottery.methods.pickWinner().send({from : accounts[0]});

    // check the final balance of the winner
    const finalBalance = await web3.eth.getBalance(accounts[0]);

    // due to gass ussage the winner gets less than 2 ether
    // 1.8 is approx amount of ether
    const difference = finalBalance - initialBalance;
    console.log(difference);
    assert(difference > web3.utils.toWei('1.8','ether'));
  });
});
