import { DiscountCategory } from "./discount-category";

export class Discount {
    discount_uuid: string;
    category_id: string;
    company_id: string;
    store_id: string;
    description_en: string;
    description_ar: string;
    how_to_apply_en: string;
    how_to_apply_ar: string;
    image: string;
    valid_until: string;
    created_at: string;
    updated_at: string;
    discountCategory: DiscountCategory;
}