export const SKILLS: string[] = [
  // Web3 / blockchain
  'Solidity', 'Rust', 'Content Writer','Web3.js', 'Ethers.js', 'Hardhat', 'Foundry', 'Truffle', 'Brownie', 'Solana', 'Anchor',
  'Substrate', 'Polkadot', 'Near', 'CosmWasm', 'Smart Contracts Developer', 'On-Chain', 'Layer 2', 'zkRollups', 'Optimistic Rollups', 'DeFi', 'Defi Product Manager'
  ,'NFT', 'NFT Strategist','Tokenomics Analyst', 'IPFS', 'Filecoin', 'Chainlink', 'Oracles', 'MetaMask', 'Wallet Integration', 'Gnosis',

  // Web2 / general software
  'React', 'TypeScript', 'Node.js', 'Express', 'GraphQL', 'REST', 'Docker', 'Kubernetes', 'Postgres', 'MySQL',
  'MongoDB', 'Redis', 'AWS', 'GCP', 'Azure', 'CI/CD', 'Jenkins', 'GitHub Actions', 'HTML', 'CSS',
  'Next.js', 'Vite', 'Vue', 'Angular', 'Svelte', 'Django', 'Flask', 'Python', 'Go', 'Java',
  'C#', '.NET', 'Kotlin', 'DAO Coordinator', 'Swift', 'Mobile App Developer', 'iOS', 'Android', 'UX', 'UI', 'Product Management',

  // DevOps & Security
  'Terraform', 'Ansible', 'Prometheus', 'Grafana', 'SRE', 'Security', 'Penetration Testing', 'Audit',
  'Cryptography', 'Zero Knowledge', 'ZK', 'Privacy', 'Solana Security', 'Governance Specialist', 'Crypto Marketer', 'Growth Hacker', 'Security Auditor', 'dApp developer', 'Ecosystem Patnerships Manager', 'Validator/node Operator', 'Technical Writer', '', '', '',
  
  // Roles, marketing, community & design
  'Web3 Marketing Specialist', 'Software Engineer', 'UI/UX Designer', 'Data Analyst', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Protocol Research', 'Community Manager', 'Social Media Manager', 'Ambassador', 'KOL', 'Space Host', 'Advisor', 'Blockchain Developer', 'Community Builder', 'Web3 Developer', 'Graphic Designer',
   'Cloud Engineer', 'Data Scientist', 'DevOps Engineer', 'Machine Learning Engineer', 'AI Specialist', 'Business Analyst', 'Sales Manager', 'Content Creator', 'Video Editor', 'Animator', 'Illustrator', 'Brand Strategist', 'Event Coordinator', 'Public Relations Specialist', 'HR Manager', 'Recruiter', 'Legal Advisor', 'Compliance Officer', 'Financial Analyst', 'Accountant', 'Customer Support Specialist', 'Technical Support Engineer',
   'Database Administrator', 'Systems Administrator', 'Network Engineer', 'IT Support', 'Scrum Master', 'Agile Coach', 'Project Manager', 'Operations Manager', 'Marketing Manager', 'SEO Specialist', 'Growth Marketer', 'Email Marketing Specialist', 'Community Moderator', 'Forum Manager', 'Translator', 'Localization Specialist', 'Copywriter', 'Editor', 'Proofreader',
   'Cybersecurity Specialist', 'Ethical Hacker', 'Incident Responder', 'Forensic Analyst', 'Risk Manager', 'Data Privacy Officer', 'Cloud Security Engineer', 'Application Security Engineer', 'Security Operations Center (SOC) Analyst', 'Threat Intelligence Analyst',
   'Network Security Engineer', 'Information Security Manager', 'Vulnerability Analyst', 'Security Consultant', 'Cryptographic Engineer', 'Blockchain Security Expert', 'Smart Contract Auditor', 'Security Researcher', 'Malware Analyst', 'Security Architect', 'Identity and Access Management (IAM) Specialist', 'Security Awareness Trainer', 'Compliance Specialist', 'GRC Analyst', 'Data Protection Officer', 'Incident Manager', 'Forensic Investigator', 'Penetration Tester', 'Red Team Member', 'Blue Team Member', 'Purple Team Member', 'Security Operations Manager', 'Chief Information Security Officer (CISO)',
];

export function filterSkills(query: string, limit = 10) {
  if (!query || !query.trim()) return SKILLS.slice(0, limit);
  const q = query.toLowerCase();
  const starts = SKILLS.filter(s => s.toLowerCase().startsWith(q));
  const includes = SKILLS.filter(s => !s.toLowerCase().startsWith(q) && s.toLowerCase().includes(q));
  return [...starts, ...includes].slice(0, limit);
}
