-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist
DROP TABLE IF EXISTS partner_products CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS product_categories CASCADE;

-- Create product_categories table
CREATE TABLE product_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) CHECK (type IN ('IMPORT', 'EXPORT', 'BOTH')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    selling_price DECIMAL(10,2) NOT NULL,
    purchase_price DECIMAL(10,2) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    image_url TEXT,
    category VARCHAR(255),
    category_id UUID REFERENCES product_categories(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create partner_products table
CREATE TABLE partner_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partner_id UUID NOT NULL,
    product_id UUID NOT NULL REFERENCES products(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(partner_id, product_id)
);

-- Insert default categories
INSERT INTO product_categories (id, name, description, type) VALUES
    ('b5c91f45-84ae-5b56-c193-f3e15fed5a1d', 'Vapes', 'E-Zigaretten und Zubehör', 'IMPORT'),
    ('c6d92f56-95bf-6c67-d294-f4f26ffe6b2e', 'Zubehör', 'Allgemeines Zubehör', 'IMPORT'),
    ('d7e93f67-a6cf-47d8-e3a5-f5f37fff7c3f', 'Aktion', 'Aktionsartikel und Sonderangebote', 'BOTH'),
    ('a4b90e34-93be-4b45-b082-f2e14eed4a0c', 'Snacks - Import', 'Importierte Snacks und Knabbereien', 'IMPORT'),
    ('f9fa5e89-c8e0-49fa-95c7-97959aaa9e5f', 'Snacks', 'Lokale Snacks und Knabbereien', 'BOTH'),
    ('e8f94f78-b7df-58e9-f4b6-f6f48fff8d4f', 'Getränke', 'Softdrinks und andere Getränke', 'IMPORT')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    type = EXCLUDED.type;
