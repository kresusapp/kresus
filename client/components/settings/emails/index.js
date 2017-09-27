import React from "react";

import { translate as $t } from "../../../helpers";

import Alerts from "./alert-list";
import EmailConfig from "./config";
import Reports from "./report-list";

export default function EmailsParameters() {
  return (
    <div className="emails">
      <EmailConfig />

      <Alerts
        alertType="balance"
        sendIfText={$t("client.settings.emails.send_if_balance_is")}
        titleTranslationKey="client.settings.emails.add_balance"
        panelTitleKey="client.settings.emails.balance_title"
        panelDescriptionKey="client.settings.emails.balance_desc"
      />

      <Alerts
        alertType="transaction"
        sendIfText={$t("client.settings.emails.send_if_transaction_is")}
        titleTranslationKey="client.settings.emails.add_transaction"
        panelTitleKey="client.settings.emails.transaction_title"
        panelDescriptionKey="client.settings.emails.transaction_desc"
      />

      <Reports />
    </div>
  );
}
