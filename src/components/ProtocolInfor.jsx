import React, { useContext, useEffect, useState } from 'react';
import FilterBar from './FilterBar';
import Breadcrumb from './Breadcrumb';
import { GlobalContext } from '../contexts/GlobalContext';
import axios from 'axios';
import { RiEdit2Line } from 'react-icons/ri';
import { GiConfirmed, GiCancel, GiTrashCan } from 'react-icons/gi';

import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ProtocolInfor = () => {
	const { setCurrentTitlePage, currentUser } = useContext(GlobalContext);
	const [protocols, setProtocols] = useState([]);
	const [isEditing, setIsEditing] = useState(false);
	const [selectedProtocols, setSelectedProtocols] = useState([]);
	const [currentRole, setCurrentRole] = useState(currentUser.role[0]);
	const [isRoleDropdownVisible, setIsRoleDropdownVisible] = useState(false);
	const [isUploadBoxVisible, setIsUploadBoxVisible] = useState(false);
	const [files, setFiles] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [receivedData, setReceivedData] = useState(null);
	const [editingRow, setEditingRow] = useState(null);
	const [customMatrix, setCustomMatrix] = useState({});

	useEffect(() => {
		setCurrentTitlePage('Phương pháp');
	}, [setCurrentTitlePage]);

	useEffect(() => {
		const fetchProtocols = async () => {
			try {
				const response = await axios.get('https://black.irdop.org/db/get/protocol');
				const data = response.data;
				setProtocols(data);
			} catch (error) {
				console.error('Error fetching protocols:', error);
			}
		};

		fetchProtocols();
	}, []);

	const formatDate = (dateString) => {
		const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
		return new Date(dateString).toLocaleDateString('en-GB', options);
	};

	const handleEditClick = (index) => {
		setEditingRow(index);
	};

	const handleSaveClick = async (index) => {
		const updatedProtocol = protocols[index];
		const response = await axios.post('https://black.irdop.org/db/update/protocol', { protocol: updatedProtocol });
		console.log(response);
		setEditingRow(null);
		if (response.status === 200) {
			toast.success('Protocol updated successfully');
		} else {
			toast.error('Protocol update failed');
		}
	};

	const handleCancelClick = () => {
		setEditingRow(null);
	};

	const handleDeleteClick = async (index) => {
		const protocol = protocols[index];
		const confirmed = window.confirm(`Bạn chắc chắn muốn xóa phương pháp: ${protocol.protocol_name}?`);
		if (confirmed) {
			const response = await axios.post('https://black.irdop.org/db/delete/protocol', { id: protocol.id });
			if (response.status === 200 && response.data) {
				toast.success('Protocol deleted successfully');
				setProtocols(protocols.filter((_, i) => i !== index));
			} else {
				toast.error('Protocol deletion failed');
			}
		}
	};

	const handleInputChange = (index, field, value) => {
		const updatedProtocols = protocols.map((protocol, i) => {
			if (i === index) {
				return { ...protocol, [field]: value };
			}
			return protocol;
		});
		setProtocols(updatedProtocols);
	};

	const handleCheckboxChange = (protocol_name) => {
		setSelectedProtocols((prevSelected) =>
			prevSelected.includes(protocol_name)
				? prevSelected.filter((name) => name !== protocol_name)
				: [...prevSelected, protocol_name],
		);
	};

	const handleRoleChange = (role) => {
		setCurrentRole(role);
		setIsRoleDropdownVisible(false);
	};

	const handleFileChange = (event) => {
		const newFiles = Array.from(event.target.files);
		const validExtensions = ['doc', 'docx', 'pdf', 'csv', 'xls', 'xlsx'];
		const invalidFiles = newFiles.filter((file) => !validExtensions.includes(file.name.split('.').pop().toLowerCase()));

		if (invalidFiles.length > 0) {
			alert('Chỉ chấp nhận các file có định dạng DOC, DOCX, PDF, hoặc EXCEL.');
		} else {
			setFiles((prevFiles) => [...prevFiles, ...newFiles]);
		}
	};

	const handleFileDrop = (event) => {
		event.preventDefault();
		const newFiles = Array.from(event.dataTransfer.files);
		const validExtensions = ['doc', 'docx', 'pdf', 'csv', 'xls', 'xlsx'];
		const invalidFiles = newFiles.filter((file) => !validExtensions.includes(file.name.split('.').pop().toLowerCase()));

		if (invalidFiles.length > 0) {
			alert('Chỉ chấp nhận các file có định dạng DOC, DOCX, PDF, CSV, hoặc EXCEL.');
		} else {
			setFiles((prevFiles) => [...prevFiles, ...newFiles]);
		}
	};

	const handleFileDelete = (fileName) => {
		setFiles((prevFiles) => prevFiles.filter((file) => file.name !== fileName));
	};

	const handleConfirmUpload = async () => {
		// Kiểm tra nếu không có file nào được chọn
		if (!files || files.length === 0) {
			console.error('No files selected');
			return;
		}

		setIsLoading(true);

		try {
			let lisMes = [];

			// Tạo hàm đọc file sử dụng FileReader
			const readFile = (file) => {
				return new Promise((resolve, reject) => {
					const reader = new FileReader();
					reader.onload = () => resolve(reader.result); // Trả về buffer của file
					reader.onerror = reject; // Bắt lỗi
					reader.readAsArrayBuffer(file); // Đọc file dưới dạng ArrayBuffer
				});
			};

			// Duyệt qua từng file và đọc buffer
			for (const file of files) {
				const fileBuffer = await readFile(file); // Lấy buffer của file
				const fileBase64 = btoa(
					new Uint8Array(fileBuffer).reduce((data, byte) => data + String.fromCharCode(byte), ''),
				);
				const media = {
					file_name: file.name,
					file_mime: file.type,
					file_buffer: fileBase64, // ArrayBuffer của file
				};
				lisMes.push({ media: media });
			}

			console.log('Media:', lisMes);

			// Gửi dữ liệu tới API sử dụng axios
			const response = await axios.post(
				'https://black.irdop.org/generate_protocol',
				{ messages: lisMes },
				{
					headers: {
						'Content-Type': 'application/json',
					},
				},
			);

			// Kiểm tra định dạng của dữ liệu trả về
			if (!response.data || !response.data.parameters) {
				throw new Error('Invalid response format');
			}

			// Bổ sung thuộc tính accreditation và tat_expected cho mỗi parameter
			const updatedData = {
				...response.data,
				parameters: response.data.parameters.map((param) => ({
					...param,
					accreditation: '', // Giá trị mặc định
					tat_expected: '1 day', // Giá trị mặc định
				})),
			};

			console.log('Upload result:', updatedData);
			setReceivedData(updatedData);
		} catch (error) {
			console.error('Error during upload:', error.message);
			alert('Error during upload: ' + error.message);
			setIsLoading(false);
		}
	};

	const handleCancelUpload = () => {
		setFiles([]);
		setIsUploadBoxVisible(false);
		setReceivedData(null);
		setIsLoading(false);
	};

	const handleConfirmReceivedData = async () => {
		const protocol = receivedData;
		let parameters = receivedData.parameters;
		delete protocol.parameters;
		// Handle the confirmation of received data
		console.log('Confirmed protocol data:', protocol);
		const protocolResponse = await axios.post('https://black.irdop.org/db/insert/protocol', { protocol: protocol });

		const updatedParameters = parameters.map((param) => ({
			...param,
			tat_expected: `${param.tat_expected} ${param.tat_expected > 1 ? 'days' : 'day'}`,
			protocol_id: protocolResponse.data.id,
			protocol_code: receivedData.protocol_code,
			matrix: param.matrix === 'Khác' ? customMatrix[param.parameter_name] : param.matrix,
		}));

		parameters = updatedParameters;
		console.log('Confirmed parameter data:', parameters);
		const parameterResponse = await axios.post('https://black.irdop.org/db/insert/parameter', {
			parameters: parameters,
		});
		console.log('Protocol:', protocolResponse);
		console.log('Parameters:', parameterResponse);
		setReceivedData(null);
		setIsUploadBoxVisible(false);
		setFiles([]);
		setIsLoading(false);
		if (protocolResponse.status === 200 && parameterResponse.status === 200) {
			toast.success('Data confirmed successfully');
		} else {
			toast.error('Data confirmed failed');
		}
	};

	const handleAccreditationChange = (index, value) => {
		const updatedParameters = receivedData.parameters.map((param, paramIndex) => {
			if (paramIndex === index) {
				const accreditations = param.accreditation ? param.accreditation.split(', ') : [];
				if (accreditations.includes(value)) {
					return {
						...param,
						accreditation: accreditations.filter((acc) => acc !== value).join(', '),
					};
				} else {
					return {
						...param,
						accreditation: [...accreditations, value].join(', '),
					};
				}
			}
			return param;
		});
		setReceivedData({ ...receivedData, parameters: updatedParameters });
	};

	const handleParameterChange = (index, field, value) => {
		const updatedParameters = receivedData.parameters.map((param, paramIndex) => {
			if (paramIndex === index) {
				return {
					...param,
					[field]: value,
				};
			}
			return param;
		});
		setReceivedData({ ...receivedData, parameters: updatedParameters });
	};

	const handleAddParameter = () => {
		const newParameter = {
			parameter_name: '',
			matrix: '',
			equipments: '',
			default_unit: '',
			accreditation: '',
			tat_expected: '',
		};
		setReceivedData({ ...receivedData, parameters: [...receivedData.parameters, newParameter] });
	};

	const handleDeleteParameter = (index) => {
		const updatedParameters = receivedData.parameters.filter((_, paramIndex) => paramIndex !== index);
		setReceivedData({ ...receivedData, parameters: updatedParameters });
	};

	const handleCustomMatrixChange = (parameterName, value) => {
		setCustomMatrix({ ...customMatrix, [parameterName]: value });
	};

	const handleProtocolSourceChange = (index, value) => {
		const updatedProtocols = protocols.map((protocol, i) => {
			if (i === index) {
				return { ...protocol, protocol_source: value };
			}
			return protocol;
		});
		setProtocols(updatedProtocols);
	};

	return (
		<div className="w-full h-full relative">
			<ToastContainer />
			<Breadcrumb
				paths={[
					{ name: 'Thư viện', link: '/library' },
					{ name: 'Phương pháp', link: '/library/protocol' },
				]}
			/>
			<div className={`w-full h-full mt-2 rounded-lg bg-white p-2 ${receivedData ? 'blur-sm' : ''}`}>
				<div className="flex justify-between items-center">
					<div className="relative">
						<button
							className="bg-blue-500 text-white px-4 py-0 w-44 rounded-lg font-medium"
							onClick={() => setIsRoleDropdownVisible(!isRoleDropdownVisible)}
						>
							{currentRole}
						</button>
						{isRoleDropdownVisible && (
							<div className="absolute top-full mt-1 w-44 bg-white border rounded shadow-lg z-10">
								{currentUser.role.map((role) => (
									<div
										key={role}
										className="p-1 text-md cursor-pointer hover:bg-gray-200 text-start border-b border-slate-100"
										onClick={() => handleRoleChange(role)}
									>
										{role}
									</div>
								))}
							</div>
						)}
					</div>
					<h2 className="text-4xl text-primary font-semibold py-2">Danh sách phương pháp</h2>
					<div className="relative z-10">
						<button
							className="bg-blue-500 text-white px-4 py-0 w-44 rounded-lg font-medium "
							onClick={() => setIsUploadBoxVisible(!isUploadBoxVisible)}
						>
							Thêm mới
						</button>
						{isUploadBoxVisible && (
							<div
								className="w-96 border-dashed border-2 border-gray-400 rounded-lg p-4 mt-8 absolute top-0 right-0 z-10 bg-white"
								onDrop={handleFileDrop}
								onDragOver={(e) => e.preventDefault()}
							>
								<input type="file" multiple className="hidden" id="fileInput" onChange={handleFileChange} />
								<label htmlFor="fileInput" className="cursor-pointer text-blue-500">
									Kéo thả file vào đây hoặc nhấn để chọn file <br></br>
									<p className="text-sm text-red-500">(* .docx, .doc, .xlsx, .pdf)</p>
								</label>
								<div className="mt-4">
									{files.map((file) => (
										<div key={file.name} className="flex justify-between items-center border pl-2 w-full rounded-lg">
											{/* Thêm lớp `break-words` hoặc `break-all` để nội dung xuống dòng */}
											<span className="w-72 break-words text-start">{file.name}</span>

											<button className="text-red-500 py-2 px-4" onClick={() => handleFileDelete(file.name)}>
												X
											</button>
										</div>
									))}
								</div>
								<div className="flex justify-end mt-8">
									<button
										className="bg-gray-500 text-white font-bold py-2 px-4 rounded mr-2"
										onClick={handleCancelUpload}
									>
										Hủy bỏ
									</button>
									<button className="bg-blue-500 text-white font-bold py-2 px-4 rounded" onClick={handleConfirmUpload}>
										Xác nhận
									</button>
								</div>
							</div>
						)}
					</div>
				</div>

				<div className="rounded-lg border p-0.5 relative z-0">
					<FilterBar />

					<table className="min-w-full bg-white ">
						<thead className="border-b-2">
							<tr>
								<th className="py-2 text-center w-1/6">Phương pháp</th>
								<th className="py-2 text-center w-40">Mã phương pháp</th>
								<th className="py-2 text-center w-1/6">Mô tả</th>
								<th className="py-2 text-center w-1/4">Nội dung</th>
								{/* <th className="py-2 text-center w-24">File</th> */}
								<th className="py-2 text-center w-40">Tác giả</th>
								<th className="py-2 text-center w-40">Xuất bản</th>
								<th className="py-2 text-center w-40">Nguồn</th>
								{/* <th className="py-2 text-center min-w-28">Created At</th> */}
								{/* <th className="py-2 text-center min-w-28">Modified At</th> */}
								<th className="py-2 text-center min-w-24">Thực hiện</th>
							</tr>
						</thead>
						<tbody>
							{protocols.map((protocol, index) => (
								<tr key={index} className="border-t">
									<td className="p-1 text-start">
										{editingRow === index ? (
											<input
												type="text"
												className="w-full border px-2 py-1 rounded bg-white"
												value={protocol.protocol_name}
												onChange={(e) => handleInputChange(index, 'protocol_name', e.target.value)}
											/>
										) : (
											protocol.protocol_name
										)}
									</td>
									<td className="p-1 text-start">
										{editingRow === index ? (
											<input
												type="text"
												className="w-full border px-2 py-1 rounded bg-white"
												value={protocol.protocol_code}
												onChange={(e) => handleInputChange(index, 'protocol_code', e.target.value)}
											/>
										) : (
											protocol.protocol_code
										)}
									</td>
									<td className="p-1 text-start">
										{editingRow === index ? (
											<textarea
												className="w-full border px-2 py-1 rounded bg-white"
												value={protocol.protocol_description}
												rows={1}
												onChange={(e) => handleInputChange(index, 'protocol_description', e.target.value)}
											/>
										) : (
											protocol.protocol_description
										)}
									</td>
									<td className="p-1 text-start">
										{editingRow === index ? (
											<textarea
												className="w-full border px-2 py-1 rounded bg-white"
												value={protocol.protocol_content}
												rows={1}
												onChange={(e) => handleInputChange(index, 'protocol_content', e.target.value)}
											/>
										) : (
											protocol.protocol_content
										)}
									</td>
									{/* <td className="p-1 text-start">
										{editingRow === index ? (
											<input
												type="text"
												className="w-full border px-2 py-1 rounded bg-white"
												value={protocol.file_uid}
												onChange={(e) => handleInputChange(index, 'file_uid', e.target.value)}
											/>
										) : (
											protocol.file_uid
										)}
									</td> */}
									<td className="p-1 text-start">
										{editingRow === index ? (
											<input
												type="text"
												className="w-full border px-2 py-1 rounded bg-white"
												value={protocol.author_name}
												onChange={(e) => handleInputChange(index, 'author_name', e.target.value)}
											/>
										) : (
											protocol.author_name
										)}
									</td>
									<td className="p-1 text-start">
										{editingRow === index ? (
											<input
												type="text"
												className="w-full border px-2 py-1 rounded bg-white"
												value={protocol.publisher}
												onChange={(e) => handleInputChange(index, 'publisher', e.target.value)}
											/>
										) : (
											protocol.publisher
										)}
									</td>
									<td className="p-1 text-start">
										{editingRow === index ? (
											<select
												className="w-full border px-2 py-1 rounded bg-white"
												value={protocol.protocol_source}
												onChange={(e) => handleProtocolSourceChange(index, e.target.value)}
											>
												<option value="IRDOP">IRDOP</option>
												<option value="IRDOP VS">IRDOP VS</option>
											</select>
										) : (
											protocol.protocol_source
										)}
									</td>
									{/* <td className="p-1 text-start">
										<p>{formatDate(protocol.created_at)}</p>
										<p className="text-primary text-sm font-medium">{protocol.created_by_uid}</p>
									</td>
									<td className="p-1 text-start">
										<p>{formatDate(protocol.modified_at)}</p>
										<p className="text-primary text-sm font-medium">{protocol.modified_by_uid}</p>
									</td> */}
									<td className="p-1 text-center">
										{editingRow === index ? (
											<>
												<button
													className="text-blue-500 px-2 py-1 mr-1 focus:outline-none focus:border-none"
													onClick={() => handleSaveClick(index)}
												>
													<GiConfirmed size={20} />
												</button>
												<button
													className="text-red-500 px-2 ml-1 py-1 focus:outline-none focus:border-none"
													onClick={handleCancelClick}
												>
													<GiCancel size={20} />
												</button>
											</>
										) : (
											<>
												<button
													className="text-blue-500 px-2 py-1 focus:outline-none focus:border-none"
													onClick={() => handleEditClick(index)}
												>
													<RiEdit2Line size={20} />
												</button>
												<button
													className="text-red-500 px-2 py-1 focus:outline-none focus:border-none"
													onClick={() => handleDeleteClick(index)}
												>
													<GiTrashCan size={20} />
												</button>
											</>
										)}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>

			{isLoading && (
				<div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-20">
					<div className="flex flex-col items-center justify-center min-h-screen">
						<div class="flex space-x-1 pl-5 text-3xl font-bold text-primary">
							<span className="bounce">L</span>
							<span className="bounce">o</span>
							<span className="bounce">a</span>
							<span className="bounce">d</span>
							<span className="bounce">i</span>
							<span className="bounce">n</span>
							<span className="bounce">g</span>
							<span className="bounce">.</span>
							<span className="bounce">.</span>
							<span className="bounce">.</span>
						</div>
						<button
							className="bg-red-500 text-white font-bold py-2 px-4 mt-6 rounded ml-4"
							onClick={handleCancelUpload}
						>
							Hủy
						</button>
					</div>
				</div>
			)}

			{receivedData && (
				<div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-20   ">
					<div className="bg-white p-4 rounded-lg h-4/5 w-3/4 overflow-auto">
						<h2 className="text-xl font-bold mb-4">Received Data</h2>
						<div className="mb-4">
							<h3 className="text-lg font-semibold">Protocol Information</h3>
							<table className="min-w-full bg-white">
								<thead className="border-b-2">
									<tr>
										<th className="py-2 text-center w-40">Field</th>
										<th className="py-2 text-center">Value</th>
									</tr>
								</thead>
								<tbody>
									<tr className="border-t">
										<td className="p-1 text-start font-semibold">Tên phương pháp:</td>
										<td className="p-1 text-start">
											<input
												type="text"
												className="w-full border px-2 py-1 rounded bg-white"
												value={receivedData.protocol_name}
												onChange={(e) => setReceivedData({ ...receivedData, protocol_name: e.target.value })}
												disabled
											/>
										</td>
									</tr>
									<tr className="border-t">
										<td className="p-1 text-start font-semibold">Mã phương pháp:</td>
										<td className="p-1 text-start">
											<input
												type="text"
												className="w-full border px-2 py-1 rounded bg-white"
												value={receivedData.protocol_code}
												onChange={(e) => setReceivedData({ ...receivedData, protocol_code: e.target.value })}
												disabled
											/>
										</td>
									</tr>
									<tr className="border-t">
										<td className="p-1 text-start font-semibold">Mô tả:</td>
										<td className="p-1 text-start">
											<textarea
												className="w-full border px-2 py-1 rounded bg-white"
												value={receivedData.protocol_description}
												onChange={(e) => setReceivedData({ ...receivedData, protocol_description: e.target.value })}
												disabled
											/>
										</td>
									</tr>
									<tr className="border-t">
										<td className="p-1 text-start font-semibold">Nội dung:</td>
										<td className="p-1 text-start">
											<textarea
												className="w-full border px-2 py-1 rounded bg-white"
												defaultValue={receivedData.protocol_content}
												onChange={(e) => setReceivedData({ ...receivedData, protocol_content: e.target.value })}
												disabled
											/>
										</td>
									</tr>
									<tr className="border-t">
										<td className="p-1 text-start font-semibold">Tác giả:</td>
										<td className="p-1 text-start">
											<input
												type="text"
												className="w-full border px-2 py-1 rounded bg-white"
												value={receivedData.author_name}
												onChange={(e) => setReceivedData({ ...receivedData, author_name: e.target.value })}
												disabled
											/>
										</td>
									</tr>
									<tr className="border-t">
										<td className="p-1 text-start font-semibold">Người phát hành:</td>
										<td className="p-1 text-start">
											<input
												type="text"
												className="w-full border px-2 py-1 rounded bg-white"
												value={receivedData.author_name}
												onChange={(e) => setReceivedData({ ...receivedData, author_name: e.target.value })}
												disabled
											/>
										</td>
									</tr>
								</tbody>
							</table>
						</div>
						<h3 className="text-lg font-semibold">Parameters</h3>
						<table className="min-w-full bg-white">
							<thead className="border-b-2">
								<tr>
									<th className="py-2 text-center w-1/5">Phép thử / chỉ tiêu</th>
									<th className="py-2 text-center w-1/5">Nền mẫu</th>
									<th className="py-2 text-center w-1/4">Thiết bị</th>
									<th className="py-2 text-center w-1/12">Đơn vị</th>
									<th className="py-2 text-center w-1/12">Dự kiến</th>
									<th className="py-2 text-center w-36">Chứng nhận</th>
									<th className="py-2 text-center w-10">Xóa</th>
								</tr>
							</thead>
							<tbody>
								{receivedData.parameters.map((param, index) => (
									<tr key={index} className="border-t">
										<td className="p-1 text-start">
											<input
												type="text"
												className="w-full border px-2 py-1 rounded bg-white"
												value={param.parameter_name}
												onChange={(e) => handleParameterChange(index, 'parameter_name', e.target.value)}
											/>
										</td>
										<td className="p-1 text-start">
											<select
												className="w-full border px-2 py-1 rounded bg-white"
												value={param.matrix}
												onChange={(e) => handleParameterChange(index, 'matrix', e.target.value)}
											>
												<option value="">{param.matrix}</option>
												<option value="Nước uống">Nước uống</option>
												<option value="Nước sinh hoạt">Nước sinh hoạt</option>
												<option value="Nước thải">Nước thải</option>
												<option value="Nước mặt">Nước mặt</option>
												<option value="Nước ngầm">Nước ngầm</option>
												<option value="Khí xung quanh">Khí xung quanh</option>
												<option value="Khí thải">Khí thải</option>
												<option value="Đất">Đất</option>
												<option value="Chất thải">Chất thải</option>
												<option value="Phế liệu">Phế liệu</option>
												<option value="Khác">Khác</option>
											</select>
											{param.matrix === 'Khác' && (
												<input
													type="text"
													className="w-full border px-2 py-1 rounded bg-white mt-2"
													placeholder="Nhập nền mẫu khác"
													value={customMatrix[param.parameter_name] || ''}
													onChange={(e) => handleCustomMatrixChange(param.parameter_name, e.target.value)}
												/>
											)}
										</td>
										<td className="p-1 text-start">
											<textarea
												className="w-full border px-2 py-1 rounded bg-white"
												value={param.equipments}
												onChange={(e) => handleParameterChange(index, 'equipments', e.target.value)}
											/>
										</td>
										<td className="p-1 text-start">
											<input
												type="text"
												className="w-full border px-2 py-1 rounded bg-white"
												value={param.default_unit}
												onChange={(e) => handleParameterChange(index, 'default_unit', e.target.value)}
											/>
										</td>
										<td className="p-1 text-center">
											<input
												type="number"
												className="w-14 mr-1 border px-2 py-1 rounded bg-white"
												value={param.tat_expected}
												onChange={(e) => handleParameterChange(index, 'tat_expected', e.target.value)}
											/>
											ngày
										</td>
										<td className="p-1 text-center">
											<label>
												<input
													type="checkbox"
													checked={param.accreditation?.includes('VILAS 997')}
													onChange={() => handleAccreditationChange(index, 'VILAS 997')}
												/>
												VILAS 997
											</label>
											<label className="ml-2">
												<input
													type="checkbox"
													checked={param.accreditation?.includes('107')}
													onChange={() => handleAccreditationChange(index, '107')}
												/>
												107
											</label>
										</td>
										<td className="p-1 text-center">
											<button
												className="text-red-500 px-2 py-1 focus:outline-none focus:border-none"
												onClick={() => handleDeleteParameter(index)}
											>
												X
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
						<div className="flex justify-end mt-4">
							<button className="bg-gray-500 text-white font-bold py-2 px-4 rounded mr-2" onClick={handleAddParameter}>
								Thêm hàng
							</button>
							<button className="bg-gray-500 text-white font-bold py-2 px-4 rounded mr-2" onClick={handleCancelUpload}>
								Hủy bỏ
							</button>
							<button
								className="bg-blue-500 text-white font-bold py-2 px-4 rounded"
								onClick={handleConfirmReceivedData}
							>
								Xác nhận
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default ProtocolInfor;
