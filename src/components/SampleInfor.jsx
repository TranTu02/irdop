import * as React from 'react';
const { useContext, useState, useEffect } = React;
import { useParams } from 'react-router-dom';
import { GlobalContext } from '../contexts/GlobalContext';
import Breadcrumb from './Breadcrumb';
import TinyMceInput from './Input';
import FilterBar from './FilterBar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SampleInfor = () => {
	const { receipt_uid, sample_uid } = useParams();
	const { currentBulkReceipt, setCurrentSample, currentSample } = useContext(GlobalContext);
	const [sample, setSample] = useState(null);
	const [listAnalytes, setListAnalytes] = useState([]);
	const [editingField, setEditingField] = useState(null);
	const [inputValue, setInputValue] = useState('');
	const [isEditorVisible, setIsEditorVisible] = useState(false);

	let key;

	useEffect(() => {
		const receipt = currentBulkReceipt.find((r) => r.receipt_uid === receipt_uid);
		if (receipt) {
			const foundSample = receipt.samples.find((s) => s.sample_uid === sample_uid);
			if (foundSample) {
				setSample(foundSample);
				setCurrentSample(foundSample);
			}
		}
	}, [currentSample]);

	useEffect(() => {
		if (sample) {
			setListAnalytes(
				sample.test_orders.map((order) => ({
					...order,
					sample_uid: sample.sample_uid,
				})),
			);
		} else {
			setListAnalytes([]);
		}
	}, [sample]);

	const handleResultValueClick = (order) => {
		setEditingField(`result_value-${order.id}`);
		setInputValue(order.result_value ? String(order.result_value) : '');
		setIsEditorVisible(true);
	};

	const handleResultUnitClick = (order) => {
		setEditingField(`result_unit-${order.id}`);
		setInputValue(order.result_unit ? String(order.result_unit) : '');
		setIsEditorVisible(true);
	};

	const handleSaveContent = (newValue) => {
		if (key !== 'Enter') {
			setInputValue(newValue);
			const updatedAnalytes = listAnalytes.map((item) => {
				if (item.id === parseInt(editingField.split('-')[1])) {
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

	const handleKeyDown = (e, newValue) => {
		key = e.key;
		if (key === 'Enter') {
			setInputValue(newValue);
			const updatedAnalytes = listAnalytes.map((item) => {
				if (item.id === parseInt(editingField.split('-')[1])) {
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

	if (!sample) {
		return <div>Loading...</div>;
	}

	return (
		<div className="">
			<ToastContainer />
			<Breadcrumb
				paths={[
					{ name: 'Home', link: '/' },
					{ name: `${receipt_uid}`, link: `/dashboard/${receipt_uid}` },
					{ name: `${sample.sample_uid}`, link: `/dashboard/${receipt_uid}/${sample.sample_uid}` },
				]}
			/>
			<div className="rounded-lg w-full p-4 bg-white">
				<h2 className="text-4xl text-primary font-semibold pb-4">Thông tin mẫu thử</h2>
				<table className="min-w-full text-black mt-1">
					<thead className="border-2">
						<tr>
							<th className="py-2 px-4 border-b w-1/6">Mã mẫu thử</th>
							<th className="py-2 px-4 border-b w-2/6">Tên chỉ tiêu</th>
							<th className="py-2 px-4 border-b w-1/6">Phương pháp</th>
							<th className="py-2 px-4 border-b w-1/6">Kết quả</th>
							<th className="py-2 px-4 border-b w-1/6">Đơn vị</th>
						</tr>
					</thead>
					<tbody className="border-2">
						{listAnalytes.map((order) => (
							<tr key={order.id}>
								<td className="py-2 px-4 border">{sample.sample_uid}</td>
								<td className="py-2 px-4 border">{order.test_name}</td>
								<td className="py-2 px-4 border">{order.protocol}</td>
								<td className="py-2 px-4 border relative" onClick={() => handleResultValueClick(order)}>
									{editingField === `result_value-${order.id}` && isEditorVisible ? (
										<TinyMceInput value={inputValue} onUpdate={handleSaveContent} onKey={handleKeyDown} />
									) : (
										<div dangerouslySetInnerHTML={{ __html: order.result_value }} />
									)}
								</td>
								<td className="py-2 px-4 border relative" onClick={() => handleResultUnitClick(order)}>
									{editingField === `result_unit-${order.id}` && isEditorVisible ? (
										<TinyMceInput value={inputValue} onUpdate={handleSaveContent} onKey={handleKeyDown} />
									) : (
										<div className="min-h-6" dangerouslySetInnerHTML={{ __html: order.result_unit }} />
									)}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
			<div className="bg-white rounded-lg w-full mt-4 p-4">
				<h2 className="text-4xl text-primary font-semibold pb-4">Danh sách chỉ tiêu</h2>

				<FilterBar />

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
							<tr key={order.id}>
								<td className="py-2 px-4 border">{order.sample_uid}</td>
								<td className="py-2 px-4 border text-start">{order.test_name}</td>
								<td className="py-2 px-4 border text-start hidden md:table-cell">{order.protocol}</td>
								<td className="py-2 px-4 border relative" onClick={() => handleResultValueClick(order)}>
									{editingField === `result_value-${order.id}` && isEditorVisible ? (
										<TinyMceInput value={inputValue} onUpdate={handleSaveContent} onKey={handleKeyDown} />
									) : (
										<div dangerouslySetInnerHTML={{ __html: order.result_value }} />
									)}
								</td>
								<td className="py-2 px-4 border relative" onClick={() => handleResultUnitClick(order)}>
									{editingField === `result_unit-${order.id}` && isEditorVisible ? (
										<TinyMceInput value={inputValue} onUpdate={handleSaveContent} onKey={handleKeyDown} />
									) : (
										<div className="min-h-6" dangerouslySetInnerHTML={{ __html: order.result_unit }} />
									)}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default SampleInfor;
