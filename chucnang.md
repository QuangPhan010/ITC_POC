# Chi tiết Chức năng Hệ thống ITC

Tài liệu này mô tả chi tiết các chức năng cốt lõi và vai trò của các đối tượng tham gia trong hệ thống **ITC (Incentive Task Coordination)** trên Sui Blockchain.

---

## 👥 Các Vai trò trong Hệ thống (Roles)

### 1. Admin (Quản trị viên Hệ thống)
Là người nắm giữ `AdminCap`, có quyền hạn cao nhất để duy trì giao thức.
- **Quản lý Verifier**: Cấp phát hoặc thu hồi quyền xác thực (`VerifierCap`) cho các tổ chức.
- **Quản lý Task công cộng**: Tạo, chỉnh sửa hoặc xóa các nhiệm vụ do chính hệ thống quản lý.
- **Giám sát hệ thống**: Điều chỉnh cấu hình toàn cầu (`GlobalConfig`), danh sách kỹ năng, và chính sách thưởng/phạt.
- **Phê duyệt đặc biệt**: Có khả năng phê duyệt hoặc từ chối bất kỳ minh chứng đóng góp nào trong hệ thống.

### 2. Verifier (Tổ chức / Người xác thực)
Là các đơn vị (Câu lạc bộ, Trường học, Công ty) nắm giữ `VerifierCap`.
- **Quản lý Nhiệm vụ**: Tạo và quản lý các nhiệm vụ dành riêng cho tổ chức của mình.
- **Xác thực đóng góp**: Phê duyệt hoặc từ chối các minh chứng (submissions) mà người dùng gửi lên.
- **Xác thực trực tiếp**: Ghi nhận đóng góp trực tiếp cho người dùng mà không cần qua bước nộp bài (đối với các hoạt động ngoại tuyến).
- **Quản lý gói đăng ký**: Mua hoặc gia hạn quyền xác thực bằng đồng SUI theo mô hình Subscription (ví dụ: 30 ngày).

### 3. Student / User (Người thực hiện / Sinh viên)
Đối tượng trung tâm của hệ thống, thực hiện nhiệm vụ để tích lũy năng lực.
- **Quản lý Hồ sơ (Soulbound Profile)**: Tạo hồ sơ định danh duy nhất trên chuỗi (không thể chuyển nhượng), lưu trữ lịch sử đóng góp và thành tích.
- **Tham gia nhiệm vụ**: Tìm kiếm nhiệm vụ trên Task Board, nộp minh chứng (URL/Proof) để được xác thực.
- **Xây dựng Uy tín (Reputation)**: Tích lũy điểm uy tín qua các nhiệm vụ hoàn thành tốt. Điểm uy tín cao giúp mở khóa các nhiệm vụ cao cấp hơn.
- **Bình chọn (Voting)**: Tham gia bình chọn cho các bài nộp chất lượng. Mỗi bài nộp có thể nhận được nhiều lượt bình chọn từ cộng đồng.
- **Nhận thưởng Khảo thí (Curator Rewards)**: Nhận điểm thưởng XP và uy tín khi tham gia bình chọn cho các bài nộp sau đó được phê duyệt thành công.
- **Nhận thưởng**: Đổi điểm thưởng tích lũy (Points) lấy các phần thưởng tương ứng.

---

## 🛠 Các Chức năng Chính

### 1. Hệ thống Quản lý Nhiệm vụ (Task Marketplace)
- **Task Board**: Giao diện trực quan hiển thị danh sách các nhiệm vụ đang hoạt động, lọc theo danh mục, độ khó, hoặc phần thưởng.
- **Cấu hình Nhiệm vụ**: Cho phép thiết lập thời hạn (deadline), yêu cầu uy tín tối thiểu, và tiêu chí đánh giá (Rubric).
- **Double-Check Workflow**: Tùy chọn yêu cầu 02 Verifier khác nhau cùng phê duyệt một bài nộp để đảm bảo tính khách quan.

### 2. Cơ chế Xác thực Đóng góp (Proof of Contribution)
- **Submission Tracking**: Theo dõi trạng thái bài nộp (Đang chờ, Đã duyệt, Bị từ chối, Đang khiếu nại).
- **Dispute System**: Cho phép người dùng khiếu nại nếu bài nộp bị từ chối không thỏa đáng.
- **Evidence Requests**: Verifier có thể yêu cầu người dùng bổ sung thêm minh chứng nếu cần thiết.

### 3. Chế độ Thi đấu (Competition Mode)
- **Hệ thống Bình chọn Phi tập trung**: Mỗi ví chỉ được vote tối đa 1 lần cho mỗi bài nộp. Tổng số vote được hiển thị công khai để đánh giá chất lượng.
- **Tự động Phê duyệt bởi Cộng đồng (Community Finalize)**: Khi một bài nộp đạt ngưỡng 5 upvotes, bất kỳ ai cũng có thể kích hoạt chức năng "Finalize" để phê duyệt bài nộp ngay lập tức mà không cần Admin/Verifier.
- **Thưởng Curator**: Khuyến khích cộng đồng tham gia giám định bằng cách thưởng +5 XP và Reputation cho tất cả những người đã vote cho bài nộp được duyệt.
- **Tự động xác định người chiến thắng (Competition)**: Hệ thống tự động chọn ra bài nộp có số phiếu cao nhất để trao thưởng lớn nhất.

### 4. Hệ thống Hồ sơ Năng lực & Uy tín
- **On-chain Resume**: Mỗi đóng góp được xác thực sẽ trở thành một bản ghi vĩnh viễn trên blockchain gắn liền với địa chỉ ví của người dùng.
- **Dynamic Reputation**: Điểm uy tín thay đổi dựa trên hành vi (Hoàn thành tốt -> Tăng; Vi phạm/Spam -> Giảm).
- **Skill Tracking**: Ghi nhận các kỹ năng mà người dùng đạt được qua từng loại nhiệm vụ (Coding, Design, Research...).

### 5. Quản lý Tài chính & Subscription
- **Verifier Subscription**: Mô hình trả phí định kỳ để duy trì quyền hạn của tổ chức, tạo nguồn thu cho giao thức.
- **Claim Portal**: Cơ chế chuyển đổi điểm thưởng thành tài sản thực tế hoặc các đặc quyền khác trong hệ sinh thái.

### 6. Trung tâm Thông báo (Notification Center)
- Cập nhật thời gian thực khi có Task mới, bài nộp được duyệt, hoặc khi sắp đến hạn chót của nhiệm vụ đang tham gia.

### 7. Khám phá & Giám sát Cộng đồng
- **Xem Profile người dùng**: Người dùng có thể nhấn vào địa chỉ/ID của sinh viên khác để xem chi tiết hồ sơ năng lực, uy tín và lịch sử đóng góp.
- **Hệ thống Báo cáo (Reporting)**: Bất kỳ người dùng nào cũng có thể báo cáo hành vi bất thường của người khác. Báo cáo được ghi lại on-chain để Admin kiểm tra và xử lý.
