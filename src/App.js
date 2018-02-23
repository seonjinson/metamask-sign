import React, { Component } from 'react';
import { default as Web3 } from 'web3';
import { default as Eth } from 'ethjs';
import { default as sigUtil } from 'eth-sig-util';
import { default as ethUtil } from 'ethereumjs-util';
import swal from 'sweetalert';
let _web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

class App extends Component {
  constructor(props){
    super(props);
    this.state={
      address:''
    }
   
  }

  componentWillMount() {
    const text ='<Wallet Address Authentication> \n\ Press the sign button to authenticate the address...';
    this.setState({
      msg : ethUtil.bufferToHex(new Buffer(text,'utf8'))
    })
  }

  getAddress = async()=>{
    if(typeof _web3.eth.accounts.givenProvider.publicConfigStore._state.selectedAddress === 'undefined'){
    
      swal({
        title: "Please check metamask",
        text: "Please unlock metamask or create account or import account",
        icon: "warning",
        buttons: true,
      }) 
    }else{
      const address = await _web3.eth.accounts.givenProvider.publicConfigStore._state.selectedAddress
      this.setState({
        address
      })
    }
  }

  hanldeSign=async()=>{
    // const msgParams = [
    //   {
    //     type: 'string',
    //     name: 'Message',
    //     value: 'Hi, Alice!'
    //   },
    //   {
    //     type: 'uint32',
    //     name: 'A number',
    //     value: '1337'
    //   }
    // ]
    console.log('CLICKED, SENDING PERSONAL SIGN REQ')
    const msg = this.state.msg
    let from = this.state.address
    let params = [msg, from]
    const method = 'personal_sign'
    // let params = [msgParams, from]
    // const method = 'eth_signTypedData'
    
    Web3.givenProvider.sendAsync({
      method,
      params,
      from,
    }, (err, result) => {
      if (err) return console.error(err)
      if (result.error) return console.error(result.error)
      console.log('PERSONAL SIGNED:' + JSON.stringify(result.result))
  
      const msgParams = { data: msg }
      msgParams.sig = result.result
      const recovered = sigUtil.recoverPersonalSignature(msgParams)
  
      if (recovered === from.toLowerCase() ) {
        const resultMessage = 'SigUtil Successfully verified signer as';
        const signer = from;
        console.log(resultMessage+signer)
        this.setState({
          account:from
        })
        return signer
      } else {
        console.dir(recovered)
        console.log('SigUtil Failed to verify signer when comparing ' + recovered.result + ' to ' + from)
        console.log('Failed, comparing %s to %s', recovered, from)
      }}
    )
  }
  
  hanldeClick = async()=>{
    if (typeof web3 !== 'undefined') {
      await this.getAddress();
      console.log(this.state.address)
      console.log("provider is available");
     (this.state.address !== '' ? this.hanldeSign(): console.log("Not found account") )
      
      
    } else {
      console.log("provider is not available");

        swal({
          title: "You need to install metamask",
          text: "Move to install",
          icon: "warning",
          buttons: true,
        })
      .then((willmove) => {
        if(willmove){
          window.open(
            'https://metamask.io/',
            '_blank'
          )
        }else{
          ;
        } 
      })
      }

   
   
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
        <button onClick={this.hanldeClick}>Signing</button>
        {/* <button onClick={this.hanldeSignEth}>SignEth</button> */}
        <p>Address:{this.state.account}</p>
      </div>
    );
  }
}

export default App;
