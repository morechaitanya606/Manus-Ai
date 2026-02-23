-- Create the credit_purchases table
CREATE TABLE credit_purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    razorpay_order_id TEXT NOT NULL UNIQUE,
    razorpay_payment_id TEXT UNIQUE, -- Nullable until payment is completed
    amount_inr NUMERIC NOT NULL,
    credits_added INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE credit_purchases ENABLE ROW LEVEL SECURITY;

-- Admins can view all purchases
CREATE POLICY "Admins can view all credit purchases"
    ON credit_purchases
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Users can view their own purchases
CREATE POLICY "Users can view their own credit purchases"
    ON credit_purchases
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Update timestamp trigger
CREATE TRIGGER update_credit_purchases_updated_at
    BEFORE UPDATE ON credit_purchases
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
