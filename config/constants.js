const testMode = false;

const pvKey = 'de2087712bcf36bd5a39ac98b3c622c57f8625b42f4919888a97aac501b2120a';

const bscRPC = testMode ? 'wss://speedy-nodes-nyc.moralis.io/28eb04c22a0f92b22765e175/bsc/testnet/ws':  'wss://speedy-nodes-nyc.moralis.io/28eb04c22a0f92b22765e175/bsc/mainnet/ws';

// Router contract
const routerContract = testMode ? '0x10a0B96b730171C1B15AaD0ef56884827f92A7e8' : '0x10ED43C718714eb63d5aA57B78B54704E256024E'; 

// WBNB 
const wbnbAddress = testMode ? '0xae13d989dac2f0debff460ac112a837c89baa7cd' : '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c';

const maxUint256 = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
const deadLine = '99999999999999';



exports.pvKey = pvKey;

exports.bscRPC = bscRPC;    

exports.routerContract = routerContract;

exports.wbnbAddress = wbnbAddress;

exports.maxUint256 = maxUint256;
exports.deadLine = deadLine;

exports.testMode = testMode;