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

## Compiling

In the base directory we use the node 19 Docker container to compile the smart contracts. Run the following command and wait until it ends:

```sh
docker run --rm --entrypoint=/bin/sh --workdir=/tmp/permissioning-smart-contracts --volume=$PWD:/opt/permissioning-smart-contracts node:19-alpine3.16 -c \
  "cp -r /opt/permissioning-smart-contracts/. .; \
   apk add --no-cache git &>/dev/null && npm install --location=global truffle &>/dev/null; \
   npm install &>/dev/null; \
   truffle compile &>/dev/null; \
   tar -cf abis.tar abis/ && cat abis.tar" | tar xf -
```

This will generate the output in the `abis` directory.

## Deployment

### Deploying the contracts
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
   truffle migrate --compile-none --network qbft_network"
```

### Deploying the Dapp
1. Obtain the most recent release (tarball or zip) from the [projects release page](https://github.com/ConsenSys/permissioning-smart-contracts/releases/latest)
2. Unpack the distribution into a folder that will be available to your webserver
3. Add to the root of that folder a file `config.json` with the following contents

_Note: The `networkID` is defined as the `chainID` in the genesis file._
```
{
        "accountIngressAddress":  "<Address of the account ingress contract>",
        "nodeIngressAddress": "<Address of the node ingress contract>",
        "networkId": "<ID of your ethereum network>"
}
```
4. Use a webserver of your choice to host the contents of the folder as static files directing root requests to `index.html`
