const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');
const { interface, bytecode } = require('./compile');

const provider = new HDWalletProvider(
  'vessel neutral artwork crane hero hammer gravity auto party sudden myself alien',
  'https://rinkeby.infura.io/aKl1Ey5vmdHxGQjz7RnS'
);
const web3 = new Web3(provider);

const deploy = async () => {
  const accounts = await web3.eth.getAccounts();

  console.log('attempting to deploy from account', accounts[0]);

  const result = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({data: '0x' + bytecode })
    .send({gas: '1000000', from: accounts[0]});

  console.log('Contrat deployed to ', result.options.address);
};
deploy();
