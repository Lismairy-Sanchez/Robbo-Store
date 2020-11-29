import React, {useState, useEffect} from 'react';
import {useParams} from 'react-router-dom';
import {useSelector, useDispatch} from 'react-redux';
import {allActions} from '../../Redux/Actions/actions';
import {editButton, star} from '../../multimedia/SVGs';
import 'bootstrap/dist/css/bootstrap.css';
import './Producto.css';
import Axios from 'axios';
import Review from './Review/Review.jsx';
import Carousel from 'react-bootstrap/Carousel';
import Modal from 'react-bootstrap/Modal';
import ProductForm from '../FormularioProducto/ProductForm';
// =========== FIN DE IMPORTS ============

const urlBack = process.env.REACT_APP_API_URL;

export default function Producto() {
	// ========================== Redux State ========================== //

	const currentUser = useSelector(state => state.user);
	const currentCart = useSelector(state => state.cart.currentCart);
	const productStore = useSelector(state => state.products);
	const dispatch = useDispatch();

	// ========================== React State ========================== //

	const [robot, setRobot] = useState({});
	const [pics, setPics] = useState([]);
	const {id} = useParams();
	const [showModal, setShowModal] = useState(false);
	const [index, setIndex] = useState(0); // carousel Image Index
	const [reloadData, setReloadData] = useState(false);

	useEffect(
		() => {
			Axios.get(`${urlBack}/products/${id}`)
				.then(res => {
					setRobot(res.data);
					setPics(res.data.pics.map(i => i.imageUrl));
				})
				.catch(err => {
					console.log(err);
				});
		},
		[id, productStore, reloadData]
	);

	// ===================== Utility Functions ====================== //

	// function to show the stars
	const showStars = num => {
		var arr = [];
		for (let i = 0; i < num; i++) {
			arr.push(star);
		}
		return arr;
	};
	const stars = showStars(`${robot.averageQualification}`);

	const superReload = () => {
		console.log('super Reload ha sido invocada');
		setReloadData(!reloadData);
	};

	// ======================= Event Hnadlers ======================= //

	// this is a carousel function to change the images
	const handleSelect = (selectedIndex, e) => {
		setIndex(selectedIndex);
	};

	// buy button
	const handleBuy = event => {
		event.preventDefault();

		if (robot.stock < 1) return; // Si no hay en stock no se compra
		if (currentCart && currentCart.products.find(product => product.id === robot.id)) return; // ya lo tiene en carrito

		const productValues = {
			productId: robot.id,
			quantity: 1,
			price: robot.price
		};

		if (currentUser.rol === 'Guest') {
			dispatch(
				allActions.cartActions.editGuestCart(
					productValues,
					currentCart.orderlines,
					robot,
					productValues.quantity === 1 ? 'AddToProducts' : 'No changes'
				)
			);
		}
		else {
			Axios.put(`${urlBack}/user/${currentUser.id}/cart`, productValues)
				.then(() => {
					dispatch(allActions.cartActions.getUserCart(currentUser.id));
				})
				.catch(error => {
					alert(error.response.data);
				});
		}
	};

	// =============== Render if robot not found ============== //

	if (!robot)
		return (
			<h1 className="product-not-found">
				Lo sentimos, pero ese producto no se encuentra en nuestra base de datos!
			</h1>
		);

	// ================ Render if robot IS found ================== //

	return (
		<div className="productContainer">
			<div className="tituloproductocontainer">
			<h3 className="tituloCarousel">{robot.name}</h3>
			</div>
			<div className="productCont2">
				<Carousel className="carItems" activeIndex={index} onSelect={handleSelect}>
					{pics.map(image => (
						<Carousel.Item>
							<img
								// d-block w-100
								className="productImg"
								src={image}
								alt={pics.indexOf(image)}
							/>
							{/*
							<Carousel.Caption className="">
								<h4></h4>
							</Carousel.Caption>
							*/}
						</Carousel.Item>
					))}
				</Carousel>

				<div className="infoCard">
					<div className="infoCardHeader">
						<h3 className="productTitle">
							{robot.name} {' '}
							{currentUser.rol === 'Admin' && (
								<button
									type="submit"
									className="editProdBtn"
									value="Editar"
									onClick={() => setShowModal(!showModal)}
								>
									{editButton}
								</button>
							)}
							<hr />
						</h3>
						<div className="starQualification">
							<div>{stars.map(i => i)}</div>
							|{' '}
							{`${robot.averageQualification && robot.averageQualification.toFixed(1)} / 5`}
						</div>
						<p className="infoCardDescription">{robot.description}</p>
						<div className="infoCardData">
							<span className="">Price U$S: {robot.price}</span>
							<br />
							<span className="">
								{robot.stock > 0 ? `Stock: ${robot.stock} units left` : 'Out of stock!'}
							</span>
						</div>
					</div>

					<button className="bigBuyButton" onClick={handleBuy}>
						<h4>¡ Agregar al Carrito !</h4>
					</button>

					<div className="reviewContainer">
						<Review robotId={id} superReload={superReload} />
					</div>
				</div>
			</div>

			{currentUser.rol === 'Admin' && (
				<Modal
					show={showModal}
					onHide={() => {
						setShowModal(!showModal);
					}}
					size="xl"
					aria-labelledby="contained-modal-title-vcenter"
					centered
				>
					<div className="container">
						<ProductForm preSelected={robot} />
					</div>
				</Modal>
			)}
		</div>
	);
}
