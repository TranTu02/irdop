import React, { createContext, useState, useEffect } from 'react';
import { bulkReceipts, listClients } from '../assets/testData';

export const GlobalContext = createContext();

const sampleCurrentBulkReceipt = bulkReceipts;
const sampleCurrentUser = {
	email: 'user@example.com',
	password: 'password123',
	name: 'John Doe',
	role: ['Customer Service', 'Lab Analyst', 'Accountant', 'Manager', 'Admin'],
};

export const GlobalProvider = ({ children }) => {
	const [currentTitlePage, setCurrentTitlePage] = useState('Nhập kết quả');
	const [currentReceipt, setCurrentReceiptState] = useState(sampleCurrentBulkReceipt[0]);
	const [currentSample, setCurrentSampleState] = useState(null);
	const [listAnalytes, setListAnalytes] = useState([]);
	const [searchWords, setSearchWords] = useState('');
	const [currentBulkReceipt, setCurrentBulkReceipt] = useState(sampleCurrentBulkReceipt);
	const [currentFilter, setCurrentFilter] = useState([]);
	const [currentSort, setCurrentSort] = useState({});
	const [currentKey, setCurrentKey] = useState([
		{ key: 'receipt_uid', value: 'Mã tiếp nhận' },
		{ key: 'sample_uid', value: 'Mã mẫu' },
		{ key: 'analyte_name', value: 'Chỉ tiêu' },
		{ key: 'protocol', value: 'Phương pháp' },
	]);
	const [clients, setClients] = useState(listClients);
	const [currentUser, setCurrentUser] = useState(sampleCurrentUser);

	const searchClients = (query) => {
		return clients.filter(
			(client) =>
				client.client_uid.includes(query) ||
				client.client_name.includes(query) ||
				client.client_address.includes(query),
		);
	};

	useEffect(() => {
		if (currentReceipt && currentReceipt.samples) {
			let analytes = currentReceipt.samples.flatMap((sample) =>
				sample.sample_analytes.map((order) => ({
					...order,
					sample_receipt_id: sample.sample_receipt_id,
					sample_uid: sample.sample_uid,
				})),
			);

			// Apply filters
			currentFilter.forEach((filter) => {
				analytes = analytes.filter((analyte) => {
					switch (filter.condition) {
						case 'include':
							return analyte[filter.key].includes(filter.value);
						case 'not in':
							return !analyte[filter.key].includes(filter.value);
						case '>':
							return analyte[filter.key] > filter.value;
						case '>=':
							return analyte[filter.key] >= filter.value;
						case '<':
							return analyte[filter.key] < filter.value;
						case '<=':
							return analyte[filter.key] <= filter.value;
						case '===':
							return analyte[filter.key] === filter.value;
						default:
							return true;
					}
				});
			});

			// Apply sorting
			if (currentSort.key) {
				analytes.sort((a, b) => {
					if (a[currentSort.key] < b[currentSort.key]) return currentSort.order === 'asc' ? -1 : 1;
					if (a[currentSort.key] > b[currentSort.key]) return currentSort.order === 'asc' ? 1 : -1;
					return 0;
				});
			}

			setListAnalytes(analytes);
		}
	}, [currentReceipt, currentFilter, currentSort]);

	const setCurrentReceipt = (receipt_uid) => {
		// Find the receipt with the given receipt_uid
		const receipt = currentBulkReceipt.find((receipt) => receipt.receipt_uid === receipt_uid);
		setCurrentReceiptState(receipt);
		if (receipt && receipt.samples) {
			const analytes = receipt.samples.flatMap((sample) =>
				sample.sample_analytes.map((order) => ({
					...order,
					sample_receipt_id: sample.sample_receipt_id,
					sample_uid: sample.sample_uid,
				})),
			);
			setListAnalytes(analytes);
		} else {
			setListAnalytes([]);
		}
	};

	const setCurrentSample = (sample_uid) => {
		// Find the sample with the given sample_uid
		const sample = currentReceipt.samples.find((sample) => sample.sample_uid === sample_uid);
		setCurrentSampleState(sample);
		if (sample && sample.sample_analytes) {
			setListAnalytes(
				sample.sample_analytes.map((order) => ({
					...order,
					sample_uid: sample.sample_uid,
				})),
			);
		} else {
			setListAnalytes([]);
		}
	};

	const createReceipt = (receipt) => {
		setCurrentBulkReceipt([...currentBulkReceipt, receipt]);
		return receipt;
	};

	const setCurrentReceiptByUid = (receipt_uid) => {
		const receipt = currentBulkReceipt.find((receipt) => receipt.receipt_uid === receipt_uid);
		setCurrentReceiptState(receipt);
	};

	return (
		<GlobalContext.Provider
			value={{
				currentTitlePage,
				setCurrentTitlePage,
				currentReceipt,
				setCurrentReceipt,
				currentSample,
				setCurrentSample,
				listAnalytes,
				setListAnalytes,
				searchWords,
				setSearchWords,
				currentBulkReceipt,
				setCurrentBulkReceipt,
				currentFilter,
				setCurrentFilter,
				currentSort,
				setCurrentSort,
				currentKey,
				setCurrentKey,
				searchClients,
				createReceipt,
				setCurrentReceiptByUid,
				setCurrentReceiptState,
				currentUser,
				setCurrentUser,
			}}
		>
			{children}
		</GlobalContext.Provider>
	);
};
