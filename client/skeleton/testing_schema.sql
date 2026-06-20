CREATE TABLE "Customers"(
    "id" UUID NOT NULL,
    "first_name" VARCHAR(255) NOT NULL,
    "last_name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "user_name" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "mailing_address" VARCHAR(255) NOT NULL,
    "billing_address" VARCHAR(255) NOT NULL
);
ALTER TABLE
    "Customers" ADD PRIMARY KEY("id");
CREATE TABLE "Orders"(
    "id" VARCHAR(255) NOT NULL,
    "order_types" VARCHAR(255) NOT NULL,
    "products" VARCHAR(255) NOT NULL,
    "store_name" VARCHAR(255) NOT NULL,
    "quantity" BIGINT NOT NULL,
    "customers_id" UUID NOT NULL
);
ALTER TABLE
    "Orders" ADD PRIMARY KEY("id");
CREATE INDEX "orders_customers_id_index" ON
    "Orders"("customers_id");
CREATE TABLE "Products"(
    "id" VARCHAR(255) NOT NULL,
    "product_type" VARCHAR(255) NOT NULL,
    "product_name" VARCHAR(255) NOT NULL,
    "product_quantity" BIGINT NOT NULL,
    "production_description" TEXT NOT NULL,
    "products" VARCHAR(255) NOT NULL,
    "orders_id" VARCHAR(255) NOT NULL
);
ALTER TABLE
    "Products" ADD PRIMARY KEY("id");
CREATE INDEX "products_orders_id_index" ON
    "Products"("orders_id");
CREATE TABLE "Order Types"(
    "id" VARCHAR(255) NOT NULL,
    "repeat" BOOLEAN NOT NULL,
    "single" BOOLEAN NOT NULL,
    "numbered" BOOLEAN NOT NULL,
    "occurence_count" BIGINT NOT NULL,
    "orders_id" VARCHAR(255) NOT NULL
);
ALTER TABLE
    "Order Types" ADD PRIMARY KEY("id");
CREATE INDEX "order types_orders_id_index" ON
    "Order Types"("orders_id");
CREATE TABLE "Product Origins"(
    "id" VARCHAR(255) NOT NULL,
    "company_name" VARCHAR(255) NOT NULL,
    "store_location" VARCHAR(255) NOT NULL,
    "order_id" VARCHAR(255) NOT NULL
);
ALTER TABLE
    "Product Origins" ADD PRIMARY KEY("id");
CREATE INDEX "product origins_order_id_index" ON
    "Product Origins"("order_id");
ALTER TABLE
    "Products" ADD CONSTRAINT "products_orders_id_foreign" FOREIGN KEY("orders_id") REFERENCES "Orders"("id");
ALTER TABLE
    "Product Origins" ADD CONSTRAINT "product origins_order_id_foreign" FOREIGN KEY("order_id") REFERENCES "Orders"("id");
ALTER TABLE
    "Orders" ADD CONSTRAINT "orders_customers_id_foreign" FOREIGN KEY("customers_id") REFERENCES "Customers"("id");
ALTER TABLE
    "Order Types" ADD CONSTRAINT "order types_orders_id_foreign" FOREIGN KEY("orders_id") REFERENCES "Orders"("id");