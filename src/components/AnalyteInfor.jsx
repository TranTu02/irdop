import React, { useContext, useEffect, useState } from 'react';
import FilterBar from './FilterBar';
import Breadcrumb from './Breadcrumb';
import { GlobalContext } from '../contexts/GlobalContext';
import axios from 'axios';
import { RiEdit2Line } from 'react-icons/ri';
import { GiConfirmed, GiCancel } from 'react-icons/gi';

const AnalyteInfor = () => {
	const { setCurrentTitlePage, currentUser } = useContext(GlobalContext);
	const [analytes, setAnalytes] = useState([]);
	const [isEditing, setIsEditing] = useState(false);
	const [selectedAnalytes, setSelectedAnalytes] = useState([]);
	const [currentRole, setCurrentRole] = useState(currentUser.role[0]);
	const [isRoleDropdownVisible, setIsRoleDropdownVisible] = useState(false);
	const [editingRow, setEditingRow] = useState(null);
	const [isAddingNew, setIsAddingNew] = useState(false);
	const [newAnalyte, setNewAnalyte] = useState({
		parameter_name: '',
		matrix: 'Đất',
		tat_expected: { days: 1 },
		default_unit: '',
		accreditation: '',
		technicant_uid: '',
	});

	useEffect(() => {
		setCurrentTitlePage('Chỉ tiêu');
	}, [setCurrentTitlePage]);

	useEffect(() => {
		const fetchAnalytes = async () => {
			try {
				const response = await axios.get('http://127.0.0.1:1880/getAnalyte');
				const data = response.data.map(({ id, ...rest }) => rest); // Remove 'id' field
				setAnalytes(data);
			} catch (error) {
				console.error('Error fetching analytes:', error);
			}
		};

		fetchAnalytes();
	}, []);

	const formatDate = (dateString) => {
		const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
		return new Date(dateString).toLocaleDateString('en-GB', options);
	};

	const formatInterval = (interval) => {
		return `${interval.days} ngày`;
	};

	const handleEditClick = (index) => {
		setEditingRow(index);
	};

	const handleSaveClick = async (index) => {
		const updatedAnalyte = analytes[index];
		updatedAnalyte.tat_expected = { days: parseInt(updatedAnalyte.tat_expected) };
		console.log(updatedAnalyte);
		try {
			// await axios.post('https://12345/abc/def', updatedAnalyte);
			setEditingRow(null);
		} catch (error) {
			console.error('Error updating analyte:', error);
		}
	};

	const handleCancelClick = () => {
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

	const handleCheckboxChange = (parameter_name) => {
		setSelectedAnalytes((prevSelected) =>
			prevSelected.includes(parameter_name)
				? prevSelected.filter((name) => name !== parameter_name)
				: [...prevSelected, parameter_name],
		);
	};

	const handleDeleteClick = () => {
		const confirmed = window.confirm(`Selected analytes: ${selectedAnalytes.join(', ')}`);
		if (confirmed) {
			// Perform delete action here
			alert(`Deleted analytes: ${selectedAnalytes.join(', ')}`);
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
	};

	const handleSaveNewAnalyte = async () => {
		try {
			// await axios.post('https://12345/abc/def', newAnalyte);
			setAnalytes([...analytes, newAnalyte]);
			setIsAddingNew(false);
			setNewAnalyte({
				parameter_name: '',
				matrix: 'Đất',
				tat_expected: { days: 1 },
				default_unit: '',
				accreditation: '',
				technicant_uid: '',
			});
		} catch (error) {
			console.error('Error adding new analyte:', error);
		}
	};

	const handleCancelNewAnalyte = () => {
		setIsAddingNew(false);
		setNewAnalyte({
			parameter_name: '',
			matrix: 'Đất',
			tat_expected: { days: 1 },
			default_unit: '',
			accreditation: '',
			technicant_uid: '',
		});
	};

	const handleAccreditationChange = (index, value) => {
		const updatedAnalytes = analytes.map((analyte, analyteIndex) => {
			if (analyteIndex === index) {
				const accreditations = analyte.accreditation ? analyte.accreditation.split(', ') : [];
				if (accreditations.includes(value)) {
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
		newAnalyte.tat_expected = { days: parseInt(newAnalyte.tat_expected) };
		const accreditations = newAnalyte.accreditation ? newAnalyte.accreditation.split(', ') : [];
		if (accreditations.includes(value)) {
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

	return (
		<div className="w-full h-full relative">
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
					<FilterBar />

					<table className="min-w-screen-xl bg-white ">
						<thead className="border-b-2">
							<tr>
								<th className="py-2 text-center  w-1/3 ">Tên chỉ tiêu</th>
								<th className="py-2 text-center  w-1/4 ">Nền mẫu</th>
								<th className="py-2 text-center  w-1/12 min-w-20 ">Dự kiến</th>
								<th className="py-2 text-center  w-1/12 min-w-20 ">Đơn vị</th>
								<th className="py-2 text-center  min-w-40 max-w-56 ">Chứng nhận</th>
								<th className="py-2 text-center min-w-28">Ngày sửa</th>
								<th className="py-2 text-center min-w-36">Kiểm nghiệm viên</th>
								<th className="py-2 text-center min-w-24">Thao tác</th>
							</tr>
						</thead>
						<tbody>
							{isAddingNew && (
								<tr className="border-t bg-blue-50">
									<td className="p-1 text-start">
										<input
											type="text"
											className="w-full border px-2 py-1 rounded bg-white"
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
										</select>
									</td>
									<td className="p-1 text-start">
										<input
											type="number"
											className="w-14 border px-2 py-1 rounded bg-white"
											value={newAnalyte.tat_expected.days}
											onChange={(e) => handleNewAnalyteChange('tat_expected', e.target.value)}
										/>
										<span className="ml-2">Ngày</span>
									</td>
									<td className="p-1 text-center">
										<input
											type="text"
											className="w-full border px-2 py-1 rounded bg-white"
											value={newAnalyte.default_unit}
											onChange={(e) => handleNewAnalyteChange('default_unit', e.target.value)}
										/>
									</td>
									<td className="p-1 text-center ">
										<label className="mr-2">
											<input
												type="checkbox"
												className="w-4 h-4"
												checked={newAnalyte.accreditation.includes('VILAS 997')}
												onChange={() => handleNewAccreditationChange('VILAS 997')}
											/>
											VILAS 997
										</label>
										<label className="mr-2">
											<input
												type="checkbox"
												className="w-4 h-4"
												checked={newAnalyte.accreditation.includes('107')}
												onChange={() => handleNewAccreditationChange('107')}
											/>
											107
										</label>
									</td>
									<td className="p-1 text-start"></td>
									<td className="p-1 text-start">
										<input
											type="text"
											className="w-full border px-2 py-1 rounded bg-white"
											value={newAnalyte.technicant_uid}
											onChange={(e) => handleNewAnalyteChange('technicant_uid', e.target.value)}
										/>
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
							{analytes.map((analyte, index) => (
								<tr key={index} className={`border-t ${editingRow === index ? 'bg-blue-50' : ''}`}>
									<td className="p-1 text-start">
										{editingRow === index ? (
											<input
												type="text"
												className="w-full border px-2 py-1 rounded bg-white"
												value={analyte.parameter_name}
												onChange={(e) => handleInputChange(index, 'parameter_name', e.target.value)}
											/>
										) : (
											<p className="px-2">{analyte.parameter_name}</p>
										)}
									</td>
									<td className="p-1 text-start">
										{editingRow === index ? (
											<select
												className="w-full border px-2 py-1 rounded bg-white"
												value={analyte.matrix}
												onChange={(e) => handleInputChange(index, 'matrix', e.target.value)}
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
											</select>
										) : (
											<p className="px-2">{analyte.matrix}</p>
										)}
									</td>
									<td className="p-1 text-start ">
										{editingRow === index ? (
											<>
												<input
													type="number"
													className="w-14 border px-2 py-1 rounded bg-white"
													value={analyte.tat_expected.days}
													onChange={(e) => handleInputChange(index, 'tat_expected', e.target.value)}
												/>
												<span className="ml-2">Ngày</span>
											</>
										) : (
											<p className="px-2">{formatInterval(analyte.tat_expected)}</p>
										)}
									</td>
									<td className="p-1 text-center">
										{editingRow === index ? (
											<input
												type="text"
												className="w-full border px-2 py-1 rounded bg-white"
												value={analyte.default_unit}
												onChange={(e) => handleInputChange(index, 'default_unit', e.target.value)}
											/>
										) : (
											<p className="px-2">{analyte.default_unit}</p>
										)}
									</td>
									<td className="p-1 text-start">
										{editingRow === index ? (
											<>
												<label>
													<input
														type="checkbox"
														className="w-4 h-4"
														checked={analyte.accreditation.includes('VILAS 997')}
														onChange={() => handleAccreditationChange(index, 'VILAS 997')}
													/>
													VILAS 997
												</label>
												<label>
													<input
														type="checkbox"
														className="w-4 h-4"
														checked={analyte.accreditation.includes('107')}
														onChange={() => handleAccreditationChange(index, '107')}
													/>
													107
												</label>
											</>
										) : (
											<p className="px-2">{analyte.accreditation}</p>
										)}
									</td>
									<td className="p-1 text-start">
										<p>{formatDate(analyte.modified_at)}</p>
										<p className="text-primary text-sm font-medium">{analyte.modified_by_uid}</p>
									</td>
									<td className="p-1 text-start">{analyte.technicant_uid}</td>
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
											<button
												className="text-blue-500 px-2 py-1 focus:outline-none focus:border-none"
												onClick={() => handleEditClick(index)}
											>
												<RiEdit2Line size={20} />
											</button>
										)}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
};

export default AnalyteInfor;
