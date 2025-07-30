const { BeforeAll, AfterAll } = require('@cucumber/cucumber');
const { setup, teardown } = require('../../cucumber-setup');

let setupComplete = false;

BeforeAll(async function () {
  if (!setupComplete) {
    await setup();
    setupComplete = true;
  }
});

AfterAll(async function () {
  await teardown();
}); 