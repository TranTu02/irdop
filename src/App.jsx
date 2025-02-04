import React, { useContext } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import ReceiptInfor from './components/ReceiptInfor';
import SampleInfor from './components/SampleInfor';
import { GlobalContext } from './contexts/GlobalContext';
import Library from './components/Library';
import ProtocolInfor from './components/ProtocolInfor';
import AnalyteInfor from './components/AnalyteInfor';
import Login from './components/Login';

const App = () => {
	const { currentBulkReceipt } = useContext(GlobalContext);

	return (
		<Router>
			<div className="h-full min-h-lvh min-w-lvw w-lvw flex flex-col items-center">
				<Header />
				<div className="flex justify-center items-center w-full 2xl:max-w-screen-2xl xl:max-w-screen-xl lg:max-w-screen-lg md:max-w-screen-md sm:max-w-screen-sm  max-w-sm ">
					<Routes>
						<Route path="library" element={<Library />} />
						<Route path="library/protocol" element={<ProtocolInfor />} />
						<Route path="library/analyte" element={<AnalyteInfor />} />
						<Route path="/" element={<Dashboard />} />
						<Route path="/dashboard/:receipt_uid" element={<ReceiptInfor />} />
						<Route path="/dashboard/:receipt_uid/:sample_uid" element={<SampleInfor />} />
						<Route path="login" element={<Login />} />
					</Routes>
				</div>
			</div>
		</Router>
	);
};

export default App;
