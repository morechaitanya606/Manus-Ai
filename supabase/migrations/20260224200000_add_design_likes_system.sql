-- Community likes system
-- 1) Track likes per design/user
-- 2) Persist total likes on designs for fast sorting (trending/loved)

ALTER TABLE designs
ADD COLUMN IF NOT EXISTS likes_count INTEGER NOT NULL DEFAULT 0 CHECK (likes_count >= 0);

CREATE TABLE IF NOT EXISTS design_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    design_id UUID NOT NULL REFERENCES designs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (design_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_design_likes_design_id ON design_likes(design_id);
CREATE INDEX IF NOT EXISTS idx_design_likes_user_id ON design_likes(user_id);

ALTER TABLE design_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read design likes" ON design_likes;
CREATE POLICY "Anyone can read design likes"
    ON design_likes
    FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Authenticated users can add own design likes" ON design_likes;
CREATE POLICY "Authenticated users can add own design likes"
    ON design_likes
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authenticated users can remove own design likes" ON design_likes;
CREATE POLICY "Authenticated users can remove own design likes"
    ON design_likes
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION sync_design_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE designs
        SET likes_count = likes_count + 1
        WHERE id = NEW.design_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE designs
        SET likes_count = GREATEST(likes_count - 1, 0)
        WHERE id = OLD.design_id;
        RETURN OLD;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_design_likes_count ON design_likes;
CREATE TRIGGER trg_sync_design_likes_count
    AFTER INSERT OR DELETE ON design_likes
    FOR EACH ROW
    EXECUTE FUNCTION sync_design_likes_count();

-- Backfill counts for existing data
UPDATE designs AS d
SET likes_count = COALESCE((
    SELECT COUNT(*)
    FROM design_likes AS dl
    WHERE dl.design_id = d.id
), 0);
