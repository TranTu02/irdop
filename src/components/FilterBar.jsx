import React, { useContext, useState, useEffect } from 'react';
import { GlobalContext } from '../contexts/GlobalContext';

const FilterBar = ({ source, setCurrentList, typeSearch }) => {
	const { setCurrentSort, setCurrentFilter, setSearchWords, currentKey, searchProtocol, searchAnalyte,technicians } =
		useContext(GlobalContext);
	const [searchTerm, setSearchTerm] = useState('');
	const [currentList, setCurrentListState] = useState(source);
	const [sorts, setSorts] = useState([]);
	const [filters, setFilters] = useState([]);
	const [showSortOptions, setShowSortOptions] = useState(false);
	const [showFilterOptions, setShowFilterOptions] = useState(false);

	useEffect(() => {
		setCurrentListState(source);
	}, [source]);

	const handleSearchChange = (e) => {
		setSearchTerm(e.target.value);
		if (typeSearch === 'protocol') {
			setCurrentList(searchProtocol(e.target.value, currentList));
		} else if (typeSearch === 'parameter') {
			setCurrentList(searchAnalyte(e.target.value, currentList));
		}
	};

	const handleSortChange = () => {
		setShowSortOptions(!showSortOptions);
	};

	const handleSortKeyChange = (index, e) => {
		const newSorts = [...sorts];
		newSorts[index].key = e.target.value;
		setSorts(newSorts);
	};

	const handleSortOrderChange = (index, e) => {
		const newSorts = [...sorts];
		newSorts[index].order = e.target.value;
		setSorts(newSorts);
	};

	const handleAddSort = () => {
		setSorts([...sorts, { key: currentKey[0]?.key || '', order: 'asc' }]);
	};

	const handleRemoveSort = (index) => {
		const newSorts = sorts.filter((_, i) => i !== index);
		setSorts(newSorts);
	};

	const handleFilterChange = () => {
		setShowFilterOptions(!showFilterOptions);
	};

	const handleFilterKeyChange = (index, e) => {
		const newFilters = [...filters];
		newFilters[index].key = e.target.value;
		setFilters(newFilters);
	};

	const handleFilterConditionChange = (index, e) => {
		const newFilters = [...filters];
		newFilters[index].condition = e.target.value;
		setFilters(newFilters);
	};

	const handleFilterValueChange = (index, e) => {
		const newFilters = [...filters];
		newFilters[index].value = e.target.value;
		setFilters(newFilters);
	};

	const handleFilterLogicChange = (index, e) => {
		const newFilters = [...filters];
		newFilters[index].logic = e.target.value;
		setFilters(newFilters);
	};

	const handleAddFilter = () => {
		setFilters([...filters, { key: currentKey[0]?.key || '', condition: 'include', value: '', logic: 'AND' }]);
	};

	const handleRemoveFilter = (index) => {
		const newFilters = filters.filter((_, i) => i !== index);
		setFilters(newFilters);
	};

	const handleFilterAccept = () => {
		const validFilters = filters.filter((filter) => filter.value.trim() !== '');
		let filteredList = [...currentList];

		// Apply filters
		validFilters.forEach((filter, index) => {
			if (filter.logic === 'AND' || index === 0) {
				filteredList = filteredList.filter((item) => {
					switch (filter.condition) {
						case 'include':
							return item[filter.key].includes(filter.value);
						case 'not in':
							return !item[filter.key].includes(filter.value);
						case '>':
							return item[filter.key] > filter.value;
						case '>=':
							return item[filter.key] >= filter.value;
						case '<':
							return item[filter.key] < filter.value;
						case '<=':
							return item[filter.key] <= filter.value;
						case '===':
							return item[filter.key] === filter.value;
						default:
							return true;
					}
				});
			} else if (filter.logic === 'OR') {
				const additionalList = currentList.filter((item) => {
					switch (filter.condition) {
						case 'include':
							return item[filter.key].includes(filter.value);
						case 'not in':
							return !item[filter.key].includes(filter.value);
						case '>':
							return item[filter.key] > filter.value;
						case '>=':
							return item[filter.key] >= filter.value;
						case '<':
							return item[filter.key] < filter.value;
						case '<=':
							return item[filter.key] <= filter.value;
						case '===':
							return item[filter.key] === filter.value;
						default:
							return true;
					}
				});
				filteredList = [...new Set([...filteredList, ...additionalList])];
			}
		});

		// Apply sorting
		sorts.forEach((sort) => {
			filteredList.sort((a, b) => {
				if (a[sort.key] < b[sort.key]) return sort.order === 'asc' ? -1 : 1;
				if (a[sort.key] > b[sort.key]) return sort.order === 'asc' ? 1 : -1;
				return 0;
			});
		});

		setCurrentFilter(validFilters);
		setCurrentSort(sorts);
		setCurrentList(filteredList);
		setShowFilterOptions(false);
		setShowSortOptions(false);
	};

	const filterConditions = [
		{ key: 'include', value: 'Bao gồm' },
		{ key: 'not in', value: 'Không có' },
		{ key: '>', value: '>' },
		{ key: '>=', value: '>=' },
		{ key: '<', value: '<' },
		{ key: '<=', value: '<=' },
		{ key: '===', value: '===' },
	];

	return (
		<div className="relative flex flex-col md:flex-row items-center justify-between p-4 text-black md:px-4 px-2 xl:px-6 2xl:px-8 py-2 w-full bg-white rounded-lg leading-none">
			<div className="relative flex flex-col md:flex-row items-center mb-2 md:mb-0 w-full md:w-1/3 justify-center">
				<label className="mr-2">Sắp xếp:</label>
				<button onClick={handleSortChange} className="p-2 border border-gray-400 rounded-lg bg-white w-80 md:w-auto">
					{sorts.length > 0 && sorts[0].key
						? sorts.map((sort, index) => (
								<span key={index}>
									{index > 0 && ', '}
									{sort.key
										? `${currentKey.find((key) => key.key === sort.key).value} (${
												sort.order === 'asc' ? 'tăng dần' : 'giảm dần'
										  })`
										: 'Tùy chọn sắp xếp'}
								</span>
						  ))
						: 'Tùy chọn sắp xếp'}
				</button>
				{showSortOptions && (
					<div className="absolute top-full mt-2 p-2 border rounded bg-white shadow-lg z-10 w-full md:w-auto">
						{sorts.map((sort, index) => (
							<div key={index} className="flex flex-col md:flex-row items-center mb-2">
								<label className="mr-2">Thuộc tính:</label>
								<select
									value={sort.key}
									onChange={(e) => handleSortKeyChange(index, e)}
									className="p-2 border border-gray-400 rounded-lg bg-white md:mr-2 min-w-60 md:min-w-52 mb-2 md:mb-0"
								>
									{currentKey.map((key) => (
										<option key={key.key} value={key.key}>
											{key.value}
										</option>
									))}
								</select>
								<label className="mr-2">Thứ tự:</label>
								<select
									value={sort.order}
									onChange={(e) => handleSortOrderChange(index, e)}
									className="p-2 border border-gray-400 rounded-lg bg-white min-w-60 md:min-w-28"
								>
									<option value="asc">Tăng dần</option>
									<option value="desc">Giảm dần</option>
								</select>
								<button
									onClick={() => handleRemoveSort(index)}
									className="p-2 border rounded bg-red-500 text-white ml-2"
								>
									Xóa
								</button>
							</div>
						))}
						<button onClick={handleAddSort} className="p-2 border rounded bg-green-500 text-white w-full mb-2">
							Thêm sắp xếp
						</button>
						<button onClick={handleFilterAccept} className="p-2 border rounded bg-blue-500 text-white w-full">
							Chấp nhận
						</button>
					</div>
				)}
			</div>
			<div className="relative flex flex-col md:flex-row items-center mb-2 md:mb-0 w-full md:w-1/3 justify-center">
				<label className="mr-2">Lọc theo:</label>
				<button onClick={handleFilterChange} className="p-2 border border-gray-400 rounded-lg bg-white w-80 md:w-auto">
					{filters.length > 0 && filters[0].key
						? filters.map((filter, index) => (
								<span key={index}>
									{index > 0 && ` ${filter.logic} `}
									{filter.key
										? `${currentKey.find((key) => key.key === filter.key).value} (${
												filterConditions.find((condition) => condition.key === filter.condition)?.value
										  }) ${filter.value}`
										: 'Tùy chọn lọc'}
								</span>
						  ))
						: 'Tùy chọn lọc'}
				</button>
				{showFilterOptions && (
					<div className="absolute top-full mt-2 p-2 border rounded bg-white shadow-lg z-10 w-full lg:w-auto">
						{filters.map((filter, index) => (
							<>
								{index > 0 && (
									<div className="w-full lg:w-auto mb-2 lg:mb-0 flex">
										<select
											value={filter.logic}
											onChange={(e) => handleFilterLogicChange(index, e)}
											className="p-2 border rounded-lg bg-white w-fit"
										>
											<option value="AND">AND</option>
											<option value="OR">OR</option>
										</select>
									</div>
								)}
								<div key={index} className="flex flex-col lg:flex-row items-center my-1">
									<label className="lg:mr-2 mb-1 lg:mb-0">Thuộc tính:</label>
									<select
										value={filter.key}
										onChange={(e) => handleFilterKeyChange(index, e)}
										className="p-2 border border-gray-400 rounded-lg bg-white lg:mr-2 min-w-60 lg:min-w-40 mb-2 lg:mb-0"
									>
										{currentKey.map((key) => (
											<option key={key.key} value={key.key}>
												{key.value}
											</option>
										))}
									</select>
									<label className="lg:mr-2 mb-1 lg:mb-0">Điều kiện:</label>
									<select
										value={filter.condition}
										onChange={(e) => handleFilterConditionChange(index, e)}
										className="p-2 border border-gray-400 rounded-lg bg-white lg:mr-2 mb-2 lg:mb-0"
									>
										{filterConditions.map((condition) => (
											<option key={condition.key} value={condition.key}>
												{condition.value}
											</option>
										))}
									</select>
									<label className="lg:mr-2 mb-1 lg:mb-0">Giá trị:</label>
									<input
										type="text"
										value={filter.value}
										onChange={(e) => handleFilterValueChange(index, e)}
										className="p-2 border border-gray-400 rounded-lg bg-white mb-2 lg:mb-0 w-60 lg:w-auto"
										placeholder="Giá trị lọc"
									/>
									<button
										onClick={() => handleRemoveFilter(index)}
										className="p-2 border rounded bg-red-500 text-white ml-2"
									>
										Xóa
									</button>
								</div>
							</>
						))}
						<button onClick={handleAddFilter} className="p-2 border rounded bg-green-500 text-white w-full mb-2">
							Thêm điều kiện
						</button>
						<button onClick={handleFilterAccept} className="p-2 border rounded bg-blue-500 text-white w-full">
							Chấp nhận
						</button>
					</div>
				)}
			</div>
			<div className="flex flex-col md:flex-row items-center w-full md:w-1/3 justify-center">
				<label className="mr-2">Tìm kiếm:</label>
				<input
					type="text"
					value={searchTerm}
					onChange={handleSearchChange}
					className="p-1.5 border text-md border-gray-400 rounded-lg bg-white w-80 md:w-auto min-w-68"
					placeholder="Search..."
				/>
			</div>
		</div>
	);
};

export default FilterBar;
