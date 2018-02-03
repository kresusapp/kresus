import should from "should";
import {
  addAccess,
  removeAccess,
  updateAccessInternal,
  addAccounts,
  removeAccount,
  updateAccountInternal,
  addOperation,
  removeOperation,
  updateOperationInternal
} from "../client/store/banks.js";
import { get } from "../client/store";
import banks from "../shared/banks.json";

import { setupTranslator } from "../client/helpers";
const dummyState = {
  accessIds: [],
  accessesMap: {},
  alerts: [],
  banks,
  constants: {
    defaultCurrency: "EUR"
  }
};

const dummyAccess = {
  id: "1",
  bank: "fakebank1",
  enabled: true,
  login: "login",
  customFields: []
};

const dummyAccount = {
  id: "account1",
  bankAccess: "1",
  accountNumber: "#1",
  lastChecked: new Date(),
  initialAmount: 1000,
  title: "My Account",
  bank: "fakebank1"
};

const dummyOperation = {
  id: "operation1",
  bankAccount: dummyAccount.accountNumber,
  amount: 500,
  type: "type.unknown",
  raw: "Dummy operation",
  title: "Dummy Op.",
  date: new Date()
};

describe("Access management", () => {
  describe("Access creation", () => {
    it("the access should be added to the store", () => {
      let newState = addAccess(dummyState, dummyAccess);
      get.accessIds({ banks: newState }).should.containEql(dummyAccess.id);
      let access = get.accessById({ banks: newState }, dummyAccess.id);
      should.deepEqual(access.customFields, []);
      should.deepEqual(access.accountIds, []);
      should.equal(access.id, dummyAccess.id);
      should.equal(access.bank, dummyAccess.bank);
      should.equal(access.enabled, dummyAccess.enabled);
      should.equal(access.login, dummyAccess.login);
    });
  });
  describe("Access deletion", () => {
    it("The access should be deleted from the store", () => {
      // First we create an access.
      let newState = addAccess(dummyState, dummyAccess);
      let access = get.accessById({ banks: newState }, dummyAccess.id);
      get.accessIds({ banks: newState }).should.containEql(dummyAccess.id);
      should.equal(access.id, dummyAccess.id);
      newState = removeAccess(newState, dummyAccess.id);
      // Ensure the access id deleted.
      should.equal(get.accessById({ banks: newState }, dummyAccess.id), null);
      get.accessIds({ banks: newState }).should.not.containEql(dummyAccess.id);
    });
    it("All attached accounts should be deleted from the store", () => {
      let newState = addAccess(dummyState, dummyAccess);
      newState = addAccounts(newState, dummyAccount);
      get
        .accountById({ banks: newState }, dummyAccount.id)
        .should.not.equal(null);
      newState = removeAccess(newState, dummyAccess.id);
      should.equal(get.accountById({ banks: newState }, dummyAccount.id), null);
    });
  });
  describe("Access update", () => {
    it("The access should be updated in the store", () => {
      // First we create an access.
      let newState = addAccess(dummyState, dummyAccess);
      let access = get.accessById({ banks: newState }, dummyAccess.id);
      get.accessIds({ banks: newState }).should.containEql(dummyAccess.id);
      should.equal(access.id, dummyAccess.id);
      newState = updateAccessInternal(newState, dummyAccess.id, { login: "newlogin" });
      access = get.accessById({ banks: newState }, dummyAccess.id);
      access.login.should.equal("newlogin");
    });
  });
});
describe("Account management", () => {
  const state = {
    accessIds: ["1"],
    accessesMap: {
      "1": {
        id: "1",
        bank: "fakebank1",
        enabled: true,
        login: "login",
        customFields: [],
        accountIds: []
      }
    },
    banks,
    alerts:[],
    constants: {
      defaultCurrency: "EUR"
    }
  };

  const dummyAccount2 = {
    id: "account2",
    bankAccess: "1",
    accountNumber: "#2",
    lastChecked: new Date(),
    initialAmount: 500,
    title: "My Other Account",
    bank: "fakebank1"
  };
  describe("Account creation", () => {
    describe("single account addition", () => {
      let newState = addAccounts(state, dummyAccount);
      let account = get.accountById({ banks: newState }, dummyAccount.id);
      it("The account should be in the store", () => {
        account.id.should.equal(dummyAccount.id);
        account.initialAmount.should.equal(dummyAccount.initialAmount);
        // No attached operation
        account.bankAccess.should.equal(dummyAccount.bankAccess);
      });
      it("The account balance should be the initialAmount, as no operation is attached to the account", () => {
        account.balance.should.equal(dummyAccount.initialAmount);
      });
      it("The account should be added to its access's account's list", () => {
        let access = get.accessById(
          { banks: newState },
          dummyAccount.bankAccess
        );
        access.accountIds.should.containEql(dummyAccount.id);
      });
    });
    describe("multiple account addition", () => {
      // Setting the translator is necessary to allow account sorting.
      setupTranslator("en");
      let newState = addAccounts(state, [dummyAccount, dummyAccount2]);
      let account = get.accountById({ banks: newState }, dummyAccount.id);
      let account2 = get.accountById({ banks: newState }, dummyAccount2.id);
      it("Both accounts should be in the store", () => {
        account.should.not.equal(null);
        account.title.should.equal(dummyAccount.title);
        account2.should.not.equal(null);
        account2.title.should.equal(dummyAccount2.title);
      });
      it("Both accounts should be in their access's list", () => {
        let access = get.accessById(
          { banks: newState },
          dummyAccount.bankAccess
        );
        access.accountIds.should.containEql(dummyAccount.id);
        access.accountIds.should.containEql(dummyAccount2.id);
      });
    });
  });
  describe("Account deletion", () => {
    describe("Delete the last account of an access", () => {
      let newState = addAccounts(state, dummyAccount);
      let account = get.accountById({ banks: newState }, dummyAccount.id);
      let access = get.accessById({ banks: newState }, dummyAccount.bankAccess);

      it("The account should be deleted from the store", () => {
        // First ensure the account is correctly added in the store
        account.id.should.equal(dummyAccount.id);
        access.accountIds.should.containEql(dummyAccount.id);
        newState = removeAccount(newState, dummyAccount.id);
        account = get.accountById({ banks: newState }, dummyAccount.id);
        should.equal(account, null);
      });
      it("The access to which the account was attached is removed from the store, as there is no more account attached to it", () => {
        access = get.accessById({ banks: newState }, dummyAccount.bankAccess);
        should.equal(access, null);
      });
    });
    describe("An account remains attached to the deleted account's access after the account deletion", () => {
      // Setting the translator is necessary to allow account sorting.
      setupTranslator("en");
      let newState = addAccounts(state, [dummyAccount, dummyAccount2]);
      let account = get.accountById({ banks: newState }, dummyAccount.id);
      let account2 = get.accountById({ banks: newState }, dummyAccount2.id);
      it("The account should be removed from the store, and its access should still be in the store, ", () => {
        account.should.not.equal(null);
        account.title.should.equal(dummyAccount.title);
        account2.should.not.equal(null);
        account2.title.should.equal(dummyAccount2.title);
        newState = removeAccount(newState, dummyAccount.id);
        account = get.accountById({ banks: newState }, dummyAccount.id);
        should.equal(account, null);
        let access = get.accessById(
          { banks: newState },
          dummyAccount.bankAccess
        );
        access.should.not.equal(null);
        access.accountIds.should.not.containEql(dummyAccount.id);
        access.accountIds.should.containEql(dummyAccount2.id);
      });
    });
    describe("Deleting an account also deletes all the attached operations", () => {
      let newState = addAccounts(state, dummyAccount);
      newState = addOperation(newState, dummyOperation);
      let operation = get.operationById({ banks: newState }, dummyOperation.id);
      // First ensure the operation is in the store.
      operation.should.not.equal(null);

      newState = removeAccount(newState, dummyAccount.id);

      // Now check the operation is deleted.
      operation = get.operationById({ banks: newState }, dummyOperation.id);
      should.equal(operation, null);
    });
  });
  describe("Account update", () => {
    it("The account should be updated", () => {
      let newState = addAccounts(state, dummyAccount);
      let account = get.accountById({ banks: newState }, dummyAccount.id);
      account.should.not.equal(null);
      newState = updateAccountInternal(newState, dummyAccount.id, { initialAmount: 0 });
      account = get.accountById({ banks: newState }, dummyAccount.id);
      account.initialAmount.should.equal(0);
    });
  });
});
describe("Operation management", () => {
  const state = {
    accessIds: ["1"],
    accessesMap: {
      "1": {
        ...dummyAccess,
        accountIds: ["account1"]
      }
    },
    accountsMap: {
      account1: {
        ...dummyAccount,
        balance: dummyAccount.initialAmount,
        operationIds: []
      }
    },
    banks,
    constants: {
      defaultCurrency: "EUR"
  },
  alerts:[]
  };

  describe("Add operation", () => {
    let newState = addOperation(state, dummyOperation);
    let operation = get.operationById({ banks: newState }, dummyOperation.id);

    it("The operation should be added to the store", () => {
      operation.should.not.equal(null);
      operation.amount.should.equal(dummyOperation.amount);
      operation.type.should.equal(dummyOperation.type);
      operation.title.should.equal(dummyOperation.title);
      operation.id.should.equal(dummyOperation.id);
      operation.date.toString().should.equal(dummyOperation.date.toString());
    });
    let opIds = get.operationIdsByAccountId({ banks: newState }, dummyAccount.id);
    let account = get.accountById({ banks: newState }, dummyAccount.id);

    it("The operation should be added to the accounts operations and the balance should be updated", () => {
      opIds.should.containEql(dummyOperation.id);
      account.balance.should.equal(
        dummyAccount.initialAmount + dummyOperation.amount
      );
    });
  });
  describe("Update operation", () => {
    let newState = addOperation(state, dummyOperation);
    let operation = get.operationById({ banks: newState }, dummyOperation.id);
    it("The operation should be updated", () => {
      // First ensure the operation exists
      operation.should.not.equal(null);
      newState = updateOperationInternal(newState, dummyOperation.id, {
        type: "type.card"
      });
      operation = get.operationById({ banks: newState }, dummyOperation.id);
      operation.type.should.not.equal(dummyOperation.type);
      operation.type.should.equal("type.card");
      newState = updateOperationInternal(newState, dummyOperation.id, {
        customLabel: "Custom Label"
      });
      operation = get.operationById({ banks: newState }, dummyOperation.id);
      operation.customLabel.should.equal("Custom Label");
    });
  });
  describe("Delete operation", () => {
    let newState = addOperation(state, dummyOperation);
    let operation = get.operationById({ banks: newState }, dummyOperation.id);
    it("The operation should be deleted and be removed of the list of operations of the according account and the balance should be updated", () => {
      // First ensure the operation exists and is in the operation list.
      operation.should.not.equal(null);
      let accountIds = get.operationIdsByAccountIds(
        { banks: newState },
        dummyAccount.id
      );
      accountIds.should.containEql(dummyOperation.id);

      newState = removeOperation(newState, dummyOperation.id);
      // Check operations map.
      operation = get.operationById({ banks: newState }, dummyOperation.id);
      should.equal(operation, null);
      // Check account's operation list.
      accountIds = get.operationIdsByAccountIds(
        { banks: newState },
        dummyAccount.id
      );
      accountIds.should.not.containEql(dummyOperation.id);
      // Check balance.
      let account = get.accountById({ banks: newState }, dummyAccount.id);
      account.balance.should.equal(account.initialAmount);
    });
  });
});
