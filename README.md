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

- **`/poc`**: Chứa mã nguồn Smart Contract (Sui Move)
  - `sources/poc.move`: Module lõi quản lý Hồ sơ, Nhiệm vụ và Quyền hạn.
  - `sources/vote.move`: Module quản trị phi tập trung (Upvote, Reward, Auto-finalize).
- **`/frontend`**: Ứng dụng web React/Vite
  - `src/components/`: Các thành phần giao diện chung (TaskBoard, ProfileCard...).
  - `src/vote/`: Các thành phần chuyên biệt cho hệ thống Voting & Curation.
  - `src/constants.ts`: Cấu hình địa chỉ Package và Object ID trên mạng Sui.

## ✨ Tính năng mới cập nhật (v3.0)
- **Hệ thống Bình chọn Phi tập trung**: Mỗi bài nộp giờ đây có thể được bình chọn bởi cộng đồng.
- **Tự động Duyệt bài**: Cơ chế đạt ngưỡng 5 Upvotes để tự động phê duyệt bài nộp mà không cần Admin.
- **Thưởng Khảo thí (Curator Reward)**: Nhận ngay +5 XP và tăng điểm uy tín khi tham gia bình chọn cho các nội dung chất lượng.

## 🗺️ Lộ trình phát triển (Future Roadmap)
- [ ] **Cơ chế Thử thách (Challenge Mechanism)**: Hệ thống chống gian lận cho phép "đặt cược danh tiếng" để tố cáo các minh chứng giả mạo.
- [ ] **Hệ thống Cấp bậc (Tier System)**: Mở khóa các Quest cao cấp dựa trên tổng điểm XP tích lũy.
- [ ] **Tích hợp NFT Chứng nhận**: Tự động đúc NFT cho các sinh viên hoàn thành nhiệm vụ xuất sắc.

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
