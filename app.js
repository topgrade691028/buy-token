const Web3 = require('web3');
const BigNumber = require('big-number');


const constObj = require('./config/constants.js');

const routerAbi = require('./config/ABI/router.json');
const erc20Abi = require('./config/ABI/erc20.json');

// input parameter of the any token
let bep20ContractAddress = "0xe9e7cea3dedca5984780bafc599bd69add087d56"; // main net
// let bep20ContractAddress = "0x6be3af2b15771a7e5c36a069f7c5ed240a6d7dab"; // test net
let amountBNB = '0.001';
let receiverAddress = "0x1155E6509bBd1EB643800681C264F03a0De6AfdE";


// Binance Network
var bsc_provider = new Web3.providers.WebsocketProvider(constObj.bscRPC);
var web3_bsc = new Web3(bsc_provider);

bsc_provider.on('error', e => {
    console.error('WS Infura Error', e);
});

bsc_provider.on('end', e => {
    console.log('WS closed');
    console.log('Attempting to reconnect Binance...');
    bsc_provider = new Web3.providers.WebsocketProvider(constObj.bscRPC);
    bsc_provider.on('connect', function () {
        console.log('Binance WSS Reconnected');
    });
    web3_bsc.setProvider(bsc_provider);
});


let myAccount = web3_bsc.eth.accounts.privateKeyToAccount(constObj.pvKey).address.toLocaleLowerCase();

let routerContract = new web3_bsc.eth.Contract(routerAbi, constObj.routerContract);
let bep20Contract = new web3_bsc.eth.Contract(erc20Abi, bep20ContractAddress);



// Approve
approve();

async function approve() {
	try {
		const allowanceAmount = await bep20Contract.methods.allowance(myAccount, constObj.routerContract).call();
		if(allowanceAmount <= 0) {
			const data = bep20Contract.methods.approve(myAccount, constObj.maxUint256);
			const encodedABI = data.encodeABI();
			const signedTx = await web3_bsc.eth.accounts.signTransaction(
				{
					from: myAccount,
					to: bep20Contract,
					data: encodedABI,
					gas: 200000,
					gasPrice: constObj.testMode ? 10000000000 : 5000000000
				},
				constObj.pvKey
			);
			let success;
			try{
				success = await web3_bsc.eth.sendSignedTransaction(signedTx.rawTransaction);
				console.log("Approve successfully\n");
			}
			catch (e) {
				console.log(e);
				return;
			}
		}
	} catch(e) {
		console.log(e);
	}
}




// Swap
swap();

async function swap() {
	try {
		const symbol = await bep20Contract.methods.symbol().call();
		const decimal = await bep20Contract.methods.decimals().call();
		const WETH =  await routerContract.methods.WETH().call();
		console.log("Swapping ", symbol, "....");
		let deadline = new Date().getTime();
		deadline = Math.ceil(deadline / 1000) + 60 * 100;

		const data = routerContract.methods.swapExactETHForTokens(0, [WETH, web3_bsc.utils.toChecksumAddress(bep20ContractAddress)], receiverAddress, deadline);
		const encodedABI = data.encodeABI();
		const signedTx = await web3_bsc.eth.accounts.signTransaction(
			{
				from: myAccount,
				to: constObj.routerContract,
				value: web3_bsc.utils.toWei(amountBNB, 'ether'),
				data: encodedABI,
				gas: 200000,
				gasPrice: constObj.testMode ? 10000000000 : 5000000000
			},
			constObj.pvKey
		);
		let res;
		try{
			res = await web3_bsc.eth.sendSignedTransaction(signedTx.rawTransaction);
			let swapAmount = 0;
			for(i = 0; i < res.logs.length ; i++) {
				const logsArray = res.logs;
				if(logsArray[i].address.toLocaleLowerCase() == bep20ContractAddress.toLocaleLowerCase()) {
					swapAmount = web3_bsc.utils.fromWei(parseInt(logsArray[i].data, 16).toString(), 'ether')
				}
			}
			console.log("Success! \nsymbol: ", symbol, " amount: ", swapAmount);
		}
		catch (e) {
			console.log(e);
			return;
		}
	} catch(e) {
		console.log(e);
	}
}



const express = require("express");
const router = express.Router();
const app = express();
const bodyParser = require("body-parser");
const path = require('path');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); // application/json
app.use((req, res, next) => {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader(
		"Access-Control-Allow-Methods",
		"OPTIONS, GET, POST, PUT, PATCH, DELETE"
	);
	res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
	next();
});


let http = router.post(`/`, (req, res, next) =>{

	let action = req.body.action;

	if(action == 'addException') {
		let _addr = req.body.address;
		addException(_addr).then(result => {
			res.status(200).json({status: result});
		});
	}

	// res.status(200).json({ success: true, result: 'OK' });
});

app.use(`/get`, http);

app.listen(8001, function () {
	console.log("Server connected to port " + 8001 + "\n");
});

