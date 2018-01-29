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
	promptManager();
});

//show manager all inventory
function SelectAll(){
	connection.query("SELECT * FROM products",function(err,res){
		if (err) throw err;
		console.log("\n" + "Managerial view of the inventory: " + "\n");
		console.log("---------------------------------------------------")
		var strOut = '';
		for (var i = 0; i < res.length; i++) {
			strOut = '';
            strOut += 'Item ID: ' + res[i].item_id + '  //  ';
            strOut += 'Product Name: ' + res[i].product_name + '  //  ';
            strOut += 'Department: ' + res[i].department_name + '  //  ';
            strOut += 'Price: $' + res[i].price_usd + ' // ';
            strOut += 'Stock Quantity: ' + res[i].stock_quantity + '\n';
            console.log(strOut);
		}
		console.log("---------------------------------------------------")

		//console.log("result",res);
	})		
    promptManager();
}

//show manager the low inventory
function low_count(){
    var lowCount = "SELECT * FROM products WHERE stock_quantity <= 5";
    connection.query(lowCount, function(err,res){
        if (err) throw err;
        console.log("---------------------------------------------------")
        console.log("\n" + "The following items are low (below 5): " + "\n");
        var strOut = '';
        for (var i = 0; i < res.length; i++) {
            strOut = '';
            strOut += 'Item ID: ' + res[i].item_id + '  //  ';
            strOut += 'Product Name: ' + res[i].product_name + '  //  ';
            strOut += 'Department: ' + res[i].department_name + '  //  ';
            strOut += 'Price: $' + res[i].price_usd + ' // ';
            strOut += 'Stock Quantity: ' + res[i].stock_quantity + '\n';
            console.log(strOut);
        }
        console.log("---------------------------------------------------")
    })
    promptManager();
}

//manager can add more to the inventory
function add_more(){
    inquirer.prompt([
        {
            name: 'product_ID',
            type: 'input',
            message: 'Which product(s) would you like to add to? Please select the product ID',
            validate: isNumPositive,
            filter: Number
        },
        {
            name: 'quantity',
            type: 'input',
            message: 'How many would you like to add?',
            validate: isNumPositive,
            filter: Number
        }
    ]).then(function(addInput){
        var id = addInput.product_ID;
        var addQuant = addInput.quantity;

        //query bamazon to confirm given ID exists, adds to the current stock_quantity
        var queryInv = "SELECT * FROM products WHERE ?";
        //connection to bamazon for given ID
        connection.query(queryInv, {item_id: id}, function(err, res){
            if (err) throw err;
            //if user selects invalid item ID, throw error
            if (res.length === 0){
                console.log('ERROR: Invalid Item ID. Please select a valid Item ID.');
                add_more();
            } else {
                var product_data = res[0];
                var currentInv = product_data.stock_quantity;
                console.log("Updating the inventory...");
                //query string
                var updateQueryInv = "UPDATE products SET stock_quantity = " + (product_data.stock_quantity + addQuant) + " WHERE item_id = " + id;
                
                connection.query(updateQueryInv, function(err, res){
                    if(err) throw err;
                    console.log('Stock count for Item ID ' + id + ' has been updated from ' + currentInv + ' to ' + (product_data.stock_quantity + addQuant) + '.');
                    console.log("\n---------------------------------------------------------------------\n");

                    promptManager();
                })            
            }
        })        
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

function promptManager() {
    // Prompt the manager to select an option
    inquirer.prompt([
        {
            type: 'list',
            name: 'options',
            message: 'Please select an option:',
            choices: ['View Products for Sale', 'View Low Inventory', 'Add to Inventory', 'Add New Product'],
            filter: function (val) {
                if (val === 'View Products for Sale') {
                    return 'showInventory';
                } else if (val === 'View Low Inventory') {
                    return 'lowInventory';
                } else if (val === 'Add to Inventory') {
                    return 'addInventory';
                } else if (val === 'Add New Product') {
                    return 'newProduct';
                }
            }
        }
    ]).then(function(ManInput) {

        var managerInput = ManInput.options;

        switch (managerInput){
            case 'showInventory':
                return SelectAll();
            case 'lowInventory':
                return low_count();
            case 'addInventory':
                return add_more();
            case 'newProduct':
                return new_product();
        }
    })
}
