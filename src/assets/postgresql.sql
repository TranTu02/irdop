-- PostgreSQL
CREATE EXTENSION IF NOT EXISTS vector;

-- DELETE ALL TABLES
DROP TABLE IF EXISTS client CASCADE;
DROP TABLE IF EXISTS protocol CASCADE;
DROP TABLE IF EXISTS analyte CASCADE;
DROP TABLE IF EXISTS receipt CASCADE;
DROP TABLE IF EXISTS sample CASCADE;
DROP TABLE IF EXISTS sample_analyte CASCADE;

-- LIBRARY TABLES
CREATE TABLE client (
    id SERIAL PRIMARY KEY,
    client_uid      VARCHAR(20) NOT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by_uid  VARCHAR(20),
    modified_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modified_by_uid VARCHAR(20),
    client_name     VARCHAR(100) NOT NULL,
    client_address  VARCHAR(255),
    contacts        JSONB,
    internal_memo TEXT
);

CREATE TABLE protocol (
    id                      SERIAL PRIMARY KEY,
    file_uid                VARCHAR(20),
    protocol_name           VARCHAR(100) NOT NULL,    -- Phương pháp kiểm nghiệm gì đấy cho nền mẫu gì đấy bằng cách nào đấy
    protocol_code           VARCHAR(100),             -- HDPP /TCVN /QCVN...
    protocol_description    TEXT,
    protocol_content        TEXT,              -- content
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by_uid      VARCHAR(20),
    modified_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modified_by_uid     VARCHAR(20)
);

CREATE TABLE analyte (
    id                          SERIAL PRIMARY KEY,
    technicant_uid              VARCHAR(20),            -- Default identity of the tester
    analyte_uid                 VARCHAR(20) NOT NULL,
    analyte_name                VARCHAR(100) NOT NULL,
    protocol_id                 INT REFERENCES protocol(id),
    protocol_source             VARCHAR(100),
    protocol_code               VARCHAR(100),
    matrix                      VARCHAR(100),
    report_notation             TEXT,
    turnaround_time_expected    INTERVAL,
    created_at                  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by_uid              VARCHAR(20),
    modified_at                 TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modified_by_uid             VARCHAR(20)
);

-- ORDER MANAGEMENT TABLES
CREATE TABLE receipt (
    id SERIAL PRIMARY KEY,
    receipt_uid VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by_uid VARCHAR(20),
    modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modified_by_uid VARCHAR(20),
    client_id INT REFERENCES client(id),
    client_name VARCHAR(100) NOT NULL,
    contact_person JSONB, -- {name: '', email: '', phone: ''}
    receipt_date DATE,
    internal_memo TEXT
);

CREATE TABLE sample (
    id SERIAL PRIMARY KEY,
    sample_uid VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by_uid VARCHAR(20),
    modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modified_by_uid VARCHAR(20),
    receipt_id INT REFERENCES receipt(id),
    client_id INT REFERENCES client(id),
    sample_date DATE,
    sample_information JSONB,
    sample_description TEXT,
    sample_volume TEXT,
    additional_requests TEXT
);

CREATE TABLE sample_analyte (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by_uid VARCHAR(20),
    modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modified_by_uid VARCHAR(20),
    receipt_id INT REFERENCES receipt(id),
    sample_id INT REFERENCES sample(id),
    protocol_id         INT REFERENCES protocol(id),
    technicant_uid          VARCHAR(20),    -- Select identity of the tester idx123, idx124, ...
    -- Local fields
    analyte_name        VARCHAR(100),
    protocol_source     VARCHAR(100),
    protocol_code       VARCHAR(100),
    result_unit         VARCHAR(100),
    result_value        TEXT,
    lodq                TEXT
);




-- Indexes for clients table
CREATE INDEX idx_client_client_uid ON client(client_uid);
CREATE INDEX idx_client_created_by_uid ON client(created_by_uid);
CREATE INDEX idx_client_modified_by_uid ON client(modified_by_uid);

-- Indexes for protocol table
CREATE INDEX idx_protocol_created_by_uid ON protocol(created_by_uid);
CREATE INDEX idx_protocol_modified_by_uid ON protocol(modified_by_uid);
CREATE INDEX idx_protocol_protocol_name ON protocol(protocol_name);

-- Indexes for analyte table
CREATE INDEX idx_analyte_analyte_uid ON analyte(analyte_uid);
CREATE INDEX idx_analyte_created_by_uid ON analyte(created_by_uid);
CREATE INDEX idx_analyte_modified_by_uid ON analyte(modified_by_uid);
CREATE INDEX idx_analyte_protocol_id ON analyte(protocol_id);

-- Indexes for receipt table
CREATE INDEX idx_receipt_receipt_uid ON receipt(receipt_uid);
CREATE INDEX idx_receipt_created_by_uid ON receipt(created_by_uid);
CREATE INDEX idx_receipt_modified_by_uid ON receipt(modified_by_uid);
CREATE INDEX idx_receipt_client_id ON receipt(client_id);

-- Indexes for sample table
CREATE INDEX idx_sample_sample_uid ON sample(sample_uid);
CREATE INDEX idx_sample_created_by_uid ON sample(created_by_uid);
CREATE INDEX idx_sample_modified_by_uid ON sample(modified_by_uid);
CREATE INDEX idx_sample_receipt_id ON sample(receipt_id);
CREATE INDEX idx_sample_client_id ON sample(client_id);

-- Indexes for sample_analyte table
CREATE INDEX idx_sample_analyte_created_by_uid ON sample_analyte(created_by_uid);
CREATE INDEX idx_sample_analyte_modified_by_uid ON sample_analyte(modified_by_uid);
CREATE INDEX idx_sample_analyte_receipt_id ON sample_analyte(receipt_id);
CREATE INDEX idx_sample_analyte_sample_id ON sample_analyte(sample_id);
CREATE INDEX idx_sample_analyte_protocol_id ON sample_analyte(protocol_id);



INSERT INTO protocol (file_uid, protocol_name, protocol_code, protocol_description, protocol_content, created_by_uid, modified_by_uid)
VALUES
('media_file001', 'Kiểm nghiệm hóa chất trong nước', 'TCVN1234:2020', 'Phương pháp kiểm nghiệm hóa chất trong mẫu nước bằng sắc ký.', 'Nội dung chi tiết kiểm nghiệm mẫu nước bằng sắc ký.', 'user001', 'user002'),
('media_file002', 'Kiểm nghiệm vi sinh trong thực phẩm', 'QCVN5678:2021', 'Phương pháp kiểm nghiệm vi sinh vật trong thực phẩm.', 'Hướng dẫn thực hiện kiểm nghiệm vi sinh vật.', 'user003', 'user004'),
('media_file003', 'Kiểm tra độ pH của đất', 'HDPP6789', 'Phương pháp xác định độ pH trong đất.', 'Quy trình chi tiết đo độ pH của đất.', 'user001', 'user002'),
('media_file004', 'Đo nồng độ kim loại nặng trong nước', 'TCVN7890:2019', 'Phương pháp đo nồng độ kim loại nặng trong nước bằng quang phổ.', 'Hướng dẫn đo nồng độ kim loại nặng.', 'user005', 'user006'),
('media_file005', 'Kiểm tra độ dẫn điện của dung dịch', 'QCVN2345:2020', 'Phương pháp kiểm tra độ dẫn điện của dung dịch.', 'Chi tiết thực hiện đo độ dẫn điện.', 'user007', 'user008'),
('media_file006', 'Đo nhiệt độ điểm nóng chảy', 'TCVN3456:2018', 'Phương pháp đo nhiệt độ điểm nóng chảy của chất rắn.', 'Hướng dẫn chi tiết đo nhiệt độ điểm nóng chảy.', 'user003', 'user004'),
('media_file007', 'Phân tích độ đục của nước', 'HDPP5678', 'Phương pháp đo độ đục của nước.', 'Hướng dẫn chi tiết đo độ đục.', 'user001', 'user002'),
('media_file008', 'Xác định hàm lượng dầu trong nước', 'QCVN7890:2022', 'Phương pháp xác định hàm lượng dầu trong nước.', 'Quy trình chi tiết kiểm tra dầu trong nước.', 'user009', 'user010'),
('media_file009', 'Kiểm nghiệm độ cứng của vật liệu', 'TCVN1234:2023', 'Phương pháp đo độ cứng của vật liệu.', 'Hướng dẫn đo độ cứng vật liệu.', 'user005', 'user006'),
('media_file010', 'Xác định nồng độ ion trong dung dịch', 'HDPP6789:2021', 'Phương pháp xác định nồng độ ion trong dung dịch.', 'Chi tiết kiểm tra ion trong dung dịch.', 'user001', 'user004'),
('media_file011', 'Kiểm tra độ ẩm của không khí', 'TCVN4321:2021', 'Phương pháp đo độ ẩm không khí.', 'Hướng dẫn đo độ ẩm không khí.', 'user002', 'user003'),
('media_file012', 'Đo độ mặn của nước biển', 'QCVN5678:2020', 'Phương pháp đo độ mặn trong nước biển.', 'Quy trình đo độ mặn nước biển.', 'user001', 'user002'),
('media_file013', 'Kiểm nghiệm độ cứng của nước', 'HDPP6789:2023', 'Phương pháp đo độ cứng của nước.', 'Hướng dẫn đo độ cứng nước.', 'user007', 'user008'),
('media_file014', 'Phân tích hóa chất độc hại trong đất', 'TCVN1234:2022', 'Phương pháp phân tích hóa chất độc hại trong đất.', 'Chi tiết kiểm nghiệm hóa chất độc hại.', 'user003', 'user006'),
('media_file015', 'Xác định thành phần khí trong không khí', 'HDPP5678', 'Phương pháp đo nồng độ các thành phần khí trong không khí.', 'Hướng dẫn đo thành phần khí.', 'user009', 'user010'),
('media_file016', 'Kiểm tra độ nhớt của dầu', 'QCVN2345:2021', 'Phương pháp kiểm tra độ nhớt của dầu.', 'Chi tiết kiểm tra độ nhớt.', 'user001', 'user002'),
('media_file017', 'Xác định nhiệt độ sôi của chất lỏng', 'TCVN7890:2020', 'Phương pháp đo nhiệt độ sôi của chất lỏng.', 'Hướng dẫn đo nhiệt độ sôi.', 'user005', 'user007'),
('media_file018', 'Kiểm nghiệm độ bền cơ học của vật liệu', 'HDPP3456', 'Phương pháp kiểm tra độ bền cơ học.', 'Chi tiết kiểm nghiệm độ bền cơ học.', 'user003', 'user004'),
('media_file019', 'Đo nồng độ cồn trong nước giải khát', 'TCVN4321:2023', 'Phương pháp đo nồng độ cồn.', 'Hướng dẫn đo nồng độ cồn trong nước giải khát.', 'user001', 'user002'),
('media_file020', 'Phân tích dư lượng thuốc bảo vệ thực vật', 'QCVN5678:2023', 'Phương pháp phân tích dư lượng thuốc bảo vệ thực vật trong mẫu nông sản.', 'Chi tiết kiểm tra dư lượng thuốc bảo vệ thực vật.', 'user009', 'user010'),
('media_file021', 'Kiểm tra hàm lượng đường trong thực phẩm', 'TCVN5678:2022', 'Phương pháp xác định hàm lượng đường trong thực phẩm.', 'Chi tiết kiểm nghiệm đường trong thực phẩm.', 'user011', 'user012'),
('media_file022', 'Xác định nồng độ khí CO2 trong môi trường', 'QCVN7890:2021', 'Phương pháp đo nồng độ khí CO2.', 'Hướng dẫn đo nồng độ CO2 trong không khí.', 'user013', 'user014'),
('media_file023', 'Phân tích cấu trúc vi sinh vật', 'HDPP6789:2020', 'Phương pháp phân tích cấu trúc vi sinh vật bằng kính hiển vi điện tử.', 'Chi tiết phân tích cấu trúc vi sinh.', 'user015', 'user016'),
('media_file024', 'Đo nồng độ cation trong đất', 'TCVN2345:2023', 'Phương pháp đo nồng độ cation trong mẫu đất.', 'Hướng dẫn đo cation trong đất.', 'user017', 'user018'),
('media_file025', 'Kiểm tra độ hòa tan của dược phẩm', 'QCVN1234:2020', 'Phương pháp kiểm tra độ hòa tan của thuốc viên.', 'Chi tiết kiểm nghiệm độ hòa tan.', 'user019', 'user020'),
('media_file026', 'Xác định nồng độ oxy hòa tan trong nước', 'HDPP3456:2021', 'Phương pháp đo lượng oxy hòa tan trong nước.', 'Hướng dẫn đo oxy hòa tan.', 'user011', 'user012'),
('media_file027', 'Phân tích độ bền nhiệt của vật liệu', 'TCVN5678:2023', 'Phương pháp kiểm nghiệm độ bền nhiệt của vật liệu.', 'Quy trình kiểm nghiệm độ bền nhiệt.', 'user013', 'user014'),
('media_file028', 'Kiểm tra chất lượng nước thải công nghiệp', 'QCVN6789:2022', 'Phương pháp kiểm tra các chỉ tiêu nước thải công nghiệp.', 'Hướng dẫn đo các chỉ tiêu môi trường.', 'user015', 'user016'),
('media_file029', 'Đo cường độ ánh sáng môi trường', 'HDPP7890:2020', 'Phương pháp đo cường độ ánh sáng trong môi trường.', 'Hướng dẫn đo ánh sáng.', 'user017', 'user018'),
('media_file030', 'Kiểm tra độ nhớt của chất lỏng', 'QCVN2345:2021', 'Phương pháp đo độ nhớt của chất lỏng.', 'Chi tiết đo độ nhớt.', 'user019', 'user020'),
('media_file031', 'Phân tích nồng độ amoniac trong không khí', 'TCVN1234:2020', 'Phương pháp đo nồng độ amoniac.', 'Hướng dẫn đo amoniac trong môi trường.', 'user011', 'user012'),
('media_file032', 'Kiểm tra độ ổn định của mẫu sinh học', 'QCVN5678:2022', 'Phương pháp kiểm tra độ ổn định của các mẫu sinh học.', 'Hướng dẫn kiểm tra mẫu sinh học.', 'user013', 'user014'),
('media_file033', 'Xác định chất ô nhiễm trong nước uống', 'HDPP6789:2020', 'Phương pháp xác định các chất ô nhiễm trong nước uống.', 'Chi tiết kiểm tra nước uống.', 'user015', 'user016'),
('media_file034', 'Đo nồng độ nitrat trong đất', 'QCVN7890:2023', 'Phương pháp đo nitrat trong đất.', 'Hướng dẫn đo nitrat.', 'user017', 'user018'),
('media_file035', 'Phân tích hàm lượng protein trong thực phẩm', 'TCVN2345:2020', 'Phương pháp phân tích protein.', 'Chi tiết phân tích protein thực phẩm.', 'user019', 'user020'),
('media_file036', 'Đo độ phóng xạ trong đất', 'HDPP3456:2022', 'Phương pháp đo độ phóng xạ.', 'Hướng dẫn đo phóng xạ trong đất.', 'user011', 'user012'),
('media_file037', 'Kiểm tra độ bền kéo của vật liệu', 'QCVN5678:2023', 'Phương pháp đo độ bền kéo của vật liệu.', 'Chi tiết kiểm nghiệm độ bền kéo.', 'user013', 'user014'),
('media_file038', 'Phân tích dư lượng hóa chất bảo vệ thực vật', 'TCVN7890:2022', 'Phương pháp phân tích dư lượng hóa chất bảo vệ thực vật.', 'Hướng dẫn kiểm tra dư lượng.', 'user015', 'user016'),
('media_file039', 'Đo lượng khí thải CO từ động cơ', 'HDPP6789:2021', 'Phương pháp đo khí thải CO từ động cơ.', 'Chi tiết đo khí thải động cơ.', 'user017', 'user018'),
('media_file040', 'Kiểm nghiệm độ giãn dài của cao su', 'QCVN1234:2022', 'Phương pháp đo độ giãn dài của cao su.', 'Hướng dẫn kiểm tra cao su.', 'user019', 'user020'),
('media_file041', 'Xác định dư lượng thuốc kháng sinh trong thực phẩm', 'TCVN5678:2020', 'Phương pháp phân tích dư lượng kháng sinh trong thực phẩm.', 'Hướng dẫn phân tích kháng sinh.', 'user011', 'user012'),
('media_file042', 'Đo độ kiềm của nước', 'QCVN6789:2023', 'Phương pháp xác định độ kiềm của nước.', 'Chi tiết đo độ kiềm.', 'user013', 'user014'),
('media_file043', 'Phân tích dầu nhớt động cơ', 'HDPP7890:2022', 'Phương pháp phân tích thành phần dầu nhớt.', 'Chi tiết kiểm nghiệm dầu nhớt.', 'user015', 'user016'),
('media_file044', 'Kiểm tra độ dẫn nhiệt của vật liệu', 'QCVN2345:2022', 'Phương pháp đo độ dẫn nhiệt.', 'Hướng dẫn đo nhiệt độ.', 'user017', 'user018'),
('media_file045', 'Phân tích vi sinh trong nước sinh hoạt', 'TCVN1234:2023', 'Phương pháp kiểm tra vi sinh trong nước sinh hoạt.', 'Chi tiết kiểm tra vi sinh.', 'user019', 'user020'),
('media_file046', 'Đo cường độ âm thanh trong môi trường', 'HDPP3456:2021', 'Phương pháp đo âm thanh trong môi trường.', 'Hướng dẫn đo âm thanh.', 'user011', 'user012'),
('media_file047', 'Phân tích hàm lượng chất xơ trong thực phẩm', 'QCVN5678:2021', 'Phương pháp phân tích chất xơ.', 'Chi tiết phân tích chất xơ.', 'user013', 'user014'),
('media_file048', 'Kiểm tra hàm lượng kim loại nặng trong đất', 'TCVN7890:2023', 'Phương pháp đo kim loại nặng.', 'Hướng dẫn đo kim loại nặng.', 'user015', 'user016'),
('media_file049', 'Xác định độ nhớt của mực in', 'HDPP6789:2022', 'Phương pháp đo độ nhớt của mực in.', 'Chi tiết đo độ nhớt.', 'user017', 'user018'),
('media_file050', 'Phân tích độc tố vi sinh trong thực phẩm', 'TCVN2345:2023', 'Phương pháp phân tích độc tố vi sinh.', 'Hướng dẫn kiểm tra độc tố.', 'user019', 'user020');

