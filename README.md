# ITC - Decentralized Task & Contribution Protocol (POC)

ITC (Incentive Task Coordination) là một giao thức phi tập trung được xây dựng trên mạng lưới **Sui Blockchain**, nhằm mục đích điều phối nhiệm vụ và xác thực đóng góp của người dùng (sinh viên, thành viên cộng đồng) một cách minh bạch và bảo mật.

## 🚀 Tổng quan dự án

Dự án này là một Proof of Concept (POC) cho phép các tổ chức (Verifiers) đăng tải các nhiệm vụ (Tasks), và người dùng có thể tham gia thực hiện để nhận về điểm thưởng và xây dựng hồ sơ năng lực số (Soulbound Profile) trên chuỗi.

## 🛠 Công nghệ sử dụng

- **Smart Contracts**: Move Language (Sui Blockchain)
- **Frontend**: React.js, TypeScript, Vite
- **Styling**: Tailwind CSS v4, Lucide Icons
- **Blockchain Interaction**: @mysten/sui, @mysten/dapp-kit
- **State Management**: TanStack Query (React Query)

## 📂 Cấu trúc thư mục

- `/poc`: Chứa mã nguồn Smart Contract viết bằng ngôn ngữ Move.
- `/frontend`: Mã nguồn ứng dụng web tương tác với người dùng.

## 📋 Chức năng chi tiết

Vui lòng xem chi tiết tại file: [**chucnang.md**](./chucnang.md)

## ⚙️ Hướng dẫn cài đặt

### 1. Smart Contract (Sui/Move)
Yêu cầu đã cài đặt [Sui CLI](https://docs.sui.io/guides/developer/getting-started/sui-install).
```bash
cd poc
sui move build
sui move publish --gas-budget 100000000
```

### 2. Frontend (React)
Yêu cầu đã cài đặt [Node.js](https://nodejs.org/).
```bash
cd frontend
npm install
npm run dev
```

---
*Dự án được phát triển như một phần của giải pháp quản lý đóng góp phi tập trung trên hệ sinh thái Sui.*
