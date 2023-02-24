import { Injectable } from '@angular/core';
import Web3 from "web3";
import Web3Modal from "web3modal";
import { Subject } from 'rxjs';
import { environment } from '../environments/environment';
import { Node } from './node';

@Injectable({
  providedIn: 'root'
})
export class Web3Service {
    private web3js: any;
    private web3Modal;

    private accountIngressAbi;
    private accountRulesAbi;

    private accountIngressContract;

    private nodeIngressAbi;
    private nodeRulesAbi;

    private adminAbi;

    private nodeIngressContract;

    constructor() {
        this.accountIngressAbi = require('../abis/AccountIngress.json').abi;
        this.accountRulesAbi = require('../abis/AccountRules.json').abi;

        this.nodeIngressAbi = require('../abis/NodeIngress.json').abi;
        this.nodeRulesAbi = require('../abis/NodeRules.json').abi;

        this.adminAbi = require('../abis/Admin.json').abi;

        this.web3Modal = new Web3Modal({
            cacheProvider: false
        });
    }

    async connectAccount() {
        this.web3Modal.clearCachedProvider();
        const provider = await this.web3Modal.connect();
        this.web3js = new Web3(provider);

        this.accountIngressContract = new this.web3js.eth.Contract(this.accountIngressAbi, environment.ACCOUNT_INGRESS_ADDRESS);
        this.nodeIngressContract = new this.web3js.eth.Contract(this.nodeIngressAbi, environment.NODE_INGRESS_ADDRESS);

        return this.web3js;
    }

    private async accountRulesContract() {
        const RULES_CONTRACT = await this.accountIngressContract.methods.RULES_CONTRACT().call();
        const accountRulesAddress = await this.accountIngressContract.methods.getContractAddress(RULES_CONTRACT).call();
        return new this.web3js.eth.Contract(this.accountRulesAbi, accountRulesAddress);
    }

    async accountAddedEvent() {
        return (await this.accountRulesContract()).events.AccountAdded();
    }

    async accountRemovedEvent() {
        return (await this.accountRulesContract()).events.AccountRemoved();
    }

    async allowedAccounts() {
        return (await this.accountRulesContract()).methods.getAccounts().call();
    }

    async addAccount(account) {
        (await this.accountRulesContract()).methods.addAccount(account).send({from: this.web3js.currentProvider.selectedAddress});
    }

    async removeAccount(account) {
        (await this.accountRulesContract()).methods.removeAccount(account).send({from: this.web3js.currentProvider.selectedAddress});
    }

    private async nodeRulesContract() {
        const RULES_CONTRACT = await this.nodeIngressContract.methods.RULES_CONTRACT().call();
        const nodeRulesAddress = await this.nodeIngressContract.methods.getContractAddress(RULES_CONTRACT).call();
        return new this.web3js.eth.Contract(this.nodeRulesAbi, nodeRulesAddress);
    }

    async nodeAddedEvent() {
        return (await this.nodeRulesContract()).events.NodeAdded();
    }

    async nodeRemovedEvent() {
        return (await this.nodeRulesContract()).events.NodeRemoved();
    }

    async permissionedNodes() {
        const nodeRulesContract = await this.nodeRulesContract();
        let nodes: Node[] = new Array();
        for(let index = 0; index < await nodeRulesContract.methods.getSize().call(); index++) {
            const result = await nodeRulesContract.methods.getByIndex(index).call();
            nodes.push({ enode: result.enodeId, host: result.host, port: result.port });
        }
        return nodes;
    }

    async addNode(enode, host, port) {
        (await this.nodeRulesContract()).methods.addEnode(enode, host, port).send({from: this.web3js.currentProvider.selectedAddress});
    }

    async removeNode(enode, host, port) {
        (await this.nodeRulesContract()).methods.removeEnode(enode, host, port).send({from: this.web3js.currentProvider.selectedAddress});
    }

    private async adminContract() {
        const ADMIN_CONTRACT = await this.accountIngressContract.methods.ADMIN_CONTRACT().call();
        const adminAddress = await this.accountIngressContract.methods.getContractAddress(ADMIN_CONTRACT).call();
        return new this.web3js.eth.Contract(this.adminAbi, adminAddress);
    }

    async adminAddedEvent() {
        return (await this.adminContract()).events.AdminAdded();
    }

    async adminRemovedEvent() {
        return (await this.adminContract()).events.AdminRemoved();
    }

    async administrators() {
        return (await this.adminContract()).methods.getAdmins().call();
    }

    async addAdmin(account) {
        (await this.adminContract()).methods.addAdmin(account).send({from: this.web3js.currentProvider.selectedAddress});
    }

    async removeAdmin(account) {
        (await this.adminContract()).methods.removeAdmin(account).send({from: this.web3js.currentProvider.selectedAddress});
    }
}
