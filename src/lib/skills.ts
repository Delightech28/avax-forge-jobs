export const SKILLS: string[] = [
  // Web3 / blockchain
  'Solidity', 'Rust', 'Web3.js', 'Ethers.js', 'Hardhat', 'Foundry', 'Truffle', 'Brownie', 'Solana', 'Anchor',
  'Substrate', 'Polkadot', 'Near', 'CosmWasm', 'Smart Contracts', 'On-Chain', 'Layer 2', 'zkRollups', 'Optimistic Rollups', 'DeFi',
  'NFT', 'Tokenomics', 'IPFS', 'Filecoin', 'Chainlink', 'Oracles', 'MetaMask', 'Wallet Integration', 'Gnosis',

  // Web2 / general software
  'React', 'TypeScript', 'Node.js', 'Express', 'GraphQL', 'REST', 'Docker', 'Kubernetes', 'Postgres', 'MySQL',
  'MongoDB', 'Redis', 'AWS', 'GCP', 'Azure', 'CI/CD', 'Jenkins', 'GitHub Actions', 'HTML', 'CSS',
  'Next.js', 'Vite', 'Vue', 'Angular', 'Svelte', 'Django', 'Flask', 'Python', 'Go', 'Java',
  'C#', '.NET', 'Kotlin', 'Swift', 'Mobile', 'iOS', 'Android', 'UX', 'UI', 'Product Management',

  // DevOps & Security
  'Terraform', 'Ansible', 'Prometheus', 'Grafana', 'SRE', 'Security', 'Penetration Testing', 'Audit',
  'Cryptography', 'Zero Knowledge', 'ZK', 'Privacy', 'Solana Security',
  
  // Roles, marketing, community & design
  'Web3 Marketing Specialist', 'Software Engineer', 'UI/UX Designer', 'Data Analyst', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Content Writer', 'Community Manager', 'Social Media Manager', 'Ambassador', 'KOL', 'Space Host', 'Advisor', 'Blockchain Developer', 'Community Builder', 'Web3 Developer', 'Graphic Designer'
];

export function filterSkills(query: string, limit = 10) {
  if (!query || !query.trim()) return SKILLS.slice(0, limit);
  const q = query.toLowerCase();
  const starts = SKILLS.filter(s => s.toLowerCase().startsWith(q));
  const includes = SKILLS.filter(s => !s.toLowerCase().startsWith(q) && s.toLowerCase().includes(q));
  return [...starts, ...includes].slice(0, limit);
}
