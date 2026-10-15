import testmu, { resolveVar, setVar } from '@testmuai/playwright-bindings';
import { expect } from '@playwright/test';

testmu.configure({
  "build": "a9a62993-8f4c-4b07-b076-74b7104d9266",
  "name": "Verify Demo Mode and Demo Bank Access in Kresus",
  "tcId": "TC-53913",
  "network": (process.env.NETWORK ?? "false").toLowerCase() === "true",
  "autoHealVersion": "AH2",
  "defaultActionTimeoutMs": 10000,
  "defaultNavigationTimeoutMs": 60000,
  "kaneRunV4": true
});

testmu.test("Verify Demo Mode and Demo Bank Access in Kresus", async (page) => {
  let variable_value_0;
  await testmu.step("Navigate to {{global.start_url}}", { instructionId: "ee247fc0-919c-4e1a-9cb4-2c0761af929a" }, async () => {
    variable_value_0 = await resolveVar("{{global.start_url}}");
    await page.goto(variable_value_0);
  });
  
  await testmu.step("Waiting for the Kresus Demo bank and mode state to load and display", { instructionId: "c4a6fb46-343a-4fdf-a35c-77c78e7d9c94" }, async () => {
    await page.waitForTimeout(1000);
  });
  
  await testmu.step("Checking whether demo mode is active", async () => {
    await page.waitForLoadState("domcontentloaded", { timeout: 5000 });
    setVar("demo_mode_active", await testmu.textualAnalyzer(page, { wrappedJs: "(els) => {\n  const __m = {6: 0};\n  const el = (i) => els[__m[i]];\n  const __v = (!!el(6) && el(6).textContent.trim().toLowerCase() === 'demo mode');\n  return (typeof __v === 'boolean' ? String(__v) : __v);\n}", locators: ["internal:text=\"Demo mode\"i"], query: "whether demo mode is active", expectedValue: "true", needsUnitConversion: false, operator: "equals", transforms: [], condition: "demo mode is active" }));
  });
  
  await testmu.step("Assertion check", { instructionId: "9c377442-4e1f-4818-ae50-06c3810b5a57" }, async () => {
    await testmu.verifyAssertion(page, "Assertion check", {"operator": ["equals"], "assertion_operands": [], "left_operand": null, "right_operand": null, "operands": [], "sub_results": [{"description": "demo mode is active", "passed": true, "operator": "equals", "transforms": [], "json_path": null, "expected": "true", "extracted_value": "{{demo_mode_active}}", "store_key": "demo_mode_active", "variable_refs": {"{{demo_mode_active}}": "true"}}], "sub_checks": [{"description": "demo mode is active", "store_key": "demo_mode_active", "expected_value": "true", "extracted_value": "{{demo_mode_active}}", "operator": "equals", "transforms": []}], "composite_operator": "and", "claim": "demo mode is active"});
  });
  
  await testmu.step("Confirming the demo bank access and nested account list remain displayed", { instructionId: "426cea24-f774-46b7-8114-280d3bab1c5f" }, async () => {
    await page.waitForTimeout(500);
  });
  
  await testmu.step("Checking whether the Demo bank access is listed", async () => {
    await page.waitForLoadState("domcontentloaded", { timeout: 5000 });
    setVar("demo_bank_access_listed", await testmu.textualAnalyzer(page, { wrappedJs: "(els) => {\n  const __m = {19: 0};\n  const el = (i) => els[__m[i]];\n  const __v = (el(19).textContent.trim() === 'Demo bank');\n  return (typeof __v === 'boolean' ? String(__v) : __v);\n}", locators: ["internal:role=button[name=\"Demo bank \uf146\"i]"], query: "whether the Demo bank access is listed", expectedValue: "true", needsUnitConversion: false, operator: "equals", transforms: [], condition: "the \"Demo bank\" access is listed" }));
  });
  
  await testmu.step("Checking whether Demo bank accounts are listed", async () => {
    await page.waitForLoadState("domcontentloaded", { timeout: 5000 });
    setVar("demo_bank_accounts_listed", await testmu.textualAnalyzer(page, { wrappedJs: "(els) => {\n  const __m = {16: 0};\n  const el = (i) => els[__m[i]];\n  const __v = ((() => { const access = el(16).querySelector('button'); const accounts = [...el(16).querySelectorAll('a[href*=\"/view/account/\"]')]; return !!access && access.textContent.trim() === 'Demo bank' && accounts.length > 0 && accounts.every(a => a.textContent.trim().length > 0); })());\n  return (typeof __v === 'boolean' ? String(__v) : __v);\n}", locators: ["internal:role=list >> internal:has-text=\"Demo bankTotal -287,49 \u20ac | $\"i"], query: "whether accounts associated with the Demo bank access are listed with it", expectedValue: "true", needsUnitConversion: false, operator: "equals", transforms: [], condition: "the accounts associated with the \"Demo bank\" access are listed with it" }));
  });
  
  await testmu.step("Assertion check", { instructionId: "65322ec1-1606-4970-bc1a-3e9b33963571" }, async () => {
    await testmu.verifyAssertion(page, "Assertion check", {"operator": ["equals"], "assertion_operands": [], "left_operand": null, "right_operand": null, "operands": [], "sub_results": [{"description": "the \"Demo bank\" access is listed", "passed": true, "operator": "equals", "transforms": [], "json_path": null, "expected": "true", "extracted_value": "{{demo_bank_access_listed}}", "store_key": "demo_bank_access_listed", "variable_refs": {"{{demo_bank_access_listed}}": "true"}}, {"description": "the accounts associated with the \"Demo bank\" access are listed with it", "passed": true, "operator": "equals", "transforms": [], "json_path": null, "expected": "true", "extracted_value": "{{demo_bank_accounts_listed}}", "store_key": "demo_bank_accounts_listed", "variable_refs": {"{{demo_bank_accounts_listed}}": "true"}}], "sub_checks": [{"description": "the \"Demo bank\" access is listed", "store_key": "demo_bank_access_listed", "expected_value": "true", "extracted_value": "{{demo_bank_access_listed}}", "operator": "equals", "transforms": []}, {"description": "the accounts associated with the \"Demo bank\" access are listed with it", "store_key": "demo_bank_accounts_listed", "expected_value": "true", "extracted_value": "{{demo_bank_accounts_listed}}", "operator": "equals", "transforms": []}], "composite_operator": "and", "claim": "the \"Demo bank\" access is listed and its accounts are listed with it"});
  });
});

testmu.run();