import React from "react";
import { connect } from "react-redux";
import { Route, Switch, Redirect } from "react-router-dom";
import PropTypes from "prop-types";

import { get } from "../../store";
import { translate as $t } from "../../helpers";

import InOutChart from "./in-out-chart";
import BalanceChart from "./balance-chart";
import OperationsByCategoryChart from "./operations-by-category-chart";
import DefaultParamsModal from "./default-params-modal";

import TabMenu from "../ui/tab-menu.js";

const ChartsComponent = props => {
  const { currentAccountId } = props.match.params;
  const pathPrefix = "/charts";

  let menuItems = new Map();
  menuItems.set(
    `${pathPrefix}/all/${currentAccountId}`,
    $t("client.charts.by_category")
  );
  menuItems.set(
    `${pathPrefix}/balance/${currentAccountId}`,
    $t("client.charts.balance")
  );
  menuItems.set(
    `${pathPrefix}/earnings/${currentAccountId}`,
    $t("client.charts.differences_all")
  );

  const {
    defaultDisplay,
    account,
    operations,
    operationsCurrentAccounts
  } = props;

  const allChart = () => <OperationsByCategoryChart operations={operations} />;

  const balanceChart = () => (
    <BalanceChart operations={operations} account={account} />
  );

  const posNegChart = () => (
    <InOutChart operations={operationsCurrentAccounts} />
  );

  return (
    <div className="top-panel panel panel-default">
      <div className="panel-heading">
        <h3 className="title panel-title">{$t("client.charts.title")}</h3>

        <div className="panel-options">
          <span
            className="option-legend fa fa-cog"
            title={$t("client.general.default_parameters")}
            data-toggle="modal"
            data-target="#defaultParams"
          />
        </div>
        <DefaultParamsModal modalId="defaultParams" />
      </div>

      <div className="panel-body">
        <TabMenu
          selected={props.location.pathname}
          tabs={menuItems}
          history={props.history}
          location={props.location}
        />
        <div className="tab-content">
          <Switch>
            <Route
              path={`${pathPrefix}/all/${currentAccountId}`}
              component={allChart}
            />
            <Route
              path={`${pathPrefix}/balance/${currentAccountId}`}
              component={balanceChart}
            />
            <Route
              path={`${pathPrefix}/earnings/${currentAccountId}`}
              component={posNegChart}
            />
            <Redirect
              to={`${pathPrefix}/${defaultDisplay}/${currentAccountId}`}
              push={false}
            />
          </Switch>
        </div>
      </div>
    </div>
  );
};

ChartsComponent.propTypes = {
  // The kind of chart to display: by categories, balance, or in and outs for all accounts.
  defaultDisplay: PropTypes.string.isRequired,

  // The current account.
  account: PropTypes.object.isRequired,

  // The operations for the current account.
  operations: PropTypes.array.isRequired,

  // The operations for the current accounts.
  operationsCurrentAccounts: PropTypes.array.isRequired,

  // The history object, providing access to the history API.
  // Automatically added by the Route component.
  history: PropTypes.object.isRequired,

  // Location object (contains the current path). Automatically added by react-router.
  location: PropTypes.object.isRequired
};

const Export = connect((state, ownProps) => {
  let accountId = ownProps.match.params.currentAccountId;
  let account = get.accountById(state, accountId);
  let currentAccessId = account.bankAccess;
  // FIXME find a more efficient way to do this.
  let currentAccounts = get
    .accountsByAccessId(state, currentAccessId)
    .map(acc => acc.id);
  let operationsCurrentAccounts = get.operationsByAccountIds(
    state,
    currentAccounts
  );

  let operations = get.operationsByAccountIds(state, accountId);

  let defaultDisplay = get.setting(state, "defaultChartDisplayType");

  return {
    defaultDisplay,
    account,
    operations,
    operationsCurrentAccounts
  };
})(ChartsComponent);

export default Export;
