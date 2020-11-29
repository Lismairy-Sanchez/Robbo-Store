const express = require('express');
const passport = require('passport');
// import all routers;
const productRouter = require('./product.js');
const user = require('./user.js');
const purchase_orders = require('./purchase_orders.js');
const category = require('./category.js');
const auth = require('./auth');
const {Product, User} = require('../db.js');
const {Op} = require('sequelize');
const app = express();

// load each router on a route
// i.e: router.use('/auth', authRouter);s
// app.use('/auth', authRouter);

//app.use('/products/:idProducto/review', review); ???? se puede hacer esto ??
app.use('/products', productRouter);
app.use('/products/category', category);
app.use('/user', user);
app.use('/orders', purchase_orders);
app.use('/auth', auth);


app.get('/', (req, res) => {
	res.send('Estas en index, no en redirect');
});

app.get('/search', (req, res) => {
	const {query,p} = req.query;
	const firstIndex = (p - 1) * 2;
	const lastIndex = firstIndex + 2;
	Product.findAll({
		where: {
			[Op.or]: [{name: {[Op.iLike]: `%${query}%`}}, {description: {[Op.iLike]: `%${query}%`}}]
		}
	})
		.then(response => {
			if (response.length <= 0) return res.status(404).send('No se encontró ningún robot de ese tipo :(');
			let productos = response
			let page = productos.slice(firstIndex, lastIndex);
			let result = {
				currentPage: productos.length > 0 ? p : p - 1,
				products : page,
				more: page.length > 0 ? true : false
			}
			return res.send(result);
		})
		.catch(() => res.status(400).send('Algo salió mal'));
});

app.post('/createAdmin', async (req, res) => {
	try {
		const admin = await User.create({
			name: 'Admin',
			rol: 'Admin',
			email: 'admin@admin.com',
			password: 'admin'
		});
		return res.send('Admin creado');
	} catch (error) {
		return res.status(400).send('Ya existe el admin');
	}
});

module.exports = app;
