-- Create or replace the trigger function
CREATE OR REPLACE FUNCTION public.insert_user_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert the user profile with proper error handling
  BEGIN
    INSERT INTO public.users (
      id,
      email,
      name,
      role,
      created_at,
      updated_at
    ) VALUES (
      NEW.id,
      NEW.email,
      COALESCE(
        (NEW.raw_user_meta_data->>'name')::text,
        'Anonymous'
      ),
      COALESCE(
        (NEW.raw_user_meta_data->>'role')::text,
        'user'
      ),
      NEW.created_at,
      NEW.created_at
    );
  EXCEPTION 
    WHEN others THEN
      -- Log the error but don't fail the transaction
      RAISE WARNING 'Failed to create user profile: %', SQLERRM;
  END;
  
  RETURN NEW;
END;
$$;

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.insert_user_profile();