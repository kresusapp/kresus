import testmu, { resolveVar, setVar } from '@testmuai/playwright-bindings';
import { expect } from '@playwright/test';

testmu.configure({
  "build": "748223da-7b15-402a-a565-2cc768893999",
  "name": "Categorize Transaction in Demo Account",
  "tcId": "TC-53910",
  "network": (process.env.NETWORK ?? "false").toLowerCase() === "true",
  "autoHealVersion": "AH2",
  "defaultActionTimeoutMs": 10000,
  "defaultNavigationTimeoutMs": 60000,
  "kaneRunV4": true
});

testmu.test("Categorize Transaction in Demo Account", async (page) => {
  let variable_value_0, element_0, element_1;
  await testmu.step("Navigate to {{global.start_url}}", { instructionId: "8b7de4ff-1550-44d6-8719-ac25e5dd9c1e" }, async () => {
    variable_value_0 = await resolveVar("{{global.start_url}}");
    await page.goto(variable_value_0);
  });
  
  await testmu.step("Selecting transaction category for Glagla Frigidaire", { instructionId: "d21c8a23-aae2-4c0f-bd7f-3d1b7aa4c515" }, async () => {
    element_0 = page.locator("#react-select-5-input");
    await element_0.click();
  });
  
  await testmu.step("Clicking Groceries in the category list", { instructionId: "e0f000fa-0284-4fbf-8e8d-8bb16f19f330" }, async () => {
    element_1 = page.locator("internal:role=option[name=\"Groceries\"i]");
    await element_1.click();
  });
  
  await testmu.step("Reading the selected transaction label", async () => {
    await page.waitForLoadState("domcontentloaded", { timeout: 5000 });
    setVar("selected_transaction", await testmu.textualAnalyzer(page, { wrappedJs: "(els) => {\n  const __m = {69: 0};\n  const el = (i) => els[__m[i]];\n  const __v = (el(69).textContent.trim());\n  return (typeof __v === 'boolean' ? String(__v) : __v);\n}", locators: ["internal:role=cell[name=\"Loan payment\"i] >> nth=0"], query: "the selected transaction label from the transaction row", expectedValue: "", needsUnitConversion: false, operator: "equals", transforms: ["strip"], condition: "The selected transaction from the transaction row is saved as {{selected_transaction}}." }));
  });
  
  await testmu.step("Reading the selected category label", async () => {
    await page.waitForLoadState("domcontentloaded", { timeout: 5000 });
    setVar("selected_category_label", await testmu.textualAnalyzer(page, { wrappedJs: "(els) => {\n  const __m = {77: 0};\n  const el = (i) => els[__m[i]];\n  const __v = (el(77).querySelector('[class*=single-value]').textContent.trim());\n  return (typeof __v === 'boolean' ? String(__v) : __v);\n}", locators: ["internal:role=cell[name=\"Groceries\"i]"], query: "the selected category label from the selected transaction row", expectedValue: "", needsUnitConversion: false, operator: "equals", transforms: ["strip"], condition: "The selected category label is saved as {{selected_category_label}}." }));
  });
  
  await testmu.step("Reading the category label displayed for the selected transaction", async () => {
    await page.waitForLoadState("domcontentloaded", { timeout: 5000 });
    setVar("selected_transaction_category_label_display", await testmu.textualAnalyzer(page, { wrappedJs: "(els) => {\n  const __m = {77: 0};\n  const el = (i) => els[__m[i]];\n  const __v = (el(77).querySelector('[class*=single-value]').textContent.trim());\n  return (typeof __v === 'boolean' ? String(__v) : __v);\n}", locators: ["internal:role=cell[name=\"Groceries\"i]"], query: "the category label displayed in the selected transaction row", expectedValue: "Groceries", needsUnitConversion: false, operator: "equals", transforms: ["strip"], condition: "{{selected_transaction}}'s row displays {{selected_category_label}}." }));
  });
  
  await testmu.step("Assertion check", { instructionId: "b4451596-030f-4886-8120-655533fa9cb9" }, async () => {
    await testmu.verifyAssertion(page, "Assertion check", {"operator": ["equals"], "assertion_operands": [], "left_operand": null, "right_operand": null, "operands": [], "sub_results": [{"description": "{{selected_transaction}}'s row displays {{selected_category_label}}.", "passed": true, "operator": "equals", "transforms": ["strip"], "json_path": null, "expected": "Groceries", "extracted_value": "{{selected_transaction_category_label_display}}", "store_key": "selected_transaction_category_label_display", "variable_refs": {"{{selected_transaction_category_label_display}}": "Groceries", "{{selected_transaction}}": "Loan payment", "{{selected_category_label}}": "Groceries"}}], "sub_checks": [{"description": "{{selected_transaction}}'s row displays {{selected_category_label}}.", "store_key": "selected_transaction_category_label_display", "expected_value": "Groceries", "extracted_value": "{{selected_transaction_category_label_display}}", "operator": "equals", "transforms": ["strip"]}], "composite_operator": "and", "claim": "Assert {{selected_transaction}}'s row displays {{selected_category_label}}."});
  });
});

testmu.run();