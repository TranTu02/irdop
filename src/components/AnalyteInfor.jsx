import React, { useContext, useEffect, useState } from 'react';
import FilterBar from './FilterBar';
import Breadcrumb from './Breadcrumb';
import { GlobalContext } from '../contexts/GlobalContext';
import axios from 'axios';
import { RiEdit2Line } from 'react-icons/ri';
import { GiConfirmed, GiCancel, GiTrashCan } from 'react-icons/gi';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AnalyteInfor = () => {
	const { setCurrentTitlePage, currentUser } = useContext(GlobalContext);
	const [analytes, setAnalytes] = useState([]);
	const [currentRole, setCurrentRole] = useState(currentUser.role[0]);
	const [isRoleDropdownVisible, setIsRoleDropdownVisible] = useState(false);
	const [editingRow, setEditingRow] = useState(null);
	const [isAddingNew, setIsAddingNew] = useState(false);
	const [newAnalyte, setNewAnalyte] = useState({
		parameter_name: '',
		matrix: 'Đất',
		tat_expected: '1 day',
		default_unit: '',
		accreditation: '',
		technician_uid: '',
		protocol_code: '',
		parameter_uid: '',
		protocol_source: 'IRDOP',
	});
	const [protocols, setProtocols] = useState([]);
	const [protocolSearch, setProtocolSearch] = useState('');
	const [isProtocolDropdownVisible, setIsProtocolDropdownVisible] = useState(false);
	const [customMatrix, setCustomMatrix] = useState({});
	const [originalAnalytes, setOriginalAnalytes] = useState([]);
	const [originalCustomMatrix, setOriginalCustomMatrix] = useState({});
	const [currentPage, setCurrentPage] = useState(1);
	const [protocolPage, setProtocolPage] = useState(1);
	const [listProtocol, setListProtocol] = useState([]);
	const [technicians, setTechnicians] = useState([]);
	const [technicianDropdownVisible, setTechnicianDropdownVisible] = useState(null);
	const protocolsPerPage = 5;
	const analytesPerPage = 20;
	let count = 0;

	useEffect(() => {
		setCurrentTitlePage('Chỉ tiêu');
	}, [setCurrentTitlePage]);

	useEffect(() => {
		if (technicians.length > 0) {
			fetchAnalytes();
		}
	}, [technicians]);

	useEffect(() => {
		if (technicians.length === 0) {
			fetchTechnicians();
		}
	}, []);

	const fetchTechnicians = async () => {
		try {
			const response = await axios.get('https://pink.irdop.org/db/get/techinician');
			setTechnicians(response.data);
		} catch (error) {
			console.error('Error fetching technicians:', error);
		}
	};

	const fetchAnalytes = async () => {
		try {
			const response = await axios.get('https://black.irdop.org/db/get/analyte');
			const data = response.data.map((analyte) => ({
				...analyte,
				tat_expected: analyte?.tat_expected?.days
					? `${analyte.tat_expected.days} ${analyte.tat_expected.days > 1 ? 'days' : 'day'}`
					: '',
			}));
			console.log(data);

			setAnalytes(data);
			setOriginalAnalytes(data);
		} catch (error) {
			console.error('Error fetching analytes:', error);
		}
	};

	const technician = (param) => {
		const iden = technicians.find((identity) => identity.identity_uid === param.technician_uid);
		const ktv = iden ? iden.identity_name + ' (' + iden.alias + ')' : null;
		return ktv;
	};

	const fetchProtocols = async (searchTerm) => {
		try {
			if (listProtocol.length === 0) {
				const response = await axios.get('https://black.irdop.org/db/get/protocol');
				setListProtocol(response.data);
			}
			const filteredProtocols = listProtocol.filter((protocol) => protocol.protocol_code?.includes(searchTerm));
			setProtocols(filteredProtocols);
		} catch (error) {
			console.error('Error fetching protocols:', error);
		}
	};

	const handleEditClick = (index) => {
		setEditingRow(index);
		setOriginalCustomMatrix(customMatrix);
	};

	const handleSaveClick = async (index) => {
		const updatedAnalyte = analytes[index];
		const days = parseInt(updatedAnalyte?.tat_expected.split(' ')[0]);
		if (isNaN(days)) {
			delete updatedAnalyte.tat_expected;
		} else {
			updatedAnalyte.tat_expected = `${days} ${days > 1 ? 'days' : 'day'}`;
		}
		updatedAnalyte.matrix = updatedAnalyte.matrix === 'Khác' ? customMatrix[index] : updatedAnalyte.matrix;

		try {
			const response = await axios.post('https://black.irdop.org/db/edit/analyte', { parameter: updatedAnalyte });
			setEditingRow(null);
			if (response.status === 200) {
				toast.success('Analyte updated successfully');
				setOriginalAnalytes(analytes);
				setOriginalCustomMatrix(customMatrix);
				await fetchAnalytes(); // Refresh data
			} else {
				toast.error('Analyte update failed');
			}
		} catch (error) {
			console.error('Error updating analyte:', error);
			toast.error('Analyte update failed');
		}
	};

	const handleCancelClick = () => {
		setAnalytes(originalAnalytes);
		setCustomMatrix(originalCustomMatrix);
		setEditingRow(null);
	};

	const handleInputChange = (index, field, value) => {
		const updatedAnalytes = analytes.map((analyte, i) => {
			if (i === index) {
				return { ...analyte, [field]: value };
			}
			return analyte;
		});
		setAnalytes(updatedAnalytes);
	};

	const handleDeleteClick = async (index) => {
		const analyte = analytes[index];
		const confirmed = window.confirm(`Bạn chắc chắn muốn xóa chỉ tiêu: ${analyte.parameter_name}?`);
		if (confirmed) {
			try {
				const response = await axios.post('https://black.irdop.org/db/delete/analyte', { id: analyte.id });
				if (response.status === 200) {
					toast.success('Analyte deleted successfully');
					setAnalytes(analytes.filter((_, i) => i !== index));
				} else {
					toast.error('Analyte deletion failed');
				}
			} catch (error) {
				console.error('Error deleting analyte:', error);
				toast.error('Analyte deletion failed');
			}
		}
	};

	const handleRoleChange = (role) => {
		setCurrentRole(role);
		setIsRoleDropdownVisible(false);
	};

	const handleAddNewClick = () => {
		setIsAddingNew(true);
	};

	const handleNewAnalyteChange = (field, value) => {
		setNewAnalyte({ ...newAnalyte, [field]: value });
		if (field === 'protocol_code' && value.length >= 5) {
			fetchProtocols(value);
			setIsProtocolDropdownVisible(true);
		} else {
			setIsProtocolDropdownVisible(false);
		}
	};

	const handleSaveNewAnalyte = async () => {
		const days = parseInt(newAnalyte?.tat_expected.split(' ')[0]);
		if (isNaN(days)) {
			delete newAnalyte.tat_expected;
		} else {
			newAnalyte.tat_expected = `${days} ${days > 1 ? 'days' : 'day'}`;
		}
		newAnalyte.matrix = newAnalyte.matrix === 'Khác' ? customMatrix['new'] : newAnalyte.matrix;
		try {
			const response = await axios.post('https://black.irdop.org/db/insert/parameter', { parameters: newAnalyte });
			if (response.status === 200) {
				toast.success('New analyte added successfully');
				setAnalytes([...analytes, newAnalyte]);
				setIsAddingNew(false);
				setNewAnalyte({
					parameter_name: '',
					matrix: 'Đất',
					tat_expected: '1 day',
					default_unit: '',
					accreditation: '',
					technician_uid: technicians[0].identity_uid,
					protocol_code: '',
					parameter_uid: '',
					protocol_source: 'IRDOP',
				});
				await fetchAnalytes(); // Refresh data
			} else {
				toast.error('Failed to add new analyte');
			}
		} catch (error) {
			console.error('Error adding new analyte:', error);
			toast.error('Failed to add new analyte');
		}
	};

	const handleCancelNewAnalyte = () => {
		setIsAddingNew(false);
		setNewAnalyte({
			parameter_name: '',
			matrix: 'Đất',
			tat_expected: '1 day',
			default_unit: '',
			accreditation: '',
			technician_uid: technicians[0].identity_uid,
			protocol_code: '',
			parameter_uid: '',
			protocol_source: 'IRDOP',
		});
	};

	const handleAccreditationChange = (index, value) => {
		const updatedAnalytes = analytes.map((analyte, analyteIndex) => {
			if (analyteIndex === index) {
				const accreditations = analyte.accreditation ? analyte.accreditation.split(', ') : [];
				if (accreditations?.includes(value)) {
					return {
						...analyte,
						accreditation: accreditations.filter((acc) => acc !== value).join(', '),
					};
				} else {
					return {
						...analyte,
						accreditation: [...accreditations, value].join(', '),
					};
				}
			}
			return analyte;
		});
		setAnalytes(updatedAnalytes);
	};

	const handleNewAccreditationChange = (value) => {
		const accreditations = newAnalyte.accreditation ? newAnalyte.accreditation.split(', ') : [];
		if (accreditations?.includes(value)) {
			setNewAnalyte({
				...newAnalyte,
				accreditation: accreditations.filter((acc) => acc !== value).join(', '),
			});
		} else {
			setNewAnalyte({
				...newAnalyte,
				accreditation: [...accreditations, value].join(', '),
			});
		}
	};

	const handleProtocolSearchChange = (index, value) => {
		setProtocolSearch(value);
		handleInputChange(index, 'protocol_code', value);
		if (value.length >= 5) {
			fetchProtocols(value);
			setIsProtocolDropdownVisible(true);
			setProtocolPage(1);
		} else {
			setIsProtocolDropdownVisible(false);
		}
	};

	const handleProtocolSelect = (index, protocol) => {
		const updatedAnalytes = analytes.map((analyte, i) => {
			if (i === index) {
				return { ...analyte, protocol_id: protocol.id, protocol_code: protocol.protocol_code };
			}
			return analyte;
		});

		setAnalytes(updatedAnalytes);
		setIsProtocolDropdownVisible(false);
	};

	const handleNewProtocolSelect = (protocol) => {
		setNewAnalyte({ ...newAnalyte, protocol_code: protocol.protocol_code, protocol_id: protocol.id });
		setIsProtocolDropdownVisible(false);
	};

	const handleCustomMatrixChange = (index, value) => {
		setCustomMatrix({ ...customMatrix, [index]: value });
		// handleInputChange(index, 'matrix', value);
	};

	const handleProtocolSourceChange = (index, value) => {
		const updatedAnalytes = analytes.map((analyte, i) => {
			if (i === index) {
				return { ...analyte, protocol_source: value };
			}
			return analyte;
		});
		setAnalytes(updatedAnalytes);
	};

	const handleNewProtocolSourceChange = (value) => {
		setNewAnalyte({ ...newAnalyte, protocol_source: value });
	};

	const handlePageChange = (pageNumber) => {
		setCurrentPage(pageNumber);
	};

	const handleProtocolPageChange = (pageNumber) => {
		setProtocolPage(pageNumber);
	};

	const handleTechnicianChange = (index, value) => {
		const updatedAnalytes = analytes.map((analyte, i) => {
			if (i === index) {
				return { ...analyte, technician_uid: value };
			}
			return analyte;
		});
		setAnalytes(updatedAnalytes);
	};

	const handleTatExpectedChange = (index, value) => {
		const updatedAnalytes = analytes.map((analyte, i) => {
			if (i === index) {
				return { ...analyte, tat_expected: value };
			}
			return analyte;
		});
		setAnalytes(updatedAnalytes);
	};

	const toggleTechnicianDropdown = (index) => {
		setTechnicianDropdownVisible((prevState) => (prevState === index ? null : index));
	};

	const totalPages = Math.ceil(analytes.length / analytesPerPage);
	const totalProtocolPages = Math.ceil(protocols.length / protocolsPerPage);
	const paginatedAnalytes = analytes.slice((currentPage - 1) * analytesPerPage, currentPage * analytesPerPage);
	const paginatedProtocols = protocols.slice((protocolPage - 1) * protocolsPerPage, protocolPage * protocolsPerPage);

	const renderPageNumbers = (totalPages, currentPage, handlePageChange) => {
		const pageNumbers = [];
		const maxPagesToShow = 5;
		let startPage = Math.max(1, currentPage - 2);
		let endPage = Math.min(totalPages, currentPage + 2);

		if (currentPage <= 3) {
			endPage = Math.min(5, totalPages);
		} else if (currentPage + 2 >= totalPages) {
			startPage = Math.max(1, totalPages - 4);
		}

		for (let i = startPage; i <= endPage; i++) {
			pageNumbers.push(
				<button
					key={i}
					className={`px-2 py-1 border rounded ${i === currentPage ? 'bg-blue-500 text-white' : ''}`}
					onClick={() => handlePageChange(i)}
				>
					{i}
				</button>,
			);
		}

		return (
			<div className="flex space-x-1">
				{currentPage > 3 && (
					<>
						<button className="px-2 py-1 border rounded" onClick={() => handlePageChange(1)}>
							First
						</button>
						<span>...</span>
					</>
				)}
				{pageNumbers}
				{currentPage + 2 < totalPages && (
					<>
						<span>...</span>
						<button className="px-2 py-1 border rounded" onClick={() => handlePageChange(totalPages)}>
							Last
						</button>
					</>
				)}
			</div>
		);
	};

	return (
		<div className="w-full h-full relative">
			<ToastContainer />
			<Breadcrumb
				paths={[
					{ name: 'Thư viện', link: '/library' },
					{ name: 'Chỉ tiêu', link: '/library/analyte' },
				]}
			/>
			<div className="w-full h-full mt-2 rounded-lg bg-white p-2">
				<div className="flex justify-between items-center">
					<div className="relative">
						<button
							className="bg-blue-500 text-white px-4 py-0 w-44 rounded-lg font-medium focus:outline-none focus:border-none"
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
					<h2 className="text-4xl text-primary font-semibold py-2">Danh sách chỉ tiêu</h2>
					<div className="relative z-10">
						<button
							className="bg-blue-500 text-white px-4 py-0 w-44 rounded-lg font-medium focus:outline-none focus:border-none"
							onClick={handleAddNewClick}
						>
							Thêm mới
						</button>
					</div>
				</div>

				<div className="rounded-lg border p-0.5 relative z-0 overflow-x-auto">
					<FilterBar source={originalAnalytes} setCurrentList={setAnalytes} typeSearch="parameter" />
					<table className="min-w-screen-xl bg-white ">
						<thead className="border-b-2">
							<tr>
								<th className="py-2 text-center min-w-32">Mã chỉ tiêu</th>
								<th className="py-2 text-center  w-1/3 ">Tên chỉ tiêu</th>
								<th className="py-2 text-center  w-1/4 ">Nền mẫu</th>
								<th className="py-2 text-center min-w-40">Mã phương pháp</th>
								<th className="py-2 text-center  w-1/12 min-w-24 ">Dự kiến</th>
								<th className="py-2 text-center  w-1/12 min-w-20 ">Đơn vị</th>
								<th className="py-2 text-center min-w-32 ">Chứng nhận</th>
								<th className="py-2 text-center min-w-36">Kiểm nghiệm viên</th>
								<th className="py-2 text-center min-w-32">Nguồn </th>
								<th className="py-2 text-center min-w-24">Thao tác</th>
							</tr>
						</thead>
						<tbody>
							{isAddingNew && (
								<tr className="border-t bg-blue-50">
									<td className="p-1 text-start">
										<p className="font-medium">{newAnalyte.parameter_uid}</p>
									</td>
									<td className="p-1 text-start">
										<textarea
											className="w-full border px-2 py-1 rounded bg-white resize-none"
											rows={2}
											value={newAnalyte.parameter_name}
											onChange={(e) => handleNewAnalyteChange('parameter_name', e.target.value)}
										/>
									</td>
									<td className="p-1 text-start">
										<select
											className="w-full border px-2 py-1 rounded bg-white"
											value={newAnalyte.matrix}
											onChange={(e) => handleNewAnalyteChange('matrix', e.target.value)}
										>
											<option value="Đất">Đất</option>
											<option value="Nước">Nước</option>
											<option value="Thực phẩm bảo vệ sức khỏe">Thực phẩm bảo vệ sức khỏe</option>
											<option value="Thực phẩm chức năng">Thực phẩm chức năng</option>
											<option value="Thuốc">Thuốc</option>
											<option value="Thực phẩm chín">Thực phẩm chín</option>
											<option value="Thực phẩm sống">Thực phẩm sống</option>
											<option value="Vật liệu">Vật liệu</option>
											<option value="Hóa chất">Hóa chất</option>
											<option value="Khác">Khác</option>
										</select>
										{newAnalyte.matrix === 'Khác' && (
											<textarea
												className="w-full border px-2 py-1 rounded bg-white mt-2"
												placeholder="Nhập nền mẫu khác"
												value={customMatrix['new'] || ''}
												onChange={(e) => {
													setCustomMatrix({ ...customMatrix, new: e.target.value });
												}}
											/>
										)}
									</td>
									<td className="p-1 text-start relative">
										<textarea
											className="w-full border px-2 py-1 rounded bg-white resize-none"
											rows={2}
											value={newAnalyte.protocol_code}
											onChange={(e) => handleNewAnalyteChange('protocol_code', e.target.value)}
										/>
										{isProtocolDropdownVisible && (
											<div className="absolute w-80 bg-white border rounded shadow-lg z-10">
												{paginatedProtocols.map((protocol, index) => (
													<div
														key={index}
														className="p-1 text-md cursor-pointer hover:bg-gray-200 text-start border-b border-slate-100"
														onClick={() => handleNewProtocolSelect(protocol)}
													>
														<p>{protocol.protocol_name}</p>
														<p className="text-sm text-gray-500">{protocol.protocol_code}</p>
													</div>
												))}
												{protocols.filter((protocol) => protocol.protocol_code?.includes(protocolSearch)).length >
													protocolsPerPage && (
													<div className="flex justify-between p-2">
														<button
															className="px-2 py-1 border rounded"
															onClick={() => handleProtocolPageChange(protocolPage - 1)}
															disabled={protocolPage === 1}
														>
															Previous
														</button>
														<button
															className="px-2 py-1 border rounded"
															onClick={() => (window.location.href = '/library/protocol')}
														>
															Thêm mới
														</button>
														<button
															className="px-2 py-1 border rounded"
															onClick={() => handleProtocolPageChange(protocolPage + 1)}
															disabled={protocolPage * protocolsPerPage >= protocols.length}
														>
															Next
														</button>
													</div>
												)}
											</div>
										)}
									</td>
									<td className="p-1 text-start">
										<input
											type="number"
											min="0"
											className="w-14 border px-2 py-1 rounded bg-white"
											value={newAnalyte.tat_expected}
											onChange={(e) => handleNewAnalyteChange('tat_expected', e.target.value)}
										/>
										<span className="ml-2">Ngày</span>
									</td>
									<td className="p-1 text-center">
										<textarea
											className="w-full border px-2 py-1 rounded bg-white resize-none"
											rows={2}
											value={newAnalyte.default_unit || ''}
											onChange={(e) => handleNewAnalyteChange('default_unit', e.target.value)}
										/>
									</td>
									<td className="p-1 text-center flex flex-col items-start ">
										<label className="mt-1 flex items-center">
											<input
												type="checkbox"
												className="w-4 h-4"
												checked={newAnalyte.accreditation?.includes('VILAS 997')}
												onChange={() => handleNewAccreditationChange('VILAS 997')}
											/>
											<p className="ml-1">{'VILAS 997'}</p>
										</label>

										<label className="mt-1 flex items-center">
											<input
												type="checkbox"
												className="w-4 h-4"
												checked={newAnalyte.accreditation?.includes('107')}
												onChange={() => handleNewAccreditationChange('107')}
											/>
											<p className="ml-1">{'107'}</p>
										</label>
									</td>
									<td className="p-1 text-start">
										<select
											className="w-full border px-2 py-1 rounded bg-white"
											value={newAnalyte.technician_uid}
											onChange={(e) => handleNewAnalyteChange('technician_uid', e.target.value)}
										>
											{technicians.map((identity) => (
												<option key={identity.identity_uid} value={identity.identity_uid}>
													{identity.identity_name}
												</option>
											))}
										</select>
									</td>
									<td className="p-1 text-start">
										<select
											className="w-full border px-2 py-1 rounded bg-white"
											value={newAnalyte.protocol_source}
											onChange={(e) => handleNewProtocolSourceChange(e.target.value)}
										>
											<option value="IRDOP">IRDOP</option>
											<option value="IRDOP VS">IRDOP VS</option>
										</select>
									</td>
									<td className="p-1 text-center ">
										<button
											className="text-blue-500 px-2 py-1 mr-1 focus:outline-none focus:border-none"
											onClick={handleSaveNewAnalyte}
										>
											<GiConfirmed size={20} />
										</button>
										<button
											className="text-red-500 px-2 ml-1 py-1 focus:outline-none focus:border-none"
											onClick={handleCancelNewAnalyte}
										>
											<GiCancel size={20} />
										</button>
									</td>
								</tr>
							)}
							{paginatedAnalytes.map((analyte, index) => (
								<tr key={index} className={`border-t ${editingRow === index ? 'bg-blue-50' : ''}`}>
									<td className="p-1 text-start">
										<p className="px-2 font-medium">{analyte.parameter_uid}</p>
									</td>
									<td className="p-1 text-start">
										<textarea
											className={`w-full border px-2 py-1 rounded bg-white resize-none ${
												editingRow !== index && 'border-none'
											}`}
											rows={2}
											value={analyte.parameter_name}
											onChange={(e) => handleInputChange(index, 'parameter_name', e.target.value)}
											disabled={editingRow !== index}
										/>
									</td>
									<td className="p-1 text-start">
										<textarea
											className={`w-full border px-2 py-1 rounded bg-white resize-none ${
												editingRow !== index && 'border-none'
											}`}
											rows={2}
											value={analyte.matrix}
											onChange={(e) => handleInputChange(index, 'matrix', e.target.value)}
											disabled={editingRow !== index}
										/>
									</td>
									<td className="p-1 text-start">
										<textarea
											className={`w-full border px-2 py-1 rounded bg-white resize-none ${
												editingRow !== index && 'border-none'
											}`}
											rows={2}
											value={analyte.protocol_code}
											onChange={(e) => handleInputChange(index, 'protocol_code', e.target.value)}
											disabled={editingRow !== index}
										/>
									</td>
									<td className="p-1 text-start ">
										{editingRow === index ? (
											<>
												<input
													type="number"
													min="0"
													className="w-14 border px-2 py-1 rounded bg-white"
													value={analyte.tat_expected}
													onChange={(e) => handleTatExpectedChange(index, e.target.value)}
												/>
												<span className="ml-2">Ngày</span>
											</>
										) : (
											<p className="px-2">{analyte.tat_expected && analyte.tat_expected.slice(' ')[0] + ' ngày'}</p>
										)}
									</td>
									<td className="p-1 text-center">
										<textarea
											className={`w-full border px-2 py-1 rounded bg-white resize-none ${
												editingRow !== index && 'border-none'
											}`}
											rows={2}
											value={analyte.default_unit || ''}
											onChange={(e) => handleInputChange(index, 'default_unit', e.target.value)}
											disabled={editingRow !== index}
										/>
									</td>
									<td className="p-1 text-start flex flex-col items-start">
										{editingRow === index ? (
											<>
												<label className="mt-1 flex items-center">
													<input
														type="checkbox"
														className="w-4 h-4"
														checked={analyte.accreditation?.includes('VILAS 997')}
														onChange={() => handleAccreditationChange(index, 'VILAS 997')}
													/>
													<p className="ml-1">{'VILAS 997'}</p>
												</label>
												<label className="mt-1 flex items-center">
													<input
														type="checkbox"
														className="w-4 h-4"
														checked={analyte.accreditation?.includes('107')}
														onChange={() => handleAccreditationChange(index, '107')}
													/>
													<p className="ml-1">{'107'}</p>
												</label>
											</>
										) : (
											<p className="px-2">{analyte.accreditation}</p>
										)}
									</td>
									<td className="p-1 text-start">
										{editingRow === index ? (
											<div className="relative">
												<button
													className="w-full border px-2 py-1 rounded bg-white text-left"
													onClick={() => toggleTechnicianDropdown(index)}
												>
													{technician(analyte) || 'Chọn KTV'}
												</button>
												{technicianDropdownVisible === index && (
													<ul className="absolute w-full bg-white border rounded shadow-lg z-10">
														{technicians.map((identity) => (
															<li
																key={identity.alias}
																className="p-1 text-md cursor-pointer hover:bg-gray-200"
																onClick={() => handleTechnicianChange(index, identity.identity_uid)}
															>
																<p className="font-bold text-primary text-sm">{identity.alias}</p>
																<p>{identity.identity_name}</p>
															</li>
														))}
													</ul>
												)}
											</div>
										) : (
											<textarea
												className="w-full border-none px-2 py-1 rounded bg-white resize-none"
												rows={2}
												value={technician(analyte) || ''}
												disabled
											/>
										)}
									</td>
									<td className="p-1 text-start">
										{editingRow === index ? (
											<select
												className="w-full border px-2 py-1 rounded bg-white"
												value={analyte.protocol_source || 'IRDOP'}
												onChange={(e) => handleProtocolSourceChange(index, e.target.value)}
											>
												<option value="IRDOP">IRDOP</option>
												<option value="IRDOP VS">IRDOP VS</option>
											</select>
										) : (
											<p className="px-2">{analyte.protocol_source || 'IRDOP'}</p>
										)}
									</td>
									<td className="p-1 text-center ">
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
				<div className="flex justify-center mt-4">{renderPageNumbers(totalPages, currentPage, handlePageChange)}</div>
			</div>
		</div>
	);
};

export default AnalyteInfor;
