import React, { useState, useContext } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { GlobalContext } from '../contexts/GlobalContext';
import { useNavigate } from 'react-router-dom';

const CreateReceipt = () => {
	const { searchClients, createReceipt, setCurrentReceiptByUid, currentReceipt, setCurrentReceiptState } =
		useContext(GlobalContext);
	const navigate = useNavigate();
	const [isFormVisible, setIsFormVisible] = useState(false);
	const [isDisplayCustomer, setIsDisplayCustomer] = useState(false);
	const [isDisplayContact, setIsDisplayContact] = useState(false);
	const [customer, setCustomer] = useState({
		search: '',
		client_name: '',
		client_address: '',
		legal_id: '',
		contact_persons: [],
	});
	const [contact, setContact] = useState({ search: '', name: '', email: '', phone: '' });
	const [receipt, setReceipt] = useState({
		request_code: '',
		created_by: '',
		receipt_date: null,
		deadline: null,
		contact_person: { index: -1, name: '', email: '', phone: '' },
		note: '',
	});
	const [customerSuggestions, setCustomerSuggestions] = useState([]);
	const [contactSuggestions, setContactSuggestions] = useState([]);
	const [customerPage, setCustomerPage] = useState(0);
	const [contactPage, setContactPage] = useState(0);
	const [showConfirmation, setShowConfirmation] = useState(false);
	const [validationErrors, setValidationErrors] = useState({});

	const handleInputChange = (e, setState) => {
		const { name, value } = e.target;
		setState((prevState) => ({ ...prevState, [name]: value }));
	};

	const handleDateChange = (date, name) => {
		setReceipt((prevState) => ({ ...prevState, [name]: date }));
	};

	const handleCustomerSearch = (e) => {
		const { value } = e.target;
		setCustomer((prevState) => ({ ...prevState, search: value }));

		if (value.length >= 5) {
			if (isDisplayCustomer === false) {
				setIsDisplayCustomer(true);
			}
			const foundCustomers = searchClients(value);
			const uniqueCustomers = foundCustomers.filter(
				(customer, index, self) => index === self.findIndex((c) => c.client_uid === customer.client_uid),
			);
			setCustomerSuggestions(uniqueCustomers);
			setCustomerPage(0);
		} else {
			setIsDisplayCustomer(false);
			setCustomerSuggestions([]);
		}
	};

	const handleCustomerSelect = (customer) => {
		setIsDisplayCustomer(false);
		setCustomer({
			search: customer.client_uid,
			client_name: customer.client_name,
			client_address: customer.client_address,
			legal_id: customer.legal_id,
			contact_persons: customer.contact_persons,
		});
		setCustomerSuggestions([]);
	};

	const handleContactSearch = (e) => {
		if (isDisplayContact === false) {
			setIsDisplayContact(true);
		}
		const { value } = e.target;
		setContact((prevState) => ({ ...prevState, search: value }));

		const foundContacts = customer.contact_persons.filter(
			(person) => person.name.includes(value) || person.email.includes(value) || person.phone.includes(value),
		);
		setContactSuggestions(foundContacts);
		setContactPage(0);
	};

	const handleContactSelect = (contact, index) => {
		setIsDisplayContact(false);
		setContact({
			search: contact.name,
			name: contact.name,
			email: contact.email,
			phone: contact.phone,
		});
		setReceipt((prevState) => ({
			...prevState,
			contact_person: {
				index,
				name: contact.name,
				email: contact.email,
				phone: contact.phone,
			},
		}));
		setContactSuggestions([]);
	};

	const handleCancel = () => {
		setIsFormVisible(false);
		setCustomer({ search: '', client_name: '', client_address: '', legal_id: '', contact_persons: [] });
		setContact({ search: '', name: '', email: '', phone: '' });
		setReceipt({
			request_code: '',
			created_by: '',
			receipt_date: null,
			deadline: null,
			contact_person: { index: -1, name: '', email: '', phone: '' },
			note: '',
		});
	};

	const handleConfirm = () => {
		const errors = {};
		if (!receipt.created_by) errors.created_by = true;
		if (!receipt.receipt_date) errors.receipt_date = true;
		if (!customer.client_name) errors.client_name = true;
		if (!customer.client_address) errors.client_address = true;
		if (!customer.legal_id) errors.legal_id = true;

		if (Object.keys(errors).length > 0) {
			setValidationErrors(errors);
			alert('Vui lòng điền đầy đủ thông tin.');
			return;
		}

		setShowConfirmation(true);
	};

	const handleFinalConfirm = () => {
		const newReceipt = {
			receipt_uid: `R${Math.floor(Math.random() * 1000000)}`,
			request_code: receipt.request_code,
			created_by: receipt.created_by,
			receipt_date: receipt.receipt_date,
			deadline: receipt.deadline,
			client_uid: customer.search,
			client_name: customer.client_name,
			client_address: customer.client_address,
			legal_id: customer.legal_id,
			contact_person: {
				index: receipt.contact_person.index,
				name: contact.name,
				email: contact.email,
				phone: contact.phone,
			},
			note: receipt.note,
			samples: [],
		};

		console.log(newReceipt);
		// createReceipt(newReceipt);
		// setCurrentReceiptState(newReceipt);
		// navigate(`/receiptInfor/${newReceipt.receipt_uid}`);
	};

	const isCustomerInfoComplete =
		customer.search && customer.client_name && customer.client_address && customer.legal_id;

	const customerSuggestionsToShow = customerSuggestions.slice(customerPage * 5, (customerPage + 1) * 5);
	const contactSuggestionsToShow = contactSuggestions.slice(contactPage * 5, (contactPage + 1) * 5);

	return (
		<div className="relative p-1">
			<button className="bg-blue-500 text-white font-bold py-1 px-4 rounded-2xl" onClick={() => setIsFormVisible(true)}>
				Tạo tiếp nhận mẫu
			</button>

			{isFormVisible && (
				<div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50">
					<div className="bg-white p-6 rounded-lg  shadow-lg w-full md:max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl">
						<h2 className="text-2xl font-bold mb-4 text-primary">TIẾP NHẬN MẪU MỚI</h2>
						<div className="mb-4">
							<h3 className="text-xl font-semibold mb-2">Thông tin tiếp nhận mẫu</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="w-full flex flex-col items-start">
									<div className="w-72 md:w-48 lg:w-56 xl:w-64 2xl:w-72">
										<label className="block p-1 pb-0 text-start text-sm font-medium">Số yêu cầu đến</label>
										<input
											type="text"
											name="request_code"
											placeholder="Số yêu cầu đến"
											value={receipt.request_code}
											onChange={(e) => handleInputChange(e, setReceipt)}
											className="w-full p-2 outline-none focus:border-primary border border-gray-300 rounded mb-2 placeholder-gray-500 text-black bg-white"
											required
										/>
									</div>
									<div>
										<label className="block p-1 pb-0 text-start text-sm font-medium">Ngày nhận mẫu</label>
										<DatePicker
											selected={receipt.receipt_date}
											onChange={(date) => handleDateChange(date, 'receipt_date')}
											dateFormat="dd/MM/yyyy"
											placeholderText="Ngày nhận mẫu"
											className={`w-72 md:w-48 lg:w-56 xl:w-64 2xl:w-72 p-2  outline-none focus:border-primary border ${
												validationErrors.receipt_date ? 'border-red-500' : 'border-gray-300'
											} rounded  mb-2 placeholder-gray-500 text-black bg-white datepicker-full-width`}
											calendarClassName="text-black"
											required
										/>
									</div>
								</div>
								<div className="w-full flex flex-col items-end">
									<div className="w-72 md:w-48 lg:w-56 xl:w-64 2xl:w-72">
										<label className="block p-1 pb-0 text-start text-sm font-medium">Người tiếp nhận</label>
										<input
											type="text"
											name="created_by"
											placeholder="Người tiếp nhận"
											value={receipt.created_by}
											onChange={(e) => handleInputChange(e, setReceipt)}
											className={`w-full  outline-none focus:border-primary p-2 border ${
												validationErrors.created_by ? 'border-red-500' : 'border-gray-300'
											} rounded mb-2 placeholder-gray-500 text-black bg-white`}
											required
										/>
									</div>
									<div>
										<label className="block p-1 pb-0 text-start text-sm font-medium">Hạn trả kết quả dự kiến</label>
										<DatePicker
											selected={receipt.deadline}
											onChange={(date) => handleDateChange(date, 'deadline')}
											dateFormat="dd/MM/yyyy"
											placeholderText="Hạn trả kết quả dự kiến"
											className="w-72 md:w-48 lg:w-56 xl:w-64 2xl:w-72 p-2  outline-none focus:border-primary border border-gray-300 rounded placeholder-gray-500 text-black bg-white datepicker-full-width "
											calendarClassName="text-black"
											required
										/>
									</div>
								</div>
							</div>
							<div className="w-full flex flex-col items-center">
								<div className="w-full">
									<label className="block p-1 pb-0 text-start text-sm font-medium">Ghi chú</label>
									<textarea
										name="note"
										placeholder="Ghi chú"
										value={receipt.note}
										onChange={(e) => handleInputChange(e, setReceipt)}
										className={`w-full resize-none p-2 outline-none focus:border-primary border border-gray-300 rounded mb-2 placeholder-gray-500 text-black bg-white`}
										rows="2"
										required
									/>
								</div>
							</div>
						</div>
						<div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="w-full flex flex-col items-start relative">
								<h3 className="text-xl font-semibold mb-2 text-center w-full">Khách hàng</h3>
								<div className="w-72 md:w-48 lg:w-56 xl:w-64 2xl:w-72">
									<label className="block p-1 pb-0 text-start text-sm font-medium">Tìm kiếm khách hàng</label>
									<input
										type="text"
										name="search"
										placeholder="Tìm kiếm khách hàng"
										value={customer.search}
										onChange={handleCustomerSearch}
										className="w-full outline-none focus:border-primary p-2 border border-gray-300 rounded mb-2 placeholder-gray-500 text-black bg-white"
									/>
									{isDisplayCustomer && customer.search.length >= 5 && (
										<div className="absolute z-10 border border-gray-300 rounded bg-white max-h-80 overflow-y-auto w-72 md:w-48 lg:w-56 xl:w-64 2xl:w-72">
											{customerSuggestions.length > 0 ? (
												customerSuggestionsToShow.map((suggestion) => (
													<div
														key={suggestion.client_uid}
														className="p-2 pt-0 cursor-pointer hover:bg-gray-200 border-t border-b"
														onClick={() => handleCustomerSelect(suggestion)}
													>
														<div className="text-end text-xs font-semibold text-primary">{suggestion.client_uid}</div>
														<div className="truncate text-start text-sm text-primary font-medium">
															{suggestion.client_name}
														</div>
														<div className="truncate text-start text-sm">{suggestion.client_address}</div>
													</div>
												))
											) : (
												<div className="p-2 text-center text-gray-500">Không có kết quả phù hợp</div>
											)}
											{customerSuggestions.length > 0 && (
												<div className="flex justify-between p-2">
													<button
														className="text-blue-500"
														onClick={() => setCustomerPage((prev) => Math.max(prev - 1, 0))}
														disabled={customerPage === 0}
													>
														Trước
													</button>
													<span className="text-gray-500">
														Trang {customerPage + 1} / {Math.ceil(customerSuggestions.length / 5)}
													</span>
													<button
														className="text-blue-500"
														onClick={() =>
															setCustomerPage((prev) =>
																(customerPage + 1) * 5 < customerSuggestions.length ? prev + 1 : prev,
															)
														}
														disabled={(customerPage + 1) * 5 >= customerSuggestions.length}
													>
														Sau
													</button>
												</div>
											)}
											{customerSuggestions.length === 0 && (
												<div className="flex justify-center p-2">
													<button
														className="text-blue-500"
														onClick={() => {
															setCustomer({
																search: '',
																client_name: '',
																client_address: '',
																legal_id: '',
																contact_persons: [],
															});
															document.querySelector('input[name="client_name"]').focus();
														}}
													>
														Khách hàng mới
													</button>
												</div>
											)}
										</div>
									)}
								</div>
								<div className="w-72 md:w-48 lg:w-56 xl:w-64 2xl:w-72">
									<label className="block p-1 pb-0 text-start text-sm font-medium">Tên khách hàng</label>
									<input
										type="text"
										name="client_name"
										placeholder="Tên khách hàng"
										value={customer.client_name}
										onChange={(e) => handleInputChange(e, setCustomer)}
										className={`w-72 md:w-48 lg:w-56 xl:w-64 2xl:w-72 p-2 outline-none focus:border-primary border ${
											validationErrors.client_name ? 'border-red-500' : 'border-gray-300'
										} rounded mb-2 placeholder-gray-500 text-black bg-white`}
										disabled={!!customer.search}
										required
									/>
								</div>
								<div className="w-72 md:w-48 lg:w-56 xl:w-64 2xl:w-72">
									<label className="block p-1 pb-0 text-start text-sm font-medium">Địa chỉ</label>
									<input
										type="text"
										name="client_address"
										placeholder="Địa chỉ"
										value={customer.client_address}
										onChange={(e) => handleInputChange(e, setCustomer)}
										className={`outline-none focus:border-primary w-72 md:w-48 lg:w-56 xl:w-64 2xl:w-72 p-2 border ${
											validationErrors.client_address ? 'border-red-500' : 'border-gray-300'
										} rounded mb-2 placeholder-gray-500 text-black bg-white`}
										disabled={!!customer.search}
										required
									/>
								</div>
								<div className="w-72 md:w-48 lg:w-56 xl:w-64 2xl:w-72">
									<label className="block p-1 pb-0 text-start text-sm font-medium">MST/CCCD</label>
									<input
										type="text"
										name="legal_id"
										placeholder="MST/CCCD"
										value={customer.legal_id}
										onChange={(e) => handleInputChange(e, setCustomer)}
										className={`outline-none focus:border-primary w-72 md:w-48 lg:w-56 xl:w-64 2xl:w-72 p-2 border ${
											validationErrors.legal_id ? 'border-red-500' : 'border-gray-300'
										} rounded placeholder-gray-500 text-black bg-white`}
										disabled={!!customer.search}
										required
									/>
								</div>
							</div>
							<div className="w-full flex flex-col items-end relative">
								<h3 className="text-xl font-semibold mb-2 w-full text-center">Người liên hệ</h3>
								<div className="w-72 md:w-48 lg:w-56 xl:w-64 2xl:w-72">
									<label className="block p-1 pb-0 text-start text-sm font-medium">Tìm kiếm người liên hệ</label>
									<div className="relative">
										<input
											type="text"
											name="search"
											placeholder="Tìm kiếm người liên hệ"
											value={contact.search}
											onChange={handleContactSearch}
											className="w-72 md:w-48 lg:w-56 xl:w-64 2xl:w-72 p-2 outline-none focus:border-primary border border-gray-300 rounded mb-2 placeholder-gray-500 text-black bg-white"
											disabled={!isCustomerInfoComplete}
											required
										/>
										{isDisplayContact && contact.search && (
											<div className="absolute z-10 border border-gray-300 rounded bg-white max-h-72 overflow-y-auto w-72 md:w-48 lg:w-56 xl:w-64 2xl:w-72">
												{contactSuggestions.length > 0 ? (
													contactSuggestionsToShow.map((suggestion, index) => (
														<div
															key={suggestion.email}
															className="p-2 cursor-pointer hover:bg-gray-200 border-t border-b"
															onClick={() => handleContactSelect(suggestion, index)}
														>
															<div className="truncate text-start text-sm text-primary font-medium">
																{suggestion.name}
															</div>
															<div className="truncate text-start text-sm">{suggestion.email}</div>
															<div className="truncate text-start text-sm">{suggestion.phone}</div>
														</div>
													))
												) : (
													<div className="p-2 text-center text-gray-500">Không có kết quả phù hợp</div>
												)}
												{contactSuggestions.length === 0 && (
													<div className="flex justify-center p-2">
														<button
															className="text-blue-500"
															onClick={() => {
																setContact({ search: '', name: '', email: '', phone: '' });
																document.querySelector('input[name="name"]').focus();
															}}
														>
															Người liên hệ mới
														</button>
													</div>
												)}
											</div>
										)}
									</div>
								</div>
								<div className="w-72 md:w-48 lg:w-56 xl:w-64 2xl:w-72">
									<label className="block p-1 pb-0 text-start text-sm font-medium">Họ tên</label>
									<input
										type="text"
										name="name"
										placeholder="Họ tên"
										value={contact.name}
										onChange={(e) => handleInputChange(e, setContact)}
										className="w-72 md:w-48 lg:w-56 xl:w-64 2xl:w-72 p-2 outline-none focus:border-primary border border-gray-300 rounded mb-2 placeholder-gray-500 text-black bg-white"
										disabled={!!contact.search}
										required
									/>
								</div>
								<div className="w-72 md:w-48 lg:w-56 xl:w-64 2xl:w-72">
									<label className="block p-1 pb-0 text-start text-sm font-medium">Email</label>
									<input
										type="email"
										name="email"
										placeholder="Email"
										value={contact.email}
										onChange={(e) => handleInputChange(e, setContact)}
										className="w-72 md:w-48 lg:w-56 xl:w-64 2xl:w-72 p-2 outline-none focus:border-primary border border-gray-300 rounded mb-2 placeholder-gray-500 text-black bg-white"
										disabled={!!contact.search}
										required
									/>
								</div>
								<div className="w-72 md:w-48 lg:w-56 xl:w-64 2xl:w-72">
									<label className="block p-1 pb-0 text-start text-sm font-medium">Điện thoại</label>
									<input
										type="text"
										name="phone"
										placeholder="Điện thoại"
										value={contact.phone}
										onChange={(e) => handleInputChange(e, setContact)}
										className="w-72 md:w-48 lg:w-56 xl:w-64 2xl:w-72 p-2 outline-none focus:border-primary border border-gray-300 rounded placeholder-gray-500 text-black bg-white"
										disabled={!!contact.search}
										required
									/>
								</div>
							</div>
						</div>
						<div className="flex justify-end">
							<button className="bg-gray-500 text-white font-bold py-2 px-4 rounded mr-2" onClick={handleCancel}>
								Hủy bỏ
							</button>
							<button className="bg-blue-500 text-white font-bold py-2 px-4 rounded" onClick={handleConfirm}>
								Xác nhận
							</button>
						</div>
					</div>
				</div>
			)}

			{showConfirmation && (
				<div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50">
					<div className="bg-white p-6 rounded-lg shadow-lg w-4/5 md:w-3/5 lg:w-1/2 2xl:w-2/5">
						<h2 className="text-2xl font-bold mb-4 text-primary">Xác nhận thông tin</h2>
						<div className="mb-4">
							<h3 className="text-xl font-semibold mb-2">Thông tin khách hàng</h3>
							<p>Tên khách hàng: {customer.client_name}</p>
							<p>Địa chỉ: {customer.client_address}</p>
							<p>MST/CCCD: {customer.legal_id}</p>
						</div>
						<div className="mb-4">
							<h3 className="text-xl font-semibold mb-2">Thông tin người liên hệ</h3>
							<p>Họ tên: {contact.name}</p>
							<p>Email: {contact.email}</p>
							<p>Điện thoại: {contact.phone}</p>
						</div>
						<div className="mb-4">
							<h3 className="text-xl font-semibold mb-2">Thông tin tiếp nhận mẫu</h3>
							<p>Số yêu cầu đến: {receipt.request_code}</p>
							<p>Người tiếp nhận: {receipt.created_by}</p>
							<p>Ngày nhận mẫu: {receipt.receipt_date?.toLocaleDateString()}</p>
							<p>Hạn trả kết quả dự kiến: {receipt.deadline?.toLocaleDateString()}</p>
						</div>
						<div className="flex justify-end">
							<button
								className="bg-gray-500 text-white font-bold py-2 px-4 rounded mr-2"
								onClick={() => setShowConfirmation(false)}
							>
								Hủy bỏ
							</button>
							<button className="bg-blue-500 text-white font-bold py-2 px-4 rounded" onClick={handleFinalConfirm}>
								Xác nhận
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default CreateReceipt;
