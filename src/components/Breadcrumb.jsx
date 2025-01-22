import React, { useContext } from 'react';
import { GlobalContext } from '../contexts/GlobalContext';
import { NavLink } from 'react-router-dom';

const Breadcrumb = ({ paths }) => {
	const { currentTitlePage } = useContext(GlobalContext);

	return (
		<nav className="flex flex-col  w-lvw 2xl:max-w-screen-2xl xl:max-w-screen-xl lg:max-w-screen-lg md:max-w-screen-md sm:max-w-screen-sm  max-w-sm py-1 font-semibold ">
			<div>
				<h1 className="text-2xl md:text-3xl font-bold text-primary text-start">{currentTitlePage}</h1>
			</div>
			<ul className="flex list-none p-0 text-sm md:text-base">
				{paths.map((path, index) => (
					<li key={index} className="mr-2">
						{index === paths.length - 1 ? (
							//  <NavLink to={`/dashboard/${receipt.receipt_uid}`}>{receipt.receipt_uid}</NavLink>

							<span className="text-blue-500 hover:underline cursor-pointer">
								<NavLink to={path.link}>{path.name} </NavLink>
							</span>
						) : (
							<NavLink to={path.link} className="text-text-gray cursor-pointer">
								{path.name} /
							</NavLink>
						)}
					</li>
				))}
			</ul>
		</nav>
	);
};

export default Breadcrumb;
