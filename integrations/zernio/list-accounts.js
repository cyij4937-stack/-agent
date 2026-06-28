const zernio = require('./client');

(async () => {
  const { accounts } = await zernio.accounts.listAccounts();
  if (!accounts.length) {
    console.log('No connected accounts yet. Connect Instagram/Threads first via zernio.connect.getConnectUrl().');
    return;
  }
  for (const account of accounts) {
    console.log(`${account.platform}\t${account._id}\t${account.name || ''}`);
  }
})();
