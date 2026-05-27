import fs from 'fs';
import path from 'path';
// @ts-expect-error - solc does not have typescript declarations in this configuration
import solc from 'solc';

function compile() {
  const contractPath = path.resolve(process.cwd(), 'contracts/src/AgentDashboard.sol');
  if (!fs.existsSync(contractPath)) {
    console.error(`Contract not found at ${contractPath}`);
    process.exit(1);
  }

  const source = fs.readFileSync(contractPath, 'utf8');

  const input = {
    language: 'Solidity',
    sources: {
      'AgentDashboard.sol': {
        content: source,
      },
    },
    settings: {
      viaIR: true,
      optimizer: {
        enabled: true,
        runs: 200,
      },
      outputSelection: {
        '*': {
          '*': ['abi', 'evm.bytecode'],
        },
      },
    },
  };

  console.log('Compiling AgentDashboard.sol...');
  const output = JSON.parse(solc.compile(JSON.stringify(input)));

  interface SolcError {
    severity: string;
    formattedMessage: string;
  }

  if (output.errors) {
    let hasErrors = false;
    output.errors.forEach((err: SolcError) => {
      console.error(err.formattedMessage);
      if (err.severity === 'error') {
        hasErrors = true;
      }
    });
    if (hasErrors) {
      process.exit(1);
    }
  }

  const contract = output.contracts['AgentDashboard.sol']['AgentDashboard'];
  if (!contract) {
    console.error('Failed to retrieve compiled contract from output');
    process.exit(1);
  }

  const abi = contract.abi;
  const bytecode = contract.evm.bytecode.object;

  const destDir = path.resolve(process.cwd(), 'lib/web3');
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  fs.writeFileSync(
    path.resolve(destDir, 'AgentDashboard.json'),
    JSON.stringify({ abi, bytecode }, null, 2)
  );

  console.log('Success! Saved ABI and bytecode to lib/web3/AgentDashboard.json');
}

compile();
