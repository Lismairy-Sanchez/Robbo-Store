import React from 'react';
import {Link} from 'react-router-dom';
import {useSelector, useDispatch} from 'react-redux';
import {allActions} from '../../../Redux/Actions/actions';
import axios from 'axios';
import {adminPanel} from '../../../multimedia/SVGs';
import './UserOptions.css';

const urlBack = process.env.REACT_APP_API_URL;

export default function UserOptions() {
	// Redux
	const user = useSelector(state => state.user);
	const dispatch = useDispatch();

	const logout = () => {
		axios
			.post(`${urlBack}/auth/logout`)
			.then(() => {
				dispatch(allActions.userActions.logOut());
				dispatch(allActions.cartActions.emptyCart());
			})
			.catch(error => alert('Algo salió mal: ', error.response.data));
	};

	return (
		<div className="userOpForm">
			{user.rol === 'Admin' && (
				<Link className="CPButton CPText white-link" to="/admin">
					<div className="CPIcon">{adminPanel}</div>
					Panel de Control
				</Link>
			)}
			<Link className="myProfileBtn white-link" to={`/user/${user.id}`}>
				Mi perfil
			</Link>
			<a className="closeSessBtn white-link" href="#" onClick={logout}>
				Cerrar sesión
			</a>
		</div>
	);
}
