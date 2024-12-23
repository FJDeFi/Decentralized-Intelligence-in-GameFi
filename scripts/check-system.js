const os = require('os');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

const REQUIREMENTS = {
  development: {
    cpu: 8,
    ram: 32,
    network: 1000,  // 1 Gbps
  },
  production: {
    cpu: 32,
    ram: 64,
    network: 10000, // 10 Gbps
  }
};

async function checkSystemRequirements() {
  const env = process.env.NODE_ENV || 'development';
  const errors = [];
  // CPU Check
  const cpuCount = os.cpus().length;
  if (cpuCount < requirements.cpu) {
    errors.push(`CPU cores: ${cpuCount} (Required: ${requirements.cpu}+)`);
  }
  // RAM Check
  const totalRAM = Math.floor(os.totalmem() / (1024 * 1024 * 1024));
  if (totalRAM < requirements.ram) {
    errors.push(`RAM: ${totalRAM}GB (Required: ${requirements.ram}GB+)`);
  }

  // GPU Check
  try {
    const { stdout: gpuInfo } = await execAsync('nvidia-smi --query-gpu=name,memory.total --format=csv,noheader');
    console.log('GPU:', gpuInfo.trim());
  } catch {
    errors.push('No NVIDIA GPU detected');
  }

  if (errors.length > 0) {
    console.error('\nSystem requirements not met:');
    errors.forEach(err => console.error(`❌ ${err}`));
    process.exit(1);
  }
  

  console.log('✅ System requirements met');
}

checkSystemRequirements().catch(console.error); 