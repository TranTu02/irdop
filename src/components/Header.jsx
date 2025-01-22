import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/IRDOP-LOGO .png';

const Header = () => {
	return (
		<div className="w-screen bg-white border-b shadow flex justify-center items-center">
			<div className="flex justify-between items-center  w-full 2xl:max-w-screen-2xl xl:max-w-screen-xl lg:max-w-screen-lg md:max-w-screen-md sm:max-w-screen-sm  max-w-sm ">
				<div className="text-2xl font-bold">
					<img src={logo} alt="Logo" className="h-10" />
				</div>
				<div className="flex">
					<p className="hover:text-primary cursor-pointer md:text-md ml-4 text-md text-teritary font-medium">
						Bán hàng
					</p>
					<p className="hover:text-primary cursor-pointer md:text-md ml-4 text-md text-teritary font-medium">
						Thư viện
					</p>
					<p className="  text-slate-600 cursor-default md:text-lg ml-4 text-md font-medium">Account</p>
				</div>
			</div>
		</div>
	);
};

export default Header;
