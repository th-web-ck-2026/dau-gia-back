1.Tác nhân của hệ thống

1. Người tạo phiên đấu thầu (Host/Owner)

Người/tổ chức tạo ra phiên đấu giá
Quyền của Host
Doanh nghiệp

Cơ quan nhà nước

Startup gọi vốn

Ban tổ chức sự kiện

Cá nhân đấu giá tài sản
Tạo phiên đấu thầu

Thiết lập tiêu chí đánh giá

Thiết lập trọng số cho từng tiêu chí

Theo dõi bảng xếp hạng

Kết thúc phiên đấu thầu

Công bố người thắng

2. Người tham gia đấu thầu(Bidder)

Quyền của Bidder
Công ty

Freelancer

Nhà đầu tư

Nhà thầu
Tham gia phiên đấu thầu

Gửi gói đề xuất (Proposal)

Cập nhật đề xuất trong thời gian thực

Theo dõi bảng xếp hạng

3. Hệ thống (System)
   Vai trò của hệ thống:
   Xác thực người dùng

Kiểm tra tính hợp lệ của đề xuất

Tính điểm theo trọng số

Xếp hạng các đề xuất

Cập nhật bảng xếp hạng thời gian thực 4. Quản trị viên (Admin)
Vai trò:
Kiểm duyệt phiên đấu thầu

Quản lý người dùng

Khóa tài khoản vi phạm

Kiểm tra dữ liệu hệ thống 2. User Story
User Story 1 – Tạo phiên đấu thầu
Là một Host, tôi muốn tạo một phiên đấu thầu, để các công ty có thể gửi đề xuất cạnh tranh.
Tiêu chí chấp nhận:
nhập tên dự án

chọn thời gian bắt đầu

chọn thời gian kết thúc

thiết lập tiêu chí đánh giá

thiết lập trọng số
User Story 2 – Thiết lập tiêu chí đánh giá
Là một Host, tôi muốn tạo các tiêu chí đánh giá linh hoạt, để có thể chấm điểm dựa trên nhiều yếu tố khác nhau.
Ví dụ tiêu chí:
Ngân sách

Thời gian hoàn thành

Thời gian bảo hành

Tỷ lệ chia sẻ doanh thu
User Story 3 – Gửi đề xuất
Là một Bidder,tôi muốn gửi một gói đề xuất,để hệ thống tính điểm và xếp hạng tôi.
Ví dụ gói đề xuất:
Ngân sách: 900 triệu

Thời gian hoàn thành: 45 ngày

Bảo hành: 5 năm

Chia sẻ doanh thu: 15%
User Story 4 – Xem bảng xếp hạng thời gian thực
Là một Bidder, tôi muốn xem thứ hạng của mình theo thời gian thực, để có thể điều chỉnh đề xuất nhằm tăng cơ hội chiến thắng.
User Story 5 – Kết thúc phiên đấu thầu
Là một Host, tôi muốn kết thúc phiên đấu thầu, để xác định người chiến thắng.

3.Luồng hoạt động tổng thể của hệ thống
Giai đoạn 1: Tạo phiên đấu thầu
Luồng hoạt động:
Host đăng nhập
→ tạo phiên đấu thầu
→ thiết lập tiêu chí đánh giá
→ thiết lập trọng số
→ công bố phiên đấu thầu
Giai đoạn 2: Tham gia đấu thầu
Luồng hoạt động:
Người tham gia mở trang phiên đấu thầu
→ hệ thống gửi danh sách tiêu chí
→ người tham gia nhập đề xuất
→ hệ thống tính điểm
→ cập nhật bảng xếp hạng
Giai đoạn 3: Đấu thầu thời gian thực
Luồng hoạt động:
Người tham gia thay đổi đề xuất
→ gửi dữ liệu lên server
→ hệ thống tính lại điểm
→ cập nhật thứ hạng
→ phát sóng bảng xếp hạng cho tất cả người tham gia
Giai đoạn 4: Kết thúc phiên
Khi thời gian kết thúc:
Hệ thống đóng phiên đấu thầu
→ xác định người có điểm cao nhất
→ công bố người chiến thắng

Nội dung gồm:
1️⃣ Nguyên tắc xây dựng tiêu chí đánh giá
2️⃣ Các nhóm tiêu chí phổ biến trong thực tế
3️⃣ Cách thiết lập trọng số
4️⃣ Cách chuẩn hóa điểm
5️⃣ Ví dụ hệ thống chấm điểm hoàn chỉnh
6️⃣ Cách triển khai vào database của bạn

1. Nguyên tắc xây dựng tiêu chí đánh giá

STT
Nguyên tắc
Mục tiêu
Cần triển khai trong hệ thống
Ví dụ thực tế
1
Phản ánh mục tiêu kinh doanh
Đảm bảo tiêu chí phục vụ đúng mục tiêu

- Cho Host chọn mục tiêu (cost / speed / quality)
- Gợi ý tiêu chí theo mục tiêu
  Dự án cần nhanh → Delivery weight cao
  2
  Đa tiêu chí (Multi-criteria)
  Tránh phụ thuộc 1 yếu tố
- Cho phép tạo nhiều tiêu chí
- UI thêm/xóa tiêu chí linh hoạt
  Budget + Delivery + Warranty
  3
  Định lượng được (Measurable)
  Có thể chấm điểm rõ ràng
- Input dạng số / % / enum
- Validate dữ liệu
  Delivery = 30 ngày
  4
  Chuẩn hóa (Normalization)
  So sánh được các tiêu chí khác đơn vị
- Hàm normalize (0–100)
- Xử lý min/max
  500 triệu → 80 điểm
  5
  Trọng số hợp lý
  Phản ánh mức độ quan trọng
- UI nhập weight / slider
- Validate tổng = 1
  Budget = 0.4
  6
  Không trùng lặp
  Tránh sai lệch kết quả
- Check trùng tên tiêu chí
- Gợi ý merge
  Budget vs Price
  7
  Hướng tối ưu rõ ràng
  Biết tiêu chí tăng hay giảm tốt hơn
- Field: is_reverse (true/false)
  Budget → true
  8
  Giới hạn số lượng
  Đảm bảo UX & hiệu quả
- Limit 4–6 tiêu chí
- Warning nếu quá nhiều
  > 6 tiêu chí → cảnh báo
  > 9
  > Ràng buộc loại trừ
  > Loại bỏ phương án không hợp lệ
- Hard constraint rules
- Check trước khi chấm điểm
  Không có ISO → loại
  10
  Minh bạch & công bằng
  Tăng độ tin cậy
- Hiển thị weight + score
- Breakdown điểm
  Tổng = 82 (chi tiết từng tiêu chí)
  11
  Linh hoạt (Dynamic)
  Áp dụng cho nhiều loại dự án
- Dynamic Criteria Builder
- Template theo domain
  Template “Software Project”

2. Các nhóm tiêu chí phổ biến trong thực tế

STT
Nhóm tiêu chí
Mục tiêu
Tiêu chí cụ thể
Hướng đánh giá (is_reverse)
Cách đo lường / dữ liệu
Cần triển khai trong hệ thống
1
Tài chính (Financial)
Tối ưu chi phí / lợi nhuận

- Budget
- Giá dự thầu
- TCO
- Revenue share
- ROI
  Thường = true (càng thấp càng tốt) (trừ ROI → false)
  Số tiền (VNĐ), %
- Input dạng số- - Normalize giá trị
- Auto detect min/max
- Gợi ý reverse
  2
  Kỹ thuật (Technical)
  Đảm bảo năng lực & chất lượng
- Kinh nghiệm (năm)
- Tech stack
- Kiến trúc hệ thống
- Năng lực team
- Performance
  false (càng cao càng tốt)
  Năm kinh nghiệm, enum level (Basic → Premium)
- Cho phép enum scoring
- Upload tài liệu (portfolio)
- Mapping level → điểm
  3
  Vận hành (Operational)
  Đảm bảo tiến độ & khả năng triển khai
- Delivery time
- SLA
- Response time
- Khả năng mở rộng team
  true (càng thấp càng tốt)
  Số ngày, giờ, số người
- Input số
- Validate range
- Normalize thời gian
  4
  Giá trị gia tăng (Value-added)
  Tối đa lợi ích dài hạn
- Warranty
- Support- Training
- Cam kết nâng cấp
- ESG
  false (càng cao càng tốt)
  Năm, số buổi training, boolean
- Hỗ trợ boolean + enum
- Mapping true/false → điểm
- Cho phép custom scoring
  5
  Rủi ro & Tuân thủ (Risk & Compliance)
  Giảm rủi ro pháp lý & vận hành
- Chứng chỉ (ISO)
- Bảo mật
- Uy tín
- Lịch sử vi phạm
  Thường không dùng scoring (dùng constraint)
  Boolean / document
- Hard constraint (pass/fail)
- Upload chứng chỉ
- Rule engine loại thẳng

Một hệ thống đấu thầu tốt thường có từ 5-7 tiêu chí
Ví dụ cơ bản (dự án phát triển phần mềm):
Tiêu chí
Ý nghĩa
Loại
Ngân sách
Giá thực hiện dự án
Financial
thời gian hoàn thành
Tiến độ delivery
technical
Kinh nghiệm
số dự án tương tự
tech
Bảo hành
thời gian support
value
chia sẻ doanh thu
% lợi nhuận
financial
cam kết ESG
yếu tố xã hội
value

3.Cách thiết lập trọng số

STT
Nội dung
Mục tiêu
Cách thực hiện
Ví dụ minh họa
Cần triển khai trong hệ thống
1
Xác định mục tiêu ưu tiên
Biết nên phân bổ weight theo hướng nào
Xác định: tối ưu chi phí / tốc độ / chất lượng
Dự án gấp → Delivery cao hơn Budget

- Cho Host chọn mục tiêu
- Gợi ý weight mặc định
  2
  Phân nhóm tiêu chí
  Dễ kiểm soát & logic rõ ràng
  Chia: Financial / Technical / Operational / Value
  Financial = 40% tổng
- Group criteria
- Hiển thị theo nhóm
  3
  Gán trọng số ban đầu
  Xác định mức quan trọng từng tiêu chí
  Phân bổ % cho từng tiêu chí
  Budget = 0.4
  Delivery = 0.3
- Input số hoặc slider
- Lưu weight
  4
  Đảm bảo tổng = 1 (100%)
  Tránh sai lệch kết quả
  Normalize hoặc validate tổng weight
  0.4 + 0.3 + 0.2 + 0.1 = 1
- Validate realtime
- Auto scale nếu cần
  5
  Giới hạn trọng số tối đa
  Tránh lệch về 1 tiêu chí
  Không tiêu chí nào > 0.6
  Budget max = 0.5
- Warning nếu vượt ngưỡng
  6
  Cân bằng giữa các nhóm
  Tránh thiên lệch
  Financial ~40%, Technical ~30%
  Financial 0.4, Technical 0.3
- Dashboard hiển thị tổng theo nhóm
  7
  Điều chỉnh động (Dynamic)
  Phù hợp từng phiên đấu giá
  Cho phép edit weight trước khi mở bid
  Dự án AI → tăng Technical
- Cho edit trước khi publish
  8
  Chuẩn hóa trọng số
  Đảm bảo hệ thống xử lý đúng
  Nếu tổng ≠ 1 → auto normalize
  [2,3,5] → [0.2,0.3,0.5]
- Hàm normalize weight
  9
  Lưu lịch sử thay đổi
  Minh bạch & audit
  Ghi log thay đổi weight
  User chỉnh từ 0.3 → 0.5
- Audit log
- Versioning
  10
  Preview kết quả
  Giúp Host hiểu tác động
  Test scoring trước khi chạy thật
  Test 1 bid → score = 82
- Sandbox / preview mode

4. Cách chuẩn hóa điểm

STT
Nội dung
Mục tiêu
Cách thực hiện
Ví dụ minh họa
Cần triển khai trong hệ thống
1
Xác định loại tiêu chí
Biết cách chuẩn hóa phù hợp
Phân loại: số, %, boolean, enum
Budget = số, ESG = boolean

- Field type (number, boolean, enum)
- Validate input
  2
  Xác định hướng tối ưu
  Biết dùng công thức đúng
  Dùng is_reverse
  Budget → trueWarranty → false
- Toggle is_reverse
- Gợi ý tự động
  3
  Thu thập dữ liệu đầu vào
  Có dữ liệu để so sánh
  Lấy tất cả bid/proposal
  3 bidder: 500, 600, 700
- Query toàn bộ proposal
  4
  Xác định min / max
  Tạo khoảng chuẩn hóa
  min = nhỏ nhất
  max = lớn nhất
  min = 500, max = 700
- Auto calculate min/max
  5
  Áp dụng công thức normalize
  Đưa về thang điểm chung
  0 → 100
  tính score từng bidder
- Hàm normalize
  6
  Xử lý edge case
  Tránh lỗi hệ thống
  max == min → tránh chia 0
  tất cả = 500 → score = 100
- If max == min → return 100
  7
  Mapping dữ liệu đặc biệt
  Chuẩn hóa boolean/enum
  true/false, level
  Premium = 100
- Mapping table
  8
  Chuẩn hóa về thang điểm chung
  Đồng nhất dữ liệu
  tất cả về 0–100
  Budget → 80, Warranty → 60
- Standard scale
  9
  Kết hợp với trọng số
  Tính điểm cuối
  score × weight
  80 × 0.4 = 32
- Scoring engine
  10
  Cập nhật realtime
  Phản ánh dữ liệu mới
  Recalc khi có bid mới
  thêm bidder → đổi min/max
- Realtime update
  11
  Hiển thị minh bạch
  Giải thích kết quả
  Breakdown score
  Budget: 80 điểm
- UI hiển thị chi tiết

Ví dụ minh họa chuẩn hóa điểm (Normalization)
Bài toán :
Có 3 nhà thầu tham gia đấu thầu với tiêu chí Budget (giá dự thầu):
Nhà thầu
Giá (triệu VNĐ)
A
500
B
600
C
700

Bước 1: Xác định thông tin cơ bản
Giá trị nhỏ nhất (min) = 500

Giá trị lớn nhất (max) = 700

Đây là tiêu chí càng thấp càng tốt
→ is_reverse = true

Bước 2: Công thức chuẩn hóa
Áp dụng công thức Min-Max cho trường hợp càng thấp càng tốt:
score = (max - value) / (max - min) × 100

Bước 3: Tính điểm cho từng nhà thầu
Nhà thầu A
score = (700 - 500) / (700 - 500) × 100
= 200 / 200 × 100
= 100

Nhà thầu B
score = (700 - 600) / (700 - 500) × 100
= 100 / 200 × 100
= 50

Nhà thầu C
score = (700 - 700) / (700 - 500) × 100
= 0 / 200 × 100
= 0

Bước 4: Kết quả sau chuẩn hóa
Nhà thầu
Giá
Điểm chuẩn hóa
A
500
100
B
600
50
C
700
0

Nhận xét
Nhà thầu có giá thấp nhất nhận điểm cao nhất

Nhà thầu có giá cao nhất nhận điểm thấp nhất

Tất cả giá trị đã được chuyển về cùng một thang điểm từ 0 đến 100

Ví dụ bổ sung (càng cao càng tốt)
Tiêu chí: Warranty (thời gian bảo hành)
Nhà thầu
Bảo hành (năm)
A
1
B
3
C
5

Bước 1
min = 1

max = 5

Đây là tiêu chí càng cao càng tốt
→ is_reverse = false

Bước 2: Công thức
score = (value - min) / (max - min) × 100

Bước 3: Kết quả
Nhà thầu
Warranty
Điểm chuẩn hóa
A
1
0
B
3
50
C
5
100

Ví dụ minh họa chuẩn hóa điểm (Trường hợp càng thấp càng tốt)
Bài toán
Có 3 nhà thầu với tiêu chí Delivery Time (thời gian hoàn thành):
Nhà thầu
Thời gian (ngày)
A
40
B
50
C
70

Bước 1: Xác định thông tin
min = 40

max = 70

Đây là tiêu chí càng thấp càng tốt
→ is_reverse = true

Bước 2: Công thức chuẩn hóa
score = (max - value) / (max - min) × 100

Bước 3: Tính điểm
Nhà thầu A
score = (70 - 40) / (70 - 40) × 100
= 30 / 30 × 100
= 100

Nhà thầu B
score = (70 - 50) / (70 - 40) × 100
= 20 / 30 × 100
≈ 66.67

Nhà thầu C
score = (70 - 70) / (70 - 40) × 100
= 0 / 30 × 100
= 0

Bước 4: Kết quả
Nhà thầu
Thời gian
Điểm chuẩn hóa
A
40
100
B
50
66.67
C
70
0

5. Ví dụ hệ thống chấm điểm hoàn chỉnh
1. Bài toán
   Chọn nhà thầu phát triển website từ 3 đề xuất (A, B, C)

1. Tiêu chí và trọng số
   Tiêu chí
   Loại
   is_reverse
   Weight
   Budget (triệu VNĐ)
   Số
   true
   0.4
   Delivery (ngày)
   Số
   true
   0.3
   Warranty (năm)
   Số
   false
   0.2
   Experience (năm)
   Số
   false
   0.1

1. Dữ liệu đầu vào
   Nhà thầu
   Budget
   Delivery
   Warranty
   Experience
   A
   500
   40
   2
   3
   B
   600
   35
   3
   5
   C
   550
   50
   4
   4

1. Bước 1: Xác định min / max
   Tiêu chí
   Min
   Max
   Budget
   500
   600
   Delivery
   35
   50
   Warranty
   2
   4
   Experience
   3
   5

1. Bước 2: Chuẩn hóa điểm (0–100)
   5.1 Budget (càng thấp càng tốt)
   Công thức:
   score = (max - value) / (max - min) × 100
   Nhà thầu
   Score
   A
   100
   B
   0
   C
   50

5.2 Delivery (càng thấp càng tốt)
Nhà thầu
Score
A
66.67
B
100
C
0

5.3 Warranty (càng cao càng tốt)
score = (value - min) / (max - min) × 100
Nhà thầu
Score
A
0
B
50
C
100

5.4 Experience (càng cao càng tốt)
Nhà thầu
Score
A
0
B
100
C
50

6. Bước 3: Nhân với trọng số
   Nhà thầu A
   = 100×0.4 + 66.67×0.3 + 0×0.2 + 0×0.1
   = 40 + 20 + 0 + 0
   = 60

Nhà thầu B
= 0×0.4 + 100×0.3 + 50×0.2 + 100×0.1
= 0 + 30 + 10 + 10
= 50

Nhà thầu C
= 50×0.4 + 0×0.3 + 100×0.2 + 50×0.1
= 20 + 0 + 20 + 5
= 45

7. Kết quả cuối cùng
   Nhà thầu
   Tổng điểm
   A
   60
   B
   50
   C
   45

8. Kết luận
   Nhà thầu A có điểm cao nhất → được chọn

Dù không mạnh ở tất cả tiêu chí, nhưng cân bằng tốt

Hệ thống đảm bảo đánh giá dựa trên nhiều yếu tố

1.Đơn vị tổ chức

Đơn vị tổ chức
Thiết lập trang thông tin điện tử
Xây dựng đề án về tổ chức và hoạt động
Gửi sở tư pháp địa phương để thẩm định
Đăng tải quy chế cuộc đấu giá

2.Người tham gia

Truy cập Web & đăng kí tài khoản : sử dụng tài khoản đó để tham giá đấu giá
Quá trình tham gia đấu giá
B1: nhập vào ô trả giá, với số tiền muốn trả thì số tiền đó phải lớn hơn hoặc bằng số tiền khởi điểm mà hệ thống gợi ý
B2: ấn vào nút đấu giá ngay để xác nhận đấu giá
B3: trả giá or hủy bỏ
B4: kết thúc 1 vòng đấu, chuyển sang vòng tiếp theo…

3.Người trúng đấu giá và đấu giá viên

Người trúng đấu giá
ký biên bản, contract đấu giá
thanh toán
Đấu giá viên
xác định người trúng đấu giá
công khai kết quả đấu giá trên web
gửi kết quả cho người đấu giá

Hình ảnh ví dụ về hợp đồng của người trúng đấu giá

4.Hoạt động đấu giá diễn ra ntn
ví dụ: nhà hát tại đà nẵng
Gồm 3 tiêu chí chính để đánh giá:
cơ sở, vật chất, nội thất
mức giá
phong thủy
B1: người tham gia ( người mua/thuê) vào xem xét cơ sở
B2: Nếu ưng ( đáp ứng nhu cầu) → mua hồ sơ đấu giá → trả giá khởi điểm trước ( kiểu như cọc), nộp trước thời gian tham gia đấu giá
B3: nếu trúng đấu giá → tiền vừa trả thành tiền cọc và chỉ cần thanh toán nốt phần còn lại
nếu không trúng → được hoàn lại tiền (muộn nhất) sau 3 ngày
Khi trong thời gian bắt đầu diễn ra cuộc đấu giá, hệ thống sẽ hiển thị thời gian còn lại của cuộc đấu, các thông tin về tài sản và button “tham gia ngay”
5.Phiên đấu giá
ví dụ:
1 phiên đấu có 2 người tham gia ( có bảo mật thông tin người tham gia)
qua 3 vòng, mỗi vòng 5 phút
vòng 1 : 10h30 , hai người đều thận trọng trả bằng với giá khởi điểm là 700 triệu
vòng 2: 10h35, một người ra giá 705tr, người còn lại trả 706tr
vòng 3: ng thắng cuối cùng trả 710tr, kết thúc phiên đấu giá
Sau khi kết thúc, hệ thống gửi biên bản, mời ac ký để nhận tiền cọc và hoàn tất thủ tục đấu giá
Đấu thầu
Bảng khung tiêu chí

Nhóm tiêu chí
Tiêu chí thành phần
Hình thức chấm
Trọng số
Mục đích thực tế
1.Sàng lọc
Pháp lý
Tiền ký
Blacklist
Pass/Fail
Bắt buộc
Loại ngay nhà thầu không đủ tư cách để tránh rủi ro pháp lý
2.Năng lực
Kinh nghiệm
Tài chính
Nhân sự
Đánh giá (Rating)
Thang điểm 0-100
40% - 60%
Đảm bảo nhà thầu có đủ nguồn lực để thực hiện hợp đồng, không chỉ "hứa suông".
3.Thương mại
giá dự thầu
Tiến độ thanh toán
Bảo hành
Công thức số
40 - 60%
Tìm ra mức giá tối ưu nhất cho chủ đầu tư

Quy tắc chấm điểm (Scoring Rules)
Quy tắc chấm điểm năng lực (Technical Score - T)

Tiêu chí
Cách tính chi tiết
Trọng số nội bộ
Điểm quy đổi tối đa
Kinh nghiệm
n hợp đồng x20đ( max 5)
40%
40 điểm
Tài chính
Theo các mốc doanh thu (100, 70, 40)
30%
30 điểm
Uy tín sàn (Rating)
số sao trung bình x20
30%
30 điểm
Tổng điểm T

100%
100 điểm

    		Lưu ý:

Ngưỡng kỹ thuật tối thiểu: Nếu T<50 điểm, nhà thầu bị loại ngay lập tức (tránh trường hợp một nhà thầu yếu về năng lực nhưng vì giá quá rẻ nên tổng điểm vẫn cao và trúng thầu)
Ví dụ cách tính điểm T cuối cùng:
Nếu nhà thầu A có:
3 hợp đồng tương tự: 3 x 20 = 60đ
Doanh thu 6 tỷ: 70đ
Rating 4 sao: 4 x 20 =80đ
Suy ra, điểm T = (60 x 0.4) + (70 x 0.3) + (80 x 0.3) = 69đ
Quy tắc chấm điểm giá (Price Score - P)
Phương pháp
Công thức
Khi nào dùng?
Tỷ lệ nghịch
P = (Gmin/Gi) x 100
Phổ biến nhất, khuyến khích giá thấp.

ví dụ:
Giả định các thông số sau:
Giá gói thầu : 500 triệu đồng
Công thức áp dụng: P = (Gmin/Gi) x 100
P: Điểm giá của nhà thầu đang xét
Gmin: Giá chào thấp nhất trong số các nhà thầu hợp lệ
Gi: Giá chào của nhà thầu đang xét

Nhà thầu
Giá chào (Gi)
Phân tích công thức
Điểm giá (S)
Nhà thầu A
400tr
(400/400 x 100
100 điểm
Nhà thầu B
450tr
(400/450) x 100
88.8 điểm
Nhà thầu C
500tr
(400/500) x 100
80 điểm

Note: Edge Cases
Giá = 0 : Hệ thống cần chặn các giá trị <= 0 để tránh lỗi chia cho 0
Giá vượt trần: Nếu Gi > giá gói thầu, hệ thống loại ngay từ bước sàng lọc (Pass/Fail) trước khi chạy công thức
Điểm tổng cuối cùng (Final Score):
Công thức: Total = (T x Wt) + (P x Wp)
T: Điểm kỹ thuật/năng lực
P: Điểm giá
Wt & Wp: Trọng số của kỹ thuật và giá ( Wt + Wp =1)
Wt(Trọng số kĩ thuật): chiếm 60%
Wp(Trọng số giá): chiếm 40%

Đấu giá

1. Bảng khung tiêu chí (Criteria Schema)

Nhóm tiêu chí
Tiêu chí thành phần
Hình thức chấm
Trọng số
1.Giá (Price)
Mức giá trả (bid price)
Hệ thống tự động theo thời gian thực.
70%
2.Cam kết
Tiền đặt trước (Deposit) & Thời gian trả giá
Ai nộp cọc nhiều hơn hoặc trả giá sớm hơn sẽ được ưu tiên.
20%
3.Uy tín
Lịch sử đấu giá & Thanh toán
Dựa trên dữ liệu quá khứ của người dùng trên sàn.
10%

2. Scoring rules
   Quy tắc chấm điểm giá (P-Price score)
   Khác với đấu thầu, ở đây ta lấy giá cao nhất làm mốc 100 điểm.
   Công thức: Pi = (Gi/Gmax) x 100
   Gi: Giá của người đang xét.
   Gmax: Giá cao nhất tại thời điểm đó.
   Ý nghĩa: Người trả cao nhất luôn giữ 100 điểm giá.
   Quy tắc chấm điểm cam kết (C - commitment score)
   Dùng để phân loại những người trả giá bằng nhau:
   Thời gian (T): Cùng mức giá, ai đặt lệnh trước nhận 100đ, người sau nhận 90đ.
   Tiền cọc (D): Nếu sàn cho phép nộp cọc linh hoạt, ai nộp cọc 20% giá trị món đồ sẽ có điểm cao hơn người chỉ nộp 10%.
   Quy tắc chấm điểm uy tín (U-trust score)

Mức độ
Quy tắc cụ thể
Điểm cộng/trừ
Hạng kim cương
Đã hoàn thành > 10 cuộc đấu giá thành công
+100đ
Hạng vàng
Đã hoàn thành 1-10 cuộc đấu giá
+70đ
Vi phạm
Đã từng thắng nhưng bỏ cọc (Blacklist)
-1000đ (loại vĩnh viễn)

Ví dụ điểm tổng (total score)
Giả sử bạn đấu giá một bất động sản. Trọng số: Giá (80%) - Uy tín (20%).

Người tham gia
Giá trả (Gi)
Điểm uy tín (U)
Điểm giá (P)
Điểm tổng (T)
Người A
5.0 tỷ (Gmax)
70
(5.0/5.0) x 100 =100
(100 x 0.8) + (70 x 0.2) = 94
Người B
4.9 tỷ
100
(4.9/5.0) x 100 =98
(98 x 0.8) + (100 x 0.2) = 98.4

Kết quả: Trong trường hợp này, Người B thắng (hoặc được ưu tiên xét duyệt) dù giá thấp hơn một chút, vì hệ thống đánh giá Người B có uy tín tuyệt đối, đảm bảo việc giải ngân 4.9 tỷ chắc chắn hơn Người A (người có thể ảo hoặc rủi ro bỏ cọc cao).
Lưu ý:
Hệ số bước nhảy (Bid Increment): Thiết lập \(G*{mới} \geq G*{cũ} + X\). (Ví dụ: Bước nhảy là 5 triệu).
Đấu giá tự động (Proxy Bidding): Cho phép người dùng đặt "Giá tối đa". Hệ thống tự động nâng giá cho họ mỗi khi có người khác trả cao hơn, nhưng không vượt quá mức tối đa này.
Điểm phạt "Hủy thầu": Nếu người dùng rút lệnh trả giá, hệ thống tự động trừ 20% điểm uy tín hiện có.

API contract

openapi: 3.0.0
info:
title: Bidding & Auction API
description: API quản lý đấu thầu và đấu giá tích hợp Scoring Rules
version: 1.0.0

paths:
/bids/tender:
post:
summary: Nộp hồ sơ đấu thầu (Tendering)
tags: - Tendering
requestBody:
required: true
content:
application/json:
schema:
$ref: '#/components/schemas/TenderSubmission'
responses:
200:
description: Tính toán điểm tổng hợp thành công
content:
application/json:
schema:
$ref: '#/components/schemas/TenderResult'

/bids/auction:
post:
summary: Đặt giá đấu giá (Auction)
tags: - Auction
requestBody:
required: true
content:
application/json:
schema:
$ref: '#/components/schemas/AuctionBid'
responses:
200:
description: Đặt giá thành công
content:
application/json:
schema:
$ref: '#/components/schemas/AuctionResponse'

components:
schemas:
TenderSubmission:
type: object
properties:
bidderId: { type: string, example: "NB001" }
packageId: { type: string, example: "PKG-2023" }
technicalData:
type: object
properties:
experienceYears: { type: integer, example: 5 }
revenueBillions: { type: number, example: 12.5 }
ratingStars: { type: number, example: 4.5 }
priceProposed: { type: number, example: 850000000 }

    TenderResult:
      type: object
      properties:
        totalScore: { type: number, example: 88.52 }
        technicalScore: { type: number, example: 80.0 }
        priceScore: { type: number, example: 100.0 }
        status: { type: string, example: "Qualified" }

    AuctionBid:
      type: object
      properties:
        userId: { type: string, example: "USR-99" }
        auctionId: { type: string, example: "AUC-555" }
        bidAmount: { type: number, example: 155000000 }
        isKycVerified: { type: boolean, example: true }

    AuctionResponse:
      type: object
      properties:
        isSuccess: { type: boolean, example: true }
        currentHighestPrice: { type: number, example: 155000000 }
        nextMinBid: { type: number, example: 160000000 }
        message: { type: string, example: "Bạn đang là người dẫn đầu!" }

Mock data
Mock cho đấu thầu (Tendering) - áp dụng trọng số 60/40
{
"bidderId": "BID-789",
"packageName": "Gói thầu thiết bị y tế",
"evaluation": {
"technical": {
"experiencePoints": 80,
"financialPoints": 100,
"trustPoints": 90,
"weightedTechnicalScore": 51.6
},
"commercial": {
"proposedPrice": 900000000,
"minPriceInMarket": 800000000,
"priceScore": 88.8,
"weightedPriceScore": 35.52
},
"finalResult": {
"totalScore": 87.12,
"rank": 1,
"recommendation": "Trúng thầu"
}
}
}

Mock cho đấu giá (Auction)

{
"auctionId": "AUC-X1",
"item": "Đồng hồ Rolex Submariner",
"biddingStatus": {
"currentPrice": 250000000,
"lastBidder": "User_Mạnh_Hùng",
"totalBids": 15,
"bidIncrement": 5000000,
"nextValidBid": 255000000,
"serverTime": "2023-10-27T10:00:00Z",
"endTime": "2023-10-27T11:00:00Z"
},
"antiBot": {
"isVerified": true,
"remainingAttempts": 3
}
}
