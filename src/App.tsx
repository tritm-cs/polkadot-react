import { ApiManager } from '@metaverse-network-sdk/api';
import { NFT } from '@metaverse-network-sdk/sdk-nft';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { web3Accounts, web3Enable, web3FromAddress, web3FromSource } from '@polkadot/extension-dapp';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { KeyringPair$Meta } from '@polkadot/keyring/types';
import keyring from "@polkadot/ui-keyring";
import { hexToU8a, stringToHex, stringToU8a, u8aToHex, u8aToString } from "@polkadot/util";
import React, { ChangeEvent, useEffect, useState } from 'react';
import { showResultTransaction } from './utils';

const RPC_ENDPOINT = "ws://127.0.0.1:9944";
const NAME_APP = "ken truong";
const KEY_PRE_SIGNED_MINT = 'PreSignedMint';
const TYPE_PRE_SIGNED_MINT = {
  'class_id': 'u32',
  'token_id': 'Option<u64>',
  'attributes': 'BTreeMap<Vec<u8>, Vec<u8>>',
  'metadata': 'Vec<u8>',
  'only_account': 'Option<AccountId32>',
  'mint_price': 'Option<u128>',
}

function App() {
  const [api, setApi] = useState<ApiPromise>();
  const [nftApi, setNftApi] = useState<NFT>();
  const [accounts, setAccounts] = useState<InjectedAccountWithMeta[]>([]);
  const [selectAccount, setSelectAccount] = useState<InjectedAccountWithMeta>();
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState(false);
  const [lstKeyring, setLstKeyring] = useState();

  const setup = async () => {
    // const provider = new WsProvider(RPC_ENDPOINT);
    // const apiPromise = await ApiPromise.create({
    //   provider, types: {
    //     [KEY_PRE_SIGNED_MINT]: TYPE_PRE_SIGNED_MINT
    //   }
    // });
    // await apiPromise?.isReady;
    // setApi(apiPromise);

    const apiManager = await ApiManager.create({ wsEndpoint: RPC_ENDPOINT });
    const nftApiInit = new NFT(apiManager);

    const types = {
      [KEY_PRE_SIGNED_MINT]: TYPE_PRE_SIGNED_MINT
    }
    apiManager.api.registerTypes(types);
    setApi(apiManager.api);
    // setApi(apiPromise);
    setNftApi(nftApiInit);
  }

  const connectWallet = async () => {
    const extension = await web3Enable(NAME_APP);

    if (!extension) {
      throw new Error(`Extension not found!`);
    }

    const allAccounts = await web3Accounts();
    // const data = await web3Accounts();
    setAccounts(allAccounts);
    if (allAccounts.length > 0) {
      const allAccountsKeyring = allAccounts.map(({ address, meta }) => ({
        address,
        meta: { ...meta, name: `${meta.name} (${meta.source})` } as KeyringPair$Meta,
        key: address,
        text: `${meta.name} (${meta.source})`,
        pair: { source: meta.source },
      }));
      keyring.loadAll({ isDevelopment: false }, allAccountsKeyring);
    }

    if (allAccounts.length === 1) {
      setSelectAccount(allAccounts[0]);
    }
  }

  const changeAccount = async (e: ChangeEvent<HTMLSelectElement>) => {
    const selectedAddress = e.target.value;

    const account = accounts.find(
      (account) => account.address === selectedAddress
    );

    if (!account) {
      throw new Error(`NO_ACCOUNT_FOUND`);
    }
    setSelectAccount(account);
  }

  const createCollection = async () => {
    if (!api) return;

    if (!selectAccount) return;


    const metadata = "QmZLV7dfRtSQ3kVre9EVxmCQZmgT99Z6WGBATTqyrxUE7t";
    const collectionId = 0;
    const royalty = 1;
    const limit = 100;

    // Using with polkadot
    // const injector = await web3FromAddress(selectAccount.address);
    // const tx = api.tx.nft.createClass(metadata, null, collectionId, 0, 0, royalty, limit);

    // await tx.signAndSend(selectAccount.address, { signer: injector.signer }, (data) => {
    //   showResultTransaction('MintCollection', api, data);
    // }).catch((err) => {
    //   console.log(err);
    // });

    // Using with sdk-nft from metaverse-network
    const accountPair = keyring.getPair(selectAccount.address);
    console.log(accountPair);
    await nftApi?.createNFTCollection(
      metadata,
      null,
      collectionId,
      0,
      0,
      royalty,
      limit,
      setIsLoading,
      setStatus,
      { account: accountPair, waitToFinalized: false }
    );
  }

  const signNft = async () => {
    if (!api) return;

    if (!selectAccount) return;

    const nft = {
      class_id: 2,
      attributes: {},
      metadata: 'test_002',
    }


    const nftStruct = api.createType(KEY_PRE_SIGNED_MINT, nft);
    const serializedStruct = nftStruct.toU8a();

    // const accountPair = keyring.getPair(selectAccount.address);
    // const injector = await web3FromSource(selectAccount.meta.source);
    const injector = await web3FromAddress(selectAccount.address);
    const signRaw = injector?.signer?.signRaw;
    if (signRaw) {
      const { signature } = await signRaw({
        address: selectAccount.address,
        data: u8aToHex(serializedStruct),
        // data: stringToHex(JSON.stringify(nft)),
        type: 'bytes'
      });

      console.log(stringToU8a(signature));
      console.log(u8aToString(stringToU8a(signature)));
      console.log(signature);
    }
  }


  //     const injector = await web3FromSource(targetDotAddress.meta.source)
  //       const signRaw = injector?.signer?.signRaw
  //       const { signature } = await signRaw({
  //         address: targetDotAddress.address,
  //         data: stringToHex('I\'m verifying my DOT address'),
  //         type: 'bytes'
  //  })

  //   const accountPair = keyring.getPair(selectAccount.address);

  //   const nftStruct = api.createType(KEY_PRE_SIGNED_MINT, nft);
  //   const serializedStruct = nftStruct.toU8a();

  //   const signature = accountPair.sign(serializedStruct, { withType: true });
  //   console.log(u8aToHex(signature));
  // }

  const mintPreSigned = async () => {
    if (!api) return;

    if (!selectAccount) return;


    const nft = {
      class_id: 2,
      attributes: {},
      metadata: 'test_002',
    }
    const preSignature = "0x9815cd3c135dc3b2aebf9bfa18d6b7ac94c3ee309e440b4bdba6ef47aa3fef75207723a943647673fce4bbb666a945eda3fe0b7c3ee1089d83098f8505161f89";
    const signerAddress = "5G1d2aQY8GkoDLevESg6CsJVxgrEoLHSJ9tGGFYVH4reWTBo";
    // const injector = await web3FromAddress(selectAccount.address);
    // const tx = api.tx.nft.mintPreSigned(nft, hexToU8a(preSignature), signerAddress);
    // // const tx = api.tx.nft.mintPreSigned(nft, preSignature, signerAddress);
    // await tx.signAndSend(selectAccount.address, { signer: injector.signer }, (data) => {
    //   showResultTransaction("MintPreSign", api, data);
    // });

    const accountPair = keyring.getPair(selectAccount.address);
    const result = await nftApi?.mintPresignedNFT(
      nft,
      preSignature,
      signerAddress,
      setIsLoading,
      setStatus,
      { account: accountPair, waitToFinalized: false }
    );
    await result.send;
    const finalizedResult = await result.inBlock;
    for (let [index, { event: { method, hash, section } }] of finalizedResult.events.entries()) {
      console.log(index);
      console.log(method + " " + section);
    }
  }

  useEffect(() => {
    setup();
  }, []);

  useEffect(() => {
    if (!api) return;

    (async () => {
      const time = await api.query.timestamp.now();

      console.log(time.toPrimitive());
    })();
  }, [api]);

  return (
    <div>
      {accounts.length === 0 ? (
        <button
          onClick={connectWallet}
        >
          Connect Wallet
        </button>
      ) : null}

      {accounts.length > 0 && !selectAccount ? (
        <>
          <select onChange={changeAccount}>
            <option value={""} disabled selected hidden>Choose your account!</option>
            {accounts.map((account) => (
              <option value={account.address}>
                {account.meta.name || account.address}
              </option>
            ))}
          </select>
        </>
      ) : null}

      {/* {selectAccount ? selectAccount.address : null} */}
      {selectAccount ? (
        <div>
          <button
            onClick={createCollection}
          >
            Mint Collection
          </button>

          <button
            onClick={signNft}
          >
            Sign Pre Mint
          </button>

          <button
            onClick={mintPreSigned}
          >
            Mint Pre Sign
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default App;
