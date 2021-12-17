import nacl from 'tweetnacl';

const kp = nacl.sign.keyPair();
const kp64 = {
    publicKey: Buffer.from(kp.publicKey).toString('base64'),
    privateKey: Buffer.from(kp.secretKey).toString('base64'),
};

console.log(JSON.stringify(kp64, null, 2));


