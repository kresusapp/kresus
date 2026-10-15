import testmu, { resolveVar, setVar } from '@testmuai/playwright-bindings';
import { expect } from '@playwright/test';

testmu.configure({
  "build": "48f3dbb2-8556-474b-bd3f-f19bced319a0",
  "name": "Set and Verify Monthly Category Budget in Kresus",
  "tcId": "TC-53912",
  "network": (process.env.NETWORK ?? "false").toLowerCase() === "true",
  "autoHealVersion": "AH2",
  "defaultActionTimeoutMs": 10000,
  "defaultNavigationTimeoutMs": 60000,
  "kaneRunV4": true
});

testmu.test("Set and Verify Monthly Category Budget in Kresus", async (page) => {
  let variable_value_0, element_0, element_1, variable_value_2;
  await testmu.step("Navigate to {{global.start_url}}", { instructionId: "63d1cab3-d31a-4622-9bf7-a71ddf5c19f3" }, async () => {
    variable_value_0 = await resolveVar("{{global.start_url}}");
    await page.goto(variable_value_0);
  });
  
  await testmu.step("Clicking Budget navigation link in the left sidebar", { instructionId: "18a30f9c-06c0-4f3a-a9c8-0a1a805333a3" }, async () => {
    element_0 = page.locator("internal:role=link[name=\"\uf21e Budget\"i]");
    await element_0.click();
  });
  
  await testmu.step("Entering the planned monthly budget amount for Groceries", { instructionId: "fa33850b-22a8-41f6-9af3-6a1cf2b17968" }, async () => {
    element_1 = page.locator("internal:role=row[name=\"Groceries -27.27 Plus - \uf002\"i] >> internal:role=textbox");
    variable_value_2 = await resolveVar("{{global.budget_amount}}");
    await element_1.click();
    await element_1.fill(testmu.asText(variable_value_2));
  });
  
  await testmu.step("Pressing Tab key to commit the budget value", { instructionId: "85660956-8617-4164-baf4-873530f511cd" }, async () => {
    await page.keyboard.press("Tab");
  });
  
  await testmu.step("Waiting for the Groceries budget row to load", { instructionId: "4ef77b38-3df5-474d-ac7a-e3f42a4dc8e7" }, async () => {
    await page.waitForTimeout(500);
  });
  
  await testmu.step("Checking the chosen category's monthly budget visibility", async () => {
    await page.waitForLoadState("domcontentloaded", { timeout: 5000 });
    setVar("chosen_category_monthly_budget_visible", await testmu.textualAnalyzer(page, { wrappedJs: "(els) => {\n  const __m = {90: 0};\n  const el = (i) => els[__m[i]];\n  const __v = (!!el(90) && el(90).getClientRects().length > 0);\n  return (typeof __v === 'boolean' ? String(__v) : __v);\n}", locators: ["internal:role=cell[name=\"Plus 150\"i] >> internal:role=textbox"], query: "whether the chosen category's monthly budget amount is visible", expectedValue: "true", needsUnitConversion: false, operator: "equals", transforms: [], condition: "The chosen category's monthly budget appears." }));
  });
  
  await testmu.step("Reading the chosen category's monthly budget amount", async () => {
    await page.waitForLoadState("domcontentloaded", { timeout: 5000 });
    setVar("chosen_category_monthly_budget_amount_matches", await testmu.textualAnalyzer(page, { wrappedJs: "(els) => {\n  const __m = {90: 0};\n  const el = (i) => els[__m[i]];\n  const __v = (el(90).value);\n  return (typeof __v === 'boolean' ? String(__v) : __v);\n}", locators: ["internal:role=cell[name=\"Plus 150\"i] >> internal:role=textbox"], query: "the displayed monthly budget amount for the chosen category", expectedValue: "150", needsUnitConversion: false, operator: "equals", transforms: ["strip"], condition: "The displayed amount for the chosen category's monthly budget equals the monthly budget amount entered for that category." }));
  });
  
  await testmu.step("Assertion check", { instructionId: "e9aec2fe-3e8c-4e43-8b80-03b3518e4f14" }, async () => {
    await testmu.verifyAssertion(page, "Assertion check", {"operator": ["equals"], "assertion_operands": [], "left_operand": null, "right_operand": null, "operands": [], "sub_results": [{"description": "The chosen category's monthly budget appears.", "passed": true, "operator": "equals", "transforms": [], "json_path": null, "expected": "true", "extracted_value": "{{chosen_category_monthly_budget_visible}}", "store_key": "chosen_category_monthly_budget_visible", "variable_refs": {"{{chosen_category_monthly_budget_visible}}": "true"}}, {"description": "The displayed amount for the chosen category's monthly budget equals the monthly budget amount entered for that category.", "passed": true, "operator": "equals", "transforms": ["strip"], "json_path": null, "expected": "150", "extracted_value": "{{chosen_category_monthly_budget_amount_matches}}", "store_key": "chosen_category_monthly_budget_amount_matches", "variable_refs": {"{{chosen_category_monthly_budget_amount_matches}}": "150"}}], "sub_checks": [{"description": "The chosen category's monthly budget appears.", "store_key": "chosen_category_monthly_budget_visible", "expected_value": "true", "extracted_value": "{{chosen_category_monthly_budget_visible}}", "operator": "equals", "transforms": []}, {"description": "The displayed amount for the chosen category's monthly budget equals the monthly budget amount entered for that category.", "store_key": "chosen_category_monthly_budget_amount_matches", "expected_value": "150", "extracted_value": "{{chosen_category_monthly_budget_amount_matches}}", "operator": "equals", "transforms": ["strip"]}], "composite_operator": "and", "claim": "The chosen category's monthly budget appears and its displayed amount equals the monthly budget amount entered for that category."});
  });
});

testmu.run();