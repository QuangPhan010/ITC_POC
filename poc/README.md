# Proof of Contribution (POC) Protocol for Students

A decentralized protocol on the Sui network designed to track and verify student contributions (projects, hackathons, research, volunteer work) through a verifiable reputation system.

## Deployment Information

- **Original Package ID**: `0xd790b456c22790f4a7acd578d421fb945ff5a2a2ddaf3fd2b96c473fcb839720`
- **Current Package ID**: `0x56cc90676f7e45a0427b36a61e6ffc516c4723a7ddb6de2e5cd9e41ffdaf5ade`
- **Admin Address**: `0xeec802d4e8e8d86a0258702d31d1932ef17226164dee712d397c5ef41aad0dfe`
- **AdminCap ID**: `0x6d8428a1d967a3b0d57e9c6b3dfec11b0e7df3359be9fb6d5dd0043d133cbbde`

## Core Features

- **Soulbound Profiles**: Student profiles are non-transferable objects linked to their address.
- **Role-Based Verification**: Only authorized organizations (with a `VerifierCap`) can add verified contributions.
- **Verifiable Reputation**: Each contribution includes metadata (category, description, points) and is signed by the verifying entity.

## User Guide (CLI)

### 1. For Administrators: Issue a Verifier Capability
Authorized organizations (Universities, Clubs, etc.) need a `VerifierCap` to verify student work.

```bash
sui client call \
    --package 0x56cc90676f7e45a0427b36a61e6ffc516c4723a7ddb6de2e5cd9e41ffdaf5ade \
    --module poc \
    --function issue_verifier_cap \
    --args <ADMIN_CAP_ID> "Organization Name" <RECIPIENT_ADDRESS> \
    --gas-budget 10000000
```

### 2. For Students: Create a POC Profile
Initialize your personal reputation profile.

```bash
sui client call \
    --package 0x56cc90676f7e45a0427b36a61e6ffc516c4723a7ddb6de2e5cd9e41ffdaf5ade \
    --module poc \
    --function create_profile \
    --args "Your Name" "Student ID" "University Name" \
    --gas-budget 10000000
```

### 3. For Verifiers: Add a Verified Contribution
Add a specific achievement to a student's profile.

```bash
sui client call \
    --package 0x56cc90676f7e45a0427b36a61e6ffc516c4723a7ddb6de2e5cd9e41ffdaf5ade \
    --module poc \
    --function verify_contribution \
    --args <VERIFIER_CAP_ID> <STUDENT_PROFILE_ID> "Title" "Description" "Category" <POINTS> 0x6 \
    --gas-budget 10000000
```
*Note: `0x6` is the object ID for the Shared Clock on Sui.*

## Smart Contract Structure

- **AdminCap**: Grants permission to manage verifiers.
- **VerifierCap**: Grants permission to verify and score contributions.
- **StudentProfile**: Stores student info and a list of `Contribution` objects.
- **Contribution**: Stores verified details of an achievement.

## Testing

To run the local test suite:
```bash
sui move test
```
