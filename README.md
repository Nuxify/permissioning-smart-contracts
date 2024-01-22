# Permissioning Smart Contracts

## Audit
Version 1 of these contracts was audited by a third party. Read the report [here](https://consensys.net/diligence/audits/2019/08/pegasys-permissioning/)

## Production use
[Please contact us](https://consensys.net/quorum/contact-us) if you have questions. Additionally we would love to hear from you if you are considering using this implementation of onchain permissioning in a production environment.
## License
The contents of this repository are Apache 2.0 licensed.
**Important:** The dependency chain for this Dapp includes [web3js](https://github.com/ethereum/web3.js/) which is LGPL licensed.

## Using
You probably got here from Besu.
The [Besu documentation](https://besu.hyperledger.org/en/22.10.3/Tutorials/Permissioning/Getting-Started-Onchain-Permissioning/)
describes how to use the contracts for onchain permissioning with Besu.

We recommend you use the latest released version of this project.

## Deployment

### Compiling and deploying the contracts
1. The [Besu documentation](https://besu.hyperledger.org/en/stable/Tutorials/Permissioning/Getting-Started-Onchain-Permissioning/)
   describes how to use the contracts for onchain permissioning with Besu, including setting environment variables.
2. The following additional environment variables are optional and can be used to prevent redeployment of rules contracts. If set to true, that contract will not be redeployed and current list data will be preserved. If absent or not set to `true`, the specified contract will be redeployed. This allows you, for instance, to retain the Admin contract while redeploying NodeRules and AccountRules, or any other combination.
  - `RETAIN_ADMIN_CONTRACT=true`
  - `RETAIN_NODE_RULES_CONTRACT=true`
  - `RETAIN_ACCOUNT_RULES_CONTRACT=true`
3. The following additional environment variables are optional and can be used to permit accounts and nodes during initial contract deployment
  - `INITIAL_ADMIN_ACCOUNTS`: The admin account addresses. Comma-separated multiple addresses can be specified
  - `INITIAL_ALLOWLISTED_ACCOUNTS`: The permitted account addresses. Comma-separated multiple addresses can be specified
  - `INITIAL_ALLOWLISTED_NODES`: The enode URLs of permitted nodes. Comma-separated multiple nodes can be specified

After having created the `.env` file, in the base directory, we use the node 19 Docker container to deploy the already compiled contacts from the previous step with the following command:

```sh
docker run --rm --network=host --entrypoint=/bin/sh --workdir=/tmp/permissioning-smart-contracts --volume=$PWD:/opt/permissioning-smart-contracts node:19-alpine3.16 -c \
  "cp -r /opt/permissioning-smart-contracts/. .; \
   apk add --no-cache git && npm install --location=global truffle; \
   npm install; \
   truffle migrate --network qbft_network; \
   cp -fr dapp/src/abis /opt/permissioning-smart-contracts/dapp/src/"
```

### Deploying the Dapp

In the directory of the dapp

```sh
cd dapp/
```

we use the node 19 Docker container to generate the file of the dapp:

```sh
docker run --rm --entrypoint=/bin/sh --workdir=/tmp/dapp --volume=$PWD:/opt/dapp --env-file=dapp.env node:19-alpine3.16 -c \
  "cp -r /opt/dapp/. .; \
   npm install; \
   npm run build; \
   cp -Tr dist /opt/dapp/dist"
```

- **NOTE:** In the previous container we use the `dapp.env` file to pass address of the Acount Ingress contract, the address of the Node Ingress contract and the ID of the network.

We can serve the files of the dapp with

```sh
docker compose up -d
```

Served at port 3000 by default.
