import should from "should";
import {
  addAccess,
  removeAccess,
  updateAccess,
  addAccounts,
  removeAccount,
  updateAccount
} from "../client/store/banks.js";
import { get } from "../client/store";
import banks from "../shared/banks.json";

import { setupTranslator } from "../client/helpers";
const dummyState = {
  accesses: [],
  accessesMap: {},
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

describe("Access management", () => {
  describe("Access creation", () => {
    it("the access should be added to the store", () => {
      let newState = addAccess(dummyState, dummyAccess);
      get.accesses({ banks: newState }).should.containEql(dummyAccess.id);
      let access = get.accessById({ banks: newState }, dummyAccess.id);
      should.deepEqual(access.customFields, []);
      should.deepEqual(access.accounts, []);
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
      get.accesses({ banks: newState }).should.containEql(dummyAccess.id);
      should.equal(access.id, dummyAccess.id);
      newState = removeAccess(newState, dummyAccess.id);
      // Ensure the access id deleted.
      should.equal(get.accessById({ banks: newState }, dummyAccess.id), null);
      get.accesses({ banks: newState }).should.not.containEql(dummyAccess.id);
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
      get.accesses({ banks: newState }).should.containEql(dummyAccess.id);
      should.equal(access.id, dummyAccess.id);
      newState = updateAccess(newState, dummyAccess.id, { login: "newlogin" });
      access = get.accessById({ banks: newState }, dummyAccess.id);
      access.login.should.equal("newlogin");
    });
  });
});
describe("Account management", () => {
  const state = {
    accesses: ["1"],
    accessesMap: {
      "1": {
        id: "1",
        bank: "fakebank1",
        enabled: true,
        login: "login",
        customFields: [],
        accounts: []
      }
    },
    banks,
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
        access.accounts.should.containEql(dummyAccount.id);
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
        access.accounts.should.containEql(dummyAccount.id);
        access.accounts.should.containEql(dummyAccount2.id);
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
        access.accounts.should.containEql(dummyAccount.id);
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
        access.accounts.should.not.containEql(dummyAccount.id);
        access.accounts.should.containEql(dummyAccount2.id);
      });
    });
  });
  describe("Account update", () => {
    it("The account should be updated", () => {
      let newState = addAccounts(state, dummyAccount);
      let account = get.accountById({ banks: newState }, dummyAccount.id);
      account.should.not.equal(null);
      newState = updateAccount(newState, dummyAccount.id, { initialAmount: 0 });
      account = get.accountById({ banks: newState }, dummyAccount.id);
      account.initialAmount.should.equal(0);
    });
  });
});
describe("Operation management", () => {
  const state = {
    accesses: ["1"],
    accessesMap: {
      "1": {
        id: "1",
        bank: "fakebank1",
        enabled: true,
        login: "login",
        customFields: [],
        accounts: ["account1"]
      }
    },
    accountsMap: {
      account1: {
        id: "account1",
        bankAccess: "1",
        accountNumber: "#1",
        lastChecked: new Date(),
        initialAmount: 1000,
        title: "My Account",
        bank: "fakebank1"
      }
    },
    banks,
    constants: {
      defaultCurrency: "EUR"
    }
  };
});
