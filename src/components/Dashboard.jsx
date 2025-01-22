import React, { useContext, useEffect, useState } from 'react';
import { GlobalContext } from '../contexts/GlobalContext';
import FilterBar from './FilterBar';
import Breadcrumb from './Breadcrumb';
import { NavLink } from 'react-router-dom';
import CreateReceipt from './CreateReceipt';

const Dashboard = () => {
	const { currentBulkReceipt, setCurrentTitlePage } = useContext(GlobalContext);
	const [currentList, setCurrentList] = useState(currentBulkReceipt);
	const [currentPage, setCurrentPage] = useState(1);
	const receiptsPerPage = 15;
	const samplesPerReceipt = 3;

	useEffect(() => {
		setCurrentTitlePage('Danh sách tiếp nhận mẫu');
	}, [setCurrentTitlePage]);

	useEffect(() => {
		setCurrentList(currentBulkReceipt);
	}, [currentBulkReceipt]);

	const handlePageChange = (pageNumber) => {
		setCurrentPage(pageNumber);
	};

	const paginatedReceipts = currentList.slice((currentPage - 1) * receiptsPerPage, currentPage * receiptsPerPage);

	const [expandedReceipts, setExpandedReceipts] = useState({});

	const handleExpandClick = (receiptId) => {
		setExpandedReceipts((prev) => ({
			...prev,
			[receiptId]: !prev[receiptId],
		}));
	};

	return (
		<div className="flex flex-col justify-between items-center w-full">
			<Breadcrumb paths={[{ name: 'Danh sách', link: '/' }]} />
			<div className="bg-white rounded-lg w-full pb-4 pt-2">
				<div className="flex justify-between items-center w-full px-4">
					<div></div>
					<CreateReceipt />
				</div>

				<FilterBar source={currentBulkReceipt} currentList={currentList} setCurrentList={setCurrentList} />

				<div className="overflow-x-auto px-1">
					<table className="w-full text-black ">
						<thead>
							<tr className="border-b-2">
								<th className="p-2 border-b w-1/6 min-w-36">Mã tiếp nhận mẫu</th>
								<th className="p-2 border-b w-1/6 min-w-40">Mã mẫu thử</th>
								<th className="p-2 border-b w-2/6 min-w-72 text-start">Thông tin mẫu thử</th>
								<th className="p-2 border-b w-1/6 min-w-32">Số lượng chỉ tiêu</th>
								<th className="p-2 border-b w-1/6 min-w-28">Hạn trả kết quả</th>
							</tr>
						</thead>
						<tbody>
							{paginatedReceipts.map((receipt) => {
								const isExpanded = expandedReceipts[receipt.receipt_uid];
								const samplesToShow = isExpanded ? receipt.samples : receipt.samples.slice(0, samplesPerReceipt);

								return (
									<React.Fragment key={receipt.receipt_uid}>
										{samplesToShow.length === 0 ? (
											<tr key={receipt.receipt_uid} className="border-t border-b">
												<td className="p-2 text-primary font-semibold">
													<NavLink to={`/dashboard/${receipt.receipt_uid}`}>{receipt.receipt_uid}</NavLink>
												</td>
												<td colSpan="3" className="p-2 text-center text-gray-500">
													Chưa có thông tin mẫu thử . . .
												</td>
												<td className="p-2">{receipt.deadline}</td>
											</tr>
										) : (
											samplesToShow.map((sample, sampleIndex) => {
												const totalTests = sample.sample_analytes.length;
												const completedTests = sample.sample_analytes.filter(
													(order) => order.result_value !== '',
												).length;
												const pendingTests = totalTests - completedTests;

												return (
													<tr
														key={`${receipt.receipt_uid}-${sample.sample_uid}`}
														className={` ${sampleIndex === 0 ? 'border-t' : ''} ${
															sampleIndex === receipt.samples.length - 1 ? 'border-b' : ''
														}`}
													>
														{sampleIndex === 0 && (
															<td
																className="p-2 text-primary font-semibold"
																rowSpan={Math.min(samplesToShow.length, receipt.samples.length)}
															>
																<NavLink to={`/dashboard/${receipt.receipt_uid}`}>{receipt.receipt_uid}</NavLink>
															</td>
														)}
														<td className="p-2 text-primary font-medium">
															<NavLink to={`/dashboard/${receipt.receipt_uid}/${sample.sample_uid}`}>
																{sample.sample_uid}
															</NavLink>
														</td>
														<td className="p-2 text-start">{sample.sample_name}</td>
														<td className="p-2">
															{completedTests} / {pendingTests} / {totalTests}
														</td>
														{sampleIndex === 0 && (
															<td className="p-2" rowSpan={Math.min(samplesToShow.length, receipt.samples.length)}>
																{receipt.deadline}
															</td>
														)}
													</tr>
												);
											})
										)}
										{receipt.samples.length > samplesPerReceipt && !isExpanded && (
											<tr key={`${receipt.receipt_uid}-see-more relative`} className="relative w-full">
												<td
													colSpan="5"
													className="text-center text-teritary cursor-pointer absolute w-full bottom-0 text-sm font-semibold pb-0 border-b hover:border-b-2 hover:border-teritary hover:text-primary z-10"
													onClick={() => handleExpandClick(receipt.receipt_uid)}
												>
													<sub>Xem thêm....</sub>
												</td>
											</tr>
										)}
									</React.Fragment>
								);
							})}
						</tbody>
					</table>
				</div>

				<div className="flex justify-center mt-4">
					{Array.from({ length: Math.ceil(currentList.length / receiptsPerPage) }, (_, index) => (
						<button
							key={index + 1}
							className={`px-4 py-2 mx-1 ${currentPage === index + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200'} `}
							onClick={() => handlePageChange(index + 1)}
						>
							{index + 1}
						</button>
					))}
				</div>
			</div>
		</div>
	);
};

export default Dashboard;
