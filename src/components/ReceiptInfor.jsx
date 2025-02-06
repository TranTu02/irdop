import * as React from 'react';
const { useContext, useState, useEffect } = React;
import TinyMceInput from './Input';
import { GlobalContext } from '../contexts/GlobalContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Breadcrumb from './Breadcrumb';
import FilterBar from './FilterBar';
import { NavLink, useParams, useNavigate } from 'react-router-dom';
import { RiEdit2Line } from 'react-icons/ri';
import { CgFileDocument } from 'react-icons/cg';
import { TiBusinessCard } from 'react-icons/ti';
import { MdOutlineContactPhone } from 'react-icons/md';

const ReceiptInfor = ({ receipt }) => {
	const { listAnalytes, setListAnalytes, currentReceipt, setCurrentReceipt, setCurrentTitlePage, currentUser } =
		useContext(GlobalContext);
	const [editingField, setEditingField] = useState(null);
	const [inputValue, setInputValue] = useState('');
	const [isEditorVisible, setIsEditorVisible] = useState(false);
	const [currentRole, setCurrentRole] = useState(currentUser.role[0]);
	const [isRoleDropdownVisible, setIsRoleDropdownVisible] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [isSampleDropdownVisible, setIsSampleDropdownVisible] = useState(false);
	const [viewMode, setViewMode] = useState('analyte'); // 'analyte' or 'sample'
	const navigate = useNavigate();
	let key;
	const { receipt_uid } = useParams();

	useEffect(() => {
		setCurrentTitlePage('Tiếp nhận mẫu');
	}, [setCurrentTitlePage]);

	useEffect(() => {
		if (!receipt) {
			if (receipt_uid) {
				setCurrentReceipt(receipt_uid);
			}
		} else {
			setCurrentReceipt(receipt.receipt_uid);
		}
	}, [receipt]);

	const handleResultValueClick = (order) => {
		setEditingField(`result_value-${order.sample_uid}-${order.id}`);
		setInputValue(order.result_value ? String(order.result_value) : ''); // Đảm bảo giá trị là chuỗi
		setIsEditorVisible(true);
	};

	const handleResultUnitClick = (order) => {
		setEditingField(`result_unit-${order.sample_uid}-${order.id}`);
		setInputValue(order.result_unit ? String(order.result_unit) : ''); // Đảm bảo giá trị là chuỗi
		setIsEditorVisible(true);
	};

	// Kiểm tra phím nhập vào, nếu là enter thì log ra giá trị vừa nhập
	const handleKeyDown = (e, newValue) => {
		key = e.key;
		if (key === 'Enter') {
			setInputValue(newValue);
			const updatedAnalytes = listAnalytes.map((item) => {
				if (item.id === parseInt(editingField.split('-')[2]) && item.sample_uid === editingField.split('-')[1]) {
					if (editingField.startsWith('result_value')) {
						return { ...item, result_value: newValue };
					} else if (editingField.startsWith('result_unit')) {
						return { ...item, result_unit: newValue };
					}
				}
				return item;
			});

			setListAnalytes(updatedAnalytes);
			setIsEditorVisible(false);
			setEditingField(null);
			handleNotify(newValue);
		}
	};

	const handleSaveContent = (newValue) => {
		if (key !== 'Enter') {
			setInputValue(newValue);
			const updatedAnalytes = listAnalytes.map((item) => {
				if (item.id === parseInt(editingField.split('-')[2]) && item.sample_uid === editingField.split('-')[1]) {
					if (editingField.startsWith('result_value')) {
						return { ...item, result_value: newValue };
					} else if (editingField.startsWith('result_unit')) {
						return { ...item, result_unit: newValue };
					}
				}
				return item;
			});

			setListAnalytes(updatedAnalytes);
			setIsEditorVisible(false);
			setEditingField(null);
			handleNotify(newValue);
		}
	};

	const processHtmlString = (htmlString) => {
		return htmlString
			.replace(/<p>/g, '') // Bỏ thẻ mở <p>
			.replace(/<\/p>/g, '') // Bỏ thẻ đóng </p>
			.replace(/<sub>(.*?)<\/sub>/g, '_$1_') // Thay <sub>...</sub> bằng _..._
			.replace(/<sup>(.*?)<\/sup>/g, '^$1^'); // Thay <sup>...</sup> bằng ^...^
	};

	const handleNotify = (data) => {
		toast.success(`Kết quả vừa nhập: ${processHtmlString(data)}`, {
			autoClose: 3000, // Tự động đóng sau 3 giây
		});
	};

	const handleRoleChange = (role) => {
		setCurrentRole(role);
		setIsRoleDropdownVisible(false);
	};

	const handleEditClick = () => {
		setIsEditing(true);
	};

	const handleCancelEdit = () => {
		setIsEditing(false);
	};

	const handleSaveEdit = () => {
		// Save changes logic here
		setIsEditing(false);
	};

	const handleViewModeChange = (mode) => {
		setViewMode(mode);
	};

	return (
		<div className="">
			<ToastContainer />
			<Breadcrumb
				paths={[
					{ name: 'Danh sách', link: '/' },
					{ name: `${currentReceipt.receipt_uid}`, link: `/dashboard/${currentReceipt.receipt_uid}` },
				]}
			/>
			<div className="rounded-lg w-full p-4 bg-white">
				<div className="w-full h-10 flex justify-between items-center relative">
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
					<button className="bg-blue-500 text-white px-4 py-0 w-32 rounded-lg">In biên bản</button>
				</div>
				<table className="min-w-full text-black mt-1 ">
					<thead className="border-2">
						<tr className="">
							<th className="py-2 px-4 border-b w-1/6">Mã tiếp nhận mẫu</th>
							<th className="py-2 px-4 border-b w-1/6">Mã mẫu thử</th>
							<th className="py-2 px-4 border-b w-2/6">Thông tin mẫu thử</th>
							<th className="py-2 px-4 border-b w-1/6">Số lượng chỉ tiêu</th>
							<th className="py-2 px-4 border-b w-1/6">Hạn trả kết quả</th>
						</tr>
					</thead>
					<tbody className="border-2">
						{currentReceipt.samples.map((sample, sampleIndex) => {
							const totalTests = sample.sample_analytes.length;
							const completedTests = sample.sample_analytes.filter((order) => order.result_value !== '').length;
							const pendingTests = totalTests - completedTests;

							return (
								<tr
									key={sample.id}
									className={`${sampleIndex === 0 ? 'border-t' : ''} ${
										sampleIndex === currentReceipt.samples.length - 1 ? 'border-b' : ''
									}`}
								>
									{sampleIndex === 0 && (
										<td className="py-2 px-4 text-primary font-semibold" rowSpan={currentReceipt.samples.length}>
											{currentReceipt.receipt_uid}
										</td>
									)}
									<td className="py-2 px-4 text-primary font-medium">
										<NavLink to={`/dashboard/${receipt_uid}/${sample.sample_uid}`}>{sample.sample_uid}</NavLink>
									</td>
									<td className="py-2 px-4">{sample.sample_name}</td>
									<td className="py-2 px-4">
										{completedTests} / {pendingTests} / {totalTests}
									</td>
									{sampleIndex === 0 && (
										<td className="py-2 px-4" rowSpan={currentReceipt.samples.length}>
											{currentReceipt.deadline}
										</td>
									)}
								</tr>
							);
						})}
					</tbody>
				</table>

				<div className="flex flex-col">
					<div className="flex justify-between items-center mt-4 p-2 border rounded-md">
						<div className="w-1/2 flex flex-col items-start">
							<div className="flex justify-between items-center w-full p-2">
								<CgFileDocument size={16} className="text-primary" />
								<h2 className="text-md font-semibold w-fit text-primary px-1">THÔNG TIN TIẾP NHẬN</h2>
								<RiEdit2Line size={16} className="text-primary cursor-pointer" onClick={handleEditClick} />
							</div>
							<div className="flex justify-start w-full p-2">
								<div className="text-sm font-semibold w-1/4 flex item-start p-2 min-w-32">Số yêu cầu đến:</div>
								<div className="text-sm w-full flex item-start">
									<input
										type="text"
										className="bg-white border px-1 w-full rounded-lg"
										defaultValue={currentReceipt.request_code}
										disabled={!isEditing}
									/>
								</div>
							</div>
							<div className="flex justify-start w-full p-2">
								<div className="text-sm font-semibold w-1/4 flex item-start p-2 min-w-32">Mã tiếp nhận:</div>
								<div className="text-sm w-full flex item-start">
									<input
										type="text"
										className="bg-white border px-1 w-full rounded-lg"
										defaultValue={currentReceipt.receipt_uid}
										disabled={!isEditing}
									/>
								</div>
							</div>
							<div className="flex justify-start w-full p-2">
								<div className="text-sm font-semibold w-1/4 flex item-start p-2 min-w-32">Ngày tiếp nhận:</div>
								<div className="text-sm w-full flex item-start">
									<input
										type="text"
										className="bg-white border px-1 w-full rounded-lg"
										defaultValue={currentReceipt.receipt_date}
										disabled={!isEditing}
									/>
								</div>
							</div>
							<div className="flex justify-start w-full p-2">
								<div className="text-sm font-semibold w-1/4 flex item-start p-2 min-w-32">Người tiếp nhận:</div>
								<div className="text-sm w-full flex item-start">
									<input
										type="text"
										className="bg-white border px-1 w-full rounded-lg"
										defaultValue={currentReceipt.created_by}
										disabled={!isEditing}
									/>
								</div>
							</div>
							<div className="flex justify-start w-full p-2">
								<div className="text-sm font-semibold w-1/4 flex item-start p-2 min-w-32">Hạn trả kết quả:</div>
								<div className="text-sm w-full flex item-start">
									<input
										type="text"
										className="bg-white border px-1 w-full rounded-lg"
										defaultValue={currentReceipt.deadline}
										disabled={!isEditing}
									/>
								</div>
							</div>
							<div className="flex justify-start w-full p-2">
								<div className="text-sm font-semibold w-1/4 flex item-start p-2 min-w-32">Số lượng mẫu:</div>
								<div className="text-sm w-full flex items-center">
									<p className="text-center flex items-center w-12 font-medium">{currentReceipt.samples.length}</p>
									<div className="relative">
										<button
											className="bg-blue-500 text-white px-2 py-1 rounded-lg w-44"
											onClick={() => setIsSampleDropdownVisible(!isSampleDropdownVisible)}
										>
											Danh sách mẫu
										</button>
										{isSampleDropdownVisible && (
											<div className="absolute top-full mt-1 w-44 bg-white border rounded shadow-lg z-10 ">
												{currentReceipt.samples.map((sample) => (
													<div
														key={sample.sample_uid}
														className="p-1 text-md cursor-pointer hover:bg-gray-200 text-start border-b border-slate-100 px-2 co"
														onClick={() => navigate(`/dashboard/${receipt_uid}/${sample.sample_uid}`)}
													>
														{sample.sample_uid}
													</div>
												))}
											</div>
										)}
									</div>
								</div>
							</div>
							<div className="flex justify-start w-full p-2">
								<div className="text-sm font-semibold w-1/4 flex item-start p-2 min-w-32">Ghi chú</div>
								<div className="text-sm w-full flex item-start">
									<textarea
										className="w-full px-1 border bg-white rounded-lg p-2 pt-1.5 resize-none"
										rows="3"
										defaultValue={currentReceipt.note}
										disabled={!isEditing}
									/>
								</div>
							</div>
						</div>
						<div className="2xl:w-12 xl:w-10 lg:w-6 md:w-4 " />
						<div className="w-1/2 flex flex-col items-start">
							<div className="flex justify-between items-center w-full p-2">
								<div></div>
								<div className="flex items-center pl-5">
									<TiBusinessCard size={16} className="text-primary mr-1 " />
									<h2 className="text-md font-semibold w-full text-primary">THÔNG TIN KHÁCH HÀNG</h2>
								</div>
								<RiEdit2Line size={16} className="text-primary cursor-pointer" onClick={handleEditClick} />
							</div>
							<div className="flex justify-start w-full p-2">
								<div className="text-sm font-semibold w-1/4 flex item-start p-2 min-w-40">Mã khách hàng:</div>
								<div className="text-sm w-full flex item-start">
									<input
										type="text"
										className="bg-white border px-1 w-full rounded-lg"
										defaultValue={currentReceipt.client_uid}
										disabled={!isEditing}
									/>
								</div>
							</div>
							<div className="flex justify-start w-full p-2">
								<div className="text-sm font-semibold w-1/4 flex item-start p-2 min-w-40">Tên công ty/cá nhân:</div>
								<div className="text-sm w-full flex item-start">
									<input
										type="text"
										className="bg-white border px-1 w-full rounded-lg"
										defaultValue={currentReceipt.client_name}
										disabled={!isEditing}
									/>
								</div>
							</div>
							<div className="flex justify-start w-full p-2">
								<div className="text-sm font-semibold w-1/4 flex item-start p-2 min-w-40">Địa chỉ:</div>
								<div className="text-sm w-full flex item-start">
									<input
										type="text"
										className="bg-white border px-1 w-full rounded-lg"
										defaultValue={currentReceipt.client_address}
										disabled={!isEditing}
									/>
								</div>
							</div>
							<div className="flex justify-start w-full p-2">
								<div className="text-sm font-semibold w-1/4 flex item-start p-2 min-w-40">Mã số thuế/CCCD:</div>
								<div className="text-sm w-full flex item-start">
									<input
										type="text"
										className="bg-white border px-1 w-full rounded-lg"
										defaultValue={currentReceipt.legal_id}
										disabled={!isEditing}
									/>
								</div>
							</div>
							<div className="flex justify-between items-center w-full p-2">
								<div></div>
								<div className="flex items-center pl-5">
									<MdOutlineContactPhone size={16} className="text-primary mr-1" />
									<h2 className="text-md font-semibold w-fit text-primary">THÔNG TIN LIÊN HỆ</h2>
								</div>
								<RiEdit2Line size={16} className="text-primary cursor-pointer" onClick={handleEditClick} />
							</div>
							<div className="flex justify-start w-full p-2">
								<div className="text-sm font-semibold w-1/4 flex item-start p-2 min-w-40">Họ tên:</div>
								<div className="text-sm w-full flex item-start">
									<input
										type="text"
										className="bg-white border px-1 w-full rounded-lg"
										defaultValue={currentReceipt.contact_name}
										disabled={!isEditing}
									/>
								</div>
							</div>
							<div className="flex justify-start w-full p-2">
								<div className="text-sm font-semibold w-1/4 flex item-start p-2 min-w-40">Email:</div>
								<div className="text-sm w-full flex item-start">
									<input
										type="text"
										className="bg-white border px-1 w-full rounded-lg"
										defaultValue={currentReceipt.contact_email}
										disabled={!isEditing}
									/>
								</div>
							</div>
							<div className="flex justify-start w-full p-2">
								<div className="text-sm font-semibold w-1/4 flex item-start p-2 min-w-40">Điện thoại:</div>
								<div className="text-sm w-full flex item-start">
									<input
										type="text"
										className="bg-white border px-1 w-full rounded-lg"
										defaultValue={currentReceipt.contact_phone}
										disabled={!isEditing}
									/>
								</div>
							</div>
						</div>
					</div>

					{isEditing && (
						<div className="flex justify-end w-full p-2">
							<button className="bg-gray-500 text-white font-bold py-2 px-4 rounded mr-2" onClick={handleCancelEdit}>
								Hủy bỏ
							</button>
							<button className="bg-blue-500 text-white font-bold py-2 px-4 rounded" onClick={handleSaveEdit}>
								Chấp nhận
							</button>
						</div>
					)}
				</div>
			</div>
			<div className="bg-white rounded-lg w-full mt-4 p-4">
				<div className="flex justify-between items-center pb-4">
					<div className="relative">
						<button
							className="bg-blue-500 text-white px-4 py-2 rounded-lg"
							onClick={() => setViewMode(viewMode === 'analyte' ? 'sample' : 'analyte')}
						>
							{viewMode === 'analyte' ? 'Thông tin mẫu thử' : 'Thông tin chỉ tiêu'}
						</button>
					</div>
					<h2 className="text-4xl text-primary font-semibold">
						{viewMode === 'analyte' ? 'Thông tin chỉ tiêu' : 'Thông tin mẫu thử'}
					</h2>
					<button className="bg-blue-500 text-white px-4 py-2 rounded-lg">Thêm mẫu mới</button>
				</div>

				{viewMode === 'analyte' ? (
					<>
						<FilterBar currentList={listAnalytes} setCurrentList={setListAnalytes} />

						<table className="text-black w-full relative z-0">
							<thead>
								<tr className="border-y-2">
									<th className="py-2 px-4 border-x w-1/6 min-w-36">Mã mẫu thử</th>
									<th className="py-2 px-4 border-x w-1/3">Tên chỉ tiêu</th>
									<th className="py-2 px-4 border-x w-1/3 hidden md:table-cell">Phương pháp</th>
									<th className="py-2 px-4 border-x w-1/12 min-w-16">Kết quả</th>
									<th className="py-2 px-4 border-x w-1/12 min-w-16">Đơn vị</th>
								</tr>
							</thead>
							<tbody>
								{listAnalytes.map((order) => (
									<tr key={`${order.sample_uid}-${order.id}`}>
										<td className="py-2 px-4 border">{order.sample_uid}</td>
										<td className="py-2 px-4 border text-start">{order.analyte_name}</td>
										<td className="py-2 px-4 border text-start hidden md:table-cell">{order.protocol}</td>
										<td className="py-2 px-4 border relative" onClick={() => handleResultValueClick(order)}>
											{editingField === `result_value-${order.sample_uid}-${order.id}` && isEditorVisible ? (
												<TinyMceInput value={inputValue} onUpdate={handleSaveContent} onKey={handleKeyDown} />
											) : (
												<div dangerouslySetInnerHTML={{ __html: order.result_value }} />
											)}
										</td>
										<td className="py-2 px-4 border relative" onClick={() => handleResultUnitClick(order)}>
											{editingField === `result_unit-${order.sample_uid}-${order.id}` && isEditorVisible ? (
												<TinyMceInput value={inputValue} onUpdate={handleSaveContent} onKey={handleKeyDown} />
											) : (
												<div className="min-h-6" dangerouslySetInnerHTML={{ __html: order.result_unit }} />
											)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</>
				) : (
					<table className="min-w-full text-black mt-1 ">
						<thead className="border-2">
							<tr className="">
								<th className="py-2 px-4 border-b w-1/6">Mã mẫu thử</th>
								<th className="py-2 px-4 border-b w-1/3">Tên mẫu thử</th>
								<th className="py-2 px-4 border-b w-1/3">Thông tin mẫu thử</th>
								<th className="py-2 px-4 border-b w-1/6">Số lượng chỉ tiêu</th>
							</tr>
						</thead>
						<tbody className="border-2">
							{currentReceipt.samples.map((sample, sampleIndex) => {
								const totalTests = sample.sample_analytes.length;
								const completedTests = sample.sample_analytes.filter((order) => order.result_value !== '').length;
								const pendingTests = totalTests - completedTests;

								return (
									<tr
										key={sample.id}
										className={`${sampleIndex === 0 ? 'border-t' : ''} ${
											sampleIndex === currentReceipt.samples.length - 1 ? 'border-b' : ''
										}`}
									>
										<td className="py-2 px-4 text-primary font-medium">
											<NavLink to={`/dashboard/${receipt_uid}/${sample.sample_uid}`}>{sample.sample_uid}</NavLink>
										</td>
										<td className="py-2 px-4">{sample.sample_name}</td>
										<td className="py-2 px-4">{sample.sample_info}</td>
										<td className="py-2 px-4">
											{completedTests} / {pendingTests} / {totalTests}
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				)}
			</div>
		</div>
	);
};

export default ReceiptInfor;
