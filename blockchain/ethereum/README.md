## ⛓️ Ethereum (Ganache) Setup

```bash
ganache
```

In another terminal:
```bash
cd blockchain/ethereum
python
>>> from solcx import install_solc
>>> install_solc("0.8.0")
>>> exit()

python3 deploy_contract.py
```

Output will include:
```
Contract deployed at: 0xABC...
```

- Ganache is a personal Ethereum blockchain for development.

- It runs locally and gives you fake ETH and pre-funded test accounts.

- It allows you to deploy contracts, run transactions, and test logic instantly without spending real gas or interacting with live networks.