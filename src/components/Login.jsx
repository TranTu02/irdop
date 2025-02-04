import React, { useContext, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Cookies from 'js-cookie';
import { GlobalContext } from '../contexts/GlobalContext';

const Login = () => {
    const { setCurrentUser } = useContext(GlobalContext);
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const navigate = useNavigate();

	const handleLogin = async () => {
		try {
			const response = await axios.post('http://127.0.0.1:1880/login', { email, password });
			if (response.status === 200) {
				toast.success('Đăng nhập thành công');
                const auth = response.data;
                const jsonString = atob(auth);
                const authObject = JSON.parse(jsonString);
                setCurrentUser(authObject);
				Cookies.set('auth', auth);
				navigate('/');
			} else {
				toast.error('Đăng nhập thất bại');
			}
		} catch (error) {
			console.error('Error logging in:', error);
			toast.error('Đăng nhập thất bại');
		}
	};

	const handleKeyPress = (event) => {
		if (event.key === 'Enter') {
			handleLogin();
		}
	};

	return (
		<div className="flex items-center justify-center h-full translate-y-1/2">
			<ToastContainer />
			<div className="bg-white p-8 rounded shadow-md w-96">
				<h2 className="text-2xl font-bold mb-6 text-center">Đăng nhập</h2>
				<div className="mb-4">
					<label className="block text-gray-700 text-start text-sm font-bold mb-2" htmlFor="email">
						Tài Khoản
					</label>
					<input
						type="email"
						id="email"
						className="w-full px-3 py-2 border rounded bg-white"
						placeholder="Email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						onKeyPress={handleKeyPress}
					/>
				</div>
				<div className="mb-6">
					<label className="block text-gray-700 text-sm font-bold mb-2 text-start" htmlFor="password">
						Mật khẩu
					</label>
					<input
						type="password"
						id="password"
						className="w-full px-3 py-2 border rounded bg-white"
						placeholder="Password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						onKeyPress={handleKeyPress}
					/>
				</div>
				<div className="flex items-center justify-center">
					<button
						className="bg-blue-500 text-white px-4 py-2 rounded font-bold"
						onClick={handleLogin}
					>
						Đăng nhập
					</button>
				</div>
			</div>
		</div>
	);
};

export default Login;
