DROP DATABASE IF EXISTS bamazon;

	CREATE DATABASE bamazon;

	USE bamazon;

	create table products (
     item_id int not null auto_increment,
     product_name varchar(40) not null,
     department_name varchar(40) not null,
     price($) decimal (10,2) not null,
     stock_quantity decimal (10,2) not null,
     primary key (item_id)
    );