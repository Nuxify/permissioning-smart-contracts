import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Web3Service } from './web3.service';
import { environment } from '../environments/environment';
import { Node } from './node';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
    web3js: any;

    isQbftNetwork: any;
    currentAddress: any;

    allowedAccounts: string[];
    permissionedNodes: Node[];
    administrators: string[];

    constructor(private web3Service: Web3Service, private formBuilder: FormBuilder) {}

    addAccountForm = this.formBuilder.group({
        account: ''
    });

    addNodeForm = this.formBuilder.group({
        enode: '',
        host: '',
        port: ''
    });

    addAdminForm = this.formBuilder.group({
        admin: ''
    });

    connect() {
        this.web3Service.connectAccount().then(response => {
            this.web3js = response;

            this.isQbftNetwork = parseInt(environment.NETWORK_ID) == parseInt(this.web3js.currentProvider.networkVersion);
            if(this.isQbftNetwork) {
                this.doUpdates();
            }
            this.currentAddress = this.web3js.currentProvider.selectedAddress;

            this.web3js.currentProvider.on("chainChanged", (chainId: number) => {
                this.isQbftNetwork = parseInt(environment.NETWORK_ID) == parseInt(chainId.toString(), 16);
                if(this.isQbftNetwork) {
                    this.doUpdates();
                }
            });
            this.web3js.currentProvider.on("accountsChanged", (accounts: string[]) => {
                this.currentAddress = accounts[0];
            });

            this.setEventListeners();
        }).catch((error: any) => {
            console.error(error);
        });
    }

    private doUpdates() {
        this.updateAllowedAccounts();
        this.updatePermissionedNodes();
        this.updateAdministrators();
    }

    private async setEventListeners() {
        (await this.web3Service.accountAddedEvent()).on('data', (event) => {
            if (this.isQbftNetwork) this.updateAllowedAccounts();
        });
        (await this.web3Service.accountRemovedEvent()).on('data', (event) => {
            if (this.isQbftNetwork) this.updateAllowedAccounts();
        });

        (await this.web3Service.nodeAddedEvent()).on('data', (event) => {
            if (this.isQbftNetwork) this.updatePermissionedNodes();
        });
        (await this.web3Service.nodeRemovedEvent()).on('data', (event) => {
            if (this.isQbftNetwork) this.updatePermissionedNodes();
        });

        (await this.web3Service.adminAddedEvent()).on('data', (event) => {
            if (this.isQbftNetwork) this.updateAdministrators();
        });
        (await this.web3Service.adminRemovedEvent()).on('data', (event) => {
            if (this.isQbftNetwork) this.updateAdministrators();
        });
    }

    private async updateAllowedAccounts() {
        this.allowedAccounts = await this.web3Service.allowedAccounts();
    }

    addAccount() {
        this.web3Service.addAccount(this.addAccountForm.value.account);
        this.addAccountForm.reset();
    }

    removeAccount(account) {
        this.web3Service.removeAccount(account);
    }

    private async updatePermissionedNodes() {
        this.permissionedNodes = await this.web3Service.permissionedNodes();
    }

    addNode() {
        const nodeValue = this.addNodeForm.value;
        this.web3Service.addNode(nodeValue.enode, nodeValue.host, nodeValue.port);
        this.addNodeForm.reset();
    }

    removeNode(enode, host, port) {
        this.web3Service.removeNode(enode, host, port);
    }

    private async updateAdministrators() {
        this.administrators = await this.web3Service.administrators();
    }

    addAdmin() {
        this.web3Service.addAdmin(this.addAdminForm.value.admin);
        this.addAdminForm.reset();
    }

    removeAdmin(account) {
        this.web3Service.removeAdmin(account);
    }
}
