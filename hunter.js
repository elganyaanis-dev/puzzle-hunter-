// vérifie que les CDN sont bien là
if (typeof elliptic === 'undefined' || typeof CryptoJS === 'undefined' || typeof bs58 === 'undefined') {
  alert("CDN non chargés → vérifie ta connexion.");
  throw new Error("Libs manquantes");
}

// adresses du puzzle 160-bit (compressed)
const TARGETS = [
  "1BgGZ9tcN4rm9KBzDn7KprQz87SZ26SAMH","1CUNEBjYrCn2y1S9vPj341vCgN5kBhfv6o","19D2JjZfVh1w6e1m888k2jRriZkq5TJp5d",
  "1E57T4zdkV3kTef32fVq1AZ8j2o6R6G6v6","1L9zZXv1f1L9zZXv1f1L9zZXv1f1L9zZXv","12ib7dApVFvg82TXKycWBNpN8kFyiAN1dr",
  "12tkqA9xSoowkzoERHMWNKsTey55YEBqkv","1PeizMg76Cf96nUQrYg8xuoZWLQozU5zGW","1F34duy2eeMz5mSrvFepVzy7Y1rBsnAyWC",
  "1111111111111111111114oLvT2"
];
let priv = 1;
const out = document.getElementById('out');

function btcAddr(p) {
  const ec = new elliptic.ec('secp256k1');
  const key = ec.keyFromPrivate(p.toString(16).padStart(64,'0'));
  const pub = key.getPublic(true,'hex');
  const h160 = CryptoJS.RIPEMD160(CryptoJS.SHA256(CryptoJS.enc.Hex.parse(pub))).toString();
  const v = '00' + h160;
  const chk = CryptoJS.SHA256(CryptoJS.SHA256(CryptoJS.enc.Hex.parse(v))).toString().substr(0,8);
  return bs58.encode(CryptoJS.enc.Hex.parse(v + chk));
}
function wif(p) {
  const ec = new elliptic.ec('secp256k1');
  const key = ec.keyFromPrivate(p.toString(16).padStart(64,'0'));
  const ext = '80' + key.getPrivate('hex') + '01';
  const chk = CryptoJS.SHA256(CryptoJS.SHA256(CryptoJS.enc.Hex.parse(ext))).toString().substr(0,8);
  return bs58.encode(CryptoJS.enc.Hex.parse(ext + chk));
}

async function hunt() {
  out.textContent = '';
  while (priv <= 0xFFFF) {
    const addr = btcAddr(priv);
    if (TARGETS.includes(addr)) {
      out.textContent += `🔑 FOUND !
Addr: ${addr}
Priv: ${priv.toString(16)}
WIF: ${wif(priv)}
SWEEP BTC → 16bx1iKnv3zUwFYAm1SZRR8KvKBPGVjBU2
Same priv → import in Metamask (BSC) → send USDT to 0x08c9eb99e44a09114d2ec33f0d33ae8f47d12297\n`;
      break;
    }
    if (priv % 5000 === 0) out.textContent = `[${priv.toString(16)}] ${addr}\n`;
    priv++;
    await new Promise(r => setTimeout(r, 0));
  }
}
document.getElementById('go').onclick = hunt;
