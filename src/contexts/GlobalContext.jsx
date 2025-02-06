import { bulkReceipts, listClients } from '../assets/testData';
import axios from 'axios';
import * as React from 'react';
const { createContext, useState, useEffect } = React;

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
	const [technicians, setTechnicians] = useState([]);

	const [currentKey, setCurrentKey] = useState([]);
	const [clients, setClients] = useState(listClients);
	const [currentUser, setCurrentUser] = useState(sampleCurrentUser);

	const normalizeString = (str) => {
		const map = {
			đ: 'd',
			Đ: 'D',
			ê: 'e',
			Ê: 'E',
			ơ: 'o',
			Ơ: 'O',
			ô: 'o',
			Ô: 'O',
			ă: 'a',
			Ă: 'A',
			â: 'a',
			Â: 'A',
		};
		return str
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '')
			.replace(/[đĐêÊơƠôÔăĂâÂ]/g, (char) => map[char])
			.toLowerCase();
	};

	const searchClients = (query) => {
		const normalizedQuery = normalizeString(query);
		return clients.filter(
			(client) =>
				normalizeString(client.client_uid).includes(normalizedQuery) ||
				normalizeString(client.client_name).includes(normalizedQuery) ||
				normalizeString(client.client_address).includes(normalizedQuery),
		);
	};

	const searchProtocol = (query, listProtocols) => {
		const normalizedQuery = normalizeString(query);

		return listProtocols.filter(
			(protocol) =>
				normalizeString(protocol.protocol_name).includes(normalizedQuery) ||
				normalizeString(protocol.protocol_code).includes(normalizedQuery) ||
				protocol.parameters.some((parameter) => normalizeString(parameter.matrix).includes(normalizedQuery)),
		);
	};

	const searchAnalyte = (query, listAnalytes) => {
		const normalizedQuery = normalizeString(query);
		return listAnalytes.filter(
			(analyte) =>
				normalizeString(analyte.parameter_uid).includes(normalizedQuery) ||
				normalizeString(analyte.parameter_name).includes(normalizedQuery) ||
				normalizeString(analyte.protocol_code).includes(normalizedQuery) ||
				normalizeString(analyte.matrix).includes(normalizedQuery),
		);
	};
	const fetchTechnicians = async () => {
		try {
			const response = await axios.get('https://pink.irdop.org/db/get/techinician');
			setTechnicians(response.data);
			console.log('Technicians:', response.data);
		} catch (error) {
			console.error('Error fetching technicians:', error);
		}
	};

	// useEffect(() => {
	// 	if (currentReceipt && currentReceipt.samples) {
	// 		let analytes = currentReceipt.samples.flatMap((sample) =>
	// 			sample.sample_analytes.map((order) => ({
	// 				...order,
	// 				sample_receipt_id: sample.sample_receipt_id,
	// 				sample_uid: sample.sample_uid,
	// 			})),
	// 		);

	// 		// Apply filters
	// 		currentFilter.forEach((filter) => {
	// 			analytes = analytes.filter((analyte) => {
	// 				switch (filter.condition) {
	// 					case 'include':
	// 						return analyte[filter.key].includes(filter.value);
	// 					case 'not in':
	// 						return !analyte[filter.key].includes(filter.value);
	// 					case '>':
	// 						return analyte[filter.key] > filter.value;
	// 					case '>=':
	// 						return analyte[filter.key] >= filter.value;
	// 					case '<':
	// 						return analyte[filter.key] < filter.value;
	// 					case '<=':
	// 						return analyte[filter.key] <= filter.value;
	// 					case '===':
	// 						return analyte[filter.key] === filter.value;
	// 					default:
	// 						return true;
	// 				}
	// 			});
	// 		});

	// 		// Apply sorting
	// 		if (currentSort.key) {
	// 			analytes.sort((a, b) => {
	// 				if (a[currentSort.key] < b[currentSort.key]) return currentSort.order === 'asc' ? -1 : 1;
	// 				if (a[currentSort.key] > b[currentSort.key]) return currentSort.order === 'asc' ? 1 : -1;
	// 				return 0;
	// 			});
	// 		}

	// 		setListAnalytes(analytes);
	// 	}
	// }, [currentReceipt, currentFilter, currentSort]);

	useEffect(() => {
		fetchTechnicians();
	}, []);

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
				searchProtocol,
				searchAnalyte,
				technicians,
			}}
		>
			{children}
		</GlobalContext.Provider>
	);
};
