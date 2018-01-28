//Required dependencies
var inquirer = require('inquirer');
var mysql = require('mysql');

// Define the MySQL connection parameters
var connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    // Your username
    user: 'root',
    // Your password
    password: '',
    database: 'bamazon'
});

connection.connect(function(err){
	if (err) throw err;
	console.log("Connect as ID: ", connection.threadId);
	SelectAll();

	setTimeout(promptUserForPurchase, 400);
});

function SelectAll(){
	connection.query("SELECT * FROM products",function(err,res){
		if (err) throw err;
		console.log("Our existing inventory: " + "\n");
		console.log("---------------------------------------------------")
		var strOut = '';
		for (var i = 0; i < res.length; i++) {
			strOut = '';
            strOut += 'Item ID: ' + res[i].item_id + '  //  ';
            strOut += 'Product Name: ' + res[i].product_name + '  //  ';
            strOut += 'Department: ' + res[i].department_name + '  //  ';
            strOut += 'Price: $' + res[i].price_usd + '\n';
            console.log(strOut);
		}
		console.log("---------------------------------------------------")
		//console.log("result",res);
	})		
}
// validateInput makes sure that the user is supplying only positive integers for their inputs
function isNumPositive(value) {
    var sign = Math.sign(value);

    if (sign === 1) {
        return true;
    } else {
        return 'Please enter a positive number.';
    }
}

function promptUserForPurchase(){
	inquirer.prompt([
			{
				name: "productId",
				message: "Please provide the ID of the product you'd like to buy today",
				// validate: isNumPositive,
				// filter: Number

			},
			{
				name: "quantity",
				message: "How many would you like to buy?",
				validate: isNumPositive,
				filter: Number
			}
		]).then(function(input){
			var item = input.productId;
			var quantity = input.quantity;

        // Query db to confirm that the given item ID exists in the desired quantity
        var queryInv = 'SELECT * FROM products WHERE ?';

        connection.query(queryInv, {item_id: item}, function(err, data) {
            if (err) throw err;
            // If the user has selected an invalid item ID, data array will be empty

            if (data.length === 0) {
                console.log('ERROR: Invalid Item ID. Please select a valid Item ID.');

            } else {
                var productData = data[0];

                // console.log('productData = ' + JSON.stringify(productData));
                // console.log('productData.stock_quantity = ' + productData.stock_quantity);

                // If the quantity requested by the user is in stock
                if (quantity <= productData.stock_quantity) {
                    console.log('Congratulations, the product you requested is in stock! Placing order!');

                    // Construct the updating query string
                    var updateQueryInv = 'UPDATE products SET stock_quantity = ' + (productData.stock_quantity - quantity) + ' WHERE item_id = ' + item;
                    // console.log('updateQueryStr = ' + updateQueryStr);

                    // Update the inventory
                    connection.query(updateQueryInv, function(err, data) {
                        if (err) throw err;

                        console.log('Your order has been placed! Your total is $' + productData.price_usd + " x " + quantity + " = " + "$" + productData.price_usd * quantity);
                        console.log('Thank you for shopping with us!');
                        console.log("\n---------------------------------------------------------------------\n");

                        // End the database connection
                        connection.end();
                    })
                } else {
                    console.log('Sorry, there is not enough product in stock, your order can not be placed as is.');
                    console.log('Please modify your order.');
                    console.log("\n---------------------------------------------------------------------\n");
                    promptUserForPurchase();
                }
            }
        })
    })
}



