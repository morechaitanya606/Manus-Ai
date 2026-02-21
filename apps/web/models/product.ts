import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProduct extends Document {
    title: string;
    description?: string;
    type?: string;
    category?: string;
    basePrice?: number;
    images?: string[];
    colors?: string[];
    sizes?: string[];
    fabric?: string;
    stock?: number;
    createdAt: Date;
    updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
    {
        title: { type: String, required: true, trim: true },
        description: { type: String, default: '' },
        type: { type: String, default: 'T-Shirt' },
        category: { type: String, default: 'Unisex' },
        basePrice: { type: Number, default: 599 },
        images: { type: [String], default: [] },
        colors: { type: [String], default: ['Black'] },
        sizes: { type: [String], default: ['S', 'M', 'L', 'XL'] },
        fabric: { type: String, default: '' },
        stock: { type: Number, default: 100 },
    },
    {
        timestamps: true,
    }
);

// Prevent model recompilation in development (hot reload)
const Product: Model<IProduct> =
    mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
