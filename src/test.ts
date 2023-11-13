import { ApiPromise, Keyring, WsProvider } from "@polkadot/api";
import { u8aToHex } from '@polkadot/util';


async function main() {
    const wsProvider = new WsProvider('ws://127.0.0.1:9944');
    const types = {
        'PreSignedMintOf': {
            'class_id': 'u32',
            'token_id': 'Option<u64>',
            'attributes': 'BTreeMap<Vec<u8>, Vec<u8>>',
            'metadata': 'Vec<u8>',
            'only_account': 'Option<AccountId32>',
            'mint_price': 'Option<u128>',
        }
    }
    const api = await ApiPromise.create({ provider: wsProvider, types });
    console.log('Connecting to ws://127.0.0.1:9944 success!');

    const keyring = new Keyring({ type: 'sr25519' });
    const alice = keyring.addFromUri('//Alice');
    // const alice = keyring.addFromMnemonic("");
    console.log('Address: ' + alice.address);
    const nft = {
        "class_id": 2,
        "attributes": {},
        "metadata": "land_test_003",
    }

    const nftStruct = api.createType('PreSignedMintOf', nft);
    const serializedStruct = nftStruct.toU8a();
    console.log(u8aToHex(serializedStruct));

    const signature = alice.sign(serializedStruct, { withType: true }); // Sign with type sr25519
    const signatureHex = u8aToHex(signature);
    console.log(signatureHex);
    console.log(signature);
    console.log("signer: " + alice.address);

    // const bob = keyring.addFromUri('//Bob');
    // const tx = api.tx.nft.mintPreSigned(nft, hexToU8a(signatureHex), alice.address);
    // tx.signAndSend(bob, (data) => {
    //     showResult("MintPreSign", api, data);
    // });
}

main();