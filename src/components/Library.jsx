import * as React from 'react';
const { useContext, useEffect } = React;
import { useNavigate } from 'react-router-dom';
import Breadcrumb from './Breadcrumb';
import { GlobalContext } from '../contexts/GlobalContext';

const Library = () => {
	const { setCurrentTitlePage } = useContext(GlobalContext);
	useEffect(() => {
		setCurrentTitlePage('Thư viện');
	}, [setCurrentTitlePage]);

	const navigate = useNavigate();

	return (
		<div className="w-full h-full relative">
			<Breadcrumb paths={[{ name: 'Thư viện', link: '/library' }]} />
			<div className="rounded-lg w-full p-4 bg-white flex justify-evenly h-full">
				<div
					className="w-1/3 h-48 border-2 text-primary flex justify-center items-center rounded-lg cursor-pointer"
					onClick={() => navigate('/library/protocol')}
				>
					<h2 className="text-2xl font-semibold">Phương pháp</h2>
				</div>

				<div
					className="w-1/3 h-48 border-2 text-primary flex justify-center items-center rounded-lg cursor-pointer"
					onClick={() => navigate('/library/analyte')}
				>
					<h2 className="text-2xl font-semibold">Chỉ tiêu</h2>
				</div>
			</div>
		</div>
	);
};

export default Library;
