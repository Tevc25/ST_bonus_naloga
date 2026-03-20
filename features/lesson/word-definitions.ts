const definitions: Record<string, string> = {
  phishing:
    "A deceptive attack where criminals impersonate trusted sources to trick you into revealing passwords or personal data.",
  passphrase:
    "A password made from multiple words strung together — much harder to crack than short complex passwords.",
  credential:
    "Login information (username + password) used to prove your identity to a system.",
  credentials:
    "Login information (username + password) used to prove your identity to a system.",
  authentication:
    "The process of verifying who you are before granting access to a system.",
  impersonation:
    "Pretending to be someone else (a person, company, or website) to gain trust or unauthorized access.",
  encryption:
    "Scrambling data with a mathematical key so only authorized parties can read it.",
  vulnerability:
    "A weakness in software, hardware, or human behavior that attackers can exploit.",
  vulnerabilities:
    "Weaknesses in software, hardware, or human behavior that attackers can exploit.",
  malware:
    "Malicious software designed to harm, spy on, or take control of a computer system.",
  firewall:
    "A security barrier that monitors and filters network traffic based on defined rules.",
  biometric:
    "Using a unique physical trait (fingerprint, face, iris) to verify your identity.",
  biometrics:
    "Using unique physical traits (fingerprint, face, iris) to verify your identity.",
  authenticator:
    "An app (e.g., Google Authenticator) that generates one-time codes for secure two-step login.",
  ransomware:
    "Malware that encrypts your files and demands a ransom payment to restore access.",
  spoofing:
    "Faking an identity — email address, phone number, or website — to deceive victims.",
  breach:
    "A security incident where unauthorized parties gain access to protected systems or data.",
  breached:
    "When an unauthorized party has successfully accessed protected systems or data.",
  hijacked:
    "When an attacker takes over control of an account, session, or device without permission.",
  heuristics:
    "Rule-of-thumb methods used to detect patterns or make decisions without exhaustive analysis.",
  adversarial:
    "Designed to work against a system's normal operation, typically for malicious purposes.",
  exploitation:
    "The act of taking advantage of a vulnerability to cause harm or gain unauthorized access.",
  exfiltration:
    "Unauthorized transfer of data out of a system — typically by an attacker.",
  persistence:
    "An attacker's ability to maintain access to a system across reboots or security responses.",
  privilege:
    "The level of access or permissions a user or process has within a system.",
  escalation:
    "Gaining higher-level access or permissions than originally granted.",
  payload:
    "The part of malware or an exploit that performs the actual harmful action.",
  obfuscation:
    "Hiding the true intent of code or data to evade detection or analysis.",
  mitigation:
    "A measure taken to reduce the impact or likelihood of a security threat.",
  remediation:
    "The process of fixing a vulnerability or recovering from a security incident.",
  multifactor:
    "Authentication requiring two or more independent proofs of identity.",
  "two-factor":
    "A security method requiring exactly two forms of verification to log in.",
  "sim-swap":
    "Fraud where an attacker convinces a carrier to transfer your phone number to their SIM card.",
  passkeys:
    "A modern authentication method using cryptographic key pairs instead of passwords.",
  passkey:
    "A modern login credential using cryptographic keys stored on your device — no password needed.",
  stalkerware:
    "Software secretly installed on a device to monitor someone's activity without their knowledge.",
  spyware:
    "Software that secretly monitors a device and sends data to a third party.",
  adware:
    "Software that displays unwanted advertisements, often bundled with other software.",
  botnet:
    "A network of infected computers controlled by an attacker, often used for attacks or spam.",
  "zero-day":
    "A software vulnerability unknown to the vendor, leaving zero days to patch it before exploitation.",
  "zero-days":
    "Software vulnerabilities unknown to vendors, leaving no time to patch before exploitation.",
  https:
    "HyperText Transfer Protocol Secure — encrypts data between your browser and the server.",
  vpn: "Virtual Private Network — encrypts your internet connection and hides your IP address.",
  dns: "Domain Name System — translates website names (like google.com) into IP addresses.",
  ssl: "Secure Sockets Layer — the predecessor to TLS; encrypts internet communications.",
  tls: "Transport Layer Security — the modern protocol for encrypting internet communications.",
  cookie:
    "A small piece of data a website stores in your browser to remember your session or preferences.",
  token:
    "A digital object (string of characters) that represents authentication or authorization.",
  hashing:
    "Converting data to a fixed-length fingerprint; good hashes are irreversible and unique.",
  hash: "A fixed-length fingerprint of data produced by a hashing algorithm.",
  salting:
    "Adding random data to a password before hashing to prevent pre-computed attacks.",
  keylogger:
    "Malware that records every keystroke you type, capturing passwords and sensitive information.",
  script:
    "A program or sequence of commands that automate tasks, often used in web pages.",
  injection:
    "An attack that inserts malicious data into a program, altering its behavior.",
  sanitization:
    "Cleaning or validating input data to remove potentially dangerous content."
};

export function getWordDefinition(word: string): string | null {
  const normalized = word.toLowerCase().replace(/[^a-z-]/g, "");
  return definitions[normalized] ?? definitions[word.toLowerCase()] ?? null;
}
