-- First, add a new temporary column with jsonb type
ALTER TABLE "verification" ADD COLUMN "value_jsonb" jsonb;

-- Update the new column with the parsed JSON data
-- Using a try-catch block in a DO statement to handle potential JSON parse errors
DO $$
BEGIN
    -- Try to convert existing text to jsonb
    UPDATE "verification" 
    SET "value_jsonb" = "value"::jsonb
    WHERE "value" IS NOT NULL;
    
    -- If we get here, the conversion was successful
    -- Drop the old column and rename the new one
    ALTER TABLE "verification" DROP COLUMN "value";
    ALTER TABLE "verification" RENAME COLUMN "value_jsonb" TO "value";
    
    -- Add NOT NULL constraint if needed
    ALTER TABLE "verification" ALTER COLUMN "value" SET NOT NULL;
EXCEPTION WHEN OTHERS THEN
    -- If there's an error, clean up and re-raise
    RAISE EXCEPTION 'Failed to convert verification.value to jsonb: %', SQLERRM;
    
    -- Drop the temporary column if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'verification' AND column_name = 'value_jsonb') THEN
        ALTER TABLE "verification" DROP COLUMN "value_jsonb";
    END IF;
END
$$;